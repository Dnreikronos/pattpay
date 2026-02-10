# 🚀 PattPay - The Future of Recurring Payments on Solana

![PattPay Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=PattPay+-+Solana+Subscription+Gateway)

**PattPay** is a Web3 payment gateway built natively on the Solana network, designed for subscriptions and recurring on-chain payments. It enables businesses, creators, and platforms to automate payment flows quickly, cheaply, and securely using programmable smart contracts.

> "Set it once. Let the blockchain do the rest."

## 🌟 Features

- **🔄 Recurring Subscriptions** - Automated on-chain payments via delegate authority
- **💳 One-Time Payments** - Direct payment processing with instant confirmation
- **🔗 Payment Links** - Create shareable checkout links for products/services
- **🔐 Dual Authentication** - Email/password or Solana wallet (SIWS standard)
- **📊 Merchant Dashboard** - Real-time analytics, MRR tracking, and payment history
- **⚡ Lightning Fast** - Built on Solana (65,000 TPS, <$0.01 per transaction)
- **🛡️ Non-Custodial** - Users maintain full control of their wallets
- **🔁 Automated Billing** - Smart contracts handle recurring charges automatically

## 📐 Architecture

PattPay is a full-stack monorepo with three main components:

```
pattpay/
├── frontend/          # Next.js 15 + React 19 + TailwindCSS v4
├── backend/           # Fastify + Prisma + PostgreSQL
├── crypto/            # Solana smart contracts (Anchor/Rust)
└── docs/              # Comprehensive documentation
```

### Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 15.5, React 19, TypeScript, TailwindCSS v4, Turbopack, TanStack Query, Zustand |
| **Backend** | Fastify, Prisma ORM, PostgreSQL, JWT, bcrypt, Zod validation |
| **Smart Contracts** | Anchor Framework, Rust, Solana Web3.js, SPL Token |
| **Infrastructure** | Railway (API, Scheduler, Processor), Docker, GitHub Actions |
| **Development** | TypeScript, ESLint, Prettier, Vitest |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** (for frontend/backend)
- **Rust** and **Anchor CLI** (for smart contracts)
- **Docker** and **Docker Compose** (for local database)
- **Solana CLI** (for blockchain interaction)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pattpay.git
cd pattpay

# Install backend dependencies and start database
cd backend
npm install
npm run compose:up
npx prisma migrate dev

# Install frontend dependencies
cd ../frontend
pnpm install

# Build and deploy smart contracts (optional)
cd ../crypto
anchor build
anchor deploy
```

### Development

Run all services in separate terminals:

```bash
# Terminal 1: Backend API (port 3001)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
pnpm dev

# Terminal 3: Scheduler (runs cronjobs)
cd backend
npm run scheduler

# Terminal 4: Processor (processes payments)
cd backend
npm run processor
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/docs

## 📚 Documentation

### Core Documentation

- [API Endpoints](./API_ENDPOINTS.md) - Complete API reference with examples
- [Payment Flows](./PAYMENT_FLOWS.md) - Recurring subscriptions and one-time payments
- [Core Workflow](./CORE_WORKFLOW.md) - User journeys and system workflows
- [Scheduler & Processor Architecture](./SCHEDULER_PROCESSOR_ARCHITECTURE.md) - Automated billing system
- [Database Modeling](./DATABASE_MODELING.md) - Database schema and relationships
- [SIWS Implementation](./SIWS_IMPLEMENTATION.md) - Solana wallet authentication

### Component Documentation

- [Frontend README](./frontend/README.md) - Next.js app setup and development
- [Backend README](./backend/README.md) - Fastify API setup and architecture
- [Crypto README](./crypto/README.md) - Smart contract development and deployment

### AI Development

- [Backend CLAUDE.md](./backend/CLAUDE.md) - Backend guidance for Claude Code
- [Frontend CLAUDE.md](./frontend/CLAUDE.md) - Frontend guidance for Claude Code

## 🏗️ Project Structure

```
pattpay/
├── frontend/                    # Next.js 15 Application
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (checkout)/        # Public checkout pages
│   │   ├── dashboard/         # Merchant dashboard
│   │   └── api/               # API routes (proxies to backend)
│   ├── components/            # React components
│   ├── lib/                   # Utilities, hooks, API clients
│   └── public/                # Static assets (logo, fonts)
│
├── backend/                    # Fastify Backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── controllers/       # Business logic
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── utils/             # Helper functions
│   │   ├── index.ts           # Main API server
│   │   ├── scheduler.ts       # Cronjob scheduler
│   │   └── processor.ts       # Payment processor
│   ├── prisma/                # Database schema and migrations
│   └── docker-compose.yaml    # PostgreSQL setup
│
├── crypto/                     # Solana Smart Contracts
│   ├── programs/              # Anchor programs (Rust)
│   ├── tests/                 # Smart contract tests
│   └── migrations/            # Deployment scripts
│
├── .github/
│   └── workflows/             # CI/CD pipelines
│       ├── deploy-backend.yml
│       ├── deploy-scheduler.yml
│       └── deploy-processor.yml
│
└── target/                    # Solana program builds
```

