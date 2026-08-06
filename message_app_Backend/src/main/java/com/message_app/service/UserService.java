package com.message_app.service;

import com.message_app.dto.UserDTO;
import com.message_app.entity.User;
import com.message_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers(String currentUsername){
        List<User> users= userRepository.findAll();

        return users.stream()
                .filter(user -> !user.getUsername().equals(currentUsername))
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.isOnline()
                ))
                .toList();
    }
}
