# PattPay Dashboard - Development Roadmap

**Document:** Development Roadmap
**Last Update:** 2025-10-18

---

## 🗓️ Overview

This roadmap outlines the development phases for the PattPay Dashboard, from initial setup to production-ready application.

**Total Estimated Time:** 12-15 days

---

## 📊 Phase Summary

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **Phase 0** | Setup & Infrastructure | 1 day | 🟡 Pending |
| **Phase 1** | Dashboard Home | 2-3 days | 🟡 Pending |
| **Phase 2** | Transactions List | 2 days | 🟡 Pending |
| **Phase 3** | Transaction Details | 1 day | 🟡 Pending |
| **Phase 4** | Payment Links List | 2 days | 🟡 Pending |
| **Phase 5** | Create Link | 2-3 days | 🟡 Pending |
| **Phase 6** | Edit Link | 1 day | 🟡 Pending |
| **Phase 7** | Polish & Testing | 1-2 days | 🟡 Pending |

---

## Phase 0: Setup & Infrastructure

**Duration:** 1 day
**Priority:** 🔴 Critical
**Status:** 🟡 Pending

### Objectives

Set up the foundational infrastructure for the dashboard, including mock API, authentication, and folder structure.

### Tasks

- [ ] **Install Dependencies**
  - Install MSW (Mock Service Worker)
  - Install Recharts for data visualization
  - Install React Hook Form for form management
  - Install Zod for schema validation

- [ ] **Configure MSW**
  - Create `mocks/browser.ts` - MSW setup
  - Create `mocks/handlers.ts` - API request handlers
  - Create `mocks/data.ts` - Mock data fixtures
  - Initialize MSW in `app/layout.tsx` (dev only)

- [ ] **Create Mock Authentication**
  - Create `contexts/AuthContext.tsx`
  - Implement mock user state with localStorage
  - Add login/logout functions with simulated delay
  - Create auth provider wrapper

- [ ] **Structure Dashboard Folders**
  - Create folder structure per [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)
  - Set up components/dashboard subdirectories
  - Create types for Transaction, PaymentLink, User
  - Set up lib/hooks and lib/utils directories

### Deliverable

Functional base structure with:
- MSW intercepting API calls
- Mock auth working with context
- Proper folder organization
- TypeScript types defined

---

## Phase 1: Dashboard Home

**Duration:** 2-3 days
**Priority:** 🔴 High
**Status:** 🟡 Pending

### Sprint Goal

Create a fully functional dashboard home page with statistics, activity chart, recent transactions, and quick actions.

### Tasks

#### Layout (Day 1)
- [ ] Create `app/dashboard/layout.tsx` with Sidebar + Header
- [ ] Create `components/dashboard/layout/Sidebar.tsx`
  - Logo at top
  - Navigation menu items
  - Active state styling
  - Mobile collapse toggle
  - User info at bottom
- [ ] Create `components/dashboard/layout/Header.tsx`
  - Page title
  - User avatar + dropdown menu
  - Breadcrumbs
- [ ] Implement responsive sidebar behavior
- [ ] Add auth check (redirect if not authenticated)

#### Dashboard Page (Day 2)
- [ ] Create `app/dashboard/page.tsx`
- [ ] Create `components/dashboard/cards/DashboardCard.tsx`
  - Base card with pixel art styling
  - Support for trend indicators
  - Loading skeleton state
- [ ] Implement 4 statistics cards:
  - Total Transactions
  - Total Volume (SOL + USD)
  - Active Links
  - Conversion Rate
- [ ] Fetch stats from `/api/stats` endpoint

#### Charts & Transactions (Day 2-3)
- [ ] Create `components/dashboard/charts/ActivityChart.tsx`
  - Line chart with Recharts
  - Toggle between volume/count
  - Last 30 days data
  - Hover tooltips
  - Pixel art styling
- [ ] Create `components/dashboard/tables/RecentTransactions.tsx`
  - Mini table (5 most recent)
  - Status badges
  - Clickable rows
  - Link to full transactions page
