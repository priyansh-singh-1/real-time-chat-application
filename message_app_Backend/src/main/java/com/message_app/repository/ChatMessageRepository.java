package com.message_app.repository;


import com.message_app.dto.MessageStatusUpdate;
import com.message_app.entity.MessageEntity;
import com.message_app.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.ref.SoftReference;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<MessageEntity,Long> {
    List<MessageEntity> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            String sender,
            String receiver,
            String receiver2,
            String sender2

    );

    Optional<MessageEntity> findById(Long id);
    List<MessageEntity> findByReceiverAndStatus(
            String receiver,
            MessageStatus status
    );
}
