import DashboardClient from './components/DashboardClient';
import { API_ROOT_URL, API_SECRET_TOKEN } from '@/data/env';
import type { MetricsApiResponse, ChangelogApiResponse, ServerMetrics, BackendChangelogEntry } from '@/data/types';


// Fetches metrics directly from the Express backend (server-side only)
async function fetchMetrics(): Promise<{ metrics: ServerMetrics | null; error: string | null }> {
	try {
		const res = await fetch(`${API_ROOT_URL}/api/status`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: API_SECRET_TOKEN }),
			cache: 'no-store',
		});

		const result: MetricsApiResponse = await res.json();

		if (result.success && result.data) {
			return { metrics: result.data, error: null };
		}

		return { metrics: null, error: 'Failed to fetch metrics from backend' };
	} catch {
		return { metrics: null, error: 'Backend is not responding. Retrying...' };
	}
}


// Fetches changelog directly from the Express backend (server-side only)
async function fetchChangelog(): Promise<{ changelog: BackendChangelogEntry[]; error: string | null }> {
	try {
		const res = await fetch(`${API_ROOT_URL}/api/changelog`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: API_SECRET_TOKEN }),
			cache: 'no-store',
		});

		const result: ChangelogApiResponse = await res.json();

		if (result.success && result.data) {
			return { changelog: result.data, error: null };
		}

		return { changelog: [], error: 'Failed to fetch changelog from backend' };
	} catch {
		return { changelog: [], error: 'Backend is not responding. Retrying...' };
	}
}


// Server component — fetches data from Express backend at request time,
// then hands it off to the client component for rendering and socket.io updates.
export default async function DashboardPage() {
	const [metricsResult, changelogResult] = await Promise.all([
		fetchMetrics(),
		fetchChangelog(),
	]);

	const initialMetrics = metricsResult.metrics ?? {
		num_requests: 0,
		num_token_used: 0,
		num_active_connections: 0,
	};

	const initialError = metricsResult.error ?? changelogResult.error;

	return (
		<DashboardClient
			initialMetrics={initialMetrics}
			initialChangelog={changelogResult.changelog}
			initialError={initialError}
		/>
	);
}
