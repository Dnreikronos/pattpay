# Edit Payment Link (`/dashboard/links/:id/edit`)

**Page:** Edit Payment Link
**Route:** `/dashboard/links/:id/edit`
**Priority:** 🟠 Medium
**Status:** 🟡 Pending

---

## Overview

The Edit Link page allows users to modify existing payment links with proper validation and warnings for critical changes. It includes change history tracking and safeguards against breaking existing transactions.

---

## Features

### 1. Pre-populated Form

**Form Structure:**
Similar to create form, but:
- All fields pre-filled with current values
- Some fields locked if link has transactions
- Shows warnings for critical changes
- Displays last modified timestamp

**Locked Fields (if link has transactions):**
- Amount (cannot change if link has been used)
- Recurrence (cannot change fundamental payment structure)

**Editable Fields:**
- Name
- Description
- Status (active/paused)
- Expiration date
- Max uses
- Redirect URL

---

### 2. Editable Fields

#### Link Name
- **Current value shown**
- **Validation:** Same as create (3-50 chars)
- **Warning:** Changing name doesn't affect existing links already shared

#### Description
- **Current value shown**
- **Validation:** Max 200 characters
- **No restrictions**

#### Status
- **Type:** Toggle or select
- **Options:**
  - Active (link accepts payments)
  - Paused (link temporarily disabled)
- **Warning:** Pausing stops all new payments
- **Visual:** Toggle switch with clear labels

#### Expiration Date
- **Current value shown or "No expiration"**
- **Can set, change, or remove**
- **Validation:** Must be future date
- **Warning:** Setting past current date immediately expires link

#### Max Uses
- **Current value shown or "Unlimited"**
- **Can set, change, or remove**
- **Shows current uses vs max (e.g., "34 / 100 uses")
- **Warning:** Cannot set lower than current uses

#### Redirect URL
- **Current value shown or empty**
- **Can set, change, or remove**
- **Validation:** Must be valid HTTPS URL

---

### 3. Locked Fields (Read-only)

#### Amount
- **Displayed:** Current amount in SOL + USD
- **Locked if:** Link has > 0 transactions
- **Icon:** 🔒 lock icon
- **Explanation:** "Cannot change amount on active payment link with existing transactions"

#### Recurrence
- **Displayed:** Current recurrence type
- **Locked if:** Link has > 0 transactions
- **Icon:** 🔒 lock icon
- **Explanation:** "Cannot change recurrence on active payment link"

**Visual for Locked Fields:**
- Grayed out appearance
- Lock icon
- Tooltip explanation
- Cannot focus or edit

---

### 4. Change History

**Display:**
- Collapsible section at bottom of form
- Shows last 10 modifications
- Each entry shows:
  - Timestamp (relative: "2 hours ago")
  - What changed (e.g., "Status changed from Active to Paused")
  - Who changed it (user name, future: if multi-user)

**Example Entries:**
```
○ 2 hours ago
  Status changed from Active to Paused
  by John Doe

○ Yesterday
  Description updated
  by John Doe

○ 3 days ago
  Expiration date set to Dec 31, 2025
  by John Doe
```

---

### 5. Link Statistics (Read-only)

**Displayed at top:**
- Total Views
- Total Conversions
- Conversion Rate
- First Created Date
- Last Transaction Date
- Current Uses (if max uses set)

**Visual:**
- Cards or info grid
- Icons for each metric
- Pixel art styling

---

## Layout (ASCII)

```
┌───────────────────────────────────────────────────────┐
│ ← Back to Links                                       │
├───────────────────────────────────────────────────────┤
│ Edit Link: "Pro Subscription"                         │
│                                                        │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 👁 145 views  ✓ 34 conversions  📈 23.4%       │  │
│ │ Created: Sep 1, 2025 | Last used: 2 hours ago   │  │
│ └─────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────┤
│                                                        │
│ Link Name                                              │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Pro Subscription___________________________      │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ Description                                            │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Monthly subscription for pro features...         │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ Amount (SOL) 🔒                                        │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 10.00                                    [locked]│  │
│ └─────────────────────────────────────────────────┘  │
│ ⚠️ Cannot change amount on active link with txns     │
│                                                        │
│ Recurrence 🔒                                          │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Monthly                                  [locked]│  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ Status                                                 │
│ ┌─────────────────────────────────────────────────┐  │
│ │ [●Active] [○Paused]                              │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ ⚠️ Changes will affect future payments only           │
│                                                        │
│ ┌─Change History───────────────────────────────┐     │
│ │ ○ 2 hours ago - Status changed to Paused      │     │
│ │ ○ Yesterday - Description updated             │     │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ [Delete Link] [Cancel] [Save Changes]                 │
└───────────────────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `EditLinkForm` - Main form component
- `FormField` - Form inputs
- `ChangeHistory` - Modification log
- `ConfirmDialog` - Delete confirmation, critical change confirmation
- `StatusBadge` - Link status
- `LoadingSkeleton` - Loading state

### From Shadcn/UI
- `form` - Form wrapper
- `input` - Text inputs
- `textarea` - Description field
- `select` - Dropdowns
- `switch` - Status toggle
- `dialog` - Confirmation modals
- `button` - Action buttons

---

## Data Requirements

### From `/api/links/:id` endpoint:

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
  conversionRate: number
  expiresAt?: string
  maxUses?: number
  currentUses: number
  createdAt: string
  updatedAt: string
  lastTransactionAt?: string
  changeHistory: Array<{
    timestamp: string
    field: string
    oldValue: any
    newValue: any
    user: string
  }>
}
```

