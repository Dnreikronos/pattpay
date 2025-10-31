# ⚡ PattPay Backend

High-performance Fastify backend for PattPay's Web3 subscription payment system on Solana. Features dual authentication, automated recurring billing, and comprehensive payment processing.

![Fastify](https://img.shields.io/badge/Fastify-5.6-black?logo=fastify)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or 20+
- **Docker** and **Docker Compose** (for PostgreSQL)
- **npm** (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL database
npm run compose:up

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health

### Stopping the Database

```bash
npm run compose:down
```

## 📦 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Fastify** | Fast HTTP framework | 5.6.1 |
| **Prisma** | Type-safe ORM | 6.17.1 |
| **PostgreSQL** | Relational database | Latest (Docker) |
| **TypeScript** | Type safety | 5.9.3 |
| **Zod** | Schema validation | 4.1.12 |
| **JWT** | Authentication | @fastify/jwt 10.0 |
| **bcrypt** | Password hashing | 6.0.0 |
| **Vitest** | Testing framework | 4.0.2 |
| **Solana Web3.js** | Blockchain integration | 1.98.4 |
| **Anchor** | Smart contract SDK | 0.32.1 |

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/                  # API route handlers
│   │   ├── auth.routes.ts       # Authentication endpoints
│   │   ├── plans.routes.ts      # Subscription plans
│   │   ├── links.routes.ts      # Payment links (checkout URLs)
│   │   ├── subscriptions.routes.ts
│   │   └── payment-executions.routes.ts
│   │
│   ├── controllers/             # Business logic
│   │   ├── auth.controller.ts
│   │   ├── plans.controller.ts
│   │   └── ...
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── plans.schema.ts
│   │   └── common.schema.ts
│   │
│   ├── utils/                   # Helper functions
│   │   ├── auth.utils.ts        # Password hashing, JWT
│   │   └── solana.utils.ts      # Solana helpers
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.d.ts           # Fastify extensions
│   │
│   ├── config.ts                # Environment config (Zod validated)
│   ├── db.ts                    # Prisma client singleton
│   ├── index.ts                 # Main API server
│   ├── scheduler.ts             # Cronjob scheduler
│   └── processor.ts             # Payment processor
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
│
├── docker-compose.yaml          # PostgreSQL container
├── .env.example                 # Example environment variables
├── tsconfig.json                # TypeScript config
├── vitest.config.ts             # Vitest config
└── package.json                 # Dependencies
```

## 🏗️ Architecture

### Three-Service Model

PattPay backend consists of three independent services:

#### 1. API Service (`index.ts`)
- Main REST API
- Handles all HTTP requests
- JWT authentication
- Swagger documentation
- **Always on**

#### 2. Scheduler Service (`scheduler.ts`)
- Cronjob that runs **daily at 00:00 UTC**
- Scans for due subscriptions
- Creates `RelayerJob` records
- **Stateless** - no HTTP server

#### 3. Processor Service (`processor.ts`)
- Cronjob that runs **4x daily** (00:15, 06:15, 12:15, 18:15 UTC)
- Processes pending `RelayerJob` records
- Executes payment transactions
- Implements retry logic with exponential backoff
- **Stateless** - no HTTP server

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Scheduler  │──────▶│ RelayerJob  │──────▶│  Processor  │
│ (Daily 00:00)│       │  (Database) │       │(4x per day) │
└─────────────┘       └─────────────┘       └─────────────┘
      ↓                      ↓                       ↓
  Finds due          Creates pending          Executes payments
 subscriptions          jobs                   + retries
```

See [SCHEDULER_PROCESSOR_ARCHITECTURE.md](../SCHEDULER_PROCESSOR_ARCHITECTURE.md) for detailed explanation.

## 🔐 Authentication System

PattPay supports **dual authentication** - users choose one method during registration:

### 1. Email/Password (Traditional)

```typescript
// Register
POST /api/auth/register
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Login
POST /api/auth/login
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 2. Solana Wallet (SIWS Standard)

```typescript
// Step 1: Get sign-in data
POST /api/auth/solana-signin-data
{
  "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
}

// Step 2: Verify signature
POST /api/auth/solana-verify
{
  "signInData": { domain, statement, nonce, ... },
  "signInOutput": { signature, account },
  "name": "John Doe"
}
```

**Security:**
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Wallet signatures verified using SIWS standard
- No password stored for wallet users

See [SIWS_IMPLEMENTATION.md](../SIWS_IMPLEMENTATION.md) for detailed implementation.

## 📊 Database Schema

### Key Tables

```sql
-- Users (dual auth)
users
├── id (uuid)
├── name
├── auth_method (email_password | solana_wallet)
├── email (nullable - only for email_password)
├── password_hash (nullable - only for email_password)
└── wallet_address (nullable - only for solana_wallet)

-- Subscription plans
plans
├── id (uuid)
├── receiver_id (fk -> users)
├── name
├── description
├── duration_months
├── period_seconds
└── is_recurring (boolean)

-- Plan pricing (multi-token support)
plan_tokens
├── id (uuid)
├── plan_id (fk -> plans)
├── token_mint (SPL token address)
├── token_decimals
└── price (decimal)

-- Active subscriptions
subscriptions
├── id (uuid)
├── plan_id (fk -> plans)
├── payer_id (fk -> payers)
├── token_mint
├── status (ACTIVE | CANCELLED | EXPIRED)
├── next_due_at
├── last_paid_at
├── delegate_authority (PDA address)
└── total_approved_amount

-- Payment history
payment_executions
├── id (uuid)
├── plan_id (fk -> plans)
├── subscription_id (nullable - null for one-time)
├── tx_signature (unique)
├── status (SUCCESS | FAILED)
├── executed_at
├── token_mint
└── amount

-- Scheduled payment jobs
relayer_jobs
├── id (uuid)
├── subscription_id (fk -> subscriptions)
├── status (PENDING | SUCCESS | FAILED)
├── next_retry_at
├── retry_count
└── error_message
```

See [DATABASE_MODELING.md](../DATABASE_MODELING.md) for complete schema details.

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register              # Create account
POST   /api/auth/login                 # Sign in
POST   /api/auth/solana-signin-data    # Get SIWS message
POST   /api/auth/solana-verify         # Verify wallet signature
GET    /api/auth/me                    # Get current user (auth)
```

### Payment Links (Checkout URLs)
```
GET    /api/links                      # List links (auth)
POST   /api/links                      # Create link (auth)
GET    /api/links/:id                  # Get link details (auth)
PUT    /api/links/:id                  # Update link (auth)
DELETE /api/links/:id                  # Delete link (auth)
```

### Plans
```
GET    /api/plans                      # List plans (auth)
POST   /api/plans                      # Create plan (auth)
GET    /api/plans/:id                  # Get plan (public)
PUT    /api/plans/:id                  # Update plan (auth)
DELETE /api/plans/:id                  # Delete plan (auth)
```

### Subscriptions
```
POST   /api/subscribe                  # Create subscription (public)
GET    /api/subscriptions              # List subscriptions (auth)
GET    /api/subscriptions/:id          # Get subscription (auth)
PUT    /api/subscriptions/:id/cancel   # Cancel subscription (auth)
```

### Payments
```
POST   /api/payment-executions         # Record one-time payment (public)
GET    /api/payment-executions         # List payments (auth)
GET    /api/payment-executions/:id     # Get payment details (auth)
```

### System
```
GET    /health                         # Health check (public)
GET    /docs                           # Swagger API docs (public)
```

See [API_ENDPOINTS.md](../API_ENDPOINTS.md) for complete API reference.

## 💳 Payment Flows

### Recurring Subscriptions

1. **Customer** visits checkout page
2. **Frontend** calls `approve_delegate()` on Solana
3. **Frontend** calls `POST /api/subscribe` with delegate signature
4. **Backend** creates `Payer`, `Subscription`, and first `PaymentExecution`
5. **Scheduler** creates `RelayerJob` when subscription is due
6. **Processor** executes payment and updates subscription

### One-Time Payments

1. **Customer** visits checkout page
2. **Frontend** calls `transferTokens()` on Solana
3. **Frontend** calls `POST /api/payment-executions` with tx signature
4. **Backend** records payment

See [PAYMENT_FLOWS.md](../PAYMENT_FLOWS.md) for detailed flow diagrams and implementation.

## 🧪 Environment Variables

Create `.env` file (use `.env.example` as template):

```bash
# PostgreSQL Configuration
POSTGRES_USER=pattpay_user
POSTGRES_PASSWORD=pattpay_password
POSTGRES_DB=pattpay

# Database Connection URL
DATABASE_URL="postgresql://pattpay_user:pattpay_password@localhost:5432/pattpay"

# JWT Secret (min 32 characters)
JWT_SECRET="your-super-secret-key-at-least-32-characters-long-change-this-in-production"

# Environment
NODE_ENV="development"

# Server Port
PORT="3001"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Solana Network
SOLANA_NETWORK="devnet"
```

**Important:**
- All environment variables are **validated on startup** using Zod
- Invalid config will cause startup to fail with clear error messages
- Never access `process.env` directly - import `config` from `src/config.ts`

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev              # Start with hot reload (tsx watch)
npm run start            # Start without hot reload

# Database
npm run compose:up       # Start PostgreSQL
npm run compose:down     # Stop PostgreSQL
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI

# Scheduler & Processor
npm run scheduler        # Run scheduler manually
npm run processor        # Run processor manually

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:ui          # Vitest UI

# Build
npm run build            # Compile TypeScript
```

### Database Operations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations to production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Seed database (if seed script exists)
npx prisma db seed

# View data in browser
npx prisma studio
```

### Local Development Workflow

**Terminal 1: Database**
```bash
npm run compose:up
```

**Terminal 2: API Server**
```bash
npm run dev
```

**Terminal 3: Scheduler (optional)**
```bash
npm run scheduler
```

**Terminal 4: Processor (optional)**
```bash
npm run processor
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm run test

# Watch mode (re-runs on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

### Test Structure

```typescript
// tests/unit/auth.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '@/utils/auth.utils';

describe('Auth Utils', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await comparePassword(password, hash)).toBe(true);
  });
});
```

## 🚀 Deployment

### Railway (Recommended)

PattPay uses Railway with **three separate services**:

```bash
# Deploy API
railway up --service api