- [ ] Create `components/dashboard/shared/QuickActions.tsx`
  - Grid of action buttons
  - Navigate to create link, transactions, etc.

#### Polish (Day 3)
- [ ] Mobile responsiveness for all components
- [ ] Loading states (skeleton loaders)
- [ ] Empty state (no transactions yet)
- [ ] Error handling
- [ ] Page animations (fade in, stagger)

### Deliverable

Complete and functional dashboard home page with all features working.

### Page Specification

See [pages/01-DASHBOARD_HOME.md](./pages/01-DASHBOARD_HOME.md) for detailed specifications.

---

## Phase 2: Transactions List

**Duration:** 2 days
**Priority:** 🔴 High
**Status:** 🟡 Pending

### Sprint Goal

Build a complete transaction listing page with filtering, sorting, search, pagination, and export functionality.

### Tasks

#### Table Component (Day 1)
- [ ] Create `app/dashboard/transactions/page.tsx`
- [ ] Create `components/dashboard/tables/TransactionTable.tsx`
  - All columns (ID, Date, Amount, Status, Source, Wallet)
  - Sortable column headers
  - Clickable rows
  - Loading skeleton
- [ ] Create `components/dashboard/tables/TransactionRow.tsx`
  - Reusable row component
  - Status badge
  - Hover effects
- [ ] Create `components/dashboard/tables/Pagination.tsx`
  - Page numbers
  - Items per page selector (10, 25, 50)
  - Previous/Next buttons

#### Filters & Search (Day 1-2)
- [ ] Create `components/dashboard/tables/FilterBar.tsx`
  - Status filter (All, Success, Pending, Failed)
  - Date range filter (Last 7 days, 30 days, Custom)
  - Min/max value filter
- [ ] Implement search bar
  - Search by transaction hash
  - Search by wallet address
  - Debounced search input
- [ ] Wire up filters to table data

#### Export & Polish (Day 2)
- [ ] Implement CSV export
- [ ] Implement JSON export
- [ ] Empty state (no transactions)
- [ ] Error state (API failure)
- [ ] Mobile responsiveness (card view for small screens)
- [ ] Loading states

### Deliverable

Complete transactions page with filtering, search, pagination, and export.

### Page Specification

See [pages/02-TRANSACTIONS.md](./pages/02-TRANSACTIONS.md) for detailed specifications.

---

## Phase 3: Transaction Details

**Duration:** 1 day
**Priority:** 🟠 Medium
**Status:** 🟡 Pending

### Sprint Goal

Create individual transaction details page with timeline, on-chain data, and related link information.

### Tasks

- [ ] Create `app/dashboard/transactions/[id]/page.tsx`
- [ ] Create `components/dashboard/TransactionDetails.tsx`
  - Main information grid
  - On-chain data section
  - Related payment link
- [ ] Create `components/dashboard/TransactionTimeline.tsx`
  - Vertical timeline component
  - Created → Processing → Confirmed states
  - Timestamps for each stage
- [ ] Create `components/dashboard/shared/CopyButton.tsx`
  - Copy to clipboard functionality
  - Visual feedback (copied checkmark)
- [ ] Add "View on Solana Explorer" link
- [ ] Implement back button navigation
- [ ] Mobile responsiveness
- [ ] Loading state
- [ ] Error state (transaction not found)

### Deliverable

Complete transaction details page with all information displayed.

### Page Specification

See [pages/03-TRANSACTION_DETAILS.md](./pages/03-TRANSACTION_DETAILS.md) for detailed specifications.

---

## Phase 4: Payment Links List

**Duration:** 2 days
**Priority:** 🔴 High
**Status:** 🟡 Pending

### Sprint Goal

Build payment links grid page with actions, filters, and link management capabilities.

### Tasks

