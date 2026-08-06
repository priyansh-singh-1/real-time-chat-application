package com.message_app.dto;

import lombok.Data;
import org.hibernate.dialect.function.SumReturnTypeResolver;

@Data

public class MessageRequest {
    private String sender;
    private String receiver;
    private String content;
}
