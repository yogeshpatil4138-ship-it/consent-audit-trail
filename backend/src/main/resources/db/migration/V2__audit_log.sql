CREATE TABLE audit_log (
    id           BIGSERIAL PRIMARY KEY,
    entity_type  VARCHAR(80)  NOT NULL,
    entity_id    VARCHAR(80),
    action       VARCHAR(30)  NOT NULL,
    actor        VARCHAR(120),
    details      TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity     ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_log (created_at);
