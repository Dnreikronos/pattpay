# Transaction Details (`/dashboard/transactions/:id`)

**Page:** Transaction Details
**Route:** `/dashboard/transactions/:id`
**Priority:** 🟠 Medium
**Status:** 🟡 Pending

---

## Overview

The Transaction Details page displays comprehensive information about a single transaction, including on-chain data, related payment link, event timeline, and actions.

---

## Features

### 1. Main Information Section

**Displayed Data:**
- **Transaction Hash**: Full hash with copy button
- **Status**: Large visual badge with icon
- **Amount**: Primary display in SOL with USD equivalent below
- **Date & Time**: Exact timestamp (e.g., "Oct 18, 2025 at 14:32:15")
- **Block Number**: With link to Solana Explorer
- **Confirmations**: Number of confirmations (e.g., "32 confirmations")

**Status Visual:**
- Success: Green badge with checkmark icon
- Pending: Yellow badge with spinner icon (animated)
- Failed: Red badge with X icon

---

### 2. On-Chain Data Section

**Information Grid:**

| Field | Value | Action |
|-------|-------|--------|
| **Hash** | Full transaction hash | Copy button |
| **From** | Source wallet address (full) | Copy button |
| **To** | Destination wallet address (full) | Copy button |
| **Block** | Block number | Link to explorer |
| **Confirmations** | Confirmation count | - |
| **Fee** | Transaction fee in SOL | - |
| **Signature** | Transaction signature | Copy button |

**Visual Design:**
- Grid layout (2 columns on desktop, 1 on mobile)
- Label in muted text, value in foreground
- Copy buttons with visual feedback
- Monospace font for addresses and hashes

---

### 3. Related Payment Link (if applicable)

**Displayed If:**
- Transaction was made through a payment link

**Information:**
- Link name with icon
- Link recurrence type
- "View Link Details" button → navigate to link page

**Empty State:**
- If not from link: "Direct Transfer" badge
- Description: "This transaction was not made through a payment link"

---

### 4. Event Timeline

**Timeline Stages:**

1. **Created**
   - Icon: Empty circle (○)
   - Timestamp: Transaction creation time
   - Description: "Transaction initiated"

2. **Processing**
   - Icon: Empty circle (○) if not reached, filled if passed
   - Timestamp: When transaction started processing
   - Description: "Validating on Solana network"

3. **Confirmed/Failed**
   - Icon: Filled circle (●) for success, X for failed
   - Timestamp: Final confirmation time
   - Description: "Transaction confirmed" or "Transaction failed"

**Visual Design:**
- Vertical timeline with connecting lines
- Icons aligned left
- Timestamps and descriptions aligned right
- Active/completed stages highlighted in brand color
- Failed stage in error color

---

### 5. Actions Section

**Available Actions:**

#### View on Solana Explorer
- Button that opens transaction in Solana Explorer (Solscan or Solana Beach)
- Opens in new tab
- External link icon

#### Share Transaction
- Button that copies shareable link to clipboard
- Format: `https://app.pattpay.com/tx/{hash}`
- Success feedback: "Link copied!"

#### Report Issue (Future)
- Button to report a problem with the transaction
- Opens modal with form
- Sends to support team

---

## Layout (ASCII)

```
┌───────────────────────────────────────────────────┐
│ ← Back to Transactions                            │
├───────────────────────────────────────────────────┤
│                                                    │
│  Transaction #ABC123                               │
│  [✓ Success]                                       │
│                                                    │
│  5.25 SOL                                          │
│  ~$525.00 USD                                      │
│  Oct 18, 2025 at 14:32:15                         │
│                                                    │
├───────────────────────────────────────────────────┤
│  On-Chain Data                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ Hash:           5Kn7z...pY9q [Copy]         │  │
│  │ From:           AbCd1...XyZ9 [Copy]         │  │
│  │ To:             EfGh5...WvU1 [Copy]         │  │
│  │ Block:          #123456789   [View]         │  │
│  │ Confirmations:  32                          │  │
│  │ Fee:            0.000005 SOL                │  │
│  └─────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────┤
│  Related Link                                      │
│  🔗 Pro Subscription (Monthly)                    │
│  [View Link Details →]                            │
├───────────────────────────────────────────────────┤
│  Timeline                                          │
│  ○───────────────────────────────────────────     │
│  │ Created                      14:31:45          │
│  ○───────────────────────────────────────────     │
│  │ Processing                   14:32:00          │
│  ●───────────────────────────────────────────     │
│  │ Confirmed                    14:32:02          │
├───────────────────────────────────────────────────┤
│  [View on Explorer] [Share Transaction]           │
└───────────────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `TransactionDetails` - Information grid
- `TransactionTimeline` - Vertical timeline
- `CopyButton` - Copy to clipboard
- `StatusBadge` - Status indicator
- `LoadingSkeleton` - Loading state
- `EmptyState` - Transaction not found

### From Shadcn/UI
- `card` - Section containers
- `button` - Action buttons
- `badge` - Status badge

---

## Data Requirements

### From `/api/transactions/:id` endpoint:

```typescript
interface Transaction {
  id: string
  hash: string
  amount: number // SOL
  amountUSD: number
  status: 'success' | 'pending' | 'failed'
  from: string // wallet address (full)
  to: string // wallet address (full)
  linkId?: string
  linkName?: string
  linkRecurrence?: string
  block: number
  confirmations: number
  fee: number
  signature: string
  createdAt: string // ISO 8601
  processingAt?: string // ISO 8601
  confirmedAt?: string // ISO 8601
  failedAt?: string // ISO 8601
  errorMessage?: string // if failed
}
```

---

## States

### Loading State
- Show skeleton for all sections
- Maintain layout structure
- Disable action buttons
- Loading indicator on back button

### Success State
- All data displayed
- Action buttons enabled
- Timeline showing progression
- Related link displayed (if applicable)

### Error State (Transaction Not Found)
- 404 error page
- Message: "Transaction not found"
- Description: "This transaction doesn't exist or you don't have permission to view it"
- CTA: "Back to Transactions" button

### Error State (API Failure)
- Error message: "Failed to load transaction details"
- Retry button
- Back to transactions button

---

## Interactions

### Back Navigation
- **Back Button**: Navigate to `/dashboard/transactions`
- **Keyboard**: Esc key goes back
- Preserve previous page state (filters, page number)

### Copy Buttons
- **Click**: Copy text to clipboard
- **Visual Feedback**:
  - Button text changes to "Copied!"
  - Checkmark icon appears
  - Reset after 2 seconds
- **Error Handling**: Show error toast if copy fails

### View on Explorer
- **Click**: Open Solana Explorer in new tab
- **URL**: `https://solscan.io/tx/{hash}` (configurable)
- **Icon**: External link indicator

### Share Transaction
- **Click**: Copy shareable URL to clipboard
- **URL Format**: `https://app.pattpay.com/tx/{hash}`
- **Feedback**: "Link copied to clipboard!"

### View Link Details
- **Click**: Navigate to payment link page
- **Route**: `/dashboard/links/:linkId`
- **Disabled**: If no related link

---

## Responsive Behavior

### Desktop (> 1024px)
- Two-column layout for on-chain data
- Timeline horizontal alongside information
- All actions in row

### Tablet (768px - 1024px)
- Single column layout for on-chain data
- Timeline below information
- Actions in row

### Mobile (< 768px)
- All sections stack vertically
- On-chain data single column
- Timeline simplified (less spacing)
- Actions stack or overflow to menu
- Hash/addresses show truncated with expand option

**Mobile Truncation:**
```
Hash: 5Kn7z...pY9q [Copy] [Expand]
```

---

## Animations

### On Page Load
1. Header fades in (200ms)
2. Main info slides up (300ms)
3. On-chain data fades in (400ms)
4. Timeline animates drawing (500ms)
5. Actions fade in (600ms)

### Timeline Animation
- Line draws from top to bottom
- Circles appear sequentially
- Active stage pulses

### Copy Feedback
- Button background color change
- Checkmark icon slides in
- Text transitions

---

## Accessibility

- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] All buttons have descriptive labels
- [ ] Copy buttons announce success to screen readers
- [ ] Timeline has proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] External links announce "opens in new window"

---

## Performance Considerations

- [ ] Fetch transaction data on mount
- [ ] Memoize timeline calculations
- [ ] Lazy load explorer preview (future)
- [ ] Cache transaction details
- [ ] Prefetch related link data

---

## Security Considerations

- [ ] Validate transaction ID from URL params
- [ ] Check user permissions (own transactions only)
- [ ] Sanitize all displayed data
- [ ] Don't expose sensitive wallet info beyond address
- [ ] Rate limit API requests

---

## Testing Scenarios

### Happy Path
1. User clicks transaction from list → Details page loads
2. User sees all information → Data displayed correctly
3. User clicks copy hash → Hash copied to clipboard
4. User clicks "View on Explorer" → Opens in new tab
5. User clicks back → Returns to transaction list

### Edge Cases
1. User navigates to invalid ID → 404 page shown
2. User navigates to someone else's transaction → Permission denied
3. API fails to load → Error message with retry
4. Transaction is pending → Timeline shows current stage
5. Transaction failed → Error message and reason shown

### Responsiveness
1. Resize from desktop to mobile → Layout adapts
2. Long wallet addresses on mobile → Truncated correctly
3. Touch interactions on mobile → Copy buttons work

---

## Future Enhancements (Post-MVP)

- [ ] Real-time status updates (WebSocket)
- [ ] Transaction receipt download (PDF)
- [ ] Related transactions graph
- [ ] Gas fee breakdown
- [ ] Memo/note field display
- [ ] Transaction tags/categories
- [ ] Dispute/refund flow
- [ ] Export single transaction data

---

**Related Pages:**
- [Dashboard Home](./01-DASHBOARD_HOME.md)
- [Transactions List](./02-TRANSACTIONS.md)
- [Payment Links](./04-PAYMENT_LINKS.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
