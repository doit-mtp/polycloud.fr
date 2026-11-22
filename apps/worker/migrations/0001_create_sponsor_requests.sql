-- Sponsor requests sent from https://polycloud.fr.
-- No IP address or user agent is stored. Rows are deleted 3 years after created_at (weekly cron).
CREATE TABLE sponsor_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL, -- ISO 8601, UTC
  company       TEXT    NOT NULL,
  website       TEXT,
  contact_name  TEXT    NOT NULL,
  role          TEXT,
  email         TEXT    NOT NULL,
  phone         TEXT,
  tier_id       TEXT    NOT NULL,
  tier_label    TEXT    NOT NULL,
  message       TEXT
);

CREATE INDEX sponsor_requests_created_at ON sponsor_requests (created_at);
