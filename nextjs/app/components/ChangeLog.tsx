'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { BackendChangelogEntry } from '@/data/types';


// Formats an ISO date string to human-readable local time (HH:MM:SS AM/PM)
function formatTime(isoString: string): string {
	return new Date(isoString).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	});
}


// Renders a vertical timeline of metric changes from the backend changelog.
// Only animates entries that are new since the last render — prevents
// the entire list from re-animating when data updates arrive.
export default function ChangeLog({ entries }: { entries: BackendChangelogEntry[] }) {
	const { t } = useTranslation();

	/** Translates backend field names to user-facing labels */
	const fieldLabel = (key: string): string => {
		const map: Record<string, string> = {
			num_requests: t('metrics.requests'),
			num_token_used: t('metrics.tokensUsed'),
			num_active_connections: t('metrics.activeConnections'),
		};
		return map[key] ?? key;
	};

	// Track which entry IDs have already been rendered (skip animation for them)
	const seenIdsRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		entries.forEach((e) => seenIdsRef.current.add(e.id));
	}, [entries]);

	if (entries.length === 0) {
		return (
			<div className="py-12 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
				{t('changelog.empty')}
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{entries.map((entry, i) => {
				const diff = entry.new_value - entry.old_value;
				const isPositive = diff >= 0;
				const isNew = !seenIdsRef.current.has(entry.id);

				return (
					<div
						key={entry.id}
						className={`flex gap-4 pb-6${isNew ? ' animate-fade-in-up' : ''}`}
						style={isNew ? { animationDelay: `${i * 60}ms` } : undefined}>

						{/* Timeline dot + vertical line */}
						<div className="flex flex-col items-center pt-1.5">
							<div
								className="h-2.5 w-2.5 shrink-0 rounded-full"
								style={{ background: 'var(--changelog-dot)' }}
							/>
							{i < entries.length - 1 && (
								<div
									className="mt-1.5 w-px grow"
									style={{ background: 'var(--changelog-line)' }}
								/>
							)}
						</div>

						{/* Entry content */}
						<div className="flex min-w-0 flex-1 flex-col gap-1.5 pb-2">
							{/* Timestamp + action */}
							<span className="font-mono text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
								{formatTime(entry.created_at)}
							</span>

							{/* Field change badge */}
							<div className="flex flex-wrap gap-2">
								<span
									className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
									style={{
										background: isPositive
											? 'var(--changelog-badge-positive)'
											: 'var(--changelog-badge-negative)',
										color: isPositive
											? 'var(--changelog-badge-positive-text)'
											: 'var(--changelog-badge-negative-text)',
									}}>
									{fieldLabel(entry.field_name)}
									<span className="font-mono">
										{isPositive ? '+' : ''}{diff.toLocaleString()}
									</span>
								</span>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
