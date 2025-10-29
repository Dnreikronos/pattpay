# Payment Links - Database Architecture

## Overview

A "Payment Link" is a user-facing concept that represents a **Plan** with its configured **PlanTokens** in the database.

---

## The Relationship

```
Payment Link = Plan (1) + PlanTokens (N)
```

### Plan Table

Stores the payment link configuration:

- **Identity**: Name, description, receiver
- **Type**: One-time (`isRecurring: false`) or Subscription (`isRecurring: true`)
- **Lifecycle**: Status, expiration date (`expiresAt`)
- **Subscription Settings**: Duration in months, billing period in seconds
- **UX**: Redirect URL after payment

### PlanToken Table

Stores the accepted payment methods for that plan:

- **Token Info**: Symbol (USDC, SOL, USDT), mint address, decimals
- **Pricing**: Price in that specific token
- **Relation**: Links back to the parent Plan

---

## Example Flow

### 1. Create Payment Link

```http
POST /api/links/
{
  "name": "Premium Subscription",
  "isRecurring": true,
  "durationMonths": 12,
  "periodSeconds": 2592000,
  "tokenPrices": [
    { "token": "USDC", "price": 10 },
    { "token": "SOL", "price": 0.05 }
  ]
}
```

### 2. Database Records Created

**Plan:**

```
id: "abc-123"
name: "Premium Subscription"
isRecurring: true
durationMonths: 12
periodSeconds: 2592000
status: ACTIVE
```

**PlanTokens:**

```
[
  { planId: "abc-123", symbol: "USDC", price: 10, tokenMint: "...", decimals: 6 },
  { planId: "abc-123", symbol: "SOL", price: 0.05, tokenMint: "...", decimals: 9 }
]
```

### 3. Generated Payment Link

```
https://pattpay.com/payment/abc-123
```

---

## Why This Architecture?

### Flexibility

- One plan can accept multiple tokens at different prices
- Easy to add/remove payment options

### Clarity

- Plan metadata separate from pricing
- Each token price is an independent record

### Scalability

- New tokens can be added without schema changes
- Historical prices are preserved per token

---

## Key Concepts

| Concept          | Implementation                                 |
| ---------------- | ---------------------------------------------- |
| **Payment Link** | User-friendly term for a shareable payment URL |
| **Plan**         | Database record containing link configuration  |
| **PlanToken**    | Individual token acceptance record with price  |
| **URL**          | `{frontend}/payment/{planId}`                  |

---

## One-Time vs Recurring

### One-Time Payment

```javascript
{
  isRecurring: false,
  durationMonths: null,  // Not needed
  periodSeconds: null,   // Not needed
  expiresAt: "2025-12-31T23:59:59Z"  // Optional link expiration
}
```

### Recurring Subscription

```javascript
{
  isRecurring: true,
  durationMonths: 12,      // Total subscription length
  periodSeconds: 2592000,  // Billing frequency (30 days)
  expiresAt: null          // Optional - when link stops accepting new subscribers
}
```

---

## API Call Examples

### 1. One-Time Payment Link

**Use Case:** Simple payment for a product or service with no expiration.

```json
POST /api/links/
{
  "name": "E-book Purchase",
  "description": "Complete Guide to Solana Development",
  "isRecurring": false,
  "tokenPrices": [
    { "token": "USDC", "price": 29.99 },
    { "token": "SOL", "price": 0.15 }
  ]
}
```

**Explanation:** Creates a payment link that never expires. Customer can pay once using either USDC or SOL.

---

### 2. One-Time Payment with Deadline

**Use Case:** Limited-time offer, flash sale, or event ticket with expiration.

```json
POST /api/links/
{
  "name": "Black Friday Special",
  "description": "50% OFF - Valid until midnight",
  "isRecurring": false,
  "expiresAt": "2025-11-30T23:59:59Z",
  "redirectUrl": "https://mystore.com/thank-you",
  "tokenPrices": [
    { "token": "USDC", "price": 49.99 },
    { "token": "USDT", "price": 49.99 }
  ]
}
```

