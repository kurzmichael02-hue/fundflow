# FundFlow

> The investor CRM built for Web3 founders.

FundFlow helps Web3 startup founders manage their entire fundraising process — track investor relationships, manage deal pipelines, and connect with investors actively deploying capital.

**Live:** [fundflow-omega.vercel.app](https://fundflow-omega.vercel.app)

---

## Features

- **Investor CRM** — Add, edit, and track every investor with status, deal size, and notes
- **Kanban Pipeline** — Visualize your deal flow from Outreach to Closed
- **Investor Database** — 30+ curated Web3 investors, filter by stage, sector, and check size
- **Deal Flow** — Investor portal where VCs can discover and express interest in your project
- **Analytics** — Pipeline funnel, deal flow chart, conversion and response rates
- **Wallet Connect** — MetaMask and WalletConnect integration on profile
- **Real-time Dashboard** — Live updates via Supabase Realtime
- **Stripe Billing** — Free plan (25 investors) and Pro plan ($99/mo) with customer portal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Backend | Next.js API Routes |
| Database + Auth | Supabase (PostgreSQL, Row Level Security) |
| Payments | Stripe (Checkout, Customer Portal, Webhooks) |
| Hosting | Vercel |
| Email | Resend |
| Web3 | MetaMask, WalletConnect (Reown) |

---

## Getting Started

```bash
git clone https://github.com/kurzmichael02-hue/fundflow.git
cd fundflow/frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## Project Structure

```
fundflow/
└── frontend/
    ├── app/
    │   ├── page.tsx              # Landing page
    │   ├── dashboard/            # Main dashboard
    │   ├── investors/            # Investor CRM + Database
    │   ├── pipeline/             # Kanban pipeline
    │   ├── analytics/            # Analytics dashboard
    │   ├── profile/              # User profile + wallet connect
    │   ├── investor/             # Investor portal (login, register, discover)
    │   ├── api/                  # API routes
    │   │   ├── auth/             # Login + register
    │   │   ├── investors/        # Investor CRUD
    │   │   ├── profile/          # Profile management
    │   │   ├── projects/         # Project management
    │   │   ├── interests/        # Deal flow interests
    │   │   ├── investor-directory/ # Public investor database
    │   │   └── stripe/           # Checkout + portal + webhook
    │   └── (pages)/              # about, login, register, privacy, terms
    ├── components/
    │   ├── Navbar.tsx
    │   └── Toast.tsx
    └── lib/
        ├── supabase.ts
        └── api.ts
```

---

## Team

| Name | Role |
|---|---|
| Taiwo "Crypton Jay" | Founder |
| Joshua Oyerinde | CTO |
| Michael Kurz | Technical Manager |

---

## License

Private — All rights reserved © 2026 FundFlow
