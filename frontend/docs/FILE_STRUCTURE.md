# PattPay Dashboard - File Structure

**Document:** Complete File and Folder Structure
**Last Update:** 2025-10-18

---

## 📁 Complete Directory Tree

```
frontend/
├── CLAUDE.md                      # Project instructions for Claude Code
├── DASHBOARD_PLAN.md              # Original comprehensive plan (legacy)
│
├── docs/                          # 📚 Documentation
│   ├── README.md                  # Main documentation index
│   ├── OVERVIEW.md                # Project overview and objectives
│   ├── ARCHITECTURE.md            # Technical architecture and decisions
│   ├── RULES.md                   # Development rules and conventions
│   ├── DESIGN_SYSTEM.md           # Design system and component patterns
│   ├── ROADMAP.md                 # Development phases and timeline
│   ├── FILE_STRUCTURE.md          # This file
│   ├── COMPONENTS.md              # Shared component specifications
│   ├── AUTH_SYSTEM.md             # Mock authentication system
│   ├── API_MOCK.md                # Mock API endpoints and data
│   │
│   └── pages/                     # Page-specific specifications
│       ├── 01-DASHBOARD_HOME.md
│       ├── 02-TRANSACTIONS.md
│       ├── 03-TRANSACTION_DETAILS.md
│       ├── 04-PAYMENT_LINKS.md
│       ├── 05-CREATE_LINK.md
│       └── 06-EDIT_LINK.md
│
├── app/                           # 🎯 Next.js App Router
│   ├── layout.tsx                 # Root layout (MSW init, fonts)
│   ├── page.tsx                   # Landing page (hero + FAQ)
│   ├── globals.css                # Global styles + design tokens
│   │
│   ├── dashboard/                 # Dashboard section (protected)
│   │   ├── layout.tsx             # Dashboard layout (Sidebar + Header + Auth)
│   │   ├── page.tsx               # Dashboard home
│   │   ├── _components/           # Dashboard home specific components
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── transactions/          # Transactions section
│   │   │   ├── page.tsx           # Transaction list
│   │   │   ├── _components/       # Transaction list specific components
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   │
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Transaction details
│   │   │       └── _components/   # Transaction details specific components
│   │   │           ├── TransactionDetails.tsx
│   │   │           └── TransactionTimeline.tsx
│   │   │
│   │   └── links/                 # Payment links section
│   │       ├── page.tsx           # Links list
│   │       ├── _components/       # Links list specific components
│   │       │   ├── LinkCard.tsx
│   │       │   ├── LinkActions.tsx
│   │       │   ├── LinkStats.tsx
│   │       │   └── QRCodeModal.tsx
│   │       │
│   │       ├── new/
│   │       │   ├── page.tsx       # Create new link
│   │       │   └── _components/   # Create link specific components
│   │       │       ├── LinkFormWizard.tsx
│   │       │       ├── StepIndicator.tsx
│   │       │       └── LinkPreview.tsx
│   │       │
│   │       └── [id]/
│   │           └── edit/
│   │               ├── page.tsx   # Edit existing link
│   │               └── _components/ # Edit link specific components
│   │                   ├── EditLinkForm.tsx
│   │                   └── ChangeHistory.tsx
│   │
│   └── login/ (future)            # Login page (Solana wallet)
│       └── page.tsx
│
├── components/                    # ⚙️ React Components
│   ├── Navbar.tsx                 # Global navbar (logo + CTA)
│   ├── PixelButton.tsx            # Reusable pixel art button
│   │
│   ├── sections/                  # Landing page sections
│   │   ├── Hero.tsx
│   │   └── FAQ.tsx
│   │
│   ├── shared/                    # Shared dashboard components (organized by type)
│   │   ├── layout/                # Layout components
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── Header.tsx         # Page header
│   │   │   └── UserMenu.tsx       # User dropdown menu
│   │   │
│   │   ├── cards/                 # Reusable card components
│   │   │   └── StatCard.tsx       # Generic stat card
│   │   │
│   │   ├── forms/                 # Reusable form components
│   │   │   └── FormField.tsx      # Reusable form field
│   │   │
│   │   └── ui/                    # UI utilities
│   │       ├── StatusBadge.tsx    # Status indicator
│   │       ├── CopyButton.tsx     # Copy to clipboard
│   │       ├── EmptyState.tsx     # Empty state illustration
│   │       ├── LoadingSkeleton.tsx # Loading placeholder
│   │       └── ConfirmDialog.tsx  # Confirmation modal
│   │
│   └── ui/                        # 🎨 Shadcn/UI Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── tabs.tsx
│       ├── table.tsx
│       ├── skeleton.tsx
│       ├── tooltip.tsx
│       └── alert.tsx
│
├── contexts/                      # 🔐 React Contexts
│   ├── AuthContext.tsx            # Mock authentication
│   └── DashboardContext.tsx (future) # Global dashboard state
│
├── lib/                           # 🛠️ Utilities and Helpers
│   ├── api.ts                     # API client (fetch wrapper)
│   ├── utils.ts                   # General utilities (cn, etc.)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useTransactions.ts     # Fetch/manage transactions
│   │   ├── useLinks.ts            # Fetch/manage payment links
│   │   ├── useStats.ts            # Fetch dashboard stats
│   │   ├── useAuth.ts             # Auth hook
│   │   └── useClipboard.ts        # Copy to clipboard
│   │
│   └── utils/                     # Utility functions
│       ├── format.ts              # SOL, USD, date formatting
│       ├── validation.ts          # Zod schemas
│       └── solana.ts              # Address formatting, explorer links
│
├── mocks/                         # 🎭 Mock Service Worker
│   ├── browser.ts                 # MSW setup (browser)
│   ├── handlers.ts                # API request handlers
│   └── data.ts                    # Mock data fixtures
│
├── types/                         # 📘 TypeScript Types
│   ├── transaction.ts             # Transaction interface
│   ├── link.ts                    # PaymentLink interface
│   ├── user.ts                    # User interface
│   └── index.ts                   # Type exports
│
├── public/                        # 🖼️ Static Assets
│   ├── logo.svg                   # PattPay logo (icon only)
│   ├── text-logo.png              # Logo with text
│   ├── arrow-right.svg            # Arrow icon
│   │
│   ├── icons/                     # Pixel art icons
│   │   ├── dashboard-pixel.png
│   │   ├── transactions-pixel.png
│   │   ├── links-pixel.png
│   │   ├── settings-pixel.png
│   │   ├── wallet-pixel.png
│   │   └── ...
│   │
│   └── illustrations/             # Empty state illustrations
│       ├── empty-transactions.png
│       ├── empty-links.png
│       └── loading-coin.gif
│
├── tailwind.config.ts             # Tailwind configuration
├── postcss.config.mjs             # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies
├── pnpm-lock.yaml                 # Lock file
└── .eslintrc.mjs                  # ESLint configuration
```

