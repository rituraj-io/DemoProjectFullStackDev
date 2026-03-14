import { NextRequest, NextResponse } from 'next/server';

import { API_ROOT_URL, API_SECRET_TOKEN } from '@/data/env';


// POST /api/session/end — proxies to Express backend with session_id
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { session_id } = body;

		if (!session_id || typeof session_id !== 'number' || !Number.isInteger(session_id) || session_id <= 0) {
			return NextResponse.json(
				{ success: false, message: 'Invalid session_id: must be a positive integer' },
				{ status: 400 },
			);
		}

		const response = await fetch(`${API_ROOT_URL}/api/session/end`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: API_SECRET_TOKEN, session_id }),
		});

		const data = await response.json();

		return NextResponse.json(data, { status: response.status });
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Failed to connect to backend service' },
			{ status: 502 },
		);
	}
}
