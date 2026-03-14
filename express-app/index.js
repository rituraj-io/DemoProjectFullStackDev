const express = require('express');
const { connect } = require('./database/connect');
const fetchLatestStats = require('./functions/fetchLatestStats');
const updateStat = require('./functions/updateStat');

const app = express();
const PORT = 3000;

/**
 * Middleware to track every incoming request.
 * Increments the num_requests counter in the database.
 */
app.use(async (req, res, next) => {
	await updateStat('num_requests');
	next();
});

/**
 * GET /api/status
 * Returns current server metrics from the database.
 * @returns {{ success: boolean, message: string, data: { num_requests: number, num_token_used: number, num_active_connections: number } }}
 */
app.get('/api/status', async (req, res) => {
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

// Connect to the database, then start the server
connect().then(() => {
	app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
});
