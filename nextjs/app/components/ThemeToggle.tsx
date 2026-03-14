'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Minimal theme toggle button — switches between light and dark modes.
 * Persists preference in localStorage and syncs via data-theme attribute.
 */
export default function ThemeToggle() {
	const { t } = useTranslation();
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const current = document.documentElement.getAttribute('data-theme');
		setIsDark(current === 'dark');
	}, []);

	/**
	 * Toggles the theme and persists the choice to localStorage.
	 */
	const toggle = () => {
		const next = !isDark;
		setIsDark(next);
		document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
		localStorage.setItem('theme', next ? 'dark' : 'light');
	};

	/* Prevent hydration mismatch — render placeholder until mounted */
	if (!mounted) {
		return <div className="h-9 w-9 rounded-lg" style={{ background: 'var(--toggle-bg)' }} />;
	}

	return (
		<button
			onClick={toggle}
			aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
			title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
			className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200"
			style={{
				background: 'var(--toggle-bg)',
				color: 'var(--toggle-fg)',
			}}
			onMouseEnter={e => (e.currentTarget.style.background = 'var(--toggle-hover)')}
			onMouseLeave={e => (e.currentTarget.style.background = 'var(--toggle-bg)')}>
			{isDark ? (
				/* Sun icon for dark mode (click to go light) */
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					strokeLinejoin="round">
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			) : (
				/* Moon icon for light mode (click to go dark) */
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.75"
					strokeLinecap="round"
					strokeLinejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			)}
		</button>
	);
}