---

## 📂 Directory Descriptions

### `/app`
Next.js App Router directory. Contains all pages and layouts using the file-based routing system.

**Key Structure:**
- `layout.tsx` - Root layout with fonts and MSW initialization
- `page.tsx` - Landing page
- `dashboard/layout.tsx` - Protected dashboard layout with sidebar
- `dashboard/page.tsx` - Dashboard home
- `dashboard/_components/` - Components specific to dashboard home page

**Page-Specific Components Pattern:**
Each page has its own `_components/` folder containing components used only by that page. This keeps components co-located with the pages that use them.

**Example:**
```
dashboard/
├── page.tsx                    # Dashboard home page
├── _components/                # Components only for dashboard home
│   ├── DashboardCard.tsx
│   ├── ActivityChart.tsx
│   └── RecentTransactions.tsx
│
└── transactions/
    ├── page.tsx                # Transactions list page
    └── _components/            # Components only for transactions list
        ├── TransactionTable.tsx
        └── FilterBar.tsx
```

**Routing Structure:**
- `/` - Landing page
- `/dashboard` - Dashboard home
- `/dashboard/transactions` - Transaction list
- `/dashboard/transactions/:id` - Transaction details
- `/dashboard/links` - Payment links list
- `/dashboard/links/new` - Create link
- `/dashboard/links/:id/edit` - Edit link

---

### `/components`
Shared components used across multiple pages, organized by type and purpose.

#### `/components/sections`
Landing page sections (Hero, FAQ, etc.)

#### `/components/shared`
Reusable dashboard components organized by type:

- **`/layout`** - Sidebar, Header, UserMenu (used across all dashboard pages)
- **`/cards`** - Generic card components (StatCard, etc.)
- **`/forms`** - Reusable form components (FormField, etc.)
- **`/ui`** - UI utilities (StatusBadge, CopyButton, EmptyState, LoadingSkeleton, ConfirmDialog)

**When to use `/components/shared` vs page `_components/`:**
- Use `_components/` for page-specific components
- Use `/components/shared` for components reused across 2+ pages

#### `/components/ui`
Shadcn/UI base components. These are copied into the project (not npm packages) and can be customized.

---

### `/contexts`
React Context providers for global state management.

**`AuthContext.tsx`**:
- Mock user authentication
- localStorage persistence
- Login/logout functions
- Auth state management

**`DashboardContext.tsx`** (future):
- Global dashboard state
- Shared data across pages
- WebSocket connection (real-time)

---

### `/lib`
Utility functions, API clients, and custom hooks.

#### `/lib/hooks`
Custom React hooks for data fetching and state management.

#### `/lib/utils`
Helper functions organized by purpose:
- `format.ts` - Formatting functions (SOL, USD, dates)
- `validation.ts` - Zod validation schemas
- `solana.ts` - Solana-specific utilities

---

### `/mocks`
Mock Service Worker setup for API simulation.

**Files:**
- `browser.ts` - MSW initialization
- `handlers.ts` - Request handlers for all endpoints
- `data.ts` - Mock data (transactions, links, users)

**Endpoints Mocked:**
- `GET /api/stats` - Dashboard statistics
- `GET /api/transactions` - Transaction list
- `GET /api/transactions/:id` - Transaction details
- `GET /api/links` - Payment links
- `POST /api/links` - Create link
- `PATCH /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/activity` - Activity chart data

