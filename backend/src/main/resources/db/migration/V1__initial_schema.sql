CREATE TABLE match (
    id           UUID PRIMARY KEY,
    started_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    total_score  INTEGER
);

CREATE TABLE round (
    id                   UUID PRIMARY KEY,
    match_id             UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    round_number         INTEGER NOT NULL,
    target_hue           DOUBLE PRECISION NOT NULL,
    target_saturation    DOUBLE PRECISION NOT NULL,
    target_brightness    DOUBLE PRECISION NOT NULL,
    submitted_hue        DOUBLE PRECISION,
    submitted_saturation DOUBLE PRECISION,
    submitted_brightness DOUBLE PRECISION,
    accuracy             DOUBLE PRECISION,
    score                INTEGER,
    UNIQUE (match_id, round_number)
);

CREATE INDEX idx_round_match_id ON round(match_id);
