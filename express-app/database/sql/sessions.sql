-- Create the sessions table if it doesn't already exist
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,                                          -- Unique session identifier
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,        -- When the session began
    ended_at TIMESTAMP,                                             -- When the session ended (null if still active)
    duration_seconds INT,                                           -- Final duration in seconds
    cost_cents INT,                                                 -- Final cost in cents (duration × rate)
    status VARCHAR(20) NOT NULL DEFAULT 'active',                   -- Session state: 'active' or 'completed'
    stripe_payment_intent_id VARCHAR(255)                           -- Stripe payment intent ID (null until session ends)
);


-- Index for filtering sessions by status (e.g. finding active sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_status
ON sessions (status);
