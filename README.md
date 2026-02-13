<div align="center">

<img src="./frontend/public/logo-text.svg" alt="PattPay" width="280" />

### The Future of Recurring Payments on Solana

A Web3 payment gateway built natively on Solana for subscriptions and recurring on-chain payments. No banks, no intermediaries — just direct transactions between wallets.

> *"Set it once. Let the blockchain do the rest."*

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat&logo=solana&logoColor=white)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Anchor](https://img.shields.io/badge/Anchor-Rust-CE422B?style=flat&logo=rust&logoColor=white)](https://www.anchor-lang.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## Demo

[![PattPay Subscription Demo](https://img.youtube.com/vi/O9lURgC820s/maxresdefault.jpg)](https://youtu.be/O9lURgC820s)

> Click the image above to watch the subscription flow in action.

---

## Features

- **Recurring Subscriptions** — Automated on-chain payments via delegate authority (PDA)
- **One-Time Payments** — Direct token transfers with instant confirmation
- **Payment Links** — Shareable checkout pages for products and services
- **Dual Authentication** — Email/password or Solana wallet (SIWS standard)
- **Merchant Dashboard** — Real-time analytics, MRR tracking, and payment history
- **Automated Billing** — Scheduler + Processor handle charging cycles without manual intervention
- **Non-Custodial** — Users maintain full control of their wallets at all times
- **Near-Zero Fees** — Built on Solana (<$0.01 per transaction, ~400ms finality)

---

## Architecture

```
pattpay/
├── frontend/    Next.js 15 + React 19 + TailwindCSS v4
├── backend/     Fastify + Prisma + PostgreSQL
├── crypto/      Solana smart contracts (Anchor/Rust)
└── docs/        Project documentation
```

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS v4, Turbopack, TanStack Query, Zustand |
| **Backend** | Fastify, Prisma ORM, PostgreSQL, JWT, bcrypt, Zod |
| **Smart Contracts** | Anchor Framework, Rust, SPL Token Interface (Token + Token-2022) |
| **Infrastructure** | Railway (API, Scheduler, Processor), Docker, GitHub Actions |

---

## How It Works

### Recurring Subscriptions

```
Payer                    Smart Contract               Backend
  │                           │                          │
  ├── approve_delegate() ────>│  Create PDA              │
  │   (signs tx in wallet)    │  + set delegate authority │
  │                           │                          │
  │                           │<──── charge_subscription()│  (automated)
  │                           │      via relayer PDA      │
  │                           │                          │
  │                           │── transfer tokens ──────>│  Record payment
  │                           │                          │
```

1. Payer authorizes a total amount via `approve_delegate` — a PDA gains delegate authority over their token account
2. The backend Scheduler finds subscriptions due for billing and creates jobs
3. The Processor executes `charge_subscription` through the relayer PDA, transferring tokens automatically

### One-Time Payments

1. Payer sends a direct SPL token transfer to the merchant wallet
2. The frontend records the transaction signature in the backend

### Automated Billing Pipeline

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Scheduler  │───────>│  RelayerJob  │───────>│  Processor   │
│ (Daily 00:00)│        │  (Database)  │        │ (4x per day) │
└──────────────┘        └──────────────┘        └──────────────┘
  Finds due               Creates pending         Executes on-chain
  subscriptions           jobs with retry          payments
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Rust** and **Anchor CLI** (for smart contracts)
- **Docker** (for local PostgreSQL)
- **Solana CLI**

### Setup

```bash
# Clone
git clone https://github.com/Dnreikronos/pattpay.git
cd pattpay

# Backend
cd backend
npm install
npm run compose:up
npx prisma migrate dev

# Frontend
cd ../frontend
pnpm install

# Smart contracts (optional)
cd ../crypto
anchor build
anchor deploy
```

### Run

Start each service in a separate terminal:

```bash
# Backend API — http://localhost:3001
cd backend && npm run dev

# Frontend — http://localhost:3000
cd frontend && pnpm dev

# Scheduler (creates billing jobs daily)
cd backend && npm run scheduler

# Processor (executes on-chain payments)
cd backend && npm run processor
```

API documentation (Swagger) is available at `http://localhost:3001/docs`.

---

## Environment Variables

### Backend (`backend/.env`)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/pattpay"
JWT_SECRET="your-secret-key-at-least-32-characters"
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
SOLANA_NETWORK="devnet"
```

### Frontend (`frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## Project Structure

```
pattpay/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Sign in / Sign up
│   │   ├── (checkout)/         # Public checkout flow
│   │   ├── dashboard/          # Merchant dashboard
│   │   └── payment/            # Payer-facing payment pages
│   ├── components/             # UI components
│   ├── lib/
│   │   ├── api/                # API client functions
│   │   ├── hooks/              # TanStack Query hooks
│   │   ├── solana/             # Contract IDL + helpers
│   │   ├── stores/             # Zustand stores (UI state only)
│   │   └── utils/              # Token storage, validation
│   └── public/                 # Logo, static assets
│
├── backend/
│   ├── src/
│   │   ├── routes/             # Fastify route definitions
│   │   ├── controllers/        # Business logic
│   │   ├── schemas/            # Zod validation
│   │   ├── index.ts            # API server entry
│   │   ├── scheduler.ts        # Cron job scheduler
│   │   └── processor.ts        # Payment processor
│   └── prisma/                 # Schema + migrations
│
├── crypto/
│   ├── programs/crypto/src/
│   │   ├── lib.rs              # Program entry point
│   │   ├── constants.rs        # Authorized backend, seeds
│   │   ├── errors.rs           # Custom error codes
│   │   ├── state/              # Account data structures
│   │   │   └── delegate_approval.rs
│   │   └── instructions/       # Instruction handlers + contexts
│   │       ├── approve_delegate.rs
│   │       ├── charge_subscription.rs
│   │       └── revoke_delegate.rs
│   └── tests/                  # Integration tests
│
└── .github/workflows/          # CI/CD pipelines
```

---

## Database Schema

Key entities managed by Prisma ORM on PostgreSQL:

| Table | Purpose |
|---|---|
| **Receivers** | Merchants (dual auth: email or wallet) |
| **Plans** | Subscription templates with multi-token pricing |
| **Payers** | Customers who subscribe to plans |
| **Subscriptions** | Active subscriptions with delegate authority info |
| **PaymentExecutions** | Transaction history and logs |
| **RelayerJobs** | Scheduled payment jobs with retry logic |

See [DATABASE_MODELING.md](./DATABASE_MODELING.md) for the full schema.

---

## Deployment

PattPay runs on Railway with three services:

| Service | Entry | Schedule |
|---|---|---|
| **API** | `index.ts` | Always on |
| **Scheduler** | `scheduler.ts` | Daily at 00:00 UTC |
| **Processor** | `processor.ts` | 4x daily (00:15, 06:15, 12:15, 18:15) |

Frontend is deployed on Vercel. GitHub Actions handle CI/CD when relevant files change.

---

## Design System — "The Pixel Finance City"

PattPay uses a retro-futuristic pixel art aesthetic with a minimalist, clean interface.

| Token | Value | Usage |
|---|---|---|
| Background | `#E5DEF6` | Page background (lavender) |
| Brand | `#4F46E5` | Primary actions, links |
| Secondary | `#818CF8` | Highlights, hover states |
| Accent | `#F2B94B` | Golden emphasis (coins, value) |

**Typography:** Press Start 2P for headings, DM Mono for body text.

---

## Documentation

- [API Endpoints](./API_ENDPOINTS.md) — Complete API reference
- [Payment Flows](./PAYMENT_FLOWS.md) — Recurring and one-time payment flows
- [Core Workflow](./CORE_WORKFLOW.md) — User journeys
- [Scheduler & Processor](./SCHEDULER_PROCESSOR_ARCHITECTURE.md) — Automated billing
- [Database Modeling](./DATABASE_MODELING.md) — Schema and relationships
- [SIWS Implementation](./SIWS_IMPLEMENTATION.md) — Wallet authentication

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a Pull Request using the [PR template](.github/pull_request_template.md)

**Guidelines:** TypeScript strict mode, Zod for validation, tests for new features, follow existing patterns.

---

## License

ISC

---

<div align="center">

**Built on Solana. Powered by Web3. Secured by Smart Contracts.**

</div>
