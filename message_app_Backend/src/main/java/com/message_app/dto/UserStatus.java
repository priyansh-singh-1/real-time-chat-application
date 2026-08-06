package com.message_app.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserStatus {
    private String username;
    private boolean online;
}