## 🔑 Key Concepts

### Dual Authentication

PattPay supports two authentication methods:

1. **Email/Password** - Traditional authentication with JWT tokens
2. **Solana Wallet (SIWS)** - Sign-in with wallet using SIWS standard (Phantom, Solflare)

Users choose one method during registration and cannot switch between them.

### Payment Models

1. **Recurring Subscriptions**
   - User delegates authority to relayer via PDA (Program Derived Address)
   - Relayer automatically charges subscription when due
   - Backend scheduler + processor handle billing cycles
   - Example: $10/month SaaS subscription

2. **One-Time Payments**
   - User sends payment directly to merchant wallet
   - Frontend records transaction in backend
   - No delegation required
   - Example: Single product purchase

### Automated Billing System

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Scheduler  │──────▶│ RelayerJob  │──────▶│  Processor  │
│ (Daily 00:00)│       │  (Database) │       │(4x per day) │
└─────────────┘       └─────────────┘       └─────────────┘
      ↓                      ↓                       ↓
  Finds due          Creates pending          Executes payments
 subscriptions          jobs                   + retries
```

## 🔐 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pattpay"
POSTGRES_USER=pattpay_user
POSTGRES_PASSWORD=pattpay_password
POSTGRES_DB=pattpay

# Authentication
JWT_SECRET="your-super-secret-key-at-least-32-characters-long"

# Server
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# Solana
SOLANA_NETWORK="devnet"
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Frontend tests (coming soon)
cd frontend
pnpm test

# Smart contract tests
cd crypto
anchor test
```

## 🚢 Deployment

PattPay uses Railway for deployment with three separate services:

| Service | File | Purpose | Schedule |
|---------|------|---------|----------|
| **API** | `index.ts` | Main REST API | Always on |
| **Scheduler** | `scheduler.ts` | Creates payment jobs | Daily at 00:00 UTC |
| **Processor** | `processor.ts` | Executes payments | 4x daily (00:15, 06:15, 12:15, 18:15) |

### Manual Deployment

```bash
# Deploy backend API
cd backend
railway up --service api

# Deploy scheduler
cd backend
railway up --service scheduler

# Deploy processor
cd backend
railway up --service processor

# Deploy frontend (Vercel recommended)
cd frontend
vercel deploy
```

GitHub Actions automatically deploy services when specific files change.

## 📊 Database Schema

PattPay uses PostgreSQL with Prisma ORM. Key tables:

- **Users** - Dual auth (email or wallet)
- **Plans** - Subscription templates with pricing
- **Subscriptions** - Active subscriptions with delegate authority
- **Payers** - Customers who subscribe to plans
- **PaymentExecutions** - Payment history and transaction logs
- **RelayerJobs** - Scheduled payment jobs with retry logic
- **CheckoutLinks** - Shareable payment links

See [DATABASE_MODELING.md](./DATABASE_MODELING.md) for detailed schema.

## 🎨 Design System

PattPay features a unique **"Pixel Finance City"** design language:

- **Isometric pixel art** representing the DeFi ecosystem
- **Color palette**:
  - Background: `#E5DEF6` (lavender)
  - Brand: `#4F46E5` (indigo)
  - Secondary: `#818CF8` (light blue)
  - Accent: `#F2B94B` (golden)
- **Typography**: Press Start 2P (headings), DM Mono (body)
- **Aesthetic**: Minimalist, retro-futuristic, clean

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request using the [PR template](.github/pull_request_template.md)

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use Zod for validation schemas
- Write tests for new features
- Update documentation when needed
- Follow the existing code style

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

Built with ❤️ by the PattPay team

## 🔗 Links

- **Website**: [pattpay.com](https://pattpay.com) (coming soon)
- **Docs**: [docs.pattpay.com](https://docs.pattpay.com) (coming soon)
- **Twitter**: [@pattpay](https://twitter.com/pattpay) (coming soon)
- **Discord**: [Join our community](https://discord.gg/pattpay) (coming soon)

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact us at: support@pattpay.com (coming soon)

---

**Built on Solana. Powered by Web3. Secured by Smart Contracts.**
