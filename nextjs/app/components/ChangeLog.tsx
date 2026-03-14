'use client';

import type { BackendChangelogEntry } from '@/data/types';


// Human-readable labels for metric field keys
const FIELD_LABELS: Record<string, string> = {
	num_requests: 'Requests',
	num_token_used: 'Tokens Used',
	num_active_connections: 'Active Connections',
};


// Formats an ISO date string to human-readable local time (HH:MM:SS AM/PM)
function formatTime(isoString: string): string {
	return new Date(isoString).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	});
}


// Renders a vertical timeline of metric changes from the backend changelog
export default function ChangeLog({ entries }: { entries: BackendChangelogEntry[] }) {
	if (entries.length === 0) {
		return (
			<div className="py-12 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
				No changes recorded yet
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{entries.map((entry, i) => {
				const diff = entry.new_value - entry.old_value;
				const isPositive = diff >= 0;

				return (
					<div
						key={entry.id}
						className="animate-fade-in-up flex gap-4 pb-6"
						style={{ animationDelay: `${i * 60}ms` }}>

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
									{FIELD_LABELS[entry.field_name] ?? entry.field_name}
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
