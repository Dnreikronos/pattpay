# Create Payment Link (`/dashboard/links/new`)

**Page:** Create New Payment Link
**Route:** `/dashboard/links/new`
**Priority:** 🔴 High
**Status:** 🟡 Pending

---

## Overview

The Create Link page is a multi-step wizard form that guides users through creating a new payment link. It includes validation, live preview, and the ability to save drafts.

---

## Features

### 1. Multi-Step Wizard

**4 Steps:**
1. Basic Information
2. Payment Configuration
3. Advanced Options (Optional)
4. Review & Preview

**Step Navigation:**
- Linear progression (can't skip ahead)
- Can go back to previous steps
- Progress indicator at top
- Keyboard navigation (Tab, Enter)

---

### 2. Step 1: Basic Information

**Fields:**

#### Link Name (Required)
- **Type:** Text input
- **Validation:**
  - Required
  - Min length: 3 characters
  - Max length: 50 characters
  - Unique name (check against existing links)
- **Placeholder:** "e.g., Pro Subscription"
- **Help Text:** "Choose a clear name for your payment link"

#### Description (Optional)
- **Type:** Textarea
- **Validation:**
  - Max length: 200 characters
  - No required validation
- **Placeholder:** "Brief description of what this payment is for..."
- **Character Counter:** Shows remaining characters

**Actions:**
- Cancel button → Confirm dialog if form has data
- Next button → Validates and moves to Step 2

---

### 3. Step 2: Payment Configuration

**Fields:**

#### Amount (Required)
- **Type:** Number input
- **Validation:**
  - Required
  - Must be > 0
  - Max: 1,000,000 SOL
  - Decimal places: up to 9 (Solana precision)
- **Display:**
  - Primary input in SOL
  - Live USD conversion displayed below (e.g., "~$1,050.00 USD")
  - Uses current SOL/USD exchange rate
- **Placeholder:** "0.00"
- **Help Text:** "Amount to charge per payment"

#### Recurrence (Required)
- **Type:** Select dropdown
- **Options:**
  - Once (single payment)
  - Daily
  - Weekly
  - Monthly (default)
  - Yearly
- **Visual:** Each option shows icon and description
- **Help Text:** "How often should payments repeat?"

**Live Preview:**
- Shows how the link will appear to payers
- Updates in real-time as fields change
- Displays amount and recurrence clearly

**Actions:**
- Back button → Returns to Step 1 (preserves data)
- Next button → Validates and moves to Step 3

---

### 4. Step 3: Advanced Options (Optional)

**All fields optional - can skip to Step 4**

#### Expiration Date
- **Type:** Date picker
- **Validation:**
  - Must be future date
  - No past dates allowed
- **Placeholder:** "No expiration"
- **Help Text:** "Link will become inactive after this date"
- **Clear Button:** Remove expiration

#### Max Uses
- **Type:** Number input
- **Validation:**
  - Must be > 0
  - Integer only
- **Placeholder:** "Unlimited"
- **Help Text:** "Maximum number of times this link can be used"
- **Example:** "Useful for limited offers or first 100 customers"

#### Redirect URL (After Payment)
- **Type:** URL input
- **Validation:**
  - Must be valid URL format
  - HTTPS required
- **Placeholder:** "https://yoursite.com/success"
- **Help Text:** "Where to send users after successful payment"

**Actions:**
- Back button → Returns to Step 2
- Skip button → Moves to Step 4 (leaves fields empty)
- Next button → Validates (if filled) and moves to Step 4

---

### 5. Step 4: Review & Preview

**Review Summary:**

Displays all entered information in a summary grid:
- **Basic Info:**
  - Link Name
  - Description
- **Payment:**
  - Amount (SOL + USD)
  - Recurrence
- **Advanced:**
  - Expiration (if set)
  - Max Uses (if set)
  - Redirect URL (if set)

**Edit Links:**
- Each section has "Edit" button
- Clicking edit goes back to that step
- Returns to review after editing

**Live Link Preview:**
- Full-size preview of payment page
- Shows exactly how payers will see it
- Displays auto-generated URL
- Copy URL button (though not active yet)

**Actions:**
- Back button → Returns to Step 3
- Save as Draft button → Saves without activating
- Create Link button → Creates and activates link

---

## Layout (ASCII)

### Step 1 Example:
```
┌─────────────────────────────────────────────────┐
│ Create New Payment Link                        │
├─────────────────────────────────────────────────┤
│ [1●]─────[2○]─────[3○]─────[4○]                │
│                                                  │
│ Step 1: Basic Information                       │
│                                                  │
│ Link Name *                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Pro Subscription__________________________  │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Description                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Monthly subscription for pro features...     │ │
│ │                                               │ │
│ └─────────────────────────────────────────────┘ │
│ 180 characters remaining                         │
│                                                  │
│                                                  │
│                        [Cancel] [Next →]        │
└─────────────────────────────────────────────────┘
```

### Step 2 Example:
```
┌─────────────────────────────────────────────────┐
│ Create New Payment Link                        │
├─────────────────────────────────────────────────┤
│ [1●]─────[2●]─────[3○]─────[4○]                │
│                                                  │
│ Step 2: Payment Configuration                   │
│                                                  │
│ Amount (SOL) *                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 10.00_______________________________________  │ │
│ └─────────────────────────────────────────────┘ │
│ ~$1,000.00 USD                                   │
│                                                  │
│ Recurrence *                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Monthly ▼                                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ LIVE PREVIEW                                  │ │
│ │                                               │ │
│ │ Pro Subscription                              │ │
│ │ 10 SOL / month                                │ │
│ │ ≈ $1,000 USD                                  │ │
│ │ [Pay Now]                                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│                        [← Back] [Next →]        │
└─────────────────────────────────────────────────┘
```

---

## Components Used

### From Shared Components
- `LinkFormWizard` - Wizard container
- `StepIndicator` - Progress indicator
- `FormField` - Form input fields
- `LinkPreview` - Live preview
- `ConfirmDialog` - Unsaved changes warning

### From Shadcn/UI
- `form` - Form wrapper (React Hook Form)
- `input` - Text inputs
- `textarea` - Description field
- `select` - Dropdown selectors
- `button` - Action buttons
- `label` - Form labels
- `calendar` - Date picker

---

## Data Requirements

### Form Schema (Zod):

```typescript
import { z } from 'zod'

const createLinkSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),

  description: z.string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),

  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount too large'),

  recurrence: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),

  expiresAt: z.string().datetime().optional(),

  maxUses: z.number().int().positive().optional(),

  redirectUrl: z.string().url().startsWith('https://').optional()
})
```

### API Request (POST /api/links):

```typescript
{
  name: string
  description?: string
  amount: number
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  expiresAt?: string // ISO 8601
  maxUses?: number
  redirectUrl?: string
}
```

---

## States

### Form States

**Pristine:**
- No data entered yet
- Cancel button just navigates back
- Save draft disabled

**Dirty:**
- User has entered data
- Cancel requires confirmation
- Save draft enabled

**Validating:**
- Show validation errors below fields
- Highlight invalid fields in red
- Disable next/submit while invalid

**Submitting:**
- Disable all inputs
- Show loading state on submit button
- Prevent navigation away

**Success:**
- Show success message
- Navigate to newly created link page
- Toast notification: "Payment link created!"

**Error:**
- Show error message above form
- Re-enable all inputs
- Keep form data intact
- Retry button or manual fix

---

## Interactions

### Step Navigation

**Next Button:**
- Validates current step
- Shows errors if invalid
- Moves to next step if valid
- Smooth slide transition

**Back Button:**
- No validation required
- Preserves entered data
- Smooth slide transition

**Progress Indicator:**
- Completed steps show checkmark
- Current step highlighted
- Future steps dimmed
- Click to go back (not forward)

### Field Interactions

**Amount Input:**
- Number pad on mobile
- Live USD conversion below
- Format with proper decimal places
- Show error on blur if invalid

**Recurrence Select:**
- Dropdown with icons
- Each option shows example
- Keyboard navigable

**Date Picker:**
- Calendar overlay
- Disable past dates
- Today highlighted
- Clear button

### Preview Updates

**Real-time:**
- Updates as user types (debounced 300ms)
- Reflects all current form values
- Shows validation errors in preview too

### Draft Saving

**Auto-save:**
- Save to localStorage every 30 seconds
- Restore on page reload
- Clear after successful creation

**Manual Save:**
- "Save as Draft" button
- Saves to backend (future)
- Shows timestamp of last save

---

## Responsive Behavior

### Desktop (> 1024px)
- Two-column layout: Form left, Preview right (sticky)
- Wide form fields
- All steps visible in progress indicator

### Tablet (768px - 1024px)
- Single column: Form top, Preview bottom
- Medium form fields
- Compact progress indicator

### Mobile (< 768px)
- Single column stack
- Preview collapsible (starts collapsed)
- Full-width inputs
- Bottom navigation (sticky)
- Progress indicator simplified dots

---

## Animations

### Step Transitions
- Slide in from right (forward)
- Slide in from left (backward)
- 300ms duration
- Smooth easing

### Field Validation
- Error messages fade in (150ms)
- Invalid fields border color change (200ms)
- Success checkmarks appear (150ms)

### Preview Updates
- Smooth opacity transition (200ms)
- Values morph/transition

---

## Accessibility

- [ ] Form has proper labels
- [ ] Required fields marked with asterisk
- [ ] ARIA labels on all inputs
- [ ] Error messages associated with fields
- [ ] Keyboard navigation works
- [ ] Focus management between steps
- [ ] Screen reader announces step changes
- [ ] Date picker keyboard accessible

---

## Validation Rules

### Client-Side Validation:
- Required fields checked on blur and submit
- Format validation (URL, number, etc.)
- Length validation (min/max characters)
- Real-time validation feedback

### Server-Side Validation:
- Duplicate name check
- Amount limits check
- Rate limiting
- Security validations

---

## Error Handling

### Validation Errors:
- Show below field
- Red border on invalid input
- Icon next to error message
- Clear on user input

### API Errors:
- Show at top of form
- Specific error messages
- Retry button
- Error code for debugging

### Network Errors:
- Offline detection
- Queue for retry
- Inform user to check connection

---

## Testing Scenarios

### Happy Path
1. User opens create link page → Step 1 loads
2. User enters name and description → Validation passes
3. User clicks next → Step 2 loads
4. User enters amount and recurrence → Preview updates
5. User clicks next → Step 3 loads
6. User skips advanced options → Step 4 loads
7. User reviews → All data correct
8. User clicks create → Link created successfully

### Validation Errors
1. User enters 2-char name → Error shown
2. User enters negative amount → Error shown
3. User enters invalid URL → Error shown
4. User tries to proceed with errors → Blocked

### Edge Cases
1. User refreshes mid-form → Draft restored
2. User cancels with data → Confirmation shown
3. API fails on submit → Error shown, data preserved
4. User goes back multiple steps → Data preserved

---

## Future Enhancements (Post-MVP)

- [ ] Link templates (save configurations for reuse)
- [ ] Bulk create (CSV upload)
- [ ] Custom link slug
- [ ] Payment page customization (colors, logo)
- [ ] Multi-currency support
- [ ] Payment plans (trial periods, discounts)
- [ ] Conditional logic (if X then Y)
- [ ] Integration webhooks
- [ ] Smart contract customization

---

**Related Pages:**
- [Payment Links](./04-PAYMENT_LINKS.md)
- [Edit Link](./06-EDIT_LINK.md)

**Related Docs:**
- [Components](../COMPONENTS.md)
- [API Mock](../API_MOCK.md)
