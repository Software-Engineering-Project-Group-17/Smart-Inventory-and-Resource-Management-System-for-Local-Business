package com.nimash.notificationAPI.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @KafkaListener(topics = "low-stock-topic", groupId = "notification-group")
    public void consume(String message) {
        System.out.println("🔥 Consumer Triggered! Raw Message: " + message);
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            LowStockEvent event =objectMapper.readValue(message, LowStockEvent.class);

            System.out.println("📩 Received Low Stock Alert: " + event);

            emailService.sendLowStockEmail(
                    "nimsh.22@cse.mrt.ac.lk",
                    event.getItemName(),
                    event.getQuantity(),
                    event.getThreshold()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
