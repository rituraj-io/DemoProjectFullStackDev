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


// Express backend API response wrapper for changelog
export interface ChangelogApiResponse {
	success: boolean;
	message: string;
	data?: BackendChangelogEntry[];
}
