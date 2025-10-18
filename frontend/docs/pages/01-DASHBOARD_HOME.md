# Dashboard Home (`/dashboard`)

**Page:** Dashboard Home
**Route:** `/dashboard`
**Priority:** 🔴 High
**Status:** 🟡 Pending

---

## Overview

The Dashboard Home is the main landing page after login. It provides a quick overview of the user's account activity, key metrics, and quick actions to navigate to other sections.

---

## Features

### 1. Stats Cards (Top Section)

Display 4 key metrics in card format:

#### Total Transactions
- **Value**: Count of all transactions
- **Trend**: Percentage change vs previous period (↑ +12.5% or ↓ -3.2%)
- **Icon**: Transaction icon (pixel art)

#### Total Volume
- **Primary Value**: Amount in SOL (e.g., "5,234 SOL")
- **Secondary Value**: USD equivalent (e.g., "~$525,400")
- **Trend**: Percentage change vs previous period

#### Active Links
- **Value**: Count of active payment links
- **Secondary**: New links this week (e.g., "+3 this week")
- **Icon**: Link icon (pixel art)

#### Conversion Rate
- **Value**: Percentage (e.g., "23.5%")
- **Description**: "Views to payments"
- **Trend**: Percentage change

### 2. Activity Chart

**Type**: Line chart (Recharts)
**Data**: Last 30 days of transactions

