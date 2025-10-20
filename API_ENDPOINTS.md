# PattPay API Endpoints Documentation

## 📋 Overview

This document outlines the **essential API endpoints** for PattPay's MVP backend implementation. The API serves a Web3 payment gateway built on Solana, enabling recurring payments and subscription management.

### Target Customers

- **Content Creators**: Manage fan subscriptions
- **Web3 SaaS Companies**: Automate billing cycles
- **DAOs & Projects**: Collect recurring contributions
- **Freelancers**: Create payment links for services

---

## 🔐 Authentication & User Management

### User Registration & Login

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**User Registration**

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "walletAddress": "string", // Solana wallet address
  "name": "string",
  "email": "string?",
  "signature": "string" // Wallet signature for verification
}

Response: {
  "user": {
    "id": "uuid",
    "walletAddress": "string",
    "name": "string",
    "email": "string?",
    "createdAt": "ISO8601"
  },
  "token": "jwt_token"
}
```

**User Login**

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "string",
  "signature": "string"
}

Response: {
  "user": User,
  "token": "jwt_token"
}
```

**Get Current User**

```typescript
GET /api/auth/me
Authorization: Bearer <token>

Response: {
  "user": User
}
```

---

## 🔗 Payment Links Management (Core Feature)

### Link Operations

```http
GET    /api/links
POST   /api/links
GET    /api/links/:id
PUT    /api/links/:id
DELETE /api/links/:id
```

**List Payment Links**

```typescript
GET /api/links?page=1&limit=20&status=active&isRecurring=all
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- status: 'active' | 'inactive' | 'all'
- isRecurring: boolean | 'all'
- search: string (name or URL)
- datePreset: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'

Response: {
  "links": CheckoutLink[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "stats": {
    "totalActive": number,
    "totalCreated": number,
    "averageConversion": number,
    "totalRevenue": number,
    "totalRevenueUSD": number
  }
}
```

**Create Payment Link**

```typescript
POST /api/links
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "description": "string?",
  "amount": number, // SOL
  "amountUSD": number,
  "isRecurring": boolean,
  "redirectUrl": "string?",
  "expiresAt": "ISO8601?",
  "maxUses": number?
}

Response: {
  "link": CheckoutLink,
  "url": "string" // Full checkout URL
}
```

**Update Payment Link**

```typescript
PUT /api/links/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string?",
  "description": "string?",
  "amount": number?,
  "amountUSD": number?,
  "status": "active" | "inactive",
  "redirectUrl": "string?",
  "expiresAt": "ISO8601?",
  "maxUses": number?
}

Response: {
  "link": CheckoutLink
}
```

**Delete Payment Link**

```typescript
DELETE /api/links/:id
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Link deleted successfully"
}
```

---

## 💳 Payments Management

### Payment Operations

```http
GET    /api/payments
GET    /api/payments/:id
```

**List Payments**

```typescript
GET /api/payments?page=1&limit=20&status=success&datePreset=last-30-days
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- status: 'success' | 'pending' | 'failed' | 'all'
- datePreset: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
- dateFrom: ISO8601 (if custom)
- dateTo: ISO8601 (if custom)
- amountMin: number
- amountMax: number
- search: string (hash or wallet)

Response: {
  "payments": Payment[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "stats": {
    "totalToday": number,
    "volumeToday": number,
    "volumeTodayUSD": number,
    "averageTicket": number,
    "averageTicketTrend": number
  }
}
```

**Payment Details**

```typescript
GET /api/payments/:id
Authorization: Bearer <token>

Response: {
  "payment": Payment,
  "relatedTransactions": Transaction[],
  "link": CheckoutLink | null
}
```

---

## 🔄 Subscriptions Management

### Subscription Operations

```http
GET    /api/subscriptions
GET    /api/subscriptions/:id
PUT    /api/subscriptions/:id/cancel
```

**List Subscriptions**

```typescript
GET /api/subscriptions?page=1&limit=20&status=active&datePreset=last-30-days
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- status: 'active' | 'cancelled' | 'expired' | 'all'
- datePreset: 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'
- amountMin: number
- amountMax: number
- search: string (payer name, wallet, plan name)
- tokenMint: string (USDT, USDC, etc.)

Response: {
  "subscriptions": Subscription[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "stats": {
    "activeSubscriptions": number,
    "mrr": number,
    "mrrUSD": number,
    "arr": number,
    "arrUSD": number,
    "arrTrend": number,
    "newSubscriptions": number,
    "cancelledSubscriptions": number
  }
}
```

**Subscription Details**

```typescript
GET /api/subscriptions/:id
Authorization: Bearer <token>

Response: {
  "subscription": Subscription,
  "plan": Plan,
  "payer": Payer,
  "paymentHistory": PaymentExecution[],
  "nextPayment": {
    "dueAt": "ISO8601",
    "amount": number,
    "amountUSD": number
  }
}
```

