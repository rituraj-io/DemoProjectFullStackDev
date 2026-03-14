const { getClient } = require('../database/connect');

/**
 * Fetches the latest server metrics from the global_data table.
 * Returns the single row containing num_requests, num_token_used, and num_active_connections.
 * @returns {Promise<{ num_requests: number, num_token_used: number, num_active_connections: number }>}
 */
const fetchLatestStats = async () => {
	const client = getClient();

	const result = await client.query(
		'SELECT num_requests, num_token_used, num_active_connections FROM global_data LIMIT 1'
	);

	return result.rows[0];
};

module.exports = fetchLatestStats;
