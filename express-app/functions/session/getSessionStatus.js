const { getClient } = require('../../database/connect');
const { COST_PER_SECOND_CENTS } = require('../../data/constants');


/**
 * Retrieves a session's current state from the database.
 * For active sessions, calculates the elapsed time and running cost on the fly.
 * @param {number} sessionId - The session ID to look up
 * @returns {Promise<{ id: number, started_at: string, ended_at: string | null, duration_seconds: number, cost_cents: number, status: string, stripe_payment_intent_id: string | null }>}
 * @throws {Error} If the session is not found
 */
const getSessionStatus = async (sessionId) => {
	const client = getClient();

	const result = await client.query(
		'SELECT id, started_at, ended_at, duration_seconds, cost_cents, status, stripe_payment_intent_id FROM sessions WHERE id = $1',
		[sessionId]
	);

	if (result.rows.length === 0) {
		throw new Error(`Session with id ${sessionId} not found`);
	}

	const session = result.rows[0];

	// For active sessions, calculate live elapsed time and running cost
	if (session.status === 'active') {
		const elapsedSeconds = Math.floor(
			(Date.now() - new Date(session.started_at).getTime()) / 1000
		);

		session.duration_seconds = elapsedSeconds;
		session.cost_cents = elapsedSeconds * COST_PER_SECOND_CENTS;
	}

	return session;
};


module.exports = getSessionStatus;
