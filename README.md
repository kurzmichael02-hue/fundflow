<h1 align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./frontend/public/fundflow-wordmark-dark.svg">
    <img alt="fundflow" src="./frontend/public/fundflow-wordmark.svg" width="240">
  </picture>
</h1>

A CRM for founders raising Web3 rounds.

**Live:** <https://fundflow-omega.vercel.app>
&nbsp;·&nbsp;
**Built by:** [Michael Kurz](https://www.linkedin.com/in/kurzmichael02)

---

## The idea

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

One private side for tracking deals. One public page so VCs can find you. One funnel so you know where the round actually stands.

## Inside

- Kanban pipeline — drag-and-drop between stages, bulk ops, URL filters
- Public deal-room page — VCs browse active projects, tap "Express Interest"
- Follow-up reminders with overdue tracking and auto-timeline
- Wallet login — MetaMask + WalletConnect v2, email login too
- Stripe subscriptions with signed webhooks and idempotency
- Curated investor directory — 30+ web3 funds, one-tap add to pipeline
- Command palette (⌘K), keyboard navigation, realtime sync

## Pipeline stages

```
 Outreach ──▶ Interested ──▶ Meeting ──▶ Term sheet ──▶ Closed
   gray        purple         amber        cyan           green
```

Every status change, note edit, deal-size change, and follow-up is logged to an append-only timeline on the investor row.

## Stack

Next.js 16 · React 19 · TypeScript · Supabase (Postgres, Auth, Realtime, RLS) · Stripe · Tailwind v4 · Vercel · Resend · WalletConnect v2

## Run it locally

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in the keys
npm run dev
```

Needs these env vars:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_PRO_PRICE_ID
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
CONTACT_EMAIL
```

Apply the Supabase migrations once per environment:

```
supabase/migrations/0001_stripe_webhook_events.sql
supabase/migrations/0002_investor_events.sql
supabase/migrations/0003_investor_follow_ups.sql
```

Paste each into the Supabase SQL Editor, or use the Supabase CLI.

## Security notes

- JWT verified HS256 against `SUPABASE_JWT_SECRET` with `exp` + `iat` checks
- All authenticated API routes guard via `requireUser`; writes scoped by `user_id`
- Stripe webhook signature verified + `stripe_webhook_events` table dedupes replays
- CSP + HSTS + X-Frame-Options DENY headers set in `next.config.ts`
- Rate limiting via Upstash (per-IP, per-email); no-op fallback if not configured
- GDPR-compliant: EU-hosted (Frankfurt), consent-gated analytics, audit-logged

## Contact

Bugs, feedback, feature requests → <kurzmichael02@gmail.com> or open an issue.

---

© 2026 Michael Kurz · Set in Fraunces, DM Sans, JetBrains Mono.
