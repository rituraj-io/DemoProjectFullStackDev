const { getClient } = require('../../database/connect');
const { COST_PER_SECOND_CENTS } = require('../../data/constants');


/**
 * Fetches all active sessions from the database.
 * Calculates live elapsed time and running cost for each session.
 * @returns {Promise<Array<{ id: number, started_at: string, duration_seconds: number, cost_cents: number, status: string }>>}
 */
const listActiveSessions = async () => {
	const client = getClient();

	const result = await client.query(
		"SELECT id, started_at, status FROM sessions WHERE status = 'active' ORDER BY started_at DESC"
	);

	// Calculate live duration and cost for each active session
	return result.rows.map((session) => {
		const elapsedSeconds = Math.floor(
			(Date.now() - new Date(session.started_at).getTime()) / 1000
		);

		return {
			...session,
			duration_seconds: elapsedSeconds,
			cost_cents: elapsedSeconds * COST_PER_SECOND_CENTS,
		};
	});
};


module.exports = listActiveSessions;
