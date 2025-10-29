# PattPay Core Workflow Documentation

## 📋 Overview

This document outlines the **core workflows** for PattPay's MVP, showing how users interact with the system and what happens behind the scenes. These workflows demonstrate the essential user journeys that need to be implemented first.

---

## 🏢 Scenario 1: Merchant Creates Payment Links

### **User Story**

_Alice is the owner of "Web3SaaS Pro", a SaaS company. She wants to create recurring payment links for her two subscription plans: Basic ($10/month) and Pro ($25/month)._

### **Workflow Steps**

#### **Step 1: Merchant Authentication**

```typescript
// 1. Alice connects her Solana wallet (Phantom/Solflare)
// 2. Frontend calls authentication endpoint

POST /api/auth/login
{
  "walletAddress": "Alice's wallet address",
  "signature": "Wallet signature for verification"
}

// Response creates user record in database
// Tables used: receivers (Alice becomes a receiver/merchant)
// Note: Alice can choose email/password or Solana wallet authentication
```

#### **Step 2: Create Basic Plan Payment Link**

```typescript
// Alice creates first payment link for Basic plan

POST /api/links
Authorization: Bearer <alice_token>
{
  "name": "Basic Plan - Monthly",
  "description": "Essential features for small teams",
  "amount": 0.1, // 0.1 SOL ≈ $10 USD
  "amountUSD": 10,
  "isRecurring": true,
  "redirectUrl": "https://web3saas.com/success"
}

// Database operations:
// 1. Insert into plans table (receiver_id = Alice's ID)
// 2. Insert into plan_tokens table (USDC/USDT pricing)
// 3. Return checkout URL: https://pay.pattpay.com/link/abc123
```

#### **Step 3: Create Pro Plan Payment Link**

```typescript
// Alice creates second payment link for Pro plan

POST /api/links
Authorization: Bearer <alice_token>
{
  "name": "Pro Plan - Monthly",
  "description": "Advanced features for growing teams",
  "amount": 0.25, // 0.25 SOL ≈ $25 USD
  "amountUSD": 25,
  "isRecurring": true,
  "redirectUrl": "https://web3saas.com/success"
}

// Database operations:
// 1. Insert into plans table (receiver_id = Alice's ID)
// 2. Insert into plan_tokens table (USDC/USDT pricing)
// 3. Return checkout URL: https://pay.pattpay.com/link/def456
```

### **Database Tables Used**

