const { Client } = require('pg');
const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE } = require('../data/env');

// Delay in ms before attempting to reconnect after a disconnection
const RECONNECT_DELAY = 5000;

/**
 * Creates a new PostgreSQL client instance using the env vars.
 * @returns {import("pg").Client} A fresh PostgreSQL client
 */
const createClient = () => {
	return new Client({
		host: PG_HOST,
		port: Number(PG_PORT),
		user: PG_USER,
		password: PG_PASSWORD,
		database: PG_DATABASE,
	});
};

/** @type {import("pg").Client} */
let client = createClient();

/**
 * Connects to PostgreSQL with automatic reconnection on failure or disconnection.
 * Logs the host IP on successful connection.
 */
const connect = async () => {
	try {
		await client.connect();
		console.log(`Connected to database: ${PG_HOST}`);

		// Listen for unexpected disconnections and attempt to reconnect
		client.on('error', (/** @type {Error} */ err) => {
			console.error('Database connection lost:', err.message);
			reconnect();
		});
	} catch (/** @type {any} */ err) {
		console.error('Failed to connect to database:', err.message);
		reconnect();
	}
};

/**
 * Handles reconnection by creating a fresh client after a delay.
 * Prevents rapid retry loops by waiting RECONNECT_DELAY ms.
 */
const reconnect = () => {
	console.log(`Reconnecting in ${RECONNECT_DELAY / 1000}s...`);

	setTimeout(async () => {
		client = createClient();
		await connect();
	}, RECONNECT_DELAY);
};

/**
 * Returns the current active PostgreSQL client.
 * Use this instead of accessing `client` directly, since it may be reassigned on reconnect.
 * @returns {import("pg").Client}
 */
const getClient = () => client;

module.exports = { getClient, connect };
