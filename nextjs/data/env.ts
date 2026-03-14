import 'server-only';

// Throws an error listing all missing or empty env vars
const validateEnvVars = (vars: Record<string, string | undefined>) => {
	const missing = Object.entries(vars)
		.filter(([, value]) => value === undefined || value === '')
		.map(([key]) => key);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};


// API connection variables
const API_ROOT_URL = process.env.API_ROOT_URL;
const API_SECRET_TOKEN = process.env.API_SECRET_TOKEN;

// Validate at runtime only — skip during `next build`
if (process.env.NEXT_PHASE !== 'phase-production-build') {
	validateEnvVars({ API_ROOT_URL, API_SECRET_TOKEN });
}

export { API_ROOT_URL, API_SECRET_TOKEN };
