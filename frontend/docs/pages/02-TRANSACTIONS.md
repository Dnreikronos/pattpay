# Transactions (`/dashboard/transactions`)

**Page:** Transaction List
**Route:** `/dashboard/transactions`
**Priority:** 🔴 High
**Status:** 🟡 Pending

---

## Overview

The Transactions page displays a comprehensive, filterable, and sortable list of all user transactions. It provides full transaction management capabilities including search, filtering, pagination, and export functionality.

---

## Features

### 1. Complete Transaction Table

**Columns:**
- **ID**: Short transaction hash (first 8 characters)
- **Date & Time**: Relative time (e.g., "2 hours ago") with tooltip showing exact timestamp
- **Amount**: SOL amount with USD equivalent in parentheses
- **Status**: Visual badge (Success/Pending/Failed)
- **Source Link**: Payment link name (if applicable) or "Direct Transfer"
- **Wallet**: Truncated wallet address (first 4 + last 4 chars)

**Features:**
- Sortable columns (click header to sort)
- Clickable rows (navigate to details)
- Hover effects
- Loading skeleton during fetch
- Responsive design (cards on mobile)

---

### 2. Filters

#### Status Filter
- All (default)
- Success
- Pending
- Failed

#### Date Range Filter
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Custom range (date picker)

#### Amount Filter
- Min value (SOL)
- Max value (SOL)
- Reset filter button

---

### 3. Search Bar

**Functionality:**
- Search by transaction hash
- Search by wallet address (from/to)
- Debounced input (300ms delay)
- Clear button when active
- Real-time filtering

**Placeholder:** "Search by transaction hash or wallet..."

---

### 4. Export Functionality

**Export Options:**
- **CSV**: Download as CSV file
- **JSON**: Download as JSON file

**Filename Format:** `pattpay-transactions-YYYY-MM-DD.{csv|json}`

**Exported Fields:**
- Transaction ID
- Hash
- Date
- Amount (SOL)
- Amount (USD)
- Status
- From Wallet
- To Wallet
- Link Name
- Block Number
- Fee

---

## Layout (ASCII)

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Transactions" [Export CSV] [Export JSON]      │
├─────────────────────────────────────────────────────────┤
│ [Search: _____________] [Status: All ▼] [Date: 30d ▼]  │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐  │
│ │ ID     │ Date      │ Amount  │ Status  │ Source   │  │
│ ├───────────────────────────────────────────────────┤  │
│ │ ABC123 │ 2h ago    │ 5.2 SOL │ Success │ Pro Sub  │  │
│ │ DEF456 │ Yesterday │ 10 SOL  │ Pending │ Direct   │  │
│ │ GHI789 │ 2 days    │ 3 SOL   │ Success │ Basic    │  │
│ │ ...                                                │  │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│           < 1 [2] 3 ... 10 >  | 10 per page ▼          │
└─────────────────────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `TransactionTable` - Main table with sorting
- `TransactionRow` - Individual row
- `FilterBar` - Filter controls
- `Pagination` - Page navigation
- `StatusBadge` - Status indicator
- `EmptyState` - No transactions state
- `LoadingSkeleton` - Loading placeholder

### From Shadcn/UI
- `table` - Base table structure
- `select` - Filter dropdowns
- `input` - Search input
- `button` - Action buttons

---

## Data Requirements

### From `/api/transactions` endpoint:

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

---

## States

### Loading State
- Show skeleton table rows (10 rows)
- Maintain table structure
- Disable filters and search
- Show loading indicator on export buttons

### Empty State
**No Transactions:**
- Show empty illustration
- Message: "No transactions found"
- Description: "Transactions will appear here once you receive payments through your links"
- CTA: "Create Your First Link" button

**No Results from Filters:**
- Message: "No transactions match your filters"
- Description: "Try adjusting your search or filter criteria"
- CTA: "Clear Filters" button

### Error State
- Show error message
- Retry button
- Fallback to cached data (if available)
- Error: "Failed to load transactions. Please try again."

---

## Interactions

### Table Interactions

**Column Headers:**
- Click to sort ascending
- Click again to sort descending
- Visual indicator (↑/↓ arrow) showing sort direction
- Active column highlighted

**Table Rows:**
- Hover: Background color change (`hover:bg-brand/5`)
- Click: Navigate to transaction details (`/dashboard/transactions/:id`)
- Cursor changes to pointer on hover

