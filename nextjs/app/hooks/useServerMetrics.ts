import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import type {
	BackendChangelogEntry,
	ChangelogApiResponse,
	MetricsApiResponse,
	ServerMetrics,
} from '@/data/types';

// How often the frontend polls via socket (ms)
const POLL_INTERVAL = 10_000;


interface UseServerMetricsProps {
	initialMetrics: ServerMetrics;
	initialChangelog: BackendChangelogEntry[];
	initialError: string | null;
}


interface UseServerMetricsReturn {
	metrics: ServerMetrics;
	changelog: BackendChangelogEntry[];
	error: string | null;
}


// Initializes state with server-fetched data, then maintains
// real-time updates via socket.io polling every 10 seconds.
export function useServerMetrics({
	initialMetrics,
	initialChangelog,
	initialError,
}: UseServerMetricsProps): UseServerMetricsReturn {
	const [metrics, setMetrics] = useState<ServerMetrics>(initialMetrics);
	const [changelog, setChangelog] = useState<BackendChangelogEntry[]>(initialChangelog);
	const [error, setError] = useState<string | null>(initialError);

	const socketRef = useRef<Socket | null>(null);

	// Track the highest changelog ID from the initial data
	const lastIdRef = useRef<number>(
		initialChangelog.length > 0
			? Math.max(...initialChangelog.map((e) => e.id))
			: 0,
	);


	// Handles metrics response — updates metric cards
	const handleMetricsResponse = useCallback((result: MetricsApiResponse) => {
		if (result.success && result.data) {
			setMetrics(result.data);
			setError(null);
		} else {
			setError('Backend is not responding. Retrying...');
		}
	}, []);


	// Handles changelog response — prepends new entries at the top
	const handleChangelogResponse = useCallback((result: ChangelogApiResponse) => {
		if (result.success && result.data && result.data.length > 0) {
			setError(null);

			// Track the highest ID we've seen so far
			const maxId = Math.max(...result.data.map((e) => e.id));
			if (maxId > lastIdRef.current) {
				lastIdRef.current = maxId;
			}

			// Prepend new entries (backend returns newest first)
			setChangelog((prev) => [...result.data!, ...prev]);
		} else if (!result.success) {
			setError('Backend is not responding. Retrying...');
		}
	}, []);


	useEffect(() => {
		// Establish socket.io connection for continued polling
		const socket = io({ transports: ['websocket', 'polling'] });
		socketRef.current = socket;

		socket.on('metrics-update', handleMetricsResponse);
		socket.on('changelog-update', handleChangelogResponse);

		// Poll every 10 seconds — sends both metrics and changelog requests
		const interval = setInterval(() => {
			socket.emit('request-metrics');
			socket.emit('request-changelog', lastIdRef.current);
		}, POLL_INTERVAL);


		return () => {
			clearInterval(interval);
			socket.disconnect();
			socketRef.current = null;
		};
	}, [handleMetricsResponse, handleChangelogResponse]);


	return { metrics, changelog, error };
}
