import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

import type {
	ActiveSessionsApiResponse,
	ChangelogApiResponse,
	ConnectionsApiResponse,
	MetricsApiResponse,
} from './data/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const apiUrl = process.env.API_ROOT_URL;
const apiKey = process.env.API_SECRET_TOKEN;

// How often to broadcast metrics + changelog to all clients (ms)
const METRICS_BROADCAST_INTERVAL = 10_000;

// How often to broadcast active sessions to all clients (ms)
const SESSIONS_BROADCAST_INTERVAL = 5_000;

// Track the highest changelog ID seen so far — only broadcast new entries
let lastBroadcastChangelogId = 0;

// Fetches metrics from the Express backend API
async function fetchMetricsFromBackend(): Promise<MetricsApiResponse> {
	const response = await fetch(`${apiUrl}/api/status`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey }),
	});

	return response.json() as Promise<MetricsApiResponse>;
}

// Fetches changelog from the Express backend API
async function fetchChangelogFromBackend(): Promise<ChangelogApiResponse> {
	const response = await fetch(`${apiUrl}/api/changelog`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey }),
	});

	return response.json() as Promise<ChangelogApiResponse>;
}

// Fetches active sessions from the Express backend API
async function fetchActiveSessionsFromBackend(): Promise<ActiveSessionsApiResponse> {
	const response = await fetch(`${apiUrl}/api/session/active`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey }),
	});

	return response.json() as Promise<ActiveSessionsApiResponse>;
}

// Notifies the Express backend when a WebSocket connection opens or closes
async function updateActiveConnections(amount: number): Promise<ConnectionsApiResponse> {
	const response = await fetch(`${apiUrl}/api/connections/update`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey, amount }),
	});

	return response.json() as Promise<ConnectionsApiResponse>;
}

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer, {
		cors: { origin: process.env.ALLOWED_ORIGIN ?? `http://localhost:${port}` },
	});

	// -- Global broadcast: metrics + changelog every 10s --
	setInterval(async () => {
		try {
			const [metricsResult, changelogResult] = await Promise.all([
				fetchMetricsFromBackend(),
				fetchChangelogFromBackend(),
			]);

			if (metricsResult.success) {
				io.emit('metrics-update', metricsResult);
			}

			if (changelogResult.success && changelogResult.data) {
				// Only broadcast entries newer than the last broadcast
				const newEntries = changelogResult.data.filter(entry => entry.id > lastBroadcastChangelogId);

				if (newEntries.length > 0) {
					lastBroadcastChangelogId = Math.max(...newEntries.map(e => e.id));

					io.emit('changelog-update', {
						success: true,
						message: 'New changelog entries',
						data: newEntries,
					});
				}
			}
		} catch (err) {
			console.error('[broadcast] metrics/changelog fetch failed:', err);
		}
	}, METRICS_BROADCAST_INTERVAL);

	// -- Global broadcast: active sessions every 5s --
	setInterval(async () => {
		try {
			const result = await fetchActiveSessionsFromBackend();

			if (result.success) {
				io.emit('active-sessions-update', result);
			}
		} catch (err) {
			console.error('[broadcast] active sessions fetch failed:', err);
		}
	}, SESSIONS_BROADCAST_INTERVAL);

	io.on('connection', async socket => {
		console.log(`[socket.io] client connected: ${socket.id}`);

		// Increment active connections in the DB and broadcast to all clients
		try {
			const result = await updateActiveConnections(1);
			if (result.success && result.data) {
				io.emit('connections-update', result.data.num_active_connections);
			}
		} catch (err) {
			console.error('[socket.io] failed to update connections on connect:', err);
		}

		// Decrement active connections in the DB and broadcast to all clients
		socket.on('disconnect', async () => {
			console.log(`[socket.io] client disconnected: ${socket.id}`);

			try {
				const result = await updateActiveConnections(-1);
				if (result.success && result.data) {
					io.emit('connections-update', result.data.num_active_connections);
				}
			} catch (err) {
				console.error('[socket.io] failed to update connections on disconnect:', err);
			}
		});
	});

	httpServer.listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
