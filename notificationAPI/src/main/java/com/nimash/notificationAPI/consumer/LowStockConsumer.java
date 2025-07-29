package com.nimash.notificationAPI.consumer;

import com.nimash.notificationAPI.model.LowStockEvent;
import com.nimash.notificationAPI.service.EmailService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class LowStockConsumer {

    private final EmailService emailService;

    public LowStockConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(topics = "low-stock-topic", groupId = "notification-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(LowStockEvent event) {
        System.out.println("📩 Received Low Stock Alert: " + event);

        // Example: Send email to admin
        emailService.sendLowStockEmail(
                "nimsh.22@cse.mrt.ac.lk",
                event.getItemName(),
                event.getQuantity(),
                event.getThreshold()
        );
    }
}
