const express = require('express');
const { connect } = require('./database/connect');
const initTables = require('./database/initTables');
const fetchLatestStats = require('./functions/fetchLatestStats');
const fetchChangelog = require('./functions/fetchChangelog');
const updateStat = require('./functions/updateStat');
const authGuard = require('./functions/middleware/authGuard');

const app = express();
const PORT = 4000;

// Parse incoming JSON request bodies
app.use(express.json());

/**
 * Middleware to track every incoming request.
 * Increments the num_requests counter in the database.
 */
app.use(async (req, res, next) => {
	await updateStat('num_requests');
	next();
});

/**
 * POST /api/status
 * Returns current server metrics from the database.
 * @returns {{ success: boolean, message: string, data: { num_requests: number, num_token_used: number, num_active_connections: number } }}
 */
app.post('/api/status', authGuard, async (req, res) => {
	try {
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

// Connect to the database, initialize tables, then start the server
connect().then(async () => {
	await initTables();

	app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
});
