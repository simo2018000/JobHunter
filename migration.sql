ALTER TABLE jobs ADD COLUMN score INTEGER;
ALTER TABLE jobs ADD COLUMN match_reason TEXT;
ALTER TABLE jobs ADD COLUMN required_skills TEXT;
ALTER TABLE jobs ADD COLUMN contract_type TEXT;

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    status TEXT,
    notes TEXT,
    applied_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id)
);
