# FundFlow

> The investor CRM built for Web3 founders.

**Live:** [fundflow-omega.vercel.app](https://fundflow-omega.vercel.app)

---

## What is it?

FundFlow helps Web3 startup founders manage their entire fundraising process — track investor relationships, move deals through a pipeline, and connect with investors actively deploying capital.

Two user types: **Founders** manage their pipeline. **Investors** browse live deals and express interest.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, TailwindCSS |
| Backend | Next.js API Routes (serverless) |
| Database + Auth | Supabase (PostgreSQL + RLS + Realtime) |
| Payments | Stripe (Checkout, Customer Portal, Webhooks) |
| Hosting | Vercel |
| Email | Resend |
| Web3 | MetaMask, WalletConnect (Reown) |
| Analytics | PostHog (EU) |
| Monitoring | Sentry |

---

## System Architecture

```mermaid
graph TB
    Founder["👤 Founder"]
    Investor["👤 Investor"]

    subgraph Vercel["Vercel"]
        FE["Next.js Frontend"]
        API["API Routes"]
    end

    subgraph Supabase["Supabase (Frankfurt)"]
        DB["PostgreSQL"]
        Auth["Auth"]
        RT["Realtime"]
    end

    Stripe["Stripe"]
    Resend["Resend"]
    PostHog["PostHog"]
    Sentry["Sentry"]

    Founder --> FE
    Investor --> FE
    FE --> API
    FE <-->|WebSocket| RT
    API --> DB
    API --> Auth
    API --> Stripe
    Stripe -->|Webhooks| API
    API --> Resend
    FE --> PostHog
    FE --> Sentry
```

---

## Database Schema

```mermaid
erDiagram
    profiles {
        uuid id PK
        text name
        text email
        text user_type
        text plan
        text stripe_customer_id
        text stripe_subscription_id
        text wallet_address
    }

    investors {
        uuid id PK
        uuid user_id FK
        text name
        text company
        text email
        text status
        text deal_size
        text notes
    }

    projects {
        uuid id PK
        uuid user_id FK
        text name
        text description
        text stage
        text chain
        numeric goal
        numeric raised
        text[] tags
        boolean published
    }

    interests {
        uuid id PK
        uuid project_id FK
        text investor_email
        text investor_name
        timestamptz created_at
    }

    investor_directory {
        uuid id PK
        text name
        text firm
        text[] sector
        text[] stage
        numeric check_size_min
        numeric check_size_max
        boolean web3_focus
        text location
        text website
    }

    contacts {
        uuid id PK
        text first_name
        text last_name
        text email
        text category
        text message
        timestamptz created_at
    }

    profiles ||--o{ investors : "owns"
    profiles ||--o{ projects : "owns"
    projects ||--o{ interests : "receives"
```

---

## Auth Flow

```mermaid
sequenceDiagram
    User->>API: POST /api/auth/login
    API->>Supabase: signInWithPassword()
    Supabase-->>API: JWT
    API-->>Frontend: { token }
    Frontend->>Frontend: localStorage.setItem("token")
    Frontend->>API: requests with Authorization: Bearer <token>
    API->>API: decode userId from JWT
    API->>Supabase: query filtered by user_id (service role)
```

---

## Billing Flow

```mermaid
sequenceDiagram
    Founder->>API: POST /api/stripe/checkout
    API->>Stripe: Create Checkout Session
    Stripe-->>Founder: Hosted checkout page
    Founder->>Stripe: Complete payment
    Stripe->>API: webhook — checkout.session.completed
    API->>Supabase: SET plan="pro"
    Stripe->>API: webhook — customer.subscription.deleted
    API->>Supabase: SET plan="free"
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register founder or investor |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/investors` | ✓ | Get all investors |
| POST | `/api/investors` | ✓ | Add investor (25 limit on free) |
| PATCH | `/api/investors?id=` | ✓ | Update investor |
| DELETE | `/api/investors?id=` | ✓ | Delete investor |
| GET | `/api/profile` | ✓ | Get profile |
| PATCH | `/api/profile` | ✓ | Update profile |
| GET | `/api/projects` | — | Get published projects |
| POST | `/api/projects` | ✓ | Create / update project |
| PATCH | `/api/projects` | ✓ | Get own project |
| GET | `/api/interests` | ✓ | Get deal flow interests |
| POST | `/api/interests` | — | Express interest (investor) |
| GET | `/api/investor-directory` | — | Curated investor list |
| POST | `/api/stripe/checkout` | ✓ | Create checkout session |
| POST | `/api/stripe/portal` | ✓ | Create billing portal session |
| POST | `/api/stripe/webhook` | — | Handle Stripe events |
| POST | `/api/contact` | — | Submit contact form |

---

## Getting Started

```bash
git clone https://github.com/kurzmichael02-hue/fundflow.git
cd fundflow/frontend
npm install
npm run dev
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
RESEND_API_KEY=
```

---

## Project Structure

```
fundflow/
└── frontend/
    ├── app/
    │   ├── page.tsx                  # Landing page
    │   ├── about/                    # About page
    │   ├── contact/                  # Contact form
    │   ├── privacy/                  # Privacy policy
    │   ├── terms/                    # Terms of service
    │   ├── login/                    # Founder login
    │   ├── register/                 # Founder register
    │   ├── dashboard/                # Dashboard + Realtime
    │   ├── investors/
    │   │   ├── page.tsx              # CRM table
    │   │   └── database/             # Curated investor database
    │   ├── pipeline/                 # Kanban pipeline
    │   ├── analytics/                # Analytics + charts
    │   ├── profile/                  # Profile + wallet + project
    │   ├── investor/
    │   │   ├── page.tsx              # Investor login
    │   │   ├── register/             # Investor register
    │   │   └── discover/             # Deal flow
    │   └── api/
    │       ├── auth/
    │       ├── investors/
    │       ├── projects/
    │       ├── interests/
    │       ├── profile/
    │       ├── investor-directory/
    │       ├── contact/
    │       └── stripe/
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Toast.tsx
    │   └── CookieBanner.tsx
    └── lib/
        ├── supabase.ts
        └── api.ts
```

---

## Team

| Name | Role |
|---|---|
| Taiwo "Crypton Jay" | Founder & CEO |
| Joshua Oyerinde | CTO |
| Michael Kurz | Technical Manager |

---

*© 2026 FundFlow — All rights reserved*
