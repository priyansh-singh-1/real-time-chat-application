package com.message_app.dto;

import com.message_app.entity.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageStatusUpdate {
    private Long messageId;
    private MessageStatus status;
}
