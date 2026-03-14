-- Create the changelog table if it doesn't already exist
CREATE TABLE IF NOT EXISTS changelog (
    id SERIAL PRIMARY KEY,                                       -- Unique identifier for each log entry
    field_name VARCHAR(50) NOT NULL,                            -- Name of the metric that changed (e.g. num_requests)
    old_value INT NOT NULL,                                     -- Value before the change
    new_value INT NOT NULL,                                     -- Value after the change
    action VARCHAR(255) NOT NULL,                               -- Description of what triggered the change
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP     -- When the change occurred
);


-- Index for sorting by latest first (descending order on created_at)
CREATE INDEX IF NOT EXISTS idx_changelog_created_at
ON changelog (created_at DESC);
