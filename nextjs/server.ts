import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

import type { ChangelogApiResponse, MetricsApiResponse } from './data/types';


const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();


// Fetches metrics from the Express backend API
async function fetchMetricsFromBackend(): Promise<MetricsApiResponse> {
	const apiUrl = process.env.API_ROOT_URL;
	const apiKey = process.env.API_SECRET_TOKEN;

	const response = await fetch(`${apiUrl}/api/status`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey }),
	});

	return response.json() as Promise<MetricsApiResponse>;
}


// Fetches changelog from the Express backend API
async function fetchChangelogFromBackend(): Promise<ChangelogApiResponse> {
	const apiUrl = process.env.API_ROOT_URL;
	const apiKey = process.env.API_SECRET_TOKEN;

	const response = await fetch(`${apiUrl}/api/changelog`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ api_key: apiKey }),
	});

	return response.json() as Promise<ChangelogApiResponse>;
}


app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer, {
		cors: { origin: process.env.ALLOWED_ORIGIN ?? `http://localhost:${port}` },
	});


	io.on('connection', (socket) => {
		console.log(`[socket.io] client connected: ${socket.id}`);

		// Client polls every 10s — sends the last changelog ID it has
		socket.on('request-changelog', async (lastId: number) => {
			try {
				const result = await fetchChangelogFromBackend();

				if (result.success && result.data) {
					// Filter to only entries newer than the client's last known ID
					const newEntries = result.data.filter((entry) => entry.id > lastId);

					socket.emit('changelog-update', {
						success: true,
						message: 'New changelog entries',
						data: newEntries,
					});
				} else {
					socket.emit('changelog-update', result);
				}
			} catch {
				socket.emit('changelog-update', {
					success: false,
					message: 'Failed to connect to backend service',
				});
			}
		});

		// Metrics polling — unchanged from before
		socket.on('request-metrics', async () => {
			try {
				const result = await fetchMetricsFromBackend();
				socket.emit('metrics-update', result);
			} catch {
				socket.emit('metrics-update', {
					success: false,
					message: 'Failed to connect to backend service',
				});
			}
		});

		socket.on('disconnect', () => {
			console.log(`[socket.io] client disconnected: ${socket.id}`);
		});
	});


	httpServer.listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
