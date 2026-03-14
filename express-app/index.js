const express = require('express');

const app = express(),
	PORT = 3000;

/**
 * In-memory store for server metrics, initialized at startup.
 * @type {{ num_requests: number, num_token_used: number, num_active_connections: number }}
 */
const metrics = {
	num_requests: 0,
	num_token_used: 0,
	num_active_connections: 0,
};

/**
 * Middleware to track every incoming request.
 * Increments the request counter for each hit.
 */
app.use((req, res, next) => {
	metrics.num_requests++;
	next();
});

/**
 * GET /api/status
 * Returns current server metrics including request count, token usage, and active connections.
 * @returns {{ success: boolean, message: string, data: typeof metrics }}
 */
app.get('/api/status', (req, res) => {
	res.json({
		success: true,
		message: 'Server metrics retrieved successfully',
		data: { ...metrics },
	});
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
