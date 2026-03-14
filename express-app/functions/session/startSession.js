const { getClient } = require('../../database/connect');


/**
 * Creates a new billing session in the database.
 * Sets the start time to now and status to 'active'.
 * @returns {Promise<{ id: number, started_at: string, status: string }>} The newly created session
 */
const startSession = async () => {
	const client = getClient();

	const result = await client.query(
		`INSERT INTO sessions (started_at, status)
		VALUES (CURRENT_TIMESTAMP, 'active')
		RETURNING id, started_at, status`
	);

	return result.rows[0];
};


module.exports = startSession;
