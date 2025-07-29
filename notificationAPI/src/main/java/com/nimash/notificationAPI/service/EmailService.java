package com.nimash.notificationAPI.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendLowStockEmail(String to, String itemName, int quantity, int threshold) {
        String subject = "🚨 Low Stock Alert!";
        String text = String.format("Item: %s\nQuantity: %d\nThreshold: %d\nPlease restock soon!",
                itemName, quantity, threshold);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
