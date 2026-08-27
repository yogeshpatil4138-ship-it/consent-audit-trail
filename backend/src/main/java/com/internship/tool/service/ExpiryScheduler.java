package com.internship.tool.service;

import com.internship.tool.repository.ConsentRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryScheduler.class);

    private final ConsentRecordRepository repo;
    private final NotificationService notify;

    public ExpiryScheduler(ConsentRecordRepository repo, NotificationService notify) {
        this.repo = repo; this.notify = notify;
    }

    // Daily 08:00 UTC
    @Scheduled(cron = "0 0 8 * * *")
    public void dailyExpiryReminder() {
        var now = LocalDateTime.now();
        var soon = now.plusDays(7);
        var list = repo.findExpiringBetween(now, soon);
        log.info("Expiry reminder: {} consents expiring in 7 days", list.size());
        for (var c : list) notify.sendExpiryAlert(c.getSubjectEmail(), c.getSubjectId(), c.getPurpose());
    }
}
