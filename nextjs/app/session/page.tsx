import { Suspense } from 'react';
import type { Metadata } from 'next';

import { API_ROOT_URL, API_SECRET_TOKEN } from '@/data/env';
import type { ActiveSessionsApiResponse, ActiveSessionEntry, SessionApiResponse, SessionData } from '@/data/types';
import SessionClient from './SessionClient';


export const metadata: Metadata = {
    title: 'Session Billing',
    description: 'Real-time billing session with Stripe payment',
};


// Fetches all active sessions from the Express backend (server-side only)
async function fetchActiveSessions(): Promise<ActiveSessionEntry[]> {
    try {
        const res = await fetch(`${API_ROOT_URL}/api/session/active`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: API_SECRET_TOKEN }),
            cache: 'no-store',
        });

        const result: ActiveSessionsApiResponse = await res.json();

        return result.success && result.data ? result.data : [];
    } catch {
        return [];
    }
}


// Fetches a specific session's status from the Express backend (server-side only)
async function fetchSessionById(id: number): Promise<SessionData | null> {
    try {
        const res = await fetch(`${API_ROOT_URL}/api/session/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: API_SECRET_TOKEN, session_id: id }),
            cache: 'no-store',
        });

        const result: SessionApiResponse = await res.json();

        return result.success && result.data ? result.data : null;
    } catch {
        return null;
    }
}


// Server component — fetches active sessions (and optionally a specific session
// from the ?id= query param) so the client renders the correct state immediately.
export default async function SessionPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const idParam = typeof params.id === 'string' ? parseInt(params.id, 10) : NaN;

    const [activeSessions, initialSession] = await Promise.all([
        fetchActiveSessions(),
        !isNaN(idParam) && idParam > 0 ? fetchSessionById(idParam) : Promise.resolve(null),
    ]);

    return (
        <Suspense fallback={null}>
            <SessionClient
                initialActiveSessions={activeSessions}
                initialSession={initialSession}
            />
        </Suspense>
    );
}
