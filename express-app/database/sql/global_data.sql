-- Create the global_data table if it doesn't already exist
CREATE TABLE IF NOT EXISTS global_data (
    id INT PRIMARY KEY AUTO_INCREMENT,                -- Unique identifier for the row
    num_requests INT NOT NULL DEFAULT 0,              -- Total number of API requests made
    num_token_used INT NOT NULL DEFAULT 0,            -- Total number of tokens consumed
    num_active_connections INT NOT NULL DEFAULT 0     -- Current number of active connections
);


-- Insert the default row only if the table is empty
INSERT INTO global_data (num_requests, num_token_used, num_active_connections)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM global_data);