**Cancel Subscription**

```typescript
PUT /api/subscriptions/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string?" // Optional cancellation reason
}

Response: {
  "subscription": Subscription,
  "cancelledAt": "ISO8601"
}
```

---

## 🏠 Dashboard & Analytics

### Dashboard Overview

```http
GET /api/dashboard/overview
GET /api/dashboard/charts/transactions
GET /api/dashboard/charts/mrr
```

**Dashboard Overview**

```typescript
GET /api/dashboard/overview
Authorization: Bearer <token>

Response: {
  "stats": {
    "activeSubscriptions": number,
    "totalRevenue": number, // SOL
    "totalRevenueUSD": number,
    "paymentsToday": number,
    "mrr": number, // Monthly Recurring Revenue
    "mrrUSD": number
  },
  "recentTransactions": Payment[],
  "activeLinks": CheckoutLink[]
}
```

**Transaction Charts**

```typescript
GET /api/dashboard/charts/transactions?period=30d
Authorization: Bearer <token>

Response: {
  "data": [
    {
      "date": "YYYY-MM-DD",
      "volume": number, // SOL
      "volumeUSD": number,
      "count": number,
      "change": number // % change
    }
  ]
}
```

**MRR Charts**

```typescript
GET /api/dashboard/charts/mrr?period=30d
Authorization: Bearer <token>

Response: {
  "data": [
    {
      "date": "YYYY-MM-DD",
      "mrr": number, // SOL
      "mrrUSD": number,
      "change": number // % change
    }
  ]
}
```

---

## 🔧 System & Health

### System Operations

```http
GET /api/health
```

**Health Check**

```typescript
GET /api/health

Response: {
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "ISO8601",
  "services": {
    "database": "healthy" | "degraded" | "unhealthy",
    "solana": "healthy" | "degraded" | "unhealthy"
  },
  "version": "string"
}
```

---

## 📊 Data Types

### Core Types

```typescript
interface User {
  id: string;
  walletAddress: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  hash: string;
  amount: number; // SOL
  amountUSD: number;
  status: "success" | "pending" | "failed";
  from: string;
  to: string;
  linkId?: string;
  linkName?: string;
  block: number;
  confirmations: number;
  fee: number;
  createdAt: string;
  confirmedAt?: string;
}

interface CheckoutLink {
  id: string;
  name: string;
  amount: number; // SOL
  amountUSD: number;
  status: "active" | "inactive";
  url: string;
  isRecurring: boolean;
  redirectUrl?: string;
  description?: string;
  createdAt: string;
  totalPayments: number;
  conversions: number;
  views: number;
}

interface Subscription {
  id: string;
  planId: string;
  payerId: string;
  payerName: string;
  payerWallet: string;
  planName: string;
  planDescription?: string;
  tokenMint: string;
  tokenDecimals: number;
  amount: number;
  amountUSD: number;
  status: "active" | "cancelled" | "expired";
  nextDueAt: string;
  lastPaidAt: string;
  totalApprovedAmount: number;
  durationMonths: number;
  periodSeconds: number;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  receiverId: string;
  name: string;
  description?: string;
  durationMonths: number;
  periodSeconds: number;
  createdAt: string;
  updatedAt: string;
}

interface Receiver {
  id: string;
  walletAddress: string;
  name: string;
  description?: string;
  tokenAccountUSDT: string;
  tokenAccountUSDC: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔒 Security & Rate Limiting

### Authentication

- All endpoints (except health checks) require JWT authentication
- JWT tokens expire after 24 hours
- Wallet signature verification for registration/login

### Rate Limiting

- **General API**: 1000 requests/hour per user
- **Payment Operations**: 100 requests/hour per user
- **Authentication**: 5 attempts/minute per IP

### CORS & Headers

```http
Access-Control-Allow-Origin: https://pattpay.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

## 🚀 Implementation Priority

### Phase 1 (MVP Core - Week 1)

1. **Authentication** - User registration/login with wallet
2. **Payment Links** - CRUD operations for payment links
3. **Payments** - List, filter, and view payment details

### Phase 2 (Extended Features - Week 2)

1. **Subscriptions** - Full subscription management
2. **Dashboard** - Overview stats and charts
3. **Health** - System monitoring endpoints

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- All monetary amounts are in SOL (with USD equivalents)
- Pagination uses page-based approach (not cursor-based)
- All endpoints return consistent error format
- Database uses PostgreSQL with Prisma ORM
- Smart contracts are deployed on Solana mainnet/devnet
- Rate limiting implemented with Redis

**Next Steps**: Begin implementation with Phase 1 endpoints, starting with authentication and payment links.