# Deploy Scheduler
railway up --service scheduler

# Deploy Processor
railway up --service processor
```

### Environment Variables on Railway

Set these for each service:
- `DATABASE_URL` (from Railway PostgreSQL add-on)
- `JWT_SECRET` (min 32 characters)
- `NODE_ENV` → `production`
- `PORT` → `3001` (API only)
- `FRONTEND_URL` → Your frontend URL
- `SOLANA_NETWORK` → `mainnet` or `devnet`

### GitHub Actions

Automatic deployment on push:

| Workflow | Triggers On |
|----------|-------------|
| `deploy-backend.yml` | Changes to API code |
| `deploy-scheduler.yml` | Changes to `scheduler.ts`, Prisma schema, or dependencies |
| `deploy-processor.yml` | Changes to `processor.ts`, Prisma schema, or dependencies |

See [SCHEDULER_PROCESSOR_ARCHITECTURE.md](../SCHEDULER_PROCESSOR_ARCHITECTURE.md) for deployment details.

## 🏢 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random string (min 32 chars)
- [ ] Update `DATABASE_URL` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` to production frontend
- [ ] Set `SOLANA_NETWORK=mainnet`
- [ ] Apply database migrations: `npx prisma migrate deploy`
- [ ] Test authentication endpoints
- [ ] Test payment flows
- [ ] Set up monitoring/logging (Sentry, Datadog, etc.)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review CORS settings

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart database
npm run compose:down && npm run compose:up

