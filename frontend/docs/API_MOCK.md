# PattPay Dashboard - Mock API Documentation

**Document:** Mock API (MSW) Endpoints and Data
**Last Update:** 2025-10-18

---

## 🌐 Overview

The dashboard uses **Mock Service Worker (MSW)** to simulate a REST API during development. This allows frontend development to proceed independently of backend implementation, with realistic API responses and behaviors.

---

## 🏗️ MSW Setup

### Installation

```bash
pnpm add msw --save-dev
```

### Browser Setup

**File:** `mocks/browser.ts`

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### Initialization in App

**File:** `app/layout.tsx`

```typescript
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const { worker } = require('@/mocks/browser')
      worker.start({
        onUnhandledRequest: 'bypass' // Don't warn about unhandled requests
      })
    }
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## 📋 API Endpoints

### Dashboard Statistics

**Endpoint:** `GET /api/stats`

**Purpose:** Fetch dashboard summary statistics

**Response:**
```typescript
{
  totalTransactions: number
  totalVolume: number // SOL
  totalVolumeUSD: number
  activeLinks: number
  newLinksThisWeek: number
  conversionRate: number // percentage
  trend: {
    transactions: number // % change
    volume: number // % change
    links: number // % change
    conversion: number // % change
  }
}
```

**Example Response:**
```json
{
  "totalTransactions": 1247,
  "totalVolume": 5234.5,
  "totalVolumeUSD": 525400,
  "activeLinks": 12,
  "newLinksThisWeek": 3,
  "conversionRate": 23.5,
  "trend": {
    "transactions": 12.5,
    "volume": -3.2,
    "links": 25.0,
    "conversion": 5.3
  }
}
```

---

### Activity Data

**Endpoint:** `GET /api/activity?period=30d`

**Purpose:** Fetch activity chart data

**Query Parameters:**
- `period`: Time period (`7d`, `30d`, `90d`)

**Response:**
```typescript
Array<{
  date: string // YYYY-MM-DD
  volume: number // SOL
  count: number // transaction count
}>
```

**Example Response:**
```json
[
  {
    "date": "2025-10-01",
    "volume": 125.5,
    "count": 45
  },
  {
    "date": "2025-10-02",
    "volume": 98.2,
    "count": 32
  }
  // ... 30 days total
]
```

---

### Transactions List

**Endpoint:** `GET /api/transactions`

**Purpose:** Fetch paginated transaction list

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (`success`, `pending`, `failed`)
- `search`: Search by hash or wallet address

**Response:**
```typescript
{
  data: Transaction[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}
```

**Transaction Interface:**
```typescript
interface Transaction {
  id: string
  hash: string
  amount: number // SOL
  amountUSD: number
  status: 'success' | 'pending' | 'failed'
  from: string // wallet address
  to: string // wallet address
  linkId?: string
  linkName?: string
  block: number
  confirmations: number
  fee: number
  createdAt: string // ISO 8601
  confirmedAt?: string // ISO 8601
}
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "tx_1",
      "hash": "5Kn7zXq8PwMjL3yR9vB2nTcS4uD6fG1hW0eA7mX8pY9q",
      "amount": 10.5,
      "amountUSD": 1050,
      "status": "success",
      "from": "AbCd1234...XyZ9",
      "to": "EfGh5678...WvU1",
      "linkId": "link_1",
      "linkName": "Pro Subscription",
      "block": 123456789,
      "confirmations": 32,
      "fee": 0.000005,
      "createdAt": "2025-10-18T14:32:00Z",
      "confirmedAt": "2025-10-18T14:32:02Z"
    }
  ],
  "meta": {
    "total": 1247,
    "page": 1,
    "perPage": 10,
    "totalPages": 125
  }
}
```

---

### Transaction Details

**Endpoint:** `GET /api/transactions/:id`

**Purpose:** Fetch single transaction details

**Response:**
```typescript
Transaction
```

**Example Response:**
```json
{
  "id": "tx_1",
  "hash": "5Kn7zXq8PwMjL3yR9vB2nTcS4uD6fG1hW0eA7mX8pY9q",
  "amount": 10.5,
  "amountUSD": 1050,
  "status": "success",
  "from": "AbCd1234567890EfGhIjKlMnOpQrStUvWxYz",
  "to": "EfGh5678901234WvUxIjKlMnOpQrStAbCd",
  "linkId": "link_1",
  "linkName": "Pro Subscription",
  "block": 123456789,
  "confirmations": 32,
  "fee": 0.000005,
  "createdAt": "2025-10-18T14:32:00Z",
  "confirmedAt": "2025-10-18T14:32:02Z"
}
```

---

### Payment Links List

**Endpoint:** `GET /api/links`

**Purpose:** Fetch all payment links

**Query Parameters:**
- `status`: Filter by status (`active`, `paused`, `expired`)
- `search`: Search by link name

**Response:**
```typescript
Array<PaymentLink>
```

**PaymentLink Interface:**
```typescript
interface PaymentLink {
  id: string
  name: string
  description: string
  amount: number // SOL
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'active' | 'paused' | 'expired'
  url: string
  views: number
  conversions: number
  conversionRate: number // percentage
  expiresAt?: string // ISO 8601
  maxUses?: number
  currentUses: number
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
```

**Example Response:**
```json
[
  {
    "id": "link_1",
    "name": "Pro Subscription",
    "description": "Monthly subscription for pro features",
    "amount": 10,
    "recurrence": "monthly",
    "status": "active",
    "url": "https://pay.pattpay.com/link/abc123",
    "views": 145,
    "conversions": 34,
    "conversionRate": 23.4,
    "expiresAt": null,
    "maxUses": null,
    "currentUses": 34,
    "createdAt": "2025-09-01T10:00:00Z",
    "updatedAt": "2025-10-18T14:00:00Z"
  }
]
```

---

### Create Payment Link

**Endpoint:** `POST /api/links`

**Purpose:** Create a new payment link

**Request Body:**
```typescript
{
  name: string // 3-50 characters
  description?: string // max 200 characters
  amount: number // > 0
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  expiresAt?: string // ISO 8601
  maxUses?: number
  redirectUrl?: string // URL after payment
}
```

**Response:**
```typescript
PaymentLink
```

**Example Request:**
```json
{
  "name": "Pro Subscription",
  "description": "Monthly subscription for pro features",
  "amount": 10,
  "recurrence": "monthly",
  "expiresAt": null,
  "maxUses": null,
  "redirectUrl": "https://myapp.com/success"
}
```

**Example Response:**
```json
{
  "id": "link_2",
  "name": "Pro Subscription",
  "description": "Monthly subscription for pro features",
  "amount": 10,
  "recurrence": "monthly",
  "status": "active",
  "url": "https://pay.pattpay.com/link/xyz789",
  "views": 0,
  "conversions": 0,
  "conversionRate": 0,
  "expiresAt": null,
  "maxUses": null,
  "currentUses": 0,
  "createdAt": "2025-10-18T15:00:00Z",
  "updatedAt": "2025-10-18T15:00:00Z"
}
```

---

### Update Payment Link

**Endpoint:** `PATCH /api/links/:id`

**Purpose:** Update an existing payment link

**Request Body:**
```typescript
{
  name?: string
  description?: string
  status?: 'active' | 'paused'
  expiresAt?: string | null
  maxUses?: number | null
}
```

**Response:**
```typescript
PaymentLink
```

---

### Delete Payment Link

**Endpoint:** `DELETE /api/links/:id`

**Purpose:** Delete a payment link

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Payment link deleted successfully"
}
```

---

## 🗂️ Mock Data Fixtures

### File Structure

**File:** `mocks/data.ts`

```typescript
// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@pattpay.com',
    wallet: 'AbCd1234567890EfGhIjKlMnOpQrStUvWxYz',
    avatar: '/avatars/default.png',
    createdAt: '2025-01-15T10:00:00Z'
  }
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    hash: '5Kn7zXq8PwMjL3yR9vB2nTcS4uD6fG1hW0eA7mX8pY9q',
    amount: 10.5,
    amountUSD: 1050,
    status: 'success',
    from: 'AbCd1234567890EfGhIjKlMnOpQrStUvWxYz',
    to: 'EfGh5678901234WvUxIjKlMnOpQrStAbCd',
    linkId: 'link_1',
    linkName: 'Pro Subscription',
    block: 123456789,
    confirmations: 32,
    fee: 0.000005,
    createdAt: '2025-10-18T14:32:00Z',
    confirmedAt: '2025-10-18T14:32:02Z'
  },
  // ... more transactions
]

// Mock Payment Links
export const mockLinks: PaymentLink[] = [
  {
    id: 'link_1',
    name: 'Pro Subscription',
    description: 'Monthly subscription for pro features',
    amount: 10,
    recurrence: 'monthly',
    status: 'active',
    url: 'https://pay.pattpay.com/link/abc123',
    views: 145,
    conversions: 34,
    conversionRate: 23.4,
    expiresAt: null,
    maxUses: null,
    currentUses: 34,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-10-18T14:00:00Z'
  },
  // ... more links
]

// Mock Dashboard Stats
export const mockStats = {
  totalTransactions: 1247,
  totalVolume: 5234.5,
  totalVolumeUSD: 525400,
  activeLinks: 12,
  newLinksThisWeek: 3,
  conversionRate: 23.5,
  trend: {
    transactions: 12.5,
    volume: -3.2,
    links: 25.0,
    conversion: 5.3
  }
}

// Mock Activity Data (last 30 days)
export const mockActivity = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  volume: Math.random() * 200 + 50,
  count: Math.floor(Math.random() * 50 + 10)
}))
```

---

## 🔧 Request Handlers

### File Structure

**File:** `mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'
import {
  mockTransactions,
  mockLinks,
  mockStats,
  mockActivity
} from './data'

export const handlers = [
  // GET /api/stats
  http.get('/api/stats', () => {
    return HttpResponse.json(mockStats)
  }),

  // GET /api/activity
  http.get('/api/activity', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d'

    // Filter activity data based on period
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const filteredActivity = mockActivity.slice(-days)

    return HttpResponse.json(filteredActivity)
  }),

  // GET /api/transactions
  http.get('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    // Filter transactions
    let filtered = [...mockTransactions]

    if (status) {
      filtered = filtered.filter(tx => tx.status === status)
    }

    if (search) {
      filtered = filtered.filter(
        tx =>
          tx.hash.toLowerCase().includes(search.toLowerCase()) ||
          tx.from.toLowerCase().includes(search.toLowerCase()) ||
          tx.to.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end)

    return HttpResponse.json({
      data: paginated,
      meta: {
        total: filtered.length,
        page,
        perPage: limit,
        totalPages: Math.ceil(filtered.length / limit)
      }
    })
  }),

  // GET /api/transactions/:id
  http.get('/api/transactions/:id', ({ params }) => {
    const transaction = mockTransactions.find(tx => tx.id === params.id)

    if (!transaction) {
      return HttpResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(transaction)
  }),

  // GET /api/links
  http.get('/api/links', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filtered = [...mockLinks]

    if (status) {
      filtered = filtered.filter(link => link.status === status)
    }

    if (search) {
      filtered = filtered.filter(link =>
        link.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json(filtered)
  }),

  // POST /api/links
  http.post('/api/links', async ({ request }) => {
    const newLink = await request.json() as Partial<PaymentLink>

    const createdLink: PaymentLink = {
      id: `link_${Date.now()}`,
      name: newLink.name!,
      description: newLink.description || '',
      amount: newLink.amount!,
      recurrence: newLink.recurrence!,
      status: 'active',
      url: `https://pay.pattpay.com/link/${Math.random().toString(36).substring(7)}`,
      views: 0,
      conversions: 0,
      conversionRate: 0,
      expiresAt: newLink.expiresAt || null,
      maxUses: newLink.maxUses || null,
      currentUses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to mock data (in-memory only)
    mockLinks.push(createdLink)