- `receivers` (Alice's merchant record)
- `plans` (2 plan records created)
- `plan_tokens` (pricing for each token type)

---

## 👤 Scenario 2: Customer Makes Payment

### **User Story**

_Bob, a potential customer, clicks on Alice's Basic Plan link and wants to subscribe to the $10/month plan._

### **Workflow Steps**

#### **Step 1: Customer Views Payment Link**

```typescript
// Bob visits: https://pay.pattpay.com/link/abc123
// Frontend calls (no auth required for public checkout)

GET / api / links / abc123;
// Returns link details, pricing, and payment form
```

#### **Step 2: Customer Initiates Payment**

```typescript
// Bob connects his wallet and initiates payment
// This triggers Solana smart contract interaction

// Smart Contract Operations:
// 1. Create subscription approval transaction
// 2. Customer signs transaction in wallet
// 3. Transaction submitted to Solana network
// 4. Smart contract creates subscription record
```

#### **Step 3: Payment Processing**

```typescript
// Backend monitors Solana blockchain for transaction
// When transaction is confirmed:

// Database operations:
// 1. Insert into payers table (Bob's record)
// 2. Insert into subscriptions table (Bob's subscription to Alice's plan)
// 3. Insert into payment_executions table (first payment record)
// 4. Update relayer_jobs table (schedule next payment)

// Tables used:
// - payers (Bob's user record)
// - subscriptions (Bob's subscription to Basic plan)
// - payment_executions (payment record)
// - relayer_jobs (automated billing setup)
```

#### **Step 4: Success & Redirect**

```typescript
// Customer redirected to success page
// Alice receives notification of new subscriber
```

### **Database Tables Used**

- `payers` (Bob's user record)
- `subscriptions` (Bob's subscription)
- `payment_executions` (payment record)
- `relayer_jobs` (automated billing)

---

## 🔄 Scenario 3: Recurring Payment Execution

### **User Story**

_One month later, Bob's subscription needs to be renewed automatically._

### **Workflow Steps**

#### **Step 1: Automated Billing Check**

```typescript
// Backend cron job checks for due payments
// Query: SELECT * FROM subscriptions WHERE next_due_at <= NOW()

// Finds Bob's subscription is due for renewal
```

#### **Step 2: Execute Recurring Payment**

```typescript
// Smart contract automatically executes payment
// 1. Transfer 0.1 SOL from Bob to Alice
// 2. Update subscription next_due_at
// 3. Record payment execution

// Database operations:
// 1. Update subscriptions table (next_due_at = next month)
// 2. Insert into payment_executions table (new payment record)
// 3. Update relayer_jobs table (schedule next payment)
```

#### **Step 3: Notification & Analytics**

```typescript
// Alice's dashboard updates with new payment
// Bob receives payment confirmation
// Analytics update MRR, revenue, etc.
```

### **Database Tables Used**

- `subscriptions` (update next_due_at)
- `payment_executions` (new payment record)
- `relayer_jobs` (schedule next payment)

---

## 📊 Scenario 4: Merchant Views Dashboard

### **User Story**

_Alice wants to check her business performance and see recent payments._

### **Workflow Steps**

#### **Step 1: Dashboard Overview**

```typescript
GET / api / dashboard / overview;
Authorization: Bearer<alice_token>;

// Database queries:
// 1. Count active subscriptions for Alice
// 2. Sum total revenue from payments
// 3. Get recent transactions
// 4. Get active payment links

// Tables used:
// - subscriptions (count active)
// - payment_executions (sum revenue)
// - plans (Alice's plans)
```

#### **Step 2: View Payment History**

```typescript
GET /api/payments?page=1&limit=20
Authorization: Bearer <alice_token>

// Database query:
// SELECT * FROM payment_executions
// WHERE subscription_id IN (Alice's subscriptions)
// ORDER BY executed_at DESC

// Tables used:
// - payment_executions (payment history)
// - subscriptions (filter by Alice's plans)
```

#### **Step 3: View Subscriptions**

```typescript
GET /api/subscriptions?status=active
Authorization: Bearer <alice_token>

// Database query:
// SELECT * FROM subscriptions
// WHERE plan_id IN (Alice's plans)
// AND status = 'active'

// Tables used:
// - subscriptions (active subscribers)
// - payers (customer details)
// - plans (plan details)
```

### **Database Tables Used**

- `subscriptions` (active subscribers)
- `payment_executions` (payment history)
- `plans` (Alice's plans)
- `payers` (customer details)

---

## 🔧 Core System Components

### **Smart Contract Integration**

- **Subscription Creation**: Customer approves recurring payments
- **Payment Execution**: Automated monthly transfers
- **Cancellation**: Customer can cancel anytime

### **Database Schema Flow**

```
User Registration → Payer Record
Plan Creation → Plan + PlanToken Records
Payment Link → Public URL Generation
Customer Payment → Subscription + PaymentExecution Records
Recurring Billing → Automated PaymentExecution Records
```

### **Key Business Logic**

1. **Merchants** create plans and get payment links
2. **Customers** pay through Solana smart contracts
3. **System** automatically handles recurring billing
4. **Analytics** track MRR, revenue, and subscriber metrics

---

## 🚀 Implementation Priority

### **Phase 1: Core Payment Flow**

1. User authentication (merchants)
2. Payment link creation
3. Customer payment processing
4. Basic dashboard (payments list)

### **Phase 2: Recurring Billing**

1. Subscription management
2. Automated billing execution
3. Advanced dashboard analytics

### **Phase 3: Business Features**

1. Plan management
2. Customer management
3. Advanced reporting

---

## 📝 Notes

- **Smart Contracts**: Handle the actual payment logic on Solana
- **Database**: Tracks business relationships and payment history
- **API**: Provides interface between frontend and blockchain
- **Cron Jobs**: Execute recurring billing automatically
- **Notifications**: Alert merchants of new payments/subscribers

**Next Steps**: Start with Phase 1 - implement authentication and payment link creation first.
