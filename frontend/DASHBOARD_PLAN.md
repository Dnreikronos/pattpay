# PattPay Dashboard - Development Plan

**Version:** 1.0
**Date:** 2025-10-18
**Status:** 🟡 In Planning

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Page Specifications](#page-specifications)
4. [Shared Components](#shared-components)
5. [Mock Authentication System](#mock-authentication-system)
6. [Mock API (MSW)](#mock-api-msw)
7. [Dashboard Design System](#dashboard-design-system)
8. [Development Roadmap](#development-roadmap)
9. [File Structure](#file-structure)

---

## 🎯 Overview

The PattPay Dashboard is the main interface for managing transactions and on-chain payment links on Solana. The system allows users to monitor their transactions, create recurring payment links, and track real-time metrics.

### Main Objectives

- ✅ Display on-chain transactions clearly and organized
- ✅ Create and manage recurring payment links
- ✅ Monitor business statistics and metrics
- ✅ Provide smooth UX with pixel art visual identity
- ✅ Full responsiveness (mobile-first approach)

### Target Audience

- **Content Creators**: Manage subscriptions from their fans
- **Web3 SaaS**: Automate monthly/annual billing
- **DAOs and Projects**: Receive recurring contributions
- **Freelancers**: Create personalized payment links

---

## 🏗️ Technical Architecture

### Technology Stack

| Technology | Purpose | Status |
|------------|---------|--------|
| **Next.js 15 (App Router)** | Base framework | ✅ Installed |
| **TypeScript** | Type safety | ✅ Configured |
| **TailwindCSS v4** | Styling | ✅ Configured |
| **Framer Motion** | Animations | ✅ Installed |
| **Shadcn/UI** | Base components | ✅ Configured |
| **MSW (Mock Service Worker)** | Mock API | 🟡 To install |
| **React Hook Form** | Forms | 🟡 To install |
| **Zod** | Schema validation | 🟡 To install |
| **Recharts** | Charts and graphs | 🟡 To install |

### Architectural Decisions

1. **Authentication**: Mock via Context API (no real backend initially)
2. **Data**: Mock Service Worker (MSW) to simulate REST API
3. **Layout**: Responsive sidebar (collapse on mobile)
4. **State Management**: React Context + native hooks (no Redux/Zustand for now)
5. **Routes**: Next.js App Router with folder structure
6. **Components**: ⚠️ **ALWAYS check Shadcn/UI first** before creating from scratch - customize with pixel art styling
7. **Design**: 🎨 **ALWAYS be creative and maintain pixel art visual identity** - each component must reflect the "Pixel Finance City" aesthetic

---

## 📄 Page Specifications

### 1. Dashboard Home (`/dashboard`)

**Priority:** 🔴 High
**Status:** 🟡 Pending

#### Features

- **Stats Cards**:
  - Total transactions (count + trend)
  - Total volume moved (SOL + USD)
  - Active links (count + new this week)
  - Average conversion rate

- **Activity Chart**:
  - Line chart with transactions from the last 30 days
  - Toggle between volume (SOL) and transaction quantity

- **Latest Transactions**:
  - List of the 5 most recent transactions
  - Visual status (pending/success/failed)
  - Link to see full details

- **Quick Actions**:
  - "Create Payment Link" button
  - "View All Transactions" button
  - "Connect Wallet" button (if disconnected)

#### Layout

```
┌─────────────────────────────────────────┐
│ Header: "Dashboard" + User Avatar       │
├─────────────────────────────────────────┤
│ [Card Stats] [Card Stats] [Card Stats] │
├─────────────────────────────────────────┤
│         Activity Chart                   │
├─────────────────────────────────────────┤
│      Latest Transactions (table)         │
├─────────────────────────────────────────┤
│           Quick Actions                  │
└─────────────────────────────────────────┘
```

#### Components

- `DashboardCard` - Individual statistics card
- `ActivityChart` - Line chart with Recharts
- `RecentTransactions` - Mini transactions table
- `QuickActions` - Action buttons grid

---

### 2. Transactions (`/dashboard/transactions`)

**Priority:** 🔴 High
**Status:** 🟡 Pending

#### Features

- **Complete Table**:
  - Columns: ID, Date, Amount (SOL), Status, Source Link, Wallet
  - Pagination (10, 25, 50 items per page)
  - Column sorting (clickable)

- **Filters**:
  - Status: All, Success, Pending, Failed
  - Period: Last 7 days, 30 days, Custom range
  - Min/max value

- **Search Bar**:
  - Search by transaction hash or wallet

- **Export**:
  - Download CSV
  - Download JSON

#### Layout

```
┌─────────────────────────────────────────┐
│ Header: "Transactions" + Export Buttons │
├─────────────────────────────────────────┤
│ [Search] [Filter: Status] [Filter: Date]│
├─────────────────────────────────────────┤
│                                          │
│        Transaction Table                 │
│   (sortable, paginated, clickable)       │
│                                          │
├─────────────────────────────────────────┤
│      Pagination: < 1 2 3 ... 10 >       │
└─────────────────────────────────────────┘
```

#### Components

- `TransactionTable` - Main table
- `TransactionRow` - Clickable table row
- `FilterBar` - Filter bar
- `Pagination` - Pagination component

---

### 3. Transaction Details (`/dashboard/transactions/:id`)

**Priority:** 🟠 Medium
**Status:** 🟡 Pending

#### Features

- **Main Information**:
  - Transaction hash (copyable)
  - Status with visual icon
  - Value in SOL + USD conversion
  - Exact date and time

- **On-Chain Data**:
  - Source wallet
  - Destination wallet
  - Block number
  - Confirmations
  - Fee paid

- **Related Link**:
  - Payment link name
  - Link to see link details

- **Event Timeline**:
  - Created → Processing → Confirmed/Failed
  - Timestamps for each stage

- **Actions**:
  - View on Solana Explorer
  - Share transaction
  - Report issue

#### Layout

```
┌─────────────────────────────────────────┐
│ ← Back | Transaction #ABC123             │
├─────────────────────────────────────────┤
│ [Status Badge: Success ✓]               │
│                                          │
│ Amount: 5.25 SOL (~$525 USD)            │
│ Date: Oct 18 2025, 14:32                │
├─────────────────────────────────────────┤
│ On-Chain Data:                           │
│ Hash: 0x1234... [copy]                  │
│ From: wallet1... [copy]                 │
│ To: wallet2... [copy]                   │
│ Block: #12345678                         │
├─────────────────────────────────────────┤
│ Timeline:                                │
│ ○ Created (14:31)                       │
│ ○ Processing (14:32)                    │
│ ● Confirmed (14:32)                     │
├─────────────────────────────────────────┤
│ [View on Explorer] [Share]              │
└─────────────────────────────────────────┘
```

#### Components

- `TransactionHeader` - Header with status
- `TransactionDetails` - Information grid
- `TransactionTimeline` - Vertical timeline
- `CopyButton` - Button to copy values

---

### 4. Payment Links (`/dashboard/links`)

**Priority:** 🔴 High
**Status:** 🟡 Pending

#### Features

- **Grid/List of Links**:
  - Card per link with preview
  - Link name
  - Value and recurrence
  - Status (active/paused/expired)
  - Quick stats (views, conversions)

- **Actions per Link**:
  - Copy URL
  - Edit
  - Pause/Activate
  - Delete (with confirmation)
  - View QR Code

- **Filters**:
  - All, Active, Paused, Expired
  - Sort by: creation date, conversions, value

- **Search**:
  - Search by link name

#### Layout

```
┌─────────────────────────────────────────┐
│ "My Links" + [+ Create New Link]        │
├─────────────────────────────────────────┤
│ [Search] [Filter: Status] [Sort By]     │
├─────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Link 1   │ │ Link 2   │ │ Link 3   │ │
│ │ 10 SOL   │ │ 5 SOL    │ │ 25 SOL   │ │
│ │ Monthly  │ │ Weekly   │ │ Yearly   │ │
│ │ 12 views │ │ 5 views  │ │ 3 views  │ │
│ │ ●Active  │ │ ○Paused  │ │ ●Active  │ │
│ │ [Actions]│ │ [Actions]│ │ [Actions]│ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

#### Components

- `LinkCard` - Individual link card
- `LinkActions` - Actions dropdown
- `LinkStats` - Mini stats inside card
- `LinkStatusBadge` - Colored status badge

---

### 5. Create Link (`/dashboard/links/new`)

**Priority:** 🔴 High
**Status:** 🟡 Pending

#### Features

- **Multi-Step Form**:
  1. **Basic**: Name, description
  2. **Payment**: Amount (SOL), recurrence (once, daily, weekly, monthly, annual)
  3. **Advanced**: Expiration date, usage limit, redirect after payment
  4. **Review**: Preview before creating

- **Validations**:
  - Required name (3-50 chars)
  - Amount > 0
  - Valid recurrence

- **Live Preview**:
  - Shows how the link will look for the payer
  - Automatically generated URL

- **Actions**:
  - Save as draft
  - Create and activate
  - Cancel

#### Layout

```
┌─────────────────────────────────────────┐
│ Create New Payment Link                 │
├─────────────────────────────────────────┤
│ Steps: [1●] [2○] [3○] [4○]              │
├─────────────────────────────────────────┤
│                                          │
│ Step 1: Basic Information                │
│                                          │
│ Link Name: [_____________]               │
│ Description: [________________]          │
│                                          │
│           [Cancel] [Next →]              │
└─────────────────────────────────────────┘
```

#### Components

- `LinkFormWizard` - Wizard container
- `StepIndicator` - Steps indicator
- `FormStep` - Individual step component
- `LinkPreview` - Link preview

---

### 6. Edit Link (`/dashboard/links/:id/edit`)

**Priority:** 🟠 Medium
**Status:** 🟡 Pending

#### Features

- **Pre-populated Form**:
  - Same fields as "Create"
  - Values filled with current data

- **Change History**:
  - Log of when it was modified
  - Who modified (if multi-user)

- **Validations**:
  - Don't allow changing value if there are already transactions
  - Confirmation for critical changes

- **Actions**:
  - Save changes
  - Discard
  - Delete link (with confirmation)

#### Layout

```
┌─────────────────────────────────────────┐
│ ← Back | Edit Link: "Pro Subscription"  │
├─────────────────────────────────────────┤
│                                          │
│ Name: [Pro Subscription________]         │
│ Amount: [10 SOL] (not editable)         │
│ Recurrence: [Monthly ▼]                 │
│ Status: [●Active ▼]                     │
│                                          │
│ ⚠️ Changes affect future transactions   │
│                                          │
│ [Delete] [Cancel] [Save Changes]        │
└─────────────────────────────────────────┘
```

#### Components

- `EditLinkForm` - Edit form
- `ChangeHistory` - Changes list
- `ConfirmDialog` - Confirmation modal

---

## 🧩 Shared Components

### Layout Components

#### `DashboardLayout` (`app/dashboard/layout.tsx`)

```tsx
interface DashboardLayoutProps {
  children: React.ReactNode
}

// Features:
// - Sidebar navigation
// - Top header with user menu
// - Auth check (redirect if not logged in)
// - Responsive (sidebar collapse on mobile)
```

#### `Sidebar` (`components/dashboard/Sidebar.tsx`)

```tsx
// Features:
// - PattPay logo
// - Navigation links with icons
// - Active state
// - Collapse toggle (mobile)
// - User info at bottom
```

**Menu Items:**
- 🏠 Dashboard
- 💳 Transactions
- 🔗 Payment Links
- ⚙️ Settings (future)
- 🚪 Logout

#### `DashboardHeader` (`components/dashboard/Header.tsx`)

```tsx
// Features:
// - Page title
// - Breadcrumbs
// - User avatar + dropdown
// - Notifications (future)
```

### Data Display Components

#### `DashboardCard` (`components/dashboard/DashboardCard.tsx`)

```tsx
interface DashboardCardProps {
  title: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down' }
  icon?: React.ReactNode
  loading?: boolean
}

// Design: Pixel art borders, brand colors, hover effects
```

#### `TransactionTable` (`components/dashboard/TransactionTable.tsx`)

```tsx
interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  onSort?: (column: string) => void
  onRowClick?: (id: string) => void
}

// Features:
// - Sortable columns
// - Status badges
// - Clickable rows
// - Loading skeleton
```

#### `LinkCard` (`components/dashboard/LinkCard.tsx`)

```tsx
interface LinkCardProps {
  link: PaymentLink
  onEdit?: () => void
  onDelete?: () => void
  onToggle?: () => void
  onCopy?: () => void
}

// Design: Grid card with stats, actions dropdown
```

### Form Components

#### `FormField` (`components/dashboard/FormField.tsx`)

```tsx
interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  error?: string
  required?: boolean
}

// Design: Pixel art inputs with brand styling
```

#### `StepIndicator` (`components/dashboard/StepIndicator.tsx`)

```tsx
interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

// Visual: Connected dots, current step highlighted
```

### Utility Components

#### `StatusBadge` (`components/dashboard/StatusBadge.tsx`)

```tsx
interface StatusBadgeProps {
  status: 'success' | 'pending' | 'failed' | 'active' | 'paused'
  size?: 'sm' | 'md' | 'lg'
}

// Colors: success=#10b981, pending=#f59e0b, failed=#ef4444
```

#### `CopyButton` (`components/dashboard/CopyButton.tsx`)

```tsx
interface CopyButtonProps {
  text: string
  label?: string
}

// Feature: Click to copy, visual feedback
```

#### `EmptyState` (`components/dashboard/EmptyState.tsx`)

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

// Design: Pixel art illustration, CTA button
```

---

## 🔐 Mock Authentication System

### Context API Structure

**`contexts/AuthContext.tsx`**

```tsx
interface User {
  id: string
  name: string
  email: string
  wallet: string
  avatar?: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (wallet: string) => Promise<void>
  logout: () => void
  loading: boolean
}

// Mock implementation:
// - localStorage for persistence
// - Simulates 500ms delay on login
// - Fake user: { id: '1', name: 'John Doe', wallet: '0x123...' }
```

### Route Protection

**`app/dashboard/layout.tsx`**

```tsx
'use client'

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) redirect('/login')

  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
}
```

### Login Page (Future)

**`app/login/page.tsx`**

- Connect Solana wallet (Phantom, Solflare)
- Simulation for now, real integration later

---

## 🌐 Mock API (MSW)

### MSW Setup

**`mocks/browser.ts`**

```tsx
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

**`app/layout.tsx`** (enable MSW in dev)

```tsx
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    const { worker } = await import('@/mocks/browser')
    worker.start()
  }
}
```

### Mock Endpoints

**`mocks/handlers.ts`**

```tsx
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET /api/transactions
  http.get('/api/transactions', () => {
    return HttpResponse.json(mockTransactions)
  }),

  // GET /api/transactions/:id
  http.get('/api/transactions/:id', ({ params }) => {
    const transaction = mockTransactions.find(t => t.id === params.id)
    return HttpResponse.json(transaction)
  }),

  // GET /api/links
  http.get('/api/links', () => {
    return HttpResponse.json(mockLinks)
  }),

  // POST /api/links
  http.post('/api/links', async ({ request }) => {
    const newLink = await request.json()
    return HttpResponse.json({ ...newLink, id: generateId() }, { status: 201 })
  }),

  // PATCH /api/links/:id
  http.patch('/api/links/:id', async ({ params, request }) => {
    const updates = await request.json()
    return HttpResponse.json({ ...updates, id: params.id })
  }),

  // DELETE /api/links/:id
  http.delete('/api/links/:id', () => {
    return HttpResponse.json({ success: true }, { status: 204 })
  }),

  // GET /api/stats (dashboard)
  http.get('/api/stats', () => {
    return HttpResponse.json(mockStats)
  }),
]
```

### Mock Data Structure

**`mocks/data.ts`**

```tsx
export interface Transaction {
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
  createdAt: string
  confirmedAt?: string
}

export interface PaymentLink {
  id: string
  name: string
  description: string
  amount: number // SOL
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'active' | 'paused' | 'expired'
  url: string
  views: number
  conversions: number
  expiresAt?: string
  maxUses?: number
  currentUses: number
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalTransactions: number
  totalVolume: number // SOL
  totalVolumeUSD: number
  activeLinks: number
  conversionRate: number
  trend: {
    transactions: number // %
    volume: number // %
    links: number // %
  }
}

// Sample data
export const mockTransactions: Transaction[] = [...]
export const mockLinks: PaymentLink[] = [...]
export const mockStats: DashboardStats = {...}
```

---

## 🎨 Dashboard Design System

### Specific Color Palette

```css
/* Dashboard specific tokens */
--dashboard-sidebar-bg: var(--surface);
--dashboard-sidebar-border: var(--brand-300);
--dashboard-card-bg: var(--background);
--dashboard-card-shadow: 0 4px 0 0 rgba(79, 70, 229, 0.1);

/* Status colors */
--status-success: #10b981;
--status-pending: #f59e0b;
--status-failed: #ef4444;
--status-active: #3b82f6;
--status-paused: #6b7280;
```

### Typography Rules

- **Page Headers**: Press Start 2P, `text-3xl`, `text-foreground`
- **Card Titles**: Press Start 2P, `text-lg`, `text-brand`
- **Body/Tables**: DM Mono, `text-base`, `text-foreground`
- **Labels**: DM Mono, `text-sm`, `text-muted`

### Component Patterns

#### Cards

```tsx
<div className="bg-dashboard-card-bg border-4 border-border p-6 shadow-[4px_4px_0_0_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-transform">
  {/* content */}
</div>
```

#### Tables

```tsx
<table className="w-full border-4 border-brand">
  <thead className="bg-brand-300/20">
    <tr className="border-b-2 border-brand">
      <th className="px-4 py-3 text-left font-display text-xs">...</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-brand/5">
      <td className="px-4 py-3 font-mono text-sm">...</td>
    </tr>
  </tbody>
</table>
```

#### Buttons (Dashboard Variant)

```tsx
<button className="px-6 py-3 bg-brand text-surface font-display text-sm border-2 border-brand-600 shadow-[2px_2px_0_0_rgba(79,70,229,1)] hover:shadow-[4px_4px_0_0_rgba(79,70,229,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
  {label}
</button>
```

### Icons & Illustrations

- **Navigation**: Custom pixel art icons (16x16 or 24x24)
- **Empty States**: Pixel art illustrations aligned with "Pixel Finance City"
- **Status**: ●, ○, ✓, ✗ with semantic colors

---

## 🗓️ Development Roadmap

### Phase 0: Setup (Estimate: 1 day)

- [ ] Install dependencies (MSW, Recharts, React Hook Form, Zod)
- [ ] Configure MSW (handlers, mock data)
- [ ] Create mock AuthContext
- [ ] Structure dashboard folders

**Deliverable:** Functional base structure

---

### Phase 1: Dashboard Home (Estimate: 2-3 days)

**Sprint Goal:** Functional home page with statistics and latest transactions

#### Tasks

- [ ] Create `app/dashboard/layout.tsx` (Sidebar + Header)
- [ ] Create `components/dashboard/Sidebar.tsx`
- [ ] Create `components/dashboard/DashboardCard.tsx`
- [ ] Create `app/dashboard/page.tsx`
- [ ] Implement statistics cards
- [ ] Integrate activity chart (Recharts)
- [ ] Create `RecentTransactions` component
- [ ] Add quick actions
- [ ] Mobile responsiveness
- [ ] Loading states

**Deliverable:** Complete and functional dashboard home

---

### Phase 2: Transactions (Estimate: 2 days)

**Sprint Goal:** Complete transaction listing with filters and pagination

#### Tasks

- [ ] Create `app/dashboard/transactions/page.tsx`
- [ ] Create `components/dashboard/TransactionTable.tsx`
- [ ] Implement pagination
- [ ] Implement filters (status, date)
- [ ] Implement search bar
- [ ] Implement column sorting
- [ ] Add CSV/JSON export
- [ ] Empty state (no transactions)
- [ ] Loading skeletons

**Deliverable:** Transactions page with all features

---

### Phase 3: Transaction Details (Estimate: 1 day)

**Sprint Goal:** Individual details page with timeline

#### Tasks

- [ ] Create `app/dashboard/transactions/[id]/page.tsx`
- [ ] Create `components/dashboard/TransactionDetails.tsx`
- [ ] Create `components/dashboard/TransactionTimeline.tsx`
- [ ] Implement copy buttons
- [ ] Add link to Solana Explorer
- [ ] Responsiveness
- [ ] Loading state

**Deliverable:** Complete details page

---

### Phase 4: Payment Links (Estimate: 2 days)

**Sprint Goal:** Links grid with actions and filters

#### Tasks

- [ ] Create `app/dashboard/links/page.tsx`
- [ ] Create `components/dashboard/LinkCard.tsx`
- [ ] Create `components/dashboard/LinkActions.tsx` (dropdown)
- [ ] Implement filters (status)
- [ ] Implement search
- [ ] Add actions (copy, edit, delete, toggle)
- [ ] Delete confirmation modal
- [ ] Empty state (no links)
- [ ] Responsiveness (grid → stack)

**Deliverable:** Functional links page

---

### Phase 5: Create Link (Estimate: 2-3 days)

**Sprint Goal:** Form wizard to create payment links

#### Tasks

- [ ] Create `app/dashboard/links/new/page.tsx`
- [ ] Create `components/dashboard/LinkFormWizard.tsx`
- [ ] Implement Step 1: Basic information
- [ ] Implement Step 2: Payment configuration
- [ ] Implement Step 3: Advanced options
- [ ] Implement Step 4: Review & preview
- [ ] Validations with Zod
- [ ] React Hook Form integration
- [ ] Live link preview
- [ ] Save as draft
- [ ] Create and activate

**Deliverable:** Complete link creation flow

---

### Phase 6: Edit Link (Estimate: 1 day)

**Sprint Goal:** Editing existing links

#### Tasks

- [ ] Create `app/dashboard/links/[id]/edit/page.tsx`
- [ ] Pre-populate form with link data
- [ ] Validations (locked fields if has transactions)
- [ ] Change history
- [ ] Confirmation for critical changes
- [ ] Delete link option
- [ ] Save changes

**Deliverable:** Functional link editing

---

### Phase 7: Polish (Estimate: 1-2 days)

**Sprint Goal:** Refinements, accessibility, performance

#### Tasks

- [ ] Review responsiveness at all breakpoints
- [ ] Add visual feedback (toasts, confirmations)
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Dark mode (future)
- [ ] Basic integration tests
- [ ] Component documentation

**Deliverable:** Production-ready dashboard

---

## 📁 File Structure

```
frontend/
├── DASHBOARD_PLAN.md ← This file
│
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx ← Layout with Sidebar + Auth
│   │   ├── page.tsx ← Dashboard Home
│   │   │
│   │   ├── transactions/
│   │   │   ├── page.tsx ← Transaction list
│   │   │   └── [id]/
│   │   │       └── page.tsx ← Transaction details
│   │   │
│   │   └── links/
│   │       ├── page.tsx ← Links list
│   │       ├── new/
│   │       │   └── page.tsx ← Create link
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx ← Edit link
│   │
│   ├── login/ (future)
│   │   └── page.tsx
│   │
│   └── layout.tsx ← Root layout (with MSW init)
│
├── components/
│   └── dashboard/
│       ├── layout/
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   └── UserMenu.tsx
│       │
│       ├── cards/
│       │   ├── DashboardCard.tsx
│       │   ├── LinkCard.tsx
│       │   └── StatCard.tsx
│       │
│       ├── tables/
│       │   ├── TransactionTable.tsx
│       │   ├── TransactionRow.tsx
│       │   └── Pagination.tsx
│       │
│       ├── forms/
│       │   ├── LinkFormWizard.tsx
│       │   ├── FormField.tsx
│       │   ├── StepIndicator.tsx
│       │   └── LinkPreview.tsx
│       │
│       ├── charts/
│       │   ├── ActivityChart.tsx
│       │   └── StatsChart.tsx
│       │
│       └── shared/
│           ├── StatusBadge.tsx
│           ├── CopyButton.tsx
│           ├── EmptyState.tsx
│           ├── LoadingSkeleton.tsx
│           └── ConfirmDialog.tsx
│
├── contexts/
│   ├── AuthContext.tsx ← Mock auth
│   └── DashboardContext.tsx (future - global dashboard state)
│
├── lib/
│   ├── api.ts ← API client (fetch wrapper)
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useLinks.ts
│   │   └── useStats.ts
│   │
│   └── utils/
│       ├── format.ts (SOL, USD, dates)
│       ├── validation.ts (Zod schemas)
│       └── solana.ts (address formatting, explorer links)
│
├── mocks/
│   ├── browser.ts ← MSW setup (browser)
│   ├── handlers.ts ← Request handlers
│   └── data.ts ← Mock data fixtures
│
└── types/
    ├── transaction.ts
    ├── link.ts
    └── user.ts
```

---

## 📝 Code Conventions

### Shadcn/UI Components First

**⚠️ IMPORTANT RULE: Always check Shadcn/UI before creating components**

Before creating any component from scratch, **ALWAYS**:

1. **Check if it exists in Shadcn/UI**: Use `mcp__shadcn__search_items_in_registries` or check [ui.shadcn.com](https://ui.shadcn.com)
2. **Use as base**: If it exists, add via CLI and customize with pixel art styling
3. **Adapt to design system**: Apply brand colors, pixel art borders, and PattPay fonts
4. **Document modifications**: Comment what was changed from the original component

**Useful Shadcn/UI components for the Dashboard:**

- `table` - Base for TransactionTable
- `card` - Base for DashboardCard, LinkCard
- `button` - Base for buttons (we already have PixelButton, but can inspire)
- `dialog` - Base for ConfirmDialog, modals
- `dropdown-menu` - Base for LinkActions, UserMenu
- `form` + `input` - Base for FormField, LinkFormWizard
- `badge` - Base for StatusBadge
- `tabs` - Possible use in filters
- `select` - Filter dropdowns
- `skeleton` - Loading states
- `tooltip` - Contextual information
- `alert` - Action feedback

**Workflow example:**

```bash
# 1. Search for component in Shadcn
npx shadcn@latest add table

# 2. Customize for pixel art style
# components/ui/table.tsx
export const Table = ({ className, ...props }) => (
  <table
    className={cn(
      "w-full border-4 border-brand", // pixel art border
      className
    )}
    {...props}
  />
)

# 3. Use in dashboard component
import { Table, TableHeader, TableRow } from "@/components/ui/table"
```

---

### Creativity and Visual Identity

**🎨 IMPORTANT RULE: Be creative and maintain the "Pixel Finance City" design pattern**

Every component created must follow the established visual identity. Don't create generic or personality-less components.

#### Design Principles for the Dashboard

**1. Pixel Art Borders & Shadows**
```tsx
// ✅ CORRECT: Stylized pixel art shadow
<div className="shadow-[4px_4px_0_0_rgba(79,70,229,0.3)]">

// ❌ WRONG: Default/generic shadow
<div className="shadow-lg">
```

**2. Brand Colors**
```tsx
// ✅ CORRECT: Use design system color tokens
<div className="bg-brand text-surface border-brand-300">

// ❌ WRONG: Hardcoded or generic colors
<div className="bg-blue-500 text-white">
```

**3. Consistent Typography**
```tsx
// ✅ CORRECT: System fonts (Press Start 2P for headings, DM Mono for body)
<h2 className="font-display text-2xl">Dashboard</h2>
<p className="font-mono text-base">Description</p>

// ❌ WRONG: System default fonts
<h2 className="font-bold text-2xl">Dashboard</h2>
```

**4. Pixel Art Micro-interactions**
```tsx
// ✅ CORRECT: Hover with pixel-perfect movement
<button className="hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_rgba(79,70,229,1)] transition-all">

// ❌ WRONG: Generic hover
<button className="hover:opacity-80">
```

**5. Icons and Illustrations**
```tsx
// ✅ CORRECT: Use custom pixel art icons
<Image src="/icons/wallet-pixel.png" className="pixelated" style={{ imageRendering: 'pixelated' }} />

// ❌ WRONG: Generic library icons (Heroicons, Lucide without customization)
<LucideWallet />
```

#### Creativity Checklist

Before finalizing any component, ask yourself:

- [ ] Does this component have **personality** or is it generic?
- [ ] Does it reflect the **pixel art aesthetic** of PattPay?
- [ ] Are colors using **brand tokens** (brand, brand-300, accent)?
- [ ] Are borders **pixel art style** (4px, solid, no rounded)?
- [ ] Are animations **smooth but with pixel-perfect character**?
- [ ] Do hover/focus states have **interesting visual feedback**?
- [ ] Does the component fit the **"Pixel Finance City" narrative**?

#### Creativity Examples

**Stats Card - Creative ✅**
```tsx
<motion.div
  className="relative bg-surface border-4 border-brand p-6 shadow-[4px_4px_0_0_rgba(79,70,229,0.2)]
             hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(79,70,229,0.3)] transition-all"
  whileHover={{ scale: 1.02 }}
>
  {/* Corner pixel decorations */}
  <div className="absolute top-0 right-0 w-2 h-2 bg-brand" />
  <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent" />

  {/* Content with pixel art separator */}
  <h3 className="font-display text-lg text-brand mb-2">Total Volume</h3>
  <div className="h-[2px] w-12 bg-brand mb-3" /> {/* pixel separator */}
  <p className="font-mono text-3xl text-foreground">5,234 SOL</p>

  {/* Pixel style trend indicator */}
  <div className="flex items-center gap-2 mt-2">
    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-success" />
    <span className="font-mono text-sm text-success">+12.5%</span>
  </div>
</motion.div>
```

**vs Generic Card - Avoid ❌**
```tsx
<div className="bg-white rounded-lg shadow p-4">
  <h3 className="text-lg font-bold">Total Volume</h3>
  <p className="text-2xl">5,234 SOL</p>
  <span className="text-green-500">+12.5%</span>
</div>
```

#### Visual Inspiration

When creating components, get inspired by:
- **8-bit/16-bit games** (limited palettes, geometric shapes)
- **Isometric pixel cities** (perspective, depth)
- **Phantom Wallet UI** (clean, modern, but with personality)
- **Linear app** (minimalism, micro-interactions)
- **Pixel art dashboard examples** (Behance, Dribbble)

#### Anti-Patterns (Avoid)

❌ Components that look like "Bootstrap"
❌ Very soft shadows (blur-lg, blur-xl)
❌ Excessive rounded corners (rounded-full on everything)
❌ Complex multi-colored gradients
❌ Too fast or too slow animations (keep 200-300ms)
❌ Inconsistent typography (mixing too many fonts)

---

### Naming

- **Components**: PascalCase (`DashboardCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useTransactions.ts`)
- **Utilities**: camelCase (`formatSOL()`)
- **Types/Interfaces**: PascalCase (`Transaction`, `PaymentLink`)

### File Organization

```tsx
// Order:
1. Imports (external → internal → types)
2. Types/Interfaces
3. Constants
4. Component
5. Exports

// Example:
import { useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import type { Transaction } from '@/types/transaction'

interface Props {
  transactions: Transaction[]
}

const ITEMS_PER_PAGE = 10

export function TransactionList({ transactions }: Props) {
  // ...
}
```

### Comments

```tsx
// ✅ Good: Explain WHY, not WHAT
// Disable sorting when filtering to avoid confusion
const shouldEnableSort = !isFiltering

// ❌ Bad: Obvious comment
// Set loading to true
setLoading(true)
```

---

## 🎯 Success Metrics

### Performance

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90

### UX

- [ ] 100% mobile responsive
- [ ] Zero layout shifts (CLS = 0)
- [ ] Loading states on all async actions
- [ ] Visual feedback on all user actions

### Code Quality

- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Components < 200 lines (average)
- [ ] Reusability > 60% of components

---

## 🔮 Next Steps (Post-MVP)

### Future Features

1. **Real-time notifications** (WebSockets)
2. **Multi-currency support** (USDC, USDT)
3. **Advanced analytics** (funnel, cohorts)
4. **Webhooks** (notify external backend)
5. **Team collaboration** (multiple users)
6. **API Keys** (programmatic integration)
7. **Dark mode**
8. **Internationalization** (i18n)

### Integrations

- **Solana Wallet Adapter** (real wallet connection)
- **Real backend** (replace MSW)
- **Blockchain queries** (on-chain data fetching)
- **Payment processing** (smart contract calls)

---

## 📞 Support & Documentation

### For Developers

- **Storybook** (future): Visual component documentation
- **README per component**: Props and usage explanation
- **TypeScript**: Full IntelliSense

### For Users

- **Tooltips**: Inline explanations
- **Help center** (future): FAQs and tutorials
- **Onboarding**: Guided tour on first visit

---

## ✅ Completion Checklist

### Phase 0: Setup
- [ ] MSW configured and working
- [ ] AuthContext implemented
- [ ] Mock data created
- [ ] Folder structure defined

### Phase 1-6: Pages
- [ ] Dashboard Home ✅
- [ ] Transactions ✅
- [ ] Transaction Details ✅
- [ ] Payment Links ✅
- [ ] Create Link ✅
- [ ] Edit Link ✅

### Polish
- [ ] 100% responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Complete validations
- [ ] Basic accessibility

### Documentation
- [ ] README updated
- [ ] Components documented
- [ ] Mock API documented

---

**Last update:** 2025-10-18
**Next review:** After Phase 1 completion