#### Link Cards (Day 1)
- [ ] Create `app/dashboard/links/page.tsx`
- [ ] Create `components/dashboard/cards/LinkCard.tsx`
  - Card layout with link preview
  - Link name, amount, recurrence
  - Status badge (active/paused/expired)
  - Quick stats (views, conversions)
  - Actions dropdown
- [ ] Create `components/dashboard/LinkActions.tsx`
  - Dropdown menu component
  - Actions: Copy URL, Edit, Pause/Activate, Delete, QR Code
- [ ] Create `components/dashboard/LinkStats.tsx`
  - Mini stats display inside card

#### Filters & Actions (Day 1-2)
- [ ] Implement filters
  - Status: All, Active, Paused, Expired
  - Sort by: Creation date, Conversions, Value
- [ ] Implement search by link name
- [ ] Wire up actions:
  - Copy URL (with feedback)
  - Edit (navigate to edit page)
  - Pause/Activate (optimistic update)
  - Delete (with confirmation modal)
  - Show QR Code (modal)

#### Polish (Day 2)
- [ ] Create delete confirmation modal
- [ ] QR code generation modal
- [ ] Empty state (no links created)
- [ ] Mobile responsiveness (grid → stack)
- [ ] Loading states
- [ ] Error handling

### Deliverable

Functional payment links page with all actions working.

### Page Specification

See [pages/04-PAYMENT_LINKS.md](./pages/04-PAYMENT_LINKS.md) for detailed specifications.

---

## Phase 5: Create Payment Link

**Duration:** 2-3 days
**Priority:** 🔴 High
**Status:** 🟡 Pending

### Sprint Goal

Build multi-step wizard form to create payment links with validation, preview, and draft saving.

### Tasks

#### Form Wizard (Day 1)
- [ ] Create `app/dashboard/links/new/page.tsx`
- [ ] Create `components/dashboard/forms/LinkFormWizard.tsx`
  - Multi-step wizard container
  - Step navigation
  - Form state management (React Hook Form)
- [ ] Create `components/dashboard/forms/StepIndicator.tsx`
  - Visual progress indicator
  - Click to navigate steps

#### Form Steps (Day 1-2)
- [ ] **Step 1: Basic Information**
  - Link name (required, 3-50 chars)
  - Description (optional, max 200 chars)
- [ ] **Step 2: Payment Configuration**
  - Amount in SOL (required, > 0)
  - Recurrence selector (once, daily, weekly, monthly, yearly)
  - Currency display (SOL + USD estimate)
- [ ] **Step 3: Advanced Options**
  - Expiration date (optional)
  - Usage limit (optional, max uses)
  - Redirect URL after payment (optional)
- [ ] **Step 4: Review & Preview**
  - Summary of all inputs
  - Live link preview
  - Generated URL display

#### Validation & Actions (Day 2-3)
- [ ] Set up Zod validation schemas
- [ ] Wire up React Hook Form
- [ ] Implement field validations
- [ ] Create `components/dashboard/forms/LinkPreview.tsx`
  - Preview how link appears to payer
  - Auto-generated URL
- [ ] Implement "Save as Draft" functionality
- [ ] Implement "Create and Activate" action
- [ ] Success feedback (toast/modal)
- [ ] Error handling

#### Polish (Day 3)
- [ ] Mobile responsiveness
- [ ] Loading states on submit
- [ ] Keyboard navigation between steps
- [ ] Form field focus management
- [ ] Unsaved changes warning

### Deliverable

Complete link creation flow with validation and preview.

### Page Specification

See [pages/05-CREATE_LINK.md](./pages/05-CREATE_LINK.md) for detailed specifications.

---

## Phase 6: Edit Payment Link

**Duration:** 1 day
**Priority:** 🟠 Medium
**Status:** 🟡 Pending

### Sprint Goal

Build edit page for existing payment links with validations and change history.

### Tasks

- [ ] Create `app/dashboard/links/[id]/edit/page.tsx`
- [ ] Create `components/dashboard/forms/EditLinkForm.tsx`
  - Pre-populated form fields
  - Same validation as create form
