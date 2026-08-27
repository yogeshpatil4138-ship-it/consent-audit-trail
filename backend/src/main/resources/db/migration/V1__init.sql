-- Core consent record table
CREATE TABLE consent_record (
    id               BIGSERIAL PRIMARY KEY,
    subject_id       VARCHAR(120) NOT NULL,
    subject_email    VARCHAR(255),
    purpose          VARCHAR(500) NOT NULL,
    legal_basis      VARCHAR(80)  NOT NULL,
    consent_given    BOOLEAN      NOT NULL DEFAULT FALSE,
    granted_at       TIMESTAMP,
    expires_at       TIMESTAMP,
    withdrawn_at     TIMESTAMP,
    status           VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    source           VARCHAR(80),
    evidence_url     VARCHAR(500),
    data_categories  TEXT,
    ai_description   TEXT,
    ai_score         INTEGER,
    deleted          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(120),
    updated_by       VARCHAR(120)
);

CREATE INDEX idx_consent_subject      ON consent_record (subject_id);
CREATE INDEX idx_consent_status       ON consent_record (status);
CREATE INDEX idx_consent_expires_at   ON consent_record (expires_at);
CREATE INDEX idx_consent_deleted      ON consent_record (deleted);
CREATE INDEX idx_consent_purpose_trgm ON consent_record (purpose);
