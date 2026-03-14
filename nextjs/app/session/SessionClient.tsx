'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import type {
	ActiveSessionEntry,
	ActiveSessionsApiResponse,
	SessionApiResponse,
	SessionData,
} from '@/data/types';


// Cost rate matching the backend: $0.02/second (used only for client-side interpolation between broadcasts)
const COST_PER_SECOND_CENTS = 2;

// Initialize Stripe with the publishable key (safe for client-side)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');


/** Session lifecycle phases */
type SessionPhase = 'idle' | 'loading' | 'active' | 'ending' | 'completed';


/** Formats seconds into MM:SS display */
function formatTime(totalSeconds: number): string {
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


/** Formats cents into dollar display */
function formatCost(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}


/** Computes live elapsed seconds from a server timestamp */
function computeElapsed(startedAt: string): number {
	return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}


/**
 * Derives the initial phase and state from server-fetched session data.
 * Eliminates the flash of idle screen when loading ?id=X.
 */
function deriveInitialState(session: SessionData | null) {
	if (!session) {
		return { phase: 'idle' as SessionPhase, elapsed: 0, sessionId: null as number | null };
	}

	if (session.status === 'active') {
		return {
			phase: 'active' as SessionPhase,
			elapsed: computeElapsed(session.started_at),
			sessionId: session.id,
		};
	}

	return {
		phase: 'completed' as SessionPhase,
		elapsed: session.duration_seconds,
		sessionId: session.id,
	};
}


/**
 * Inner payment form — rendered inside Stripe Elements context.
 */
function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
	const { t } = useTranslation();
	const stripe = useStripe();
	const elements = useElements();
	const [paying, setPaying] = useState(false);
	const [payError, setPayError] = useState<string | null>(null);
	const [paySuccess, setPaySuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements) return;

		setPaying(true);
		setPayError(null);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: { return_url: window.location.href },
			redirect: 'if_required',
		});

		if (error) {
			setPayError(error.message ?? 'Payment failed');
			setPaying(false);
		} else {
			setPaySuccess(true);
			setPaying(false);
			onSuccess();
		}
	};

	if (paySuccess) {
		return (
			<div className="flex items-center gap-2 py-4 text-sm font-medium" style={{ color: 'var(--session-cost-text)' }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				{t('session.paymentSuccess')}
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<PaymentElement options={{ fields: { billingDetails: { address: 'auto', name: 'auto' } } }} />

			{payError && (
				<div
					className="mt-3 rounded-lg px-3 py-2 text-sm font-medium"
					style={{ background: 'var(--changelog-badge-negative)', color: 'var(--changelog-badge-negative-text)' }}>
					{payError}
				</div>
			)}

			<button
				type="submit"
				disabled={!stripe || paying}
				className="mt-4 w-full cursor-pointer rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
				style={{ background: 'var(--session-btn-start-bg)', color: 'var(--session-btn-text)' }}
				onMouseEnter={e => { if (!paying) e.currentTarget.style.background = 'var(--session-btn-start-hover)'; }}
				onMouseLeave={e => { e.currentTarget.style.background = 'var(--session-btn-start-bg)'; }}>
				{paying ? t('session.processing') : t('session.payNow')}
			</button>
		</form>
	);
}


interface SessionClientProps {
	initialActiveSessions: ActiveSessionEntry[];
	initialSession: SessionData | null;
}


/**
 * Session billing page — manages the full lifecycle:
 * idle → start → real-time timer → end → Stripe payment
 *
 * Active sessions list is updated via socket.io broadcasts (every 5s)
 * with backend-authoritative duration and cost values.
 * Client-side timer interpolates between broadcasts for smooth UX.
 */
export default function SessionClient({ initialActiveSessions, initialSession }: SessionClientProps) {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const initial = deriveInitialState(initialSession);

	const [phase, setPhase] = useState<SessionPhase>(initial.phase);
	const [sessionId, setSessionId] = useState<number | null>(initial.sessionId);
	const [elapsed, setElapsed] = useState(initial.elapsed);
	const [error, setError] = useState<string | null>(null);
	const [paymentIntentId, setPaymentIntentId] = useState<string | null>(
		initialSession?.stripe_payment_intent_id ?? null,
	);
	const [clientSecret, setClientSecret] = useState<string | null>(
		initialSession?.client_secret ?? null,
	);
	const [finalCost, setFinalCost] = useState<number | null>(
		initialSession?.status === 'completed' ? initialSession.cost_cents : null,
	);
	const [finalDuration, setFinalDuration] = useState<number | null>(
		initialSession?.status === 'completed' ? initialSession.duration_seconds : null,
	);
	const [paid, setPaid] = useState(false);
	const [activeSessions, setActiveSessions] = useState<ActiveSessionEntry[]>(initialActiveSessions);

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const startTimeRef = useRef<number>(
		initialSession?.status === 'active' ? new Date(initialSession.started_at).getTime() : 0,
	);
	const socketRef = useRef<Socket | null>(null);


	/** Updates the URL query param without a full page navigation */
	const setUrlSessionId = useCallback((id: number | null) => {
		const url = id ? `/session?id=${id}` : '/session';
		router.replace(url, { scroll: false });
	}, [router]);


	/** Starts the client-side interpolation timer from a known start time */
	const startTimer = useCallback((serverStartTime: string) => {
		if (timerRef.current) clearInterval(timerRef.current);

		startTimeRef.current = new Date(serverStartTime).getTime();
		setElapsed(computeElapsed(serverStartTime));

		timerRef.current = setInterval(() => {
			const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
			setElapsed(Math.max(0, secs));
		}, 1000);
	}, []);


	/** Resumes an existing session by fetching its status from the backend */
	const resumeSession = useCallback(async (id: number) => {
		setPhase('loading');
		setError(null);

		try {
			const res = await fetch('/api/session/status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ session_id: id }),
			});

			const result: SessionApiResponse = await res.json();

			if (!result.success || !result.data) {
				throw new Error(result.message || 'Session not found');
			}

			if (result.data.status === 'completed') {
				setSessionId(id);
				setFinalDuration(result.data.duration_seconds);
				setFinalCost(result.data.cost_cents);
				setPaymentIntentId(result.data.stripe_payment_intent_id);
				setClientSecret(result.data.client_secret ?? null);
				setPhase('completed');
				return;
			}

			setSessionId(id);
			startTimer(result.data.started_at);
			setPhase('active');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to resume session');
			setPhase('idle');
			setUrlSessionId(null);
		}
	}, [startTimer, setUrlSessionId]);


	/** Starts a new billing session */
	const handleStart = useCallback(async () => {
		setError(null);
		setPhase('loading');
		setPaymentIntentId(null);
		setClientSecret(null);
		setFinalCost(null);
		setFinalDuration(null);
		setPaid(false);

		try {
			const res = await fetch('/api/session/start', { method: 'POST' });
			const result: SessionApiResponse = await res.json();

			if (!result.success || !result.data) {
				throw new Error(result.message || 'Failed to start session');
			}

			const newId = result.data.id;
			setSessionId(newId);
			setUrlSessionId(newId);
			startTimer(result.data.started_at);
			setPhase('active');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to start session');
			setPhase('idle');
		}
	}, [startTimer, setUrlSessionId]);


	/** Ends the active session */
	const handleEnd = useCallback(async () => {
		if (!sessionId) return;

		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		setPhase('ending');
		setError(null);

		try {
			const res = await fetch('/api/session/end', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ session_id: sessionId }),
			});

			const result: SessionApiResponse = await res.json();

			if (!result.success || !result.data) {
				throw new Error(result.message || 'Failed to end session');
			}

			setFinalDuration(result.data.duration_seconds);
			setFinalCost(result.data.cost_cents);
			setPaymentIntentId(result.data.stripe_payment_intent_id);
			setClientSecret(result.data.client_secret ?? null);
			setPhase('completed');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to end session');
			setPhase('active');

			if (!timerRef.current) {
				timerRef.current = setInterval(() => {
					const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
					setElapsed(Math.max(0, secs));
				}, 1000);
			}
		}
	}, [sessionId]);


	/** Opens an active session from the list */
	const handleOpenSession = useCallback((id: number) => {
		if (id === sessionId && phase === 'active') return;

		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		setUrlSessionId(id);
		resumeSession(id);
	}, [sessionId, phase, setUrlSessionId, resumeSession]);


	// Start client-side timer on mount if server pre-fetched an active session
	useEffect(() => {
		if (initialSession?.status === 'active' && !timerRef.current) {
			startTimer(initialSession.started_at);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


	// Socket.io: listen for active sessions broadcast from server
	useEffect(() => {
		const socket = io({ transports: ['websocket', 'polling'] });
		socketRef.current = socket;

		socket.on('active-sessions-update', (result: ActiveSessionsApiResponse) => {
			if (result.success && result.data) {
				setActiveSessions(result.data);
			}
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, []);


	// 1-second tick to interpolate active session list values between server broadcasts
	const [tick, setTick] = useState(0);

	useEffect(() => {
		const tickInterval = setInterval(() => setTick(t => t + 1), 1000);
		return () => clearInterval(tickInterval);
	}, []);


	// Clean up timer on unmount
	useEffect(() => {
		return () => { if (timerRef.current) clearInterval(timerRef.current); };
	}, []);

	// Suppress unused var — tick drives re-renders for live list values
	void tick;

	const runningCost = elapsed * COST_PER_SECOND_CENTS;

	return (
		<div
			className="min-h-screen transition-colors duration-200"
			style={{ background: 'var(--bg-secondary)' }}>

			{/* Header */}
			<header
				className="sticky top-0 z-10 border-b backdrop-blur-sm"
				style={{
					borderColor: 'var(--border-secondary)',
					background: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)',
				}}>
				<div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-4">
						<Link
							href="/"
							className="text-sm font-medium transition-colors duration-150"
							style={{ color: 'var(--session-nav-text)' }}
							onMouseEnter={e => (e.currentTarget.style.color = 'var(--session-nav-hover)')}
							onMouseLeave={e => (e.currentTarget.style.color = 'var(--session-nav-text)')}>
							{i18n.dir() === 'rtl' ? '→' : '←'} {t('nav.backToDashboard')}
						</Link>
						<h1
							className="text-sm font-semibold tracking-wide uppercase"
							style={{ color: 'var(--text-secondary)' }}>
							{t('nav.sessionBilling')}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
								setPhase('idle');
								setSessionId(null);
								setElapsed(0);
								setError(null);
								setPaymentIntentId(null);
								setClientSecret(null);
								setFinalCost(null);
								setFinalDuration(null);
								setPaid(false);
								router.replace('/session', { scroll: false });
							}}
							className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150"
							style={{ color: 'var(--text-secondary)', background: 'var(--bg-accent)' }}
							onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
							onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-accent)')}>
							{t('nav.sessions')}
						</button>
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</header>


			{/* Main content */}
			<main className="mx-auto max-w-lg px-6 py-8">
				{/* Error banner */}
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


				{/* Session card */}
				<div
					className="animate-card-enter rounded-xl p-6"
					style={{
						background: 'var(--bg-tertiary)',
						boxShadow: 'var(--shadow-card)',
					}}>

					{/* -- IDLE STATE -- */}
					{phase === 'idle' && (
						<div className="flex flex-col items-center gap-6 py-8">
							<div
								className="flex h-16 w-16 items-center justify-center rounded-2xl"
								style={{ background: 'var(--session-timer-bg)' }}>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--session-timer-text)' }}>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
							</div>

							<div className="text-center">
								<h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
									{t('session.startTitle')}
								</h2>
								<p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
									{t('session.rate')}
								</p>
							</div>

							<button
								onClick={handleStart}
								className="cursor-pointer rounded-lg px-8 py-3 text-sm font-semibold transition-colors duration-150"
								style={{ background: 'var(--session-btn-start-bg)', color: 'var(--session-btn-text)' }}
								onMouseEnter={e => (e.currentTarget.style.background = 'var(--session-btn-start-hover)')}
								onMouseLeave={e => (e.currentTarget.style.background = 'var(--session-btn-start-bg)')}>
								{t('session.startButton')}
							</button>
						</div>
					)}


					{/* -- LOADING STATE -- */}
					{phase === 'loading' && (
						<div className="flex flex-col items-center gap-4 py-12">
							<div
								className="h-8 w-8 animate-spin rounded-full border-2"
								style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--session-timer-text)' }}
							/>
							<span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
								{t('session.loading')}
							</span>
						</div>
					)}


					{/* -- ACTIVE STATE -- */}
					{phase === 'active' && (
						<div className="flex flex-col items-center gap-6 py-4">
							<div className="flex items-center gap-2">
								<div className="animate-pulse-dot h-2.5 w-2.5 rounded-full" style={{ background: 'var(--session-btn-end-bg)' }} />
								<span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
									{t('session.activeLabel', { id: sessionId })}
								</span>
							</div>

							<div
								className="w-full rounded-xl px-6 py-5 text-center"
								style={{ background: 'var(--session-timer-bg)' }}>
								<div
									className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl"
									style={{ color: 'var(--session-timer-text)' }}>
									{formatTime(elapsed)}
								</div>
							</div>

							<div className="text-center">
								<span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
									{t('session.runningCost')}
								</span>
								<div
									className="font-mono text-3xl font-bold tabular-nums"
									style={{ color: 'var(--session-cost-text)' }}>
									{formatCost(runningCost)}
								</div>
							</div>

							<button
								onClick={handleEnd}
								className="w-full cursor-pointer rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150"
								style={{ background: 'var(--session-btn-end-bg)', color: 'var(--session-btn-text)' }}
								onMouseEnter={e => (e.currentTarget.style.background = 'var(--session-btn-end-hover)')}
								onMouseLeave={e => (e.currentTarget.style.background = 'var(--session-btn-end-bg)')}>
								{t('session.endButton')}
							</button>
						</div>
					)}


					{/* -- ENDING STATE -- */}
					{phase === 'ending' && (
						<div className="flex flex-col items-center gap-4 py-12">
							<div
								className="h-8 w-8 animate-spin rounded-full border-2"
								style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--session-timer-text)' }}
							/>
							<span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
								{t('session.ending')}
							</span>
						</div>
					)}


					{/* -- COMPLETED STATE -- */}
					{phase === 'completed' && (
						<div className="flex flex-col gap-5">
							<div className="text-center">
								<h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
									{t('session.completeTitle')}
								</h2>
							</div>

							<div
								className="grid grid-cols-2 gap-3 rounded-lg p-4"
								style={{ background: 'var(--session-result-bg)', border: `1px solid var(--session-result-border)` }}>
								<div>
									<span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
										{t('session.duration')}
									</span>
									<div className="font-mono text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
										{finalDuration !== null ? formatTime(finalDuration) : '--:--'}
									</div>
								</div>
								<div>
									<span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
										{t('session.totalCost')}
									</span>
									<div className="font-mono text-xl font-bold tabular-nums" style={{ color: 'var(--session-cost-text)' }}>
										{finalCost !== null ? formatCost(finalCost) : '$0.00'}
									</div>
								</div>
							</div>

							{paymentIntentId && (
								<div
									className="rounded-lg px-4 py-3"
									style={{ background: 'var(--session-intent-bg)' }}>
									<span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
										{t('session.paymentIntent')}
									</span>
									<div
										className="mt-1 break-all font-mono text-sm font-medium"
										style={{ color: 'var(--session-intent-text)' }}>
										{paymentIntentId}
									</div>
								</div>
							)}

							{clientSecret && !paid && (
								<div
									className="rounded-lg p-4"
									style={{ background: 'var(--session-stripe-bg)', border: `1px solid var(--session-stripe-border)` }}>
									<h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
										{t('session.completePayment')}
									</h3>
									<Elements
										stripe={stripePromise}
										options={{
											clientSecret,
											appearance: { theme: 'stripe' },
										}}>
										<CheckoutForm onSuccess={() => setPaid(true)} />
									</Elements>
								</div>
							)}

							<button
								onClick={handleStart}
								className="w-full cursor-pointer rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150"
								style={{
									background: 'var(--bg-accent)',
									color: 'var(--text-primary)',
									border: `1px solid var(--border-primary)`,
								}}
								onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
								onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-accent)')}>
								{t('session.startNew')}
							</button>
						</div>
					)}
				</div>


				<p className="mt-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
					{t('session.billingFooter')}
				</p>


				{/* Active Sessions list — backend-authoritative values via socket.io */}
				<section className="mt-10">
					<h2
						className="mb-4 text-xs font-semibold tracking-widest uppercase"
						style={{ color: 'var(--text-tertiary)' }}>
						{t('session.activeSessions')}
					</h2>

					<div
						className="rounded-xl p-5"
						style={{
							background: 'var(--bg-tertiary)',
							boxShadow: 'var(--shadow-card)',
						}}>
						{activeSessions.length === 0 ? (
							<div className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
								{t('session.noActiveSessions')}
							</div>
						) : (
							<div className="flex flex-col gap-2">
								{activeSessions.map(session => {
									const isCurrentSession = session.id === sessionId && phase === 'active';

									// Compute live values from started_at — ticks every second via the tick state
									const liveDuration = computeElapsed(session.started_at);
									const liveCost = liveDuration * COST_PER_SECOND_CENTS;

									return (
										<button
											key={session.id}
											onClick={() => handleOpenSession(session.id)}
											disabled={isCurrentSession}
											className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-start transition-colors duration-150 disabled:cursor-default"
											style={{
												background: isCurrentSession ? 'var(--session-timer-bg)' : 'var(--bg-accent)',
												border: isCurrentSession ? `1px solid var(--session-timer-text)` : '1px solid transparent',
											}}
											onMouseEnter={e => { if (!isCurrentSession) e.currentTarget.style.background = 'var(--bg-hover)'; }}
											onMouseLeave={e => { if (!isCurrentSession) e.currentTarget.style.background = 'var(--bg-accent)'; }}>

											<div className="flex items-center gap-3">
												<div
													className="animate-pulse-dot h-2 w-2 shrink-0 rounded-full"
													style={{ background: 'var(--session-btn-end-bg)' }}
												/>
												<div>
													<span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
														{t('session.sessionId', { id: session.id })}
													</span>
													<span className="ms-2 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
														{formatTime(liveDuration)}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<span className="font-mono text-sm font-semibold tabular-nums" style={{ color: 'var(--session-cost-text)' }}>
													{formatCost(liveCost)}
												</span>
												{isCurrentSession ? (
													<span
														className="rounded px-1.5 py-0.5 text-xs font-medium"
														style={{ background: 'var(--changelog-badge-positive)', color: 'var(--changelog-badge-positive-text)' }}>
														{t('session.viewing')}
													</span>
												) : (
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
														<polyline points="9 18 15 12 9 6" />
													</svg>
												)}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
