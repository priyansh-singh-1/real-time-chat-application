package com.message_app.controller;

import com.message_app.dto.ChatMessage;
import com.message_app.dto.MessageStatusUpdate;
import com.message_app.dto.TypingStatus;
import com.message_app.dto.UserStatus;
import com.message_app.entity.MessageEntity;
import com.message_app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage chatMessage){
        MessageEntity saved= chatService.saveMessage(chatMessage);
        System.out.println("Saved: " + saved);

//        messagingTemplate.convertAndSendToUser(
//                saved.getReceiver(),
//                "/queue/messages",
//                saved
//        );
//
//        messagingTemplate.convertAndSendToUser(
//                saved.getSender(),
//                "/queue/messages",
//                saved
//        );
        System.out.println("Sending to: /topic/messages/" + saved.getReceiver());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + saved.getReceiver(),

                saved
        );

        System.out.println("Sending to: /topic/messages/" + saved.getSender());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + saved.getSender(),
                saved
        );
    }

    @MessageMapping("/message.delivered")
    public void messageDelivered(MessageStatusUpdate update){

        MessageEntity message= chatService.updateMessageStatus(
                update.getMessageId(),
                update.getStatus()
        );

        messagingTemplate.convertAndSend(
                "/topic/message-status",
                update
        );
    }

    @MessageMapping("/typing")
    public void typing(TypingStatus status){

        System.out.println(
                "⌨️ Typing event: "
                        + status.getSender()
                        + " -> "
                        + status.getReceiver()
                        + " : "
                        + status.isTyping()
        );

        messagingTemplate.convertAndSend(
                "/topic/typing/"+ status.getReceiver(),
                status
        );
    }

}
