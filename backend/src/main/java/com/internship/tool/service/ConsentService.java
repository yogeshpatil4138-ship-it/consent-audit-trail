package com.internship.tool.service;

import com.internship.tool.dto.ConsentDtos;
import com.internship.tool.entity.ConsentRecord;
import com.internship.tool.exception.NotFoundException;
import com.internship.tool.repository.ConsentRecordRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ConsentService {

    private final ConsentRecordRepository repo;
    private final AiServiceClient ai;
    private final AuditService audit;

    public ConsentService(ConsentRecordRepository repo, AiServiceClient ai, AuditService audit) {
        this.repo = repo; this.ai = ai; this.audit = audit;
    }

    public Page<ConsentDtos.Response> list(Pageable p) {
        return repo.findAllByDeletedFalse(p).map(ConsentDtos.Response::from);
    }

    public Page<ConsentDtos.Response> search(String q, Pageable p) {
        if (q == null || q.isBlank()) return list(p);
        return repo.search(q.trim(), p).map(ConsentDtos.Response::from);
    }

    @Cacheable(value = "consent", key = "#id")
    public ConsentDtos.Response get(Long id) {
        var c = repo.findById(id).filter(x -> !x.isDeleted())
                .orElseThrow(() -> new NotFoundException("Consent " + id + " not found"));
        return ConsentDtos.Response.from(c);
    }

    @Transactional
    @CacheEvict(value = "consent", allEntries = true)
    public ConsentDtos.Response create(ConsentDtos.CreateRequest req) {
        ConsentRecord c = ConsentRecord.builder()
                .subjectId(req.getSubjectId())
                .subjectEmail(req.getSubjectEmail())
                .purpose(req.getPurpose())
                .legalBasis(req.getLegalBasis())
                .consentGiven(req.isConsentGiven())
                .grantedAt(req.getGrantedAt())
                .expiresAt(req.getExpiresAt())
                .status(deriveStatus(req.isConsentGiven(), req.getExpiresAt(), null))
                .source(req.getSource())
                .evidenceUrl(req.getEvidenceUrl())
                .dataCategories(req.getDataCategories())
                .deleted(false)
                .build();
        var saved = repo.save(c);
        audit.log("ConsentRecord", saved.getId().toString(), "CREATE",
                  "purpose=" + saved.getPurpose());
        enrichAsync(saved.getId());
        return ConsentDtos.Response.from(saved);
    }

    @Transactional
    @CacheEvict(value = "consent", key = "#id")
    public ConsentDtos.Response update(Long id, ConsentDtos.UpdateRequest req) {
        var c = repo.findById(id).filter(x -> !x.isDeleted())
                .orElseThrow(() -> new NotFoundException("Consent " + id + " not found"));
        if (req.getSubjectEmail() != null)  c.setSubjectEmail(req.getSubjectEmail());
        if (req.getPurpose() != null)       c.setPurpose(req.getPurpose());
        if (req.getLegalBasis() != null)    c.setLegalBasis(req.getLegalBasis());
        if (req.getConsentGiven() != null)  c.setConsentGiven(req.getConsentGiven());
        if (req.getGrantedAt() != null)     c.setGrantedAt(req.getGrantedAt());
        if (req.getExpiresAt() != null)     c.setExpiresAt(req.getExpiresAt());
        if (req.getWithdrawnAt() != null)   c.setWithdrawnAt(req.getWithdrawnAt());
        if (req.getSource() != null)        c.setSource(req.getSource());
        if (req.getEvidenceUrl() != null)   c.setEvidenceUrl(req.getEvidenceUrl());
        if (req.getDataCategories() != null)c.setDataCategories(req.getDataCategories());
        c.setStatus(req.getStatus() != null ? req.getStatus()
                : deriveStatus(c.isConsentGiven(), c.getExpiresAt(), c.getWithdrawnAt()));
        audit.log("ConsentRecord", id.toString(), "UPDATE", "status=" + c.getStatus());
        return ConsentDtos.Response.from(c);
    }

    @Transactional
    @CacheEvict(value = "consent", key = "#id")
    public void softDelete(Long id) {
        var c = repo.findById(id).orElseThrow(() -> new NotFoundException("Consent " + id + " not found"));
        c.setDeleted(true);
        audit.log("ConsentRecord", id.toString(), "DELETE", null);
    }

    public ConsentDtos.Stats stats() {
        long total = repo.countByDeletedFalse();
        long active = repo.countByDeletedFalseAndStatus("ACTIVE");
        long expired = repo.countByDeletedFalseAndStatus("EXPIRED");
        long withdrawn = repo.countByDeletedFalseAndStatus("WITHDRAWN");
        return ConsentDtos.Stats.builder()
                .total(total).active(active).expired(expired).withdrawn(withdrawn).build();
    }

    public Map<String,Object> aiReport() {
        var s = stats();
        Map<String,Object> body = Map.of(
                "total", s.getTotal(),
                "active", s.getActive(),
                "expired", s.getExpired(),
                "withdrawn", s.getWithdrawn()
        );
        var r = ai.generateReport(body);
        if (r == null) {
            return Map.of("is_fallback", true,
                          "title", "Consent Audit Report",
                          "summary", "AI service unavailable — showing cached stats.",
                          "stats", body);
        }
        return r;
    }

    @Async
    @Transactional
    public void enrichAsync(Long id) {
        try {
            var opt = repo.findById(id);
            if (opt.isEmpty()) return;
            var c = opt.get();
            var res = ai.describe(c.getSubjectId(), c.getPurpose(), c.getLegalBasis());
            if (res != null) {
                Object desc = res.get("description");
                Object score = res.get("compliance_score");
                if (desc != null) c.setAiDescription(desc.toString());
                if (score instanceof Number n) c.setAiScore(n.intValue());
                repo.save(c);
            }
        } catch (Exception ignored) { /* keep record valid */ }
    }

    private String deriveStatus(boolean consentGiven, LocalDateTime expiresAt, LocalDateTime withdrawnAt) {
        if (withdrawnAt != null) return "WITHDRAWN";
        if (!consentGiven) return "PENDING";
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) return "EXPIRED";
        return "ACTIVE";
    }
}
