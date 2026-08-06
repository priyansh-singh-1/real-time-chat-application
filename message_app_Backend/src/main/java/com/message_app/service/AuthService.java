package com.message_app.service;

import com.message_app.dto.AuthRequest;
import com.message_app.dto.AuthResponse;
import com.message_app.dto.LoginRequest;
import com.message_app.dto.UserStatus;
import com.message_app.entity.User;
import com.message_app.repository.UserRepository;
import com.message_app.utils.JwtUtil;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SimpMessagingTemplate messagingTemplate;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       SimpMessagingTemplate simpMessagingTemplate){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtUtil=jwtUtil;
        this.messagingTemplate=simpMessagingTemplate;
    }

    public AuthResponse registerUser(AuthRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");

        }

        if(userRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Username already exists");
        }

        User user= User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .online(false)
                .build();

        System.out.println("Username: " + request.getUsername());
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());

        userRepository.save(user);

        String token= jwtUtil.generateToken(user.getUsername());

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail()
        );

    }

    public AuthResponse authenticateUser(LoginRequest request){

        System.out.println("===== LOGIN METHOD CALLED =====");
        System.out.println("Username: " + request.getUsername());
        User user= userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->  new RuntimeException("Invalid username or password"));

        System.out.println("User found: " + user.getUsername());

        boolean passwordMatches= passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if(!passwordMatches){
            throw new RuntimeException("Invalid username or password");
        }

        user.setOnline(true);
        userRepository.save(user);
        System.out.println("Broadcasting ONLINE for " + user.getUsername());

        messagingTemplate.convertAndSend(
                "/topic/status",
                new UserStatus(user.getUsername(), true)
        );
        System.out.println("Broadcast sent");

        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail()
        );
    }

    public void logout(String username){
        User user= userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("User not found"));

        user.setOnline(false);

        userRepository.save(user);
        System.out.println("User marked offline");

        messagingTemplate.convertAndSend(
                "/topic/status",
                new UserStatus(user.getUsername(),false)
        );
        System.out.println("Status broadcast sent");
    }
}
