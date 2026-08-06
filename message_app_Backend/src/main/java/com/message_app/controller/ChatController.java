package com.message_app.controller;

import com.message_app.dto.MessageRequest;
import com.message_app.entity.MessageEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.message_app.service.ChatService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<MessageEntity> sendMessage(@RequestBody MessageRequest request){
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MessageEntity>> getHistory(@RequestParam String sender,@RequestParam String receiver){

        return ResponseEntity.ok(chatService.getConversation(sender,receiver));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MessageEntity>> getPendingMessages(@RequestParam String username){

        return ResponseEntity.ok(chatService.getPendingMessages(username));
    }
}