---

### `/types`
TypeScript type definitions and interfaces.

**Files:**
- `transaction.ts` - Transaction, TransactionStatus
- `link.ts` - PaymentLink, LinkStatus, Recurrence
- `user.ts` - User, AuthState
- `index.ts` - Central export file

---

### `/docs`
Comprehensive project documentation split into modular files.

**Core Documentation:**
- README.md - Documentation index
- OVERVIEW.md - Project overview
- ARCHITECTURE.md - Technical architecture
- RULES.md - Development rules
- DESIGN_SYSTEM.md - Design patterns
- ROADMAP.md - Development phases
- FILE_STRUCTURE.md - This file

**Technical Specs:**
- COMPONENTS.md - Component specifications
- AUTH_SYSTEM.md - Authentication details
- API_MOCK.md - API endpoints and data

**Page Specs:**
- 01-DASHBOARD_HOME.md
- 02-TRANSACTIONS.md
- 03-TRANSACTION_DETAILS.md
- 04-PAYMENT_LINKS.md
- 05-CREATE_LINK.md
- 06-EDIT_LINK.md

---

### `/public`
Static assets served directly by Next.js.

**Organization:**
- Root level: Logos and common icons
- `/icons/` - Pixel art navigation icons
- `/illustrations/` - Empty state graphics

---

## 🗂️ File Naming Conventions

### Components
- **PascalCase**: `DashboardCard.tsx`, `TransactionTable.tsx`
- **Descriptive**: Clear purpose from name
- **No abbreviations**: `Button` not `Btn`

### Hooks
- **camelCase**: `useTransactions.ts`, `useAuth.ts`
- **`use` prefix**: All hooks start with "use"
- **Descriptive**: `useTransactionFilters` not `useFilters`

### Utilities
- **camelCase**: `formatSOL.ts`, `validateEmail.ts`
- **Action-oriented**: Verb-first naming

### Types
- **PascalCase**: `Transaction.ts`, `PaymentLink.ts`
- **Singular**: `User` not `Users`
- **Interface suffix for props**: `ButtonProps`, `CardProps`

---

## 📦 Import Path Aliases

Configured in `tsconfig.json`:

```typescript
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage Examples:**
```typescript
// Page-specific components (from same directory)
import { DashboardCard } from './_components/DashboardCard'
import { ActivityChart } from './_components/ActivityChart'

// Shared components
import { Sidebar } from '@/components/shared/layout/Sidebar'
import { StatusBadge } from '@/components/shared/ui/StatusBadge'
import { FormField } from '@/components/shared/forms/FormField'

// Shadcn UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Hooks
import { useTransactions } from '@/lib/hooks/useTransactions'

// Types
import type { Transaction } from '@/types/transaction'

// Utils
import { formatSOL } from '@/lib/utils/format'

// Context
import { useAuth } from '@/contexts/AuthContext'
```

---

## 🔄 Future Additions

As the project grows, these directories may be added:

### `/app/api` (API Routes)
If using Next.js API routes for backend:
```
app/api/
├── transactions/
│   └── route.ts
├── links/
│   └── route.ts
└── stats/
    └── route.ts
```

### `/tests` (Testing)
Unit and integration tests:
```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   └── flows/
└── e2e/
    └── scenarios/
```

### `/styles` (Additional Styles)
If needing more complex styling:
```
styles/
├── animations.css
├── utilities.css
└── themes/
    ├── light.css
    └── dark.css
```

---

## 🎯 File Organization Best Practices

### Component Organization Philosophy

**Page-Specific Components (`_components/`):**
- Components used by **only one page**
- Co-located with the page that uses them
- Easier to find and maintain
- Clear ownership and scope

**Shared Components (`/components/shared/`):**
- Components used by **2 or more pages**
- Organized by component type (layout, cards, forms, ui)
- Promotes reusability
- Centralized maintenance

**Example Decision Tree:**
```
Creating a new component?
│
├─ Used by only 1 page?
│  └─ Put in page's _components/ folder
│
└─ Used by 2+ pages?
   └─ Put in /components/shared/{type}/
```

### General Best Practices

1. **Keep components small**: < 200 lines per file
2. **One component per file**: Unless tightly coupled
3. **Co-locate page components**: Use `_components/` folders
4. **Organize shared by type**: layout, cards, forms, ui
5. **Meaningful names**: Clear purpose from filename
6. **Consistent structure**: Follow the established patterns
7. **Move to shared when needed**: If a page component is used by another page, move it to `/components/shared/`

### Benefits of This Structure

✅ **Easy to navigate**: Know exactly where page-specific components live
✅ **Clear boundaries**: Shared vs page-specific is obvious
✅ **Scalable**: Easy to add new pages without cluttering shared folder
✅ **Maintainable**: Changes to page components don't affect other pages
✅ **Type-organized shared**: Shared components grouped by their function

---

**Next:** Review [COMPONENTS.md](./COMPONENTS.md) for detailed component specifications.
