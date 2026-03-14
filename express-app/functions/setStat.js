const { getClient } = require('../database/connect');


// Allowed column names to prevent SQL injection via dynamic field names
const ALLOWED_FIELDS = ['num_requests', 'num_token_used', 'num_active_connections'];


/**
 * Sets a specific metric in the global_data table to an exact value.
 * Also logs the change to the changelog table for audit tracking.
 * Uses parameterized queries to protect against SQL injection.
 * @param {string} field - The column name to set (must be one of ALLOWED_FIELDS)
 * @param {number} value - The value to set
 * @returns {Promise<{ num_requests: number, num_token_used: number, num_active_connections: number }>} The updated row
 * @throws {Error} If the field name is not in the allowed list
 */
const setStat = async (field, value) => {
	if (!ALLOWED_FIELDS.includes(field)) {
		throw new Error(`Invalid field name: "${field}". Allowed: ${ALLOWED_FIELDS.join(', ')}`);
	}

	const client = getClient();

	// Capture old value, set new value, and log to changelog in a single atomic CTE query.
	// Field name is validated above against a whitelist, so it's safe to interpolate.
	const result = await client.query(
		`WITH old_data AS (
			SELECT ${field} AS old_val FROM global_data LIMIT 1
		),
		updated AS (
			UPDATE global_data
			SET ${field} = $1
			RETURNING num_requests, num_token_used, num_active_connections, ${field} AS new_val
		),
		log AS (
			INSERT INTO changelog (field_name, old_value, new_value, action)
			SELECT $2, old_data.old_val, updated.new_val, $3
			FROM old_data, updated
		)
		SELECT num_requests, num_token_used, num_active_connections FROM updated`,
		[value, field, `Set ${field} to ${value}`]
	);

	return result.rows[0];
};


module.exports = setStat;
