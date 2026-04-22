package com.organicshop.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(String toEmail, String customerName, Long orderId, String totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Organic Shop - Order Confirmation #" + orderId);
        message.setText("Dear " + customerName + ",\n\n" +
                "Thank you for your order!\n" +
                "Your order #" + orderId + " has been successfully placed.\n" +
                "Total Amount: $" + totalAmount + "\n\n" +
                "We will notify you once it's shipped.\n\n" +
                "Best regards,\n" +
                "Organic Shop Team");

        mailSender.send(message);
    }
}