**Explanation:** Payment link automatically becomes inactive after the specified date. No new payments accepted after expiration.

---

### 3. Recurring Subscription (Forever)

**Use Case:** Ongoing membership or service with no end date. Continues until manually cancelled.

```json
POST /api/links/
{
  "name": "Premium Membership",
  "description": "Unlimited access to all features",
  "isRecurring": true,
  "durationMonths": 12,
  "periodSeconds": 2592000,
  "redirectUrl": "https://myapp.com/welcome",
  "tokenPrices": [
    { "token": "USDC", "price": 10 },
    { "token": "SOL", "price": 0.05 }
  ]
}
```

**Explanation:**

- `durationMonths: 12` → User approves delegate for 12 months of payments
- `periodSeconds: 2592000` → Charged every 30 days (2,592,000 seconds)
- After 12 months, subscription needs renewal (new delegate approval)
- Link remains active indefinitely, accepting new subscribers

---

### 4. Recurring Subscription with Sign-up Deadline

**Use Case:** Early bird pricing, limited enrollment period, or beta program.

```json
POST /api/links/
{
  "name": "Founding Members Program",
  "description": "Lock in lifetime discount - Limited spots!",
  "isRecurring": true,
  "durationMonths": 24,
  "periodSeconds": 2592000,
  "expiresAt": "2025-12-31T23:59:59Z",
  "redirectUrl": "https://myapp.com/onboarding",
  "tokenPrices": [
    { "token": "USDC", "price": 8 },
    { "token": "SOL", "price": 0.04 }
  ]
}
```

**Explanation:**

- Link stops accepting new subscribers after December 31, 2025
- Existing subscriptions continue normally (not affected by link expiration)
- Great for limited-time promotional pricing

---

### 5. Short-Term Subscription

**Use Case:** 3-month course, seasonal access, or trial period with auto-renewal.

```json
POST /api/links/
{
  "name": "Q1 Bootcamp",
  "description": "3-month intensive web3 development course",
  "isRecurring": true,
  "durationMonths": 3,
  "periodSeconds": 2592000,
  "tokenPrices": [
    { "token": "USDC", "price": 99 }
  ]
}
```

**Explanation:**

- User approves 3 months of payments upfront (99 × 3 = 297 USDC total delegate approval)
- Charged 99 USDC every 30 days
- After 3 payments, subscription automatically ends

---

### 6. Weekly Subscription

**Use Case:** Newsletter, weekly reports, or frequent deliverables.

```json
POST /api/links/
{
  "name": "Weekly Alpha Newsletter",
  "description": "Premium crypto insights delivered every Monday",
  "isRecurring": true,
  "durationMonths": 6,
  "periodSeconds": 604800,
  "tokenPrices": [
    { "token": "USDC", "price": 5 },
    { "token": "USDT", "price": 5 }
  ]
}
```

**Explanation:**

- `periodSeconds: 604800` → 7 days (weekly billing)
- 6 months = approximately 26 payments
- User approves delegate for ~130 USDC (26 × 5)

---

## Common Period Values

| Frequency   | Seconds  | Description              |
| ----------- | -------- | ------------------------ |
| Weekly      | 604800   | Every 7 days             |
| Bi-weekly   | 1209600  | Every 14 days            |
| Monthly     | 2592000  | Every 30 days (standard) |
| Quarterly   | 7776000  | Every 90 days            |
| Semi-annual | 15552000 | Every 180 days           |
| Annual      | 31536000 | Every 365 days           |

---

## Summary

**Payment Link** is simply the frontend terminology for what is actually a **Plan record with associated PlanToken records** in the database. The "link" itself is just the generated URL (`/payment/{planId}`) that points to this plan configuration.

Think of it as:

- 📋 **Plan** = The payment template
- 💰 **PlanTokens** = The accepted currencies
- 🔗 **Payment Link** = The shareable URL to that template
