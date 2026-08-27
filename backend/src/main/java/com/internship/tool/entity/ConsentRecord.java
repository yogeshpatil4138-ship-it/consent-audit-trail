package com.internship.tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "consent_record")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_id", nullable = false, length = 120)
    private String subjectId;

    @Column(name = "subject_email", length = 255)
    private String subjectEmail;

    @Column(nullable = false, length = 500)
    private String purpose;

    @Column(name = "legal_basis", nullable = false, length = 80)
    private String legalBasis;

    @Column(name = "consent_given", nullable = false)
    private boolean consentGiven;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 80)
    private String source;

    @Column(name = "evidence_url", length = 500)
    private String evidenceUrl;

    @Column(name = "data_categories", columnDefinition = "TEXT")
    private String dataCategories;

    @Column(name = "ai_description", columnDefinition = "TEXT")
    private String aiDescription;

    @Column(name = "ai_score")
    private Integer aiScore;

    @Column(nullable = false)
    private boolean deleted;

    @CreatedDate  @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy  @Column(name = "created_by", length = 120)
    private String createdBy;

    @LastModifiedBy @Column(name = "updated_by", length = 120)
    private String updatedBy;
}
