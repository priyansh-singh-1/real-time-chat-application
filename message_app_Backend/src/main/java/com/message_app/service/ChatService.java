package com.message_app.service;

import com.message_app.MessageAppApplication;
import com.message_app.dto.ChatMessage;
import com.message_app.dto.MessageRequest;
import com.message_app.dto.MessageStatusUpdate;
import com.message_app.entity.MessageEntity;
import com.message_app.entity.MessageStatus;
import com.message_app.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public MessageEntity sendMessage(MessageRequest request){

        MessageEntity message= MessageEntity.builder()
                .sender(request.getSender())
                .receiver(request.getReceiver())
                .content(request.getContent())
                .timestamp(LocalDateTime.now())

                .build();




        return chatMessageRepository.save(message);
    }

    public List<MessageEntity> getConversation(String sender,String receiver){
        return chatMessageRepository.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
                sender,
                receiver,
                sender,
                receiver
        ); 
    }

    public MessageEntity saveMessage(ChatMessage request){
        MessageEntity message = MessageEntity.builder()
                .sender(request.getSender())
                .receiver(request.getReceiver())
                .content(request.getContent())
                .timestamp(LocalDateTime.now())
                .status(MessageStatus.SENT)
                .build();

        return chatMessageRepository.save(message);

    }

    public MessageEntity updateMessageStatus(Long id,MessageStatus status){
        MessageEntity message= chatMessageRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Message not found"));

        message.setStatus(status);

        return chatMessageRepository.save(message);
    }

    public List<MessageEntity> getPendingMessages(String username){
        return chatMessageRepository.findByReceiverAndStatus(
                username,
                MessageStatus.SENT
        );
    }
}
