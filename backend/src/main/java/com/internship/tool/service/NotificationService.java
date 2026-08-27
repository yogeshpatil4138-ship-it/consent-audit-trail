package com.internship.tool.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mail;
    private final String username;

    public NotificationService(JavaMailSender mail, @Value("${spring.mail.username}") String username) {
        this.mail = mail; this.username = username;
    }

    public void sendExpiryAlert(String to, String subjectId, String purpose) {
        if (to == null || to.isBlank() || username == null || username.isBlank()) {
            log.info("Mail skipped (no SMTP config) to={} subject={}", to, subjectId);
            return;
        }
        try {
            SimpleMailMessage m = new SimpleMailMessage();
            m.setFrom(username);
            m.setTo(to);
            m.setSubject("Consent Expiring Soon — " + subjectId);
            m.setText("Your consent (purpose: " + purpose + ") is expiring within 7 days.");
            mail.send(m);
        } catch (Exception e) {
            log.warn("Failed to send mail to {}: {}", to, e.getMessage());
        }
    }
}