- [ ] Fetch existing link data
- [ ] Lock fields if link has transactions (amount, recurrence)
- [ ] Create `components/dashboard/ChangeHistory.tsx`
  - Display modification log
  - Timestamps and change descriptions
- [ ] Implement save changes
- [ ] Add delete link option (with confirmation)
- [ ] Confirmation modal for critical changes
- [ ] Success/error feedback
- [ ] Mobile responsiveness

### Deliverable

Functional link editing with proper validations.

### Page Specification

See [pages/06-EDIT_LINK.md](./pages/06-EDIT_LINK.md) for detailed specifications.

---

## Phase 7: Polish & Testing

**Duration:** 1-2 days
**Priority:** 🟠 Medium
**Status:** 🟡 Pending

### Sprint Goal

Final refinements, accessibility improvements, performance optimization, and basic testing.

### Tasks

#### Responsiveness & UX (Day 1)
- [ ] Test all pages at breakpoints: 320px, 768px, 1024px, 1440px
- [ ] Fix any responsive layout issues
- [ ] Add visual feedback for all actions
  - Toast notifications
  - Loading spinners
  - Success/error messages
- [ ] Smooth page transitions
- [ ] Consistent spacing and alignment

#### Performance (Day 1)
- [ ] Lazy load Recharts (code splitting)
- [ ] Optimize images
- [ ] Memoize expensive calculations
- [ ] Debounce search inputs
- [ ] Add loading skeletons everywhere
- [ ] Prefetch on hover where applicable

#### Accessibility (Day 1-2)
- [ ] Add ARIA labels to all interactive elements
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Ensure visible focus indicators
- [ ] Color contrast checks (WCAG AA)
- [ ] Screen reader testing
- [ ] Add alt text to all images

#### Testing (Day 2)
- [ ] Manual testing of all user flows
- [ ] Test empty states
- [ ] Test error states
- [ ] Test loading states
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile device testing

#### Documentation (Day 2)
- [ ] Update README with setup instructions
- [ ] Document all shared components
- [ ] Add JSDoc comments to complex functions
- [ ] Create component usage examples

### Deliverable

Production-ready dashboard with polished UX, good performance, and basic accessibility.

---

## 🎯 Success Metrics

### Performance Targets

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90
- [ ] No layout shifts (CLS = 0)

### Code Quality Targets

- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Components average < 200 lines
- [ ] Reusability > 60% of components

### UX Targets

- [ ] 100% mobile responsive
- [ ] Loading states on all async actions
- [ ] Visual feedback on all user actions
- [ ] Error handling everywhere

---

## 🔮 Post-MVP Roadmap

### Phase 8: Real Integration (Future)
- [ ] Replace MSW with real backend API
- [ ] Integrate Solana Wallet Adapter
- [ ] Connect to smart contracts
- [ ] Real-time updates (WebSockets)

### Phase 9: Advanced Features (Future)
- [ ] Dark mode
- [ ] Internationalization (i18n)
- [ ] Advanced analytics (funnel, cohorts)
- [ ] Team collaboration (multiple users)
- [ ] API keys for programmatic access
- [ ] Webhooks for external integrations

### Phase 10: Scale (Future)
- [ ] Multi-currency support (USDC, USDT)
- [ ] Custom branding for white-label
- [ ] Mobile app (React Native)
- [ ] Browser extension

---

## 📊 Progress Tracking

### Overall Completion

- [ ] Phase 0: Setup (0%)
- [ ] Phase 1: Dashboard Home (0%)
- [ ] Phase 2: Transactions (0%)
- [ ] Phase 3: Transaction Details (0%)
- [ ] Phase 4: Payment Links (0%)
- [ ] Phase 5: Create Link (0%)
- [ ] Phase 6: Edit Link (0%)
- [ ] Phase 7: Polish (0%)

**Total Progress:** 0% → Target: 100%

---

**Next:** Review [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) for complete folder organization.
