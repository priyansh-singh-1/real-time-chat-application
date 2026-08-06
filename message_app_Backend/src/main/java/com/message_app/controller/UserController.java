package com.message_app.controller;

import com.message_app.dto.UserDTO;
import com.message_app.entity.User;
import com.message_app.repository.UserRepository;
import com.message_app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/get-all")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam String currentUsername){
        return ResponseEntity.ok(userService.getAllUsers(currentUsername));
    }
}