    return HttpResponse.json(createdLink, { status: 201 })
  }),

  // PATCH /api/links/:id
  http.patch('/api/links/:id', async ({ params, request }) => {
    const updates = await request.json()
    const linkIndex = mockLinks.findIndex(link => link.id === params.id)

    if (linkIndex === -1) {
      return HttpResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Update link
    mockLinks[linkIndex] = {
      ...mockLinks[linkIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json(mockLinks[linkIndex])
  }),

  // DELETE /api/links/:id
  http.delete('/api/links/:id', ({ params }) => {
    const linkIndex = mockLinks.findIndex(link => link.id === params.id)

    if (linkIndex === -1) {
      return HttpResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Remove from array
    mockLinks.splice(linkIndex, 1)

    return HttpResponse.json(
      { success: true, message: 'Link deleted successfully' },
      { status: 200 }
    )
  })
]
```

---

## 🧪 Testing API Responses

### Using Browser DevTools

1. Open browser DevTools
2. Go to Network tab
3. Filter by "XHR" or "Fetch"
4. Look for requests to `/api/*`
5. Check MSW is intercepting (look for "from service worker" label)

### Using Console

```javascript
// Test fetch
fetch('/api/stats')
  .then(res => res.json())
  .then(console.log)

// Test with parameters
fetch('/api/transactions?page=1&limit=10&status=success')
  .then(res => res.json())
  .then(console.log)
```

---

## ⚙️ Configuration

### Enable/Disable MSW

In `app/layout.tsx`:

```typescript
// Enable only in development
if (process.env.NODE_ENV === 'development') {
  // MSW enabled
}

// Or use environment variable
if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
  // MSW enabled
}
```

### Add Delay to Responses

Simulate network latency:

```typescript
import { delay } from 'msw'

http.get('/api/stats', async () => {
  await delay(500) // 500ms delay
  return HttpResponse.json(mockStats)
})
```

---

## 🔄 Migration to Real API

When backend is ready:

1. **Remove MSW initialization** from `app/layout.tsx`
2. **Update API client** to use real endpoints
3. **Add authentication headers** to requests
4. **Handle real error responses**
5. **Update data types** if backend differs

---

## ✅ MSW Setup Checklist

- [ ] Install MSW package
- [ ] Create `mocks/browser.ts`
- [ ] Create `mocks/handlers.ts`
- [ ] Create `mocks/data.ts`
- [ ] Initialize MSW in root layout
- [ ] Test all endpoints return data
- [ ] Verify network tab shows MSW interception
- [ ] Add error scenarios (404, 500)
- [ ] Document all endpoints
- [ ] Create realistic mock data

---

**End of documentation**. You now have complete API specifications for the dashboard MVP.
