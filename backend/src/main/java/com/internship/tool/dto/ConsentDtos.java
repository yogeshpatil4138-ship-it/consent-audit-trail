package com.internship.tool.dto;

import com.internship.tool.entity.ConsentRecord;
import jakarta.validation.constraints.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ConsentDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank @Size(max = 120) private String subjectId;
        @Email    @Size(max = 255) private String subjectEmail;
        @NotBlank @Size(max = 500) private String purpose;
        @NotBlank @Size(max = 80)  private String legalBasis;
        private boolean consentGiven;
        private LocalDateTime grantedAt;
        private LocalDateTime expiresAt;
        @Size(max = 80)  private String source;
        @Size(max = 500) private String evidenceUrl;
        private String dataCategories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @Size(max = 255) private String subjectEmail;
        @Size(max = 500) private String purpose;
        @Size(max = 80)  private String legalBasis;
        private Boolean consentGiven;
        private LocalDateTime grantedAt;
        private LocalDateTime expiresAt;
        private LocalDateTime withdrawnAt;
        @Size(max = 30)  private String status;
        @Size(max = 80)  private String source;
        @Size(max = 500) private String evidenceUrl;
        private String dataCategories;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response implements Serializable {
        private Long id;
        private String subjectId;
        private String subjectEmail;
        private String purpose;
        private String legalBasis;
        private boolean consentGiven;
        private LocalDateTime grantedAt;
        private LocalDateTime expiresAt;
        private LocalDateTime withdrawnAt;
        private String status;
        private String source;
        private String evidenceUrl;
        private String dataCategories;
        private String aiDescription;
        private Integer aiScore;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(ConsentRecord c) {
            return Response.builder()
                    .id(c.getId())
                    .subjectId(c.getSubjectId())
                    .subjectEmail(c.getSubjectEmail())
                    .purpose(c.getPurpose())
                    .legalBasis(c.getLegalBasis())
                    .consentGiven(c.isConsentGiven())
                    .grantedAt(c.getGrantedAt())
                    .expiresAt(c.getExpiresAt())
                    .withdrawnAt(c.getWithdrawnAt())
                    .status(c.getStatus())
                    .source(c.getSource())
                    .evidenceUrl(c.getEvidenceUrl())
                    .dataCategories(c.getDataCategories())
                    .aiDescription(c.getAiDescription())
                    .aiScore(c.getAiScore())
                    .createdAt(c.getCreatedAt())
                    .updatedAt(c.getUpdatedAt())
                    .build();
        }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Stats {
        private long total;
        private long active;
        private long expired;
        private long withdrawn;
    }
}