# Payment Links (`/dashboard/links`)

**Page:** Payment Links List
**Route:** `/dashboard/links`
**Priority:** 🔴 High
**Status:** 🟡 Pending

---

## Overview

The Payment Links page displays a grid of all user-created payment links with quick actions, filters, and search capabilities. Users can manage their links, view statistics, and create new ones.

---

## Features

### 1. Links Grid/List

**Card Display:**
Each link is displayed as a card containing:
- Link name (title)
- Description (truncated to 2 lines)
- Amount and recurrence
- Status badge (Active/Paused/Expired)
- Quick statistics (views, conversions, conversion rate)
- Actions dropdown menu

**Grid Layout:**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column (stack)

---

### 2. Link Card Components

**Card Header:**
- Link name (font-display, text-lg)
- Status badge (top-right corner)

**Card Body:**
- Description (font-mono, text-sm, max 2 lines with ellipsis)
- Amount display (large, primary: SOL, secondary: USD)
- Recurrence type badge

**Card Stats:**
- Views count with icon
- Conversions count with icon
- Conversion rate percentage with trend indicator

**Card Footer:**
- Actions dropdown button (⋮ menu icon)
- Created date (small, muted text)

---

### 3. Actions per Link

**Dropdown Menu Actions:**

#### Copy URL
- Copies payment link URL to clipboard
- Visual feedback: "Link copied!"
- Icon: 📋 copy icon

#### Edit
- Navigates to edit page (`/dashboard/links/:id/edit`)
- Icon: ✏️ pencil icon

#### Pause/Activate
- Toggles link status between active and paused
- Optimistic UI update
- Confirmation toast
- Icon: ⏸️ pause or ▶️ play

#### View QR Code
- Opens modal with QR code
- QR code can be downloaded
- Icon: QR code icon

#### Delete
- Opens confirmation dialog
- Requires confirmation
- Permanent action warning
- Icon: 🗑️ trash icon

---

### 4. Filters

**Status Filter:**
- All (default)
- Active
- Paused
- Expired

**Sort Options:**
- Most Recent (default)
- Oldest First
- Most Views
- Most Conversions
- Highest Amount
- Lowest Amount

**Visual:**
- Dropdown selectors
- Active filter highlighted
- Badge count next to each status option

---

### 5. Search

**Search Bar:**
- Placeholder: "Search links by name..."
- Real-time search (debounced 300ms)
- Clear button when active
- Icon: 🔍 search icon

**Search Behavior:**
- Searches link name
- Searches link description
- Case-insensitive
- Shows result count

---

### 6. Create New Link Button

**Location:** Top-right corner of page header

**Features:**
- Primary action button (pixel art style)
- Text: "+ Create New Link"
- Icon: Plus icon
- Navigate to: `/dashboard/links/new`

---

## Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│ My Links                            [+ Create New Link]     │
├─────────────────────────────────────────────────────────────┤
│ [Search: _________] [Status: All ▼] [Sort: Most Recent ▼]  │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│ │ Pro Sub   [●]  │ │ Basic Plan [○] │ │ Annual    [●]  │  │
│ │ Monthly sub    │ │ Weekly payment │ │ Yearly access  │  │
│ │                │ │                │ │                │  │
│ │ 10 SOL         │ │ 5 SOL          │ │ 100 SOL        │  │
│ │ Monthly        │ │ Weekly         │ │ Yearly         │  │
│ │                │ │                │ │                │  │
│ │ 👁 145 views   │ │ 👁 23 views    │ │ 👁 8 views     │  │
│ │ ✓ 34 conv.     │ │ ✓ 5 conv.      │ │ ✓ 2 conv.      │  │
│ │ 📈 23.4%       │ │ 📈 21.7%       │ │ 📈 25.0%       │  │
│ │                │ │                │ │                │  │
│ │ [⋮ Actions]    │ │ [⋮ Actions]    │ │ [⋮ Actions]    │  │
│ └────────────────┘ └────────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `LinkCard` - Individual link card
- `LinkActions` - Actions dropdown menu
- `LinkStats` - Statistics display
- `StatusBadge` - Status indicator
- `ConfirmDialog` - Delete confirmation
- `EmptyState` - No links state
- `LoadingSkeleton` - Loading cards

### From Shadcn/UI
- `card` - Base card structure
- `dropdown-menu` - Actions menu
- `dialog` - QR code and confirmation modals
- `select` - Filter dropdowns
- `input` - Search input
- `badge` - Status and recurrence badges

---

## Data Requirements

### From `/api/links` endpoint:

