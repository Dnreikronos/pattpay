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

## Summary

**Payment Link** is simply the frontend terminology for what is actually a **Plan record with associated PlanToken records** in the database. The "link" itself is just the generated URL (`/payment/{planId}`) that points to this plan configuration.

Think of it as:

- 📋 **Plan** = The payment template
- 💰 **PlanTokens** = The accepted currencies
- 🔗 **Payment Link** = The shareable URL to that template
