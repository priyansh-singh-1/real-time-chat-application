package com.message_app.controller;

import com.message_app.dto.AuthRequest;
import com.message_app.dto.AuthResponse;
import com.message_app.dto.LoginRequest;
import com.message_app.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request){
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.authenticateUser(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestParam String username){
        authService.logout(username);
        return ResponseEntity.ok("Logged out successfully");
    }
}