```typescript
Array<PaymentLink>

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

---

## States

### Loading State
- Show skeleton cards (6 cards)
- Maintain grid layout
- Disable filters and search
- Disable create button

### Empty State (No Links)
- Show pixel art illustration
- Message: "No payment links yet"
- Description: "Create your first payment link to start accepting recurring payments on Solana"
- CTA: "Create Your First Link" button (large, prominent)

### Empty State (No Results)
- Message: "No links match your search"
- Description: "Try adjusting your search or filters"
- CTA: "Clear Filters" button

### Error State
- Show error message
- Retry button
- Fallback to cached data (if available)
- Error: "Failed to load payment links. Please try again."

---

## Interactions

### Card Interactions

**Hover:**
- Border color changes to brand
- Slight lift effect (`-translate-y-1`)
- Shadow increases

**Click:**
- Card itself is not clickable (prevent accidental navigation)
- Only actions dropdown is interactive

### Actions Dropdown

**Copy URL:**
- Click → Copy to clipboard
- Feedback: Toast notification "Link copied!"
- Button text changes to "Copied!" for 2s

**Edit:**
- Click → Navigate to edit page
- Preserves current filters in history state

**Pause/Activate:**
- Click → Toggle status
- Optimistic UI update (immediate)
- Show loading state in card
- Revert on error
- Feedback: Toast notification

**View QR Code:**
- Click → Open modal with QR code
- QR code generated from link URL
- Download button in modal
- Close button/escape key closes

**Delete:**
- Click → Open confirmation dialog
- Dialog warns about permanent deletion
- Shows link name in warning
- Confirm button is danger color
- Cancel button
- On confirm: Remove card with animation
- Feedback: Toast notification "Link deleted"

### Filters

**Status Filter:**
- Dropdown with radio selection
- Shows count next to each option
- Active filter highlighted
- URL updates with filter parameter

**Sort:**
- Dropdown with radio selection
- Immediate re-sort on selection
- Smooth animation of reordering

### Search

**Input:**
- Debounced search (300ms)
- Clear icon appears when text present
- Enter key triggers immediate search
- Shows result count below search bar

### Create Button

**Click:**
- Navigate to `/dashboard/links/new`
- Hover: Shadow animation
- Active: Pressed effect

---

## Responsive Behavior

### Desktop (> 1024px)
- 3-column grid
- All card information visible
- Filters in horizontal row
- Full search bar width

### Tablet (768px - 1024px)
- 2-column grid
- All card information visible
- Filters in horizontal row
- Full search bar width

### Mobile (< 768px)
- 1-column stack
- Compact card design
- Filters in drawer (collapsible)
- Search bar full width
- Sticky create button (bottom-right FAB)

**Mobile Card Compact:**
```
┌─────────────────────┐
│ Pro Sub        [●]  │
│ 10 SOL/month        │
│ 👁 145  ✓ 34  📈 23%│
│ [⋮]                 │
└─────────────────────┘
```

---

## Modals

### QR Code Modal

**Header:**
- Title: "QR Code for {Link Name}"
- Close button

**Body:**
- Large QR code (300x300px)
- Link URL displayed below
- Copy URL button

**Footer:**
- Download QR Code button (PNG format)
- Close button

**Design:**
- Centered modal
- Backdrop blur
- Pixel art border styling

### Delete Confirmation Dialog

**Header:**
- Title: "Delete Payment Link?"
- Warning icon

**Body:**
- Message: "Are you sure you want to delete '{Link Name}'?"
- Warning: "This action cannot be undone. All link statistics will be lost."
- Additional info: Shows transaction count if > 0

**Footer:**
- Cancel button (secondary)
- Delete button (danger, primary)

---

## Animations

### On Page Load
1. Header fades in (200ms)
2. Filters slide in from top (300ms)
3. Cards appear with stagger (50ms delay each)

### On Filter/Sort Change
1. Cards fade out (150ms)
2. New cards fade in with stagger (150ms + stagger)
3. Smooth height transition

### Card Hover
- Lift animation (200ms)
- Shadow expansion (200ms)

### Delete Animation
1. Card slides out to right (300ms)
2. Gap closes smoothly (200ms)
3. Remaining cards reflow

---

## Accessibility

- [ ] All cards have proper ARIA labels
- [ ] Actions dropdown keyboard navigable
- [ ] Focus indicators visible
- [ ] Screen reader announces status changes
- [ ] Modals trap focus
- [ ] Escape key closes modals
- [ ] Delete confirmation requires explicit action
- [ ] QR code has alt text

---

## Performance Considerations

- [ ] Virtualized scrolling for large lists (future)
- [ ] Debounced search (300ms)
- [ ] Memoize card components
- [ ] Lazy load QR code generation
- [ ] Optimize card animations
- [ ] Cache link data (5 minutes)
- [ ] Prefetch edit page on hover

---

## Testing Scenarios

### Happy Path
1. User navigates to links page → Grid loads with links
2. User filters by "Active" → Shows only active links
3. User searches for link name → Results filter
4. User clicks "Copy URL" → URL copied to clipboard
5. User clicks "Edit" → Navigates to edit page
6. User clicks "Delete" → Confirmation shown → Link deleted

### Edge Cases
1. User has 0 links → Empty state with CTA
2. User filters with no results → "No results" message
3. User deletes last link → Empty state appears
4. API fails → Error message with retry
5. User toggles pause quickly → Optimistic update handles correctly

### Responsiveness
1. Resize from desktop to mobile → Grid adapts to columns
2. Open actions on mobile → Dropdown works correctly
3. QR code modal on mobile → Fits screen correctly

---

## Future Enhancements (Post-MVP)

- [ ] Bulk actions (select multiple links)
- [ ] Duplicate link functionality
- [ ] Link templates/presets
- [ ] Link scheduling (activate at specific time)
- [ ] Custom link slugs
- [ ] Link categories/folders
- [ ] Share link directly to social media
- [ ] Email link to customer
- [ ] Link performance analytics
- [ ] A/B testing different links

---

**Related Pages:**
- [Dashboard Home](./01-DASHBOARD_HOME.md)
- [Create Link](./05-CREATE_LINK.md)
- [Edit Link](./06-EDIT_LINK.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
