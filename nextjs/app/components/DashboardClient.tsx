'use client';

import ThemeToggle from './ThemeToggle';
import MetricCard from './MetricCard';
import ChangeLog from './ChangeLog';
import { useServerMetrics } from '@/app/hooks/useServerMetrics';
import type { BackendChangelogEntry, ServerMetrics } from '@/data/types';


interface DashboardClientProps {
	initialMetrics: ServerMetrics;
	initialChangelog: BackendChangelogEntry[];
	initialError: string | null;
}


// Client-side dashboard — receives server-fetched data as props,
// then maintains real-time updates via socket.io polling.
export default function DashboardClient({
	initialMetrics,
	initialChangelog,
	initialError,
}: DashboardClientProps) {
	const { metrics, changelog, error } = useServerMetrics({
		initialMetrics,
		initialChangelog,
		initialError,
	});

	return (
		<div
			className="min-h-screen transition-colors duration-200"
			style={{ background: 'var(--bg-secondary)' }}>

			{/* Top bar */}
			<header
				className="sticky top-0 z-10 border-b backdrop-blur-sm"
				style={{
					borderColor: 'var(--border-secondary)',
					background: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)',
				}}>
				<div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
					<h1
						className="text-sm font-semibold tracking-wide uppercase"
						style={{ color: 'var(--text-secondary)' }}>
						Dashboard
					</h1>
					<ThemeToggle />
				</div>
			</header>


			{/* Main content */}
			<main className="mx-auto max-w-4xl px-6 py-8">
				{/* Inline error banner — shown when backend is unreachable */}
				{error && (
					<div
						className="mb-6 rounded-lg px-4 py-3 text-sm font-medium"
						style={{
							background: 'var(--changelog-badge-negative)',
							color: 'var(--changelog-badge-negative-text)',
						}}>
						{error}
					</div>
				)}

				{/* Metric cards grid */}
				<section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<MetricCard
						label="Requests"
						value={metrics.num_requests}
						index={0}
						colorVar="--metric-requests"
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
							</svg>
						}
					/>

					<MetricCard
						label="Tokens Used"
						value={metrics.num_token_used}
						index={1}
						colorVar="--metric-tokens"
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="12" cy="12" r="10" />
								<path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
							</svg>
						}
					/>

					<MetricCard
						label="Active Connections"
						value={metrics.num_active_connections}
						index={2}
						colorVar="--metric-connections"
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						}
					/>
				</section>


				{/* Changelog section */}
				<section className="mt-10">
					<h2
						className="mb-5 text-xs font-semibold tracking-widest uppercase"
						style={{ color: 'var(--text-tertiary)' }}>
						Change Log
					</h2>

					<div
						className="rounded-xl p-5"
						style={{
							background: 'var(--bg-tertiary)',
							boxShadow: 'var(--shadow-card)',
						}}>
						<ChangeLog entries={changelog} />
					</div>
				</section>
			</main>
		</div>
	);
}