### Update Request (PATCH /api/links/:id):

```typescript
{
  name?: string
  description?: string
  status?: 'active' | 'paused'
  expiresAt?: string | null
  maxUses?: number | null
  redirectUrl?: string | null
}
```

---

## States

### Loading State
- Fetch link data on mount
- Show skeleton form
- Disable all inputs
- Show loading indicator

### Success State
- Form pre-populated with data
- All editable fields enabled
- Save button enabled (when form dirty)
- Cancel button enabled

### Error State (Link Not Found)
- 404 error page
- Message: "Payment link not found"
- CTA: "Back to Links" button

### Error State (API Failure)
- Error message above form
- Retry button
- Keep form data intact

### Dirty State
- Form has unsaved changes
- Cancel requires confirmation
- Page leave requires confirmation
- Save button highlighted

### Submitting State
- Disable all inputs
- Show loading on save button
- Prevent navigation
- Cannot modify fields

---

## Interactions

### Edit Field Interactions

**Name/Description:**
- Type to edit
- Validation on blur
- Character counter for description

**Status Toggle:**
- Click to toggle active/paused
- Confirmation modal if pausing active link with recent transactions
- Immediate visual feedback

**Date Picker:**
- Click to open calendar
- Clear button to remove expiration
- Validation on select

**Max Uses:**
- Number input
- Validation: Cannot be less than current uses
- Clear button for unlimited

### Save Changes

**Click "Save Changes":**
1. Validate all fields
2. Show confirmation if critical changes
3. Submit PATCH request
4. Show loading state
5. On success:
   - Toast notification "Changes saved!"
   - Update change history
   - Reset dirty state
6. On error:
   - Show error message
   - Keep form state
   - Allow retry

### Cancel

**Click "Cancel":**
- If form dirty: Show confirmation dialog
- If pristine: Navigate back immediately
- Back to: `/dashboard/links`

### Delete Link

**Click "Delete Link":**
1. Open confirmation dialog
2. Dialog shows:
   - Warning message
   - Link name
   - Transaction count (if > 0)
   - Input field: "Type DELETE to confirm"
3. User must type "DELETE" to enable confirm button
4. On confirm:
   - DELETE request to API
   - Navigate to links page
   - Toast: "Link deleted successfully"

---

## Validation & Warnings

### Critical Change Warnings

**Pausing Active Link:**
```
⚠️ Are you sure?
Pausing this link will stop all new payments.
Existing subscribers will not be charged.
[Cancel] [Pause Link]
```

**Setting Expiration in Past:**
```
⚠️ Warning
Setting an expiration date in the past will immediately deactivate this link.
[Cancel] [Set Expiration]
```

**Reducing Max Uses:**
```
⚠️ Cannot Reduce
This link has been used 34 times.
Max uses cannot be set lower than current uses.
[OK]
```

### Validation Rules

**Name:**
- Min 3 chars
- Max 50 chars
- Cannot be empty

**Description:**
- Max 200 chars

**Expiration:**
- Must be future date (if setting new)
- Can be removed (set to null)

**Max Uses:**
- Must be >= current uses
- Must be positive integer
- Can be removed (set to null)

**Redirect URL:**
- Must be valid URL
- Must be HTTPS
- Can be removed (set to null)

---

## Responsive Behavior

### Desktop (> 1024px)
- Two-column layout: Form left, Stats right (sticky)
- Wide form fields
- Change history expanded by default

### Tablet (768px - 1024px)
- Single column
- Stats at top
- Change history collapsed by default

### Mobile (< 768px)
- Single column stack
- Stats in compact cards
- Change history in drawer
- Bottom sticky action buttons

---

## Animations

### Form Transitions
- Fields fade in on load (300ms)
- Status toggle smooth transition
- Save button pulse on form dirty

### Feedback Animations
- Success checkmark on save
- Error shake on validation fail
- Loading spinner on submit

---

## Accessibility

- [ ] All fields have proper labels
- [ ] Locked fields have explanation
- [ ] ARIA labels on all inputs
- [ ] Keyboard navigation works
- [ ] Focus management
- [ ] Screen reader announces changes
- [ ] Confirmation dialogs trap focus
- [ ] Status changes announced

---

## Testing Scenarios

### Happy Path
1. User navigates to edit page → Form loads with data
2. User changes description → Validation passes
3. User changes status → Toggle works
4. User clicks save → Changes saved successfully
5. User sees success toast → Change history updated

### Validation Errors
1. User clears name → Error shown
2. User sets max uses < current → Error shown
3. User enters invalid URL → Error shown

### Edge Cases
1. User tries to edit non-existent link → 404 shown
2. User tries to change locked field → Cannot interact
3. User pauses link with transactions → Confirmation required
4. User tries to delete with transactions → Must type DELETE
5. API fails on save → Error shown, data preserved

---

## Security Considerations

- [ ] Validate user owns this link
- [ ] Check permissions before allowing edits
- [ ] Sanitize all input data
- [ ] Prevent CSRF attacks
- [ ] Rate limit update requests
- [ ] Audit log all changes

---

## Future Enhancements (Post-MVP)

- [ ] Multi-user collaboration (show who's editing)
- [ ] Revision history with rollback
- [ ] Scheduled changes (activate on date)
- [ ] A/B testing variants
- [ ] Bulk edit multiple links
- [ ] Clone/duplicate link
- [ ] Archive link (soft delete)
- [ ] Export link configuration

---

**Related Pages:**
- [Payment Links](./04-PAYMENT_LINKS.md)
- [Create Link](./05-CREATE_LINK.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