### Filter Interactions

**Status Filter:**
- Dropdown menu
- Single selection
- Active filter highlighted
- Badge count next to each option (e.g., "Success (234)")

**Date Range Filter:**
- Dropdown for presets
- "Custom" opens date range picker
- Selected range displayed in filter button

**Amount Filter:**
- Min/Max input fields (number type)
- Apply button
- Clear button
- Validation: min must be < max

### Search Interactions

**Search Bar:**
- Focus: Border color changes to brand
- Type: Debounced search (300ms)
- Clear icon appears when text present
- Enter key triggers immediate search

### Export Interactions

**Export Buttons:**
- Click CSV: Downloads current filtered results as CSV
- Click JSON: Downloads current filtered results as JSON
- Loading state during export generation
- Success feedback (toast notification)

---

## Pagination

**Features:**
- Page numbers (show 5 at a time)
- Previous/Next buttons
- First/Last page buttons
- Items per page selector (10, 25, 50, 100)
- Total count display ("Showing 1-10 of 1,247")

**Behavior:**
- URL updates with page parameter (`?page=2`)
- Scroll to top on page change
- Maintain filters across pages
- Disable previous on page 1
- Disable next on last page

---

## Responsive Behavior

### Desktop (> 1024px)
- Full table with all columns
- Filters in horizontal row
- Pagination at bottom
- 10 rows visible

### Tablet (768px - 1024px)
- Table with reduced columns (hide "Source Link")
- Filters stack vertically
- Pagination compact
- 10 rows visible

### Mobile (< 768px)
- Card-style list (no table)
- Each transaction as a card
- Swipe actions (future)
- Filters in collapsible drawer
- Pagination simple (< 1 2 3 >)
- 5 cards visible

**Mobile Card Structure:**
```
┌──────────────────────────┐
│ ✓ 5.2 SOL (~$520 USD)   │
│ 2 hours ago              │
│                          │
│ ABC123...XYZ             │
│ From: wallet1...         │
│ Link: Pro Subscription   │
│ → View Details           │
└──────────────────────────┘
```

---

## Animations

### On Page Load
1. Table fades in (300ms)
2. Rows appear with stagger (50ms delay each)

### On Filter Change
1. Table fades out (150ms)
2. New data fades in (150ms)
3. Smooth height transition

### On Sort
1. Rows reorder with animation
2. Sort arrow rotates
3. 200ms transition

---

## Accessibility

- [ ] Table has proper ARIA labels
- [ ] Sortable headers have `aria-sort` attribute
- [ ] Keyboard navigation (Tab to navigate, Enter to sort)
- [ ] Focus indicators visible
- [ ] Screen reader announces filter changes
- [ ] Export buttons have descriptive labels
- [ ] Status badges have text alternative

---

## Performance Considerations

- [ ] Virtualized scrolling for large lists (future)
- [ ] Debounced search input (300ms)
- [ ] Memoize table rows
- [ ] Lazy load pages
- [ ] Cache API responses (5 minutes)
- [ ] Prefetch next page on scroll
- [ ] Optimize export for large datasets

---

## Testing Scenarios

### Happy Path
1. User navigates to transactions page → Table loads with data
2. User filters by "Success" → Table shows only successful transactions
3. User searches for hash → Results filtered in real-time
4. User exports to CSV → File downloads successfully
5. User clicks row → Navigates to details page

### Edge Cases
1. User has 0 transactions → Empty state shows
2. User filters with no results → "No results" message shows
3. User searches invalid hash → No results, clear filters button
4. API is slow → Loading skeleton displays
5. API fails → Error message with retry
6. User has 10,000+ transactions → Pagination works correctly

### Responsiveness
1. Resize from desktop to mobile → Layout adapts to cards
2. Filters on mobile → Opens in drawer
3. Export on mobile → Works correctly

---

## Future Enhancements (Post-MVP)

- [ ] Bulk actions (select multiple, export selected)
- [ ] Advanced filters (by link, by amount range)
- [ ] Saved filter presets
- [ ] Real-time updates (WebSocket)
- [ ] Transaction categories/tags
- [ ] Charts showing transaction trends
- [ ] Comparison mode (this month vs last month)

---

**Related Pages:**
- [Dashboard Home](./01-DASHBOARD_HOME.md)
- [Transaction Details](./03-TRANSACTION_DETAILS.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
