# FundFlow

Investor CRM for Web3 founders. Track deal flow from outreach to close, publish
a public project page, and let investors express interest directly.

Live: <https://fundflow-omega.vercel.app>

---

## Stack

- **Next.js 16** (App Router, Turbopack) with TypeScript and TailwindCSS v4
- **Supabase** (Postgres, Auth, Realtime, RLS) — EU region
- **Stripe** — Checkout, Customer Portal, webhooks for plan sync
- **Resend** — transactional email (contact form, new-interest notification)
- **Sentry** — runtime errors; **PostHog** — product analytics (EU)
- **Vercel** — hosting, CI/CD on `main`

The whole backend is Next.js API routes — the top-level `backend/` directory
is unused and will be removed.

---

## Local development

```bash
git clone https://github.com/kurzmichael02-hue/fundflow.git
cd fundflow/frontend
npm install
cp .env.local.example .env.local    # then fill in the values
npm run dev
```

### Required env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
NEXT_PUBLIC_POSTHOG_KEY        # optional
NEXT_PUBLIC_POSTHOG_HOST        # optional
NEXT_PUBLIC_SITE_URL            # used for metadataBase + sitemap + OAuth redirects
```

The Stripe and Resend clients are lazy-initialised, so a missing key only
breaks the specific request that needs it — `next build` still runs clean
without production secrets.

---

## How it works

Two user types live in one `profiles` table, split by `user_type`:

- **Founders** sign up at `/register`, build a private pipeline at `/investors`
  and `/pipeline`, and optionally publish a project at `/profile` so it shows
  up on the public deal flow.
- **Investors** sign up at `/investor/register`, browse published projects at
  `/investor/discover`, and tap "Express interest" to notify the founder by
  email.

### Auth

`POST /api/auth/login` wraps `supabase.auth.signInWithPassword` and returns
the JWT. The client stores it in `localStorage` and sends it as
`Authorization: Bearer <token>` on every request. API routes read the `sub`
claim to scope queries by `user_id`.

### Billing

Free plan is capped at 25 investors. Upgrade flows go through Stripe Checkout:

1. Founder hits `POST /api/stripe/checkout` — creates a Checkout Session
2. Stripe posts `checkout.session.completed` to `/api/stripe/webhook`
3. The webhook writes `plan: "pro"`, `stripe_customer_id` and
   `stripe_subscription_id` to the profile
4. Cancellations/failures come back as `customer.subscription.updated` or
   `customer.subscription.deleted` and flip the plan back to `free`

The `plan` column is never writable from the client — see `PROFILE_WRITABLE_FIELDS`
in `app/api/profile/route.ts`.

---

## API

All `✓` routes require `Authorization: Bearer <supabase-jwt>`.

| Method | Route                      | Auth | Notes                                       |
| ------ | -------------------------- | :--: | ------------------------------------------- |
| POST   | `/api/auth/register`       |  —   | `user_type` in body ∈ `founder` \| `investor` |
| POST   | `/api/auth/login`          |  —   |                                             |
| GET    | `/api/profile`             |  ✓   |                                             |
| PATCH  | `/api/profile`             |  ✓   | Whitelisted: `name`, `company`, `bio`, `wallet_address` |
| GET    | `/api/investors`           |  ✓   |                                             |
| POST   | `/api/investors`           |  ✓   | 25-row cap on free plan                     |
| PATCH  | `/api/investors?id=…`      |  ✓   |                                             |
| DELETE | `/api/investors?id=…`      |  ✓   |                                             |
| GET    | `/api/projects`            |  —   | Public — published projects only            |
| POST   | `/api/projects`            |  ✓   | Upsert — whitelisted fields                 |
| PATCH  | `/api/projects`            |  ✓   | Returns the caller's own project            |
| GET    | `/api/interests`           |  ✓   | Interests on the caller's projects          |
| POST   | `/api/interests`           |  —   | Called by investors, triggers Resend email  |
| GET    | `/api/investor-directory`  |  —   | Curated list, read-only                     |
| POST   | `/api/contact`             |  —   | Sends to the team inbox via Resend          |
| POST   | `/api/stripe/checkout`     |  ✓   |                                             |
| POST   | `/api/stripe/portal`       |  ✓   | Requires an existing `stripe_customer_id`   |
| POST   | `/api/stripe/webhook`      |  —   | Verified via `STRIPE_WEBHOOK_SECRET`        |

---

## Database

Tables on Supabase (`public` schema, RLS on everywhere except `investor_directory`
and `projects.published = true`):

- `profiles` — one row per Supabase auth user. `plan` and `stripe_*` fields
  are written only by the Stripe webhook.
- `investors` — CRM rows owned by a founder. Scoped by `user_id`.
- `projects` — one per founder. `published = true` makes it public on deal flow.
- `interests` — write-once from investors, fans out an email to the founder.
- `investor_directory` — curated seed list, admin-maintained.
- `contacts` — contact-form submissions.

---

## Project layout

```
frontend/
├── app/
│   ├── page.tsx                  Landing
│   ├── about/ contact/ privacy/ terms/
│   ├── login/ register/          Founder auth
│   ├── dashboard/                Overview + realtime
│   ├── investors/                CRM table, CSV export, detail panel
│   │   └── database/             Curated directory
│   ├── pipeline/                 Kanban
│   ├── analytics/                Funnel, conversion, top cheques
│   ├── profile/                  Profile + wallet + project
│   ├── investor/                 Investor portal
│   │   ├── register/
│   │   └── discover/             Public deal flow
│   └── api/                      Route handlers — all listed in the API table
├── components/
│   ├── Navbar.tsx
│   ├── Toast.tsx
│   ├── ConfirmDialog.tsx
│   └── CookieBanner.tsx
└── lib/
    ├── api.ts                    fetch wrapper for authed requests
    ├── supabase.ts               client-side anon client
    └── escapeHtml.ts             used by email templates
```

---

## Deploy

Push to `main` — Vercel picks it up. Make sure all env vars above are set on
the Vercel project, plus the Stripe webhook endpoint is pointed at
`/api/stripe/webhook` with the same `STRIPE_WEBHOOK_SECRET`.

---

## Team

- Taiwo "Crypton Jay" — Founder, CEO
- Joshua Oyerinde — CTO
- Michael Kurz — Technical Manager

© 2026 FundFlow
