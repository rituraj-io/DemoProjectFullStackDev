const express = require('express');
const { connect } = require('./database/connect');
const initTables = require('./database/initTables');
const fetchLatestStats = require('./functions/fetchLatestStats');
const fetchChangelog = require('./functions/fetchChangelog');
const updateStat = require('./functions/updateStat');
const authGuard = require('./functions/middleware/authGuard');
const startSession = require('./functions/session/startSession');
const endSession = require('./functions/session/endSession');
const getSessionStatus = require('./functions/session/getSessionStatus');

const app = express();
const PORT = 4000;

// Parse incoming JSON request bodies
app.use(express.json());

/**
 * POST /api/status
 * Returns current server metrics from the database.
 * Increments the num_requests counter on each call.
 * @returns {{ success: boolean, message: string, data: { num_requests: number, num_token_used: number, num_active_connections: number } }}
 */
app.post('/api/status', authGuard, async (req, res) => {
	try {
		await updateStat('num_requests');
		const data = await fetchLatestStats();

		res.json({
			success: true,
			message: 'Server metrics retrieved successfully',
			data,
		});
	} catch (/** @type {any} */ err) {
		res.status(500).json({
			success: false,
			message: err.message,
			data: null,
		});
	}
});

/**
 * POST /api/changelog
 * Returns the latest changelog entries sorted by newest first.
 * @returns {{ success: boolean, message: string, data: Array<{ id: number, field_name: string, old_value: number, new_value: number, action: string, created_at: string }> }}
 */
app.post('/api/changelog', authGuard, async (req, res) => {
	try {
		const data = await fetchChangelog();

		res.json({
			success: true,
			message: 'Changelog retrieved successfully',
			data,
		});
	} catch (/** @type {any} */ err) {
		res.status(500).json({
			success: false,
			message: err.message,
			data: null,
		});
	}
});

/**
 * POST /api/session/start
 * Creates a new billing session and returns the session ID.
 * @returns {{ success: boolean, message: string, data: { id: number, started_at: string, status: string } }}
 */
app.post('/api/session/start', authGuard, async (req, res) => {
	try {
		const data = await startSession();

		res.json({
			success: true,
			message: 'Session started successfully',
			data,
		});
	} catch (/** @type {any} */ err) {
		res.status(500).json({
			success: false,
			message: err.message,
			data: null,
		});
	}
});


/**
 * POST /api/session/end
 * Ends an active session, calculates cost, and creates a Stripe payment intent.
 * @returns {{ success: boolean, message: string, data: { id: number, duration_seconds: number, cost_cents: number, status: string, stripe_payment_intent_id: string, client_secret: string } }}
 */
app.post('/api/session/end', authGuard, async (req, res) => {
	try {
		const { session_id } = req.body;

		if (!session_id) {
			res.status(400).json({
				success: false,
				message: 'Missing required field: session_id',
				data: null,
			});
			return;
		}

		const data = await endSession(session_id);

		res.json({
			success: true,
			message: 'Session ended successfully',
			data,
		});
	} catch (/** @type {any} */ err) {
		res.status(500).json({
			success: false,
			message: err.message,
			data: null,
		});
	}
});


/**
 * POST /api/session/status
 * Returns the current state of a session, including live elapsed time and running cost for active sessions.
 * @returns {{ success: boolean, message: string, data: { id: number, started_at: string, ended_at: string | null, duration_seconds: number, cost_cents: number, status: string, stripe_payment_intent_id: string | null } }}
 */
app.post('/api/session/status', authGuard, async (req, res) => {
	try {
		const { session_id } = req.body;

		if (!session_id) {
			res.status(400).json({
				success: false,
				message: 'Missing required field: session_id',
				data: null,
			});
			return;
		}

		const data = await getSessionStatus(session_id);

		res.json({
			success: true,
			message: 'Session status retrieved successfully',
			data,
		});
	} catch (/** @type {any} */ err) {
		res.status(500).json({
			success: false,
			message: err.message,
			data: null,
		});
	}
});


// Connect to the database, initialize tables, then start the server
const start = async () => {
	try {
		await connect();
		await initTables();

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (/** @type {any} */ err) {
		console.error('Failed to start server:', err.message);
		process.exit(1);
	}
};

start();
