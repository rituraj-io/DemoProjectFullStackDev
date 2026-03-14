import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import type {
	BackendChangelogEntry,
	ChangelogApiResponse,
	MetricsApiResponse,
	ServerMetrics,
} from '@/data/types';


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


// Listens for server-side broadcasts via socket.io.
// The server fetches from the Express backend on a global interval
// and emits to all connected clients — no per-client polling needed.
export function useServerMetrics({
	initialMetrics,
	initialChangelog,
	initialError,
}: UseServerMetricsProps): UseServerMetricsReturn {
	const [metrics, setMetrics] = useState<ServerMetrics>(initialMetrics);
	const [changelog, setChangelog] = useState<BackendChangelogEntry[]>(initialChangelog);
	const [error, setError] = useState<string | null>(initialError);

	const socketRef = useRef<Socket | null>(null);

	// Track the highest changelog ID to prevent duplicates on broadcast
	const lastIdRef = useRef<number>(
		initialChangelog.length > 0
			? Math.max(...initialChangelog.map((e) => e.id))
			: 0,
	);


	// Handles metrics broadcast — updates metric cards
	const handleMetricsUpdate = useCallback((result: MetricsApiResponse) => {
		if (result.success && result.data) {
			setMetrics(result.data);
			setError(null);
		}
	}, []);


	// Handles changelog broadcast — prepends only truly new entries
	const handleChangelogUpdate = useCallback((result: ChangelogApiResponse) => {
		if (result.success && result.data && result.data.length > 0) {
			setError(null);

			// Filter out entries we already have (dedup safety)
			const newEntries = result.data.filter((e) => e.id > lastIdRef.current);

			if (newEntries.length > 0) {
				const maxId = Math.max(...newEntries.map((e) => e.id));
				lastIdRef.current = maxId;

				setChangelog((prev) => [...newEntries, ...prev].slice(0, 50));
			}
		}
	}, []);


	// Handles real-time active connection count pushed by the server
	const handleConnectionsUpdate = useCallback((count: number) => {
		setMetrics((prev) => ({ ...prev, num_active_connections: count }));
	}, []);


	useEffect(() => {
		const socket = io({ transports: ['websocket', 'polling'] });
		socketRef.current = socket;

		socket.on('metrics-update', handleMetricsUpdate);
		socket.on('changelog-update', handleChangelogUpdate);
		socket.on('connections-update', handleConnectionsUpdate);

		return () => {
			socket.off('metrics-update', handleMetricsUpdate);
			socket.off('changelog-update', handleChangelogUpdate);
			socket.off('connections-update', handleConnectionsUpdate);
			socket.disconnect();
			socketRef.current = null;
		};
	}, [handleMetricsUpdate, handleChangelogUpdate, handleConnectionsUpdate]);


	return { metrics, changelog, error };
}
