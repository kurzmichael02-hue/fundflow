<h1 align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./frontend/public/fundflow-wordmark-dark.svg">
    <img alt="FundFlow" src="./frontend/public/fundflow-wordmark.svg" width="280">
  </picture>
</h1>

A CRM for founders raising Web3 rounds.

[![live](https://img.shields.io/badge/live-fundflow--omega.vercel.app-black)](https://fundflow-omega.vercel.app)
[![status](https://img.shields.io/badge/status-active-brightgreen)]()
[![stack](https://img.shields.io/badge/stack-Next.js%2016%20%C2%B7%20Supabase%20%C2%B7%20Stripe-blue)]()

---

## Why this exists

Web3 founders track their fundraising in spreadsheets, Telegram DMs, and Notion docs that nobody opens twice. There's no CRM built for how these rounds run today: wallet-first, async, public-then-private.

FundFlow is two-sided.

```
   ┌──────────┐       ┌────────────┐       ┌──────────┐
   │ Founder  │──────▶│  Deal room │◀──────│   VCs    │
   └──────────┘       └────────────┘       └──────────┘
        │                    │
        │ tracks             │ "Express Interest"
        ▼                    ▼
   ┌──────────┐       ┌────────────┐
   │ Pipeline │◀──────│  Realtime  │
   └──────────┘       │   signal   │
                      └────────────┘
```

One private side for tracking deals. One public page so VCs can find you. One funnel so you know where the round stands — not where it pretends to.

---

## Screenshots

> Add screenshots to `./docs/screenshots/` and they'll render below.

| Founder dashboard | Public deal-room | Investor drawer |
|---|---|---|
| ![dashboard](./docs/screenshots/dashboard.png) | ![dealroom](./docs/screenshots/dealroom.png) | ![drawer](./docs/screenshots/drawer.png) |

---

## What's in it

- **Kanban pipeline** — drag-and-drop between stages, bulk ops, URL filters
- **Public deal-room page** — VCs browse active projects, tap "Express Interest"
- **Follow-up reminders** — overdue tracking, auto-timeline
- **Wallet login** — MetaMask + WalletConnect v2, email login fallback
- **Stripe subscriptions** — signed webhooks, idempotency, replay protection
- **Investor directory** — 30+ Web3 funds curated, one-tap add to pipeline
- **Command palette** — ⌘K, keyboard navigation, realtime sync
- **AI intro drafting** — context-aware first-touch emails per investor

---

## Pipeline stages

```
 Outreach ──▶ Interested ──▶ Meeting ──▶ Term sheet ──▶ Closed
   gray        purple         amber        cyan          green
```

Every status change, note edit, deal-size change, and follow-up gets logged to an append-only timeline on the investor row.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 |
| Auth | Supabase Auth + WalletConnect v2 |
| Database | Supabase Postgres with RLS |
| Realtime | Supabase Realtime channels |
| Payments | Stripe (subscriptions, webhooks) |
| Email | Resend |
| Rate limit | Upstash Redis |
| Hosting | Vercel (Frankfurt region) |

---

## Run locally

```bash
git clone https://github.com/kurzmichael02-hue/fundflow.git
cd fundflow/frontend
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Required env vars:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_PRO_PRICE_ID
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
CONTACT_EMAIL
ANTHROPIC_API_KEY        # for the "Draft opener" feature
```

Apply Supabase migrations:

```
supabase/migrations/0001_stripe_webhook_events.sql
supabase/migrations/0002_investor_events.sql
supabase/migrations/0003_investor_follow_ups.sql
```

Paste each into the Supabase SQL Editor, or run via the Supabase CLI.

---

## Security

- JWT verified HS256 against `SUPABASE_JWT_SECRET` with `exp` + `iat` checks
- Every authenticated API route gates via `requireUser`; writes scoped by `user_id`
- Stripe webhook signature verified + `stripe_webhook_events` table dedupes replays
- CSP, HSTS, X-Frame-Options DENY set in `next.config.ts`
- Rate limiting per IP and per email via Upstash; no-op fallback if not configured
- GDPR: EU-hosted (Frankfurt), consent-gated analytics, audit-logged data export and delete

Full notes: [SECURITY.md](./SECURITY.md)

---

## Contact

Bugs, feedback, feature requests → [kurzmichael02@gmail.com](mailto:kurzmichael02@gmail.com) or open an issue.

---

© 2026 Michael Kurz · Set in Fraunces, DM Sans, JetBrains Mono · MIT License