# Check DATABASE_URL in .env matches docker-compose.yaml
```

### Migration Errors

```bash
# Reset database (development only!)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3002

# Or kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### TypeScript Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild Prisma client
npx prisma generate

# Check for type errors
npx tsc --noEmit
```

## 📚 Best Practices

### TypeScript Guidelines

```typescript
// ✅ GOOD - Use utility types
type CreatePlanData = Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>;

// ✅ GOOD - Avoid any, use unknown
function processData(data: unknown) {
  if (isValidData(data)) {
    // Type guard narrows type
  }
}

// ❌ BAD - Using any
function processData(data: any) { }
```

### Error Handling

```typescript
// ✅ GOOD - Structured error responses
return reply.status(404).send({
  statusCode: 404,
  error: 'Not Found',
  message: 'Plan not found',
  details: { planId }
});

// ❌ BAD - Generic errors
throw new Error('Something went wrong');
```

### Validation

```typescript
// ✅ GOOD - Zod schema validation
const createPlanSchema = z.object({
  name: z.string().min(3).max(100),
  amount: z.number().positive()
});

const validatedData = createPlanSchema.parse(request.body);

// ❌ BAD - No validation
const { name, amount } = request.body;
```

### Database Queries

```typescript
// ✅ GOOD - Prevent N+1 queries
const subscriptions = await prisma.subscription.findMany({
  include: {
    plan: { select: { id: true, name: true } },
    payer: { select: { id: true, name: true } }
  }
});

// ❌ BAD - N+1 queries
const subscriptions = await prisma.subscription.findMany();
for (const sub of subscriptions) {
  const plan = await prisma.plan.findUnique({ where: { id: sub.planId } });
}
```

## 📖 Related Documentation

- [Main README](../README.md) - Project overview
- [Frontend README](../frontend/README.md) - Frontend documentation
- [Crypto README](../crypto/README.md) - Smart contracts
- [API Endpoints](../API_ENDPOINTS.md) - Complete API reference
- [Payment Flows](../PAYMENT_FLOWS.md) - Payment integration guide
- [Scheduler & Processor](../SCHEDULER_PROCESSOR_ARCHITECTURE.md) - Automated billing
- [Database Modeling](../DATABASE_MODELING.md) - Database schema
- [SIWS Implementation](../SIWS_IMPLEMENTATION.md) - Wallet authentication
- [CLAUDE.md](./CLAUDE.md) - Guidance for Claude Code

## 🤝 Contributing

When working on the backend:
1. Follow TypeScript strict mode conventions
2. Always validate input with Zod schemas
3. Write tests for new features
4. Use Prisma transactions for related operations
5. Never log sensitive data (passwords, private keys)
6. Update Swagger documentation for new endpoints
7. Run migrations in dev before committing

## 📄 License

ISC License

---

**Built with Fastify + Prisma + PostgreSQL**
