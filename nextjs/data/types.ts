// Shape of the metrics data returned by the Express backend
export interface ServerMetrics {
	num_requests: number;
	num_token_used: number;
	num_active_connections: number;
}


// Express backend API response wrapper for metrics
export interface MetricsApiResponse {
	success: boolean;
	message: string;
	data?: ServerMetrics;
}


// Single changelog entry as returned by the Express backend
export interface BackendChangelogEntry {
	id: number;
	field_name: string;
	old_value: number;
	new_value: number;
	action: string;
	created_at: string;
}


// Express backend API response wrapper for connection updates
export interface ConnectionsApiResponse {
	success: boolean;
	message: string;
	data?: ServerMetrics;
}


// Express backend API response wrapper for changelog
export interface ChangelogApiResponse {
	success: boolean;
	message: string;
	data?: BackendChangelogEntry[];
}


// Session data returned by the Express backend
export interface SessionData {
	id: number;
	started_at: string;
	ended_at: string | null;
	duration_seconds: number;
	cost_cents: number;
	status: 'active' | 'completed';
	stripe_payment_intent_id: string | null;
	client_secret?: string;
}


// Express backend API response wrapper for session operations
export interface SessionApiResponse {
	success: boolean;
	message: string;
	data?: SessionData;
}


// Active session summary returned by /api/session/active
export interface ActiveSessionEntry {
	id: number;
	started_at: string;
	duration_seconds: number;
	cost_cents: number;
	status: 'active';
}


// Express backend API response wrapper for active sessions list
export interface ActiveSessionsApiResponse {
	success: boolean;
	message: string;
	data?: ActiveSessionEntry[];
}
