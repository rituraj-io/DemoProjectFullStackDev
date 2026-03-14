const { getClient } = require('../../database/connect');
const { STRIPE_SECRET_KEY } = require('../../data/env');
const { COST_PER_SECOND_CENTS } = require('../../data/constants');
// @ts-ignore -- Stripe's CJS export is callable but TS types declare it as a class
const stripe = require('stripe')(STRIPE_SECRET_KEY);


/**
 * Ends an active session, calculates the final cost, and creates a Stripe payment intent.
 * Uses an atomic UPDATE to prevent race conditions on concurrent end requests.
 * @param {number} sessionId - The session ID to end
 * @returns {Promise<{ id: number, duration_seconds: number, cost_cents: number, status: string, stripe_payment_intent_id: string, client_secret: string }>}
 * @throws {Error} If the session is not found or is not active
 */
const endSession = async (sessionId) => {
	const client = getClient();

	// Atomically claim the session — only succeeds if status is currently 'active'
	const lockResult = await client.query(
		`UPDATE sessions SET status = 'processing'
		WHERE id = $1 AND status = 'active'
		RETURNING id, started_at`,
		[sessionId]
	);

	if (lockResult.rows.length === 0) {
		// Check if session exists at all to give a descriptive error
		const exists = await client.query('SELECT status FROM sessions WHERE id = $1', [sessionId]);

		if (exists.rows.length === 0) {
			throw new Error(`Session with id ${sessionId} not found`);
		}

		throw new Error(`Session ${sessionId} is already ${exists.rows[0].status}`);
	}

	const session = lockResult.rows[0];

	// Calculate duration and cost
	const durationSeconds = Math.floor(
		(Date.now() - new Date(session.started_at).getTime()) / 1000
	);
	const costCents = durationSeconds * COST_PER_SECOND_CENTS;

	// Stripe requires a minimum of 50 cents for payment intents
	const chargeAmount = Math.max(costCents, 50);

	// Create a Stripe payment intent for the calculated cost
	const paymentIntent = await stripe.paymentIntents.create({
		amount: chargeAmount,
		currency: 'usd',
		description: `Billing session #${sessionId} — ${durationSeconds}s at $0.02/sec`,
		automatic_payment_methods: { enabled: true },
		shipping: {
			name: 'Demo Customer',
			address: {
				line1: '123 Test Street',
				city: 'San Francisco',
				state: 'CA',
				postal_code: '94105',
				country: 'US',
			},
		},
		metadata: {
			session_id: String(sessionId),
			duration_seconds: String(durationSeconds),
			raw_cost_cents: String(costCents),
		},
	});

	// Update the session row with final values (store chargeAmount to match what Stripe charged)
	const updateResult = await client.query(
		`UPDATE sessions
		SET ended_at = CURRENT_TIMESTAMP,
			duration_seconds = $1,
			cost_cents = $2,
			status = 'completed',
			stripe_payment_intent_id = $3
		WHERE id = $4
		RETURNING id, duration_seconds, cost_cents, status, stripe_payment_intent_id`,
		[durationSeconds, chargeAmount, paymentIntent.id, sessionId]
	);

	return {
		...updateResult.rows[0],
		client_secret: paymentIntent.client_secret,
	};
};


module.exports = endSession;
