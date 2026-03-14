# Full-Stack AI Platform Demo

A multi-service demo covering a **Next.js dashboard**, **Express API**, **PostgreSQL database**, and an **Expo mobile app**.

## What's Inside

| Task | What | Where |
|------|------|-------|
| 1 | Live dashboard with real-time counters (Socket.io, 10s intervals) | `nextjs/` |
| 2 | Mobile approve/reject message flow | `expo-chat-app/` |
| 3 | Docker Compose multi-service stack | `docker-compose.yml` |
| 4 | Multi-language switcher with RTL (EN / AR / ES) | `nextjs/app/i18n/` |
| 5 | Stripe metered billing ($0.02/sec sessions) | `nextjs/app/session/` + `express-app/functions/session/` |

---

## Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (for the Expo app)
- [Expo Go](https://expo.dev/go) app on your phone (for the mobile app)
- A [Stripe test mode](https://dashboard.stripe.com/test/apikeys) keypair

---

## 1. Web Dashboard + Backend + Database

### Setup

1. Create `.env` files from the examples:

```bash
cp express-app/.env.example express-app/.env
cp nextjs/.env.example nextjs/.env
```

2. Add your Stripe keys:

   - In `express-app/.env` — set `STRIPE_SECRET_KEY` to your Stripe **secret** test key (`sk_test_...`)
   - In `nextjs/.env` — set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your Stripe **publishable** test key (`pk_test_...`)

   Everything else is pre-filled with working defaults.

### Start

```bash
docker compose up -d
```

This starts three containers:

| Service | URL | Container |
|---------|-----|-----------|
| Next.js Dashboard | http://localhost:3000 | `upwork_nextjs` |
| Express API | http://localhost:4000 | `upwork_express` |
| PostgreSQL | localhost:5432 | `upwork_postgres` |

### What to Look For

- **Dashboard** (http://localhost:3000) — Three live metric counters update automatically every 10 seconds. Active connections count reflects open browser tabs.
- **Language Switcher** — Top-right dropdown. Switch to Arabic (AR) to see RTL layout flip. Spanish (ES) also available. Persists across refreshes.
- **Session Billing** — "Start Session" begins a timer showing running cost at $0.02/sec. "End Session" calculates the final amount and creates a Stripe PaymentIntent. The payment intent ID is displayed on screen.

### Stop

```bash
docker compose down
```

---

## 2. Expo Mobile App

### Setup & Start

```bash
cd expo-chat-app
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

### What to Look For

- **Messages tab** — Shows a list of messages with AI-generated summaries fetched from a mock API. Tap a message to see its full content. Use **Approve** or **Reject** buttons on each card.
- **Handled tab** — Approved messages appear here. Rejected messages are removed.
- Pull down to refresh and load new messages.

---

## Tech Stack

Next.js 16, React 19, Express 5, PostgreSQL 17, Socket.io, Stripe, i18next, Tailwind CSS, React Native (Expo 54), Docker Compose, TypeScript
