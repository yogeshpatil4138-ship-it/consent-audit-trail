package com.internship.tool.service;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.repository.AuditLogRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository repo;
    public AuditService(AuditLogRepository repo) { this.repo = repo; }

    public void log(String entityType, String entityId, String action, String details) {
        String actor = "system";
        var ctx = SecurityContextHolder.getContext().getAuthentication();
        if (ctx != null && ctx.isAuthenticated()) actor = ctx.getName();
        repo.save(AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .actor(actor)
                .details(details)
                .build());
    }
}
