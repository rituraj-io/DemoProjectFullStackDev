import { NextResponse } from 'next/server';

import { API_ROOT_URL, API_SECRET_TOKEN } from '@/data/env';


// POST /api/changelog — proxies to Express backend, used by frontend on first load
export async function POST() {
	try {
		const response = await fetch(`${API_ROOT_URL}/api/changelog`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ api_key: API_SECRET_TOKEN }),
		});

		const data = await response.json();

		return NextResponse.json(data, { status: response.status });
	} catch {
		return NextResponse.json({ success: false, message: 'Failed to connect to backend service' }, { status: 502 });
	}
}