**Features**:
- Toggle between "Volume (SOL)" and "Transaction Count"
- Hover tooltip showing exact values and date
- Pixel art style grid lines
- Brand color for line (#4F46E5)
- Smooth animations on load

**Responsive**:
- Desktop: Full width, 300px height
- Mobile: Full width, 200px height

### 3. Latest Transactions

**Type**: Mini table (5 most recent)

**Columns**:
- Date (relative: "2 hours ago", "Yesterday")
- Amount (SOL + USD)
- Status badge (Success/Pending/Failed)
- Link name (if applicable)
- Arrow to view details

**Interactions**:
- Click row → Navigate to transaction details
- Hover → Highlight row

### 4. Quick Actions

**Layout**: Grid (2x2 on mobile, 4x1 on desktop)

**Actions**:
1. **Create Payment Link**
   - Icon: Plus + Link
   - Label: "Create Link"
   - Navigate to: `/dashboard/links/new`

2. **View All Transactions**
   - Icon: List
   - Label: "Transactions"
   - Navigate to: `/dashboard/transactions`

3. **View All Links**
   - Icon: Grid
   - Label: "My Links"
   - Navigate to: `/dashboard/links`

4. **Connect Wallet** (if not connected)
   - Icon: Wallet
   - Label: "Connect"
   - Action: Open wallet connection modal

---

## Layout (ASCII)

```
┌─────────────────────────────────────────┐
│ Header: "Dashboard" + User Avatar       │
├─────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ Card │ │ Card │ │ Card │ │ Card │    │
│ │Stats │ │Stats │ │Stats │ │Stats │    │
│ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────┤
│         Activity Chart                   │
│   ┌─────────────────────────────────┐   │
│   │  /\    /\                        │   │
│   │ /  \  /  \  /\                   │   │
│   │      \/    \/  \___              │   │
│   └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ Latest Transactions                      │
│ ┌─────────────────────────────────────┐ │
│ │ Date      Amount    Status    →     │ │
│ │ 2h ago    5.2 SOL   Success   →     │ │
│ │ Yesterday 10 SOL    Pending   →     │ │
│ │ 2 days    3 SOL     Success   →     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Quick Actions                            │
│ [Create Link] [Transactions] [My Links] │
└─────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `DashboardCard` - For stats cards
- `ActivityChart` - For line chart
- `RecentTransactions` - For mini table
- `QuickActions` - For action buttons

### From Shadcn/UI
- `card` - Base for stat cards
- `skeleton` - Loading states

---

## Data Requirements

### From `/api/stats` endpoint:
```typescript
{
  totalTransactions: number
  totalVolume: number // SOL
  totalVolumeUSD: number
  activeLinks: number
  newLinksThisWeek: number
  conversionRate: number
  trend: {
    transactions: number // % change
    volume: number // % change
    links: number // % change
    conversion: number // % change
  }
}
```

### From `/api/transactions?limit=5` endpoint:
```typescript
Transaction[] // Last 5 transactions
```

### From `/api/activity?period=30d` endpoint:
```typescript
{
  date: string // YYYY-MM-DD
  volume: number // SOL
  count: number
}[]
```

---

## States

### Loading State
- Show skeleton loaders for:
  - 4 stat cards
  - Chart area
  - Transaction rows
- Maintain layout structure

### Empty State
- If user has no transactions:
  - Show empty illustration
  - Message: "No transactions yet"
  - CTA: "Create your first payment link"

### Error State
- If API fails:
  - Show error message
  - Retry button
  - Fallback to cached data (if available)

---

## Interactions

### Stat Cards
- **Hover**: Slight lift (-2px translate)
- **Click**: Navigate to respective detail page
  - Transactions card → `/dashboard/transactions`
  - Volume card → `/dashboard/transactions?sort=volume`
  - Links card → `/dashboard/links`
  - Conversion card → `/dashboard/analytics` (future)

### Activity Chart
- **Hover on point**: Show tooltip with exact value
- **Toggle button**: Switch between Volume/Count
- **Click on data point**: Filter transactions for that day

### Transaction Rows
- **Hover**: Background change
- **Click row**: Navigate to transaction details
- **Click arrow**: Same as row click

### Quick Actions
- **Hover**: Pixel art shadow effect
- **Click**: Navigate to respective page

---

## Responsive Behavior

### Desktop (> 1024px)
- Stats cards: 4 columns grid
- Chart: Full width
- Transactions: Table with all columns
- Quick actions: Horizontal row

### Tablet (768px - 1024px)
- Stats cards: 2 columns grid
- Chart: Full width, slightly shorter
- Transactions: Table, some columns hidden
- Quick actions: 2x2 grid

### Mobile (< 768px)
- Stats cards: 1 column stack
- Chart: Full width, compact height
- Transactions: Card-style list
- Quick actions: 2x2 grid or stack

---

## Animations

### On Page Load
1. Stats cards fade in sequentially (100ms delay each)
2. Chart animates drawing from left to right (800ms)
3. Transactions fade in with stagger (50ms delay each)
4. Quick actions fade in last (600ms delay)

### On Data Update
- Smooth transition for values (300ms)
- Trend indicators animate direction
- Chart re-draws with smooth interpolation

---

## Accessibility

- [ ] All cards have proper ARIA labels
- [ ] Chart has text alternative for screen readers
- [ ] Keyboard navigation for all interactive elements
- [ ] Focus indicators visible
- [ ] Color not the only indicator (use icons + text)

---

## Performance Considerations

- [ ] Lazy load chart library (Recharts)
- [ ] Memoize expensive calculations (trends, percentages)
- [ ] Debounce chart toggle
- [ ] Cache API responses (5 minutes)
- [ ] Prefetch transaction details on row hover

---

## Testing Scenarios

### Happy Path
1. User logs in → Dashboard loads with all data
2. User sees stats, chart, and recent transactions
3. User clicks "Create Link" → Navigates to link creation

### Edge Cases
1. User has 0 transactions → Empty state shows
2. API is slow → Loading skeletons display
3. API fails → Error message with retry
4. User has 1000+ transactions → Only last 5 show, with "View All" link

### Responsiveness
1. Resize from desktop to mobile → Layout adapts
2. Rotate device → Chart adjusts dimensions

---

## Future Enhancements (Post-MVP)

- [ ] Customizable stat cards (user picks which 4 to show)
- [ ] More chart types (bar, pie)
- [ ] Longer time ranges (90 days, 1 year)
- [ ] Export dashboard as PDF/image
- [ ] Real-time updates (WebSocket)
- [ ] Comparison mode (this month vs last month)

---

**Related Pages:**
- [Transactions](./02-TRANSACTIONS.md)
- [Payment Links](./04-PAYMENT_LINKS.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
