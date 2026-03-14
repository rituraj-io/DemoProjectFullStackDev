const dotenv = require('dotenv');

dotenv.config();

/**
 * Checks if any required keys are missing or undefined in the given object.
 * Throws an error listing all missing keys if any are found.
 * @param {Record<string, string | undefined>} vars - The key-value pairs to validate
 * @throws {Error} If one or more keys have undefined values
 */
const validateEnvVars = vars => {
	const missing = Object.entries(vars)
		.filter(([, value]) => value === undefined || value === '')
		.map(([key]) => key);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};

// PostgreSQL connection variables
const PG_HOST = process.env.PG_HOST;
const PG_PORT = process.env.PG_PORT;
const PG_USER = process.env.PG_USER;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_DATABASE = process.env.PG_DATABASE;


// API authentication
const API_SECRET_TOKEN = process.env.API_SECRET_TOKEN;


// Stripe integration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;


// Validate all required env vars on startup
validateEnvVars({ PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE, API_SECRET_TOKEN, STRIPE_SECRET_KEY });


module.exports = { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE, API_SECRET_TOKEN, STRIPE_SECRET_KEY };
