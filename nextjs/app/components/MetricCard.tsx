'use client';

/** @typedef MetricCardProps */
interface MetricCardProps {
	/** Display label for the metric */
	label: string;
	/** Current numeric value */
	value: number;
	/** SVG icon rendered inside the accent circle */
	icon: React.ReactNode;
	/** CSS variable prefix for themed colors (e.g. "--metric-requests") */
	colorVar: string;
	/** Stagger index for entrance animation delay */
	index: number;
}

/**
 * A single metric card — displays a labeled value with an accent icon.
 * Uses CSS variables for theming so colors adapt to light/dark mode.
 * The animate-card-enter class plays once via CSS (iteration-count: 1).
 */
export default function MetricCard({ label, value, icon, colorVar, index }: MetricCardProps) {
	return (
		<div
			className="animate-card-enter flex flex-col gap-3 rounded-xl p-5 transition-shadow duration-200"
			style={{
				background: 'var(--bg-tertiary)',
				boxShadow: 'var(--shadow-card)',
				animationDelay: `${index * 100}ms`,
			}}
			onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)')}
			onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}>
			{/* Icon circle with themed accent color */}
			<div
				className="flex h-10 w-10 items-center justify-center rounded-lg"
				style={{ background: `var(${colorVar}-bg)` }}>
				<div style={{ color: `var(${colorVar}-icon)` }}>{icon}</div>
			</div>

			{/* Label */}
			<span className="text-sm font-medium tracking-wide" style={{ color: 'var(--text-secondary)' }}>
				{label}
			</span>

			{/* Value */}
			<span
				className="font-mono text-3xl font-semibold tabular-nums tracking-tight"
				style={{ color: 'var(--text-primary)' }}>
				{value.toLocaleString()}
			</span>
		</div>
	);
}
