# PattPay Dashboard - Shared Components

**Document:** Shared Component Specifications
**Last Update:** 2025-10-18

---

## 📋 Overview

This document specifies all reusable components used across the dashboard. Each component includes interface definition, features, design patterns, and usage examples.

---

## 🏗️ Layout Components

### `Sidebar` (`components/dashboard/layout/Sidebar.tsx`)

**Purpose:** Main navigation sidebar for the dashboard

**Features:**
- PattPay logo at top
- Navigation menu items with icons
- Active state highlighting
- Collapse toggle for mobile
- User info at bottom
- Sticky positioning

**Interface:**
```typescript
interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}
```

**Menu Items:**
- 🏠 Dashboard (`/dashboard`)
- 💳 Transactions (`/dashboard/transactions`)
- 🔗 Payment Links (`/dashboard/links`)
- ⚙️ Settings (future)
- 🚪 Logout

**Design Pattern:**
```tsx
<aside className="w-64 h-screen bg-surface border-r-4 border-brand-300 sticky top-0">
  {/* Logo */}
  <div className="p-6 border-b-2 border-brand-300">
    <Image src="/text-logo.png" alt="PattPay" className="pixelated" />
  </div>

  {/* Navigation */}
  <nav className="p-4">
    {menuItems.map(item => (
      <Link
        key={item.path}
        href={item.path}
        className={cn(
          "flex items-center gap-3 px-4 py-3 font-mono text-sm transition-all",
          isActive ? "bg-brand text-surface" : "text-foreground hover:bg-brand/10"
        )}
      >
        <Image src={item.icon} width={24} height={24} />
        <span>{item.label}</span>
      </Link>
    ))}
  </nav>

  {/* User Info */}
  <div className="absolute bottom-0 w-full p-4 border-t-2 border-brand-300">
    {/* User avatar and name */}
  </div>
</aside>
```

---

### `DashboardHeader` (`components/dashboard/layout/Header.tsx`)

**Purpose:** Page header with title and user actions

**Features:**
- Page title
- Breadcrumbs navigation
- User avatar + dropdown menu
- Notifications icon (future)

**Interface:**
```typescript
interface DashboardHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}
```

**Design Pattern:**
```tsx
<header className="bg-background border-b-4 border-border px-6 py-4">
  <div className="flex items-center justify-between">
    {/* Title and breadcrumbs */}
    <div>
      <nav className="flex items-center gap-2 text-sm font-mono text-muted mb-2">
        {breadcrumbs?.map((crumb, i) => (
          <Fragment key={i}>
            {i > 0 && <span>/</span>}
            <Link href={crumb.href || "#"}>{crumb.label}</Link>
          </Fragment>
        ))}
      </nav>
      <h1 className="font-display text-3xl text-foreground">{title}</h1>
    </div>

    {/* User menu */}
    <UserMenu />
  </div>
</header>
```

---

### `UserMenu` (`components/dashboard/layout/UserMenu.tsx`)

**Purpose:** Dropdown menu for user actions

**Features:**
- User avatar
- User name and wallet address (truncated)
- Dropdown with options (Settings, Logout)

**Interface:**
```typescript
interface UserMenuProps {
  user: User
  onLogout: () => void
}
```

---

## 📊 Card Components

### `DashboardCard` (`components/dashboard/cards/DashboardCard.tsx`)

**Purpose:** Statistics card for dashboard metrics

**Features:**
- Title and value display
- Trend indicator (up/down percentage)
- Icon support
- Loading skeleton state
- Hover animation
- Clickable (optional)

**Interface:**
```typescript
interface DashboardCardProps {
  title: string
  value: string | number
  trend?: {
    value: number // percentage
    direction: 'up' | 'down'
  }
  icon?: React.ReactNode
  loading?: boolean
  onClick?: () => void
  className?: string
}
```

**Design Pattern:**
```tsx
<motion.div
  className={cn(
    "relative bg-surface border-4 border-brand p-6",
    "shadow-[4px_4px_0_0_rgba(79,70,229,0.2)]",
    "hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(79,70,229,0.3)]",
    "transition-all cursor-pointer",
    className
  )}
  whileHover={{ scale: 1.02 }}
  onClick={onClick}
>
  {/* Corner decorations */}
  <div className="absolute top-0 right-0 w-2 h-2 bg-brand" />
  <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent" />

  {/* Icon */}
  {icon && <div className="mb-4">{icon}</div>}

  {/* Title */}
  <h3 className="font-display text-lg text-brand mb-2">{title}</h3>
  <div className="h-[2px] w-12 bg-brand mb-3" />

  {/* Value */}
  <p className="font-mono text-3xl text-foreground mb-2">{value}</p>

  {/* Trend */}
  {trend && (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent",
        trend.direction === 'up'
          ? "border-b-4 border-b-success"
          : "border-t-4 border-t-error"
      )} />
      <span className={cn(
        "font-mono text-sm",
        trend.direction === 'up' ? "text-success" : "text-error"
      )}>
        {trend.direction === 'up' ? '+' : ''}{trend.value}%
      </span>
    </div>
  )}
</motion.div>
```

---

### `LinkCard` (`components/dashboard/cards/LinkCard.tsx`)

**Purpose:** Payment link card for links grid

**Features:**
- Link name and description
- Amount and recurrence display
- Status badge
- Quick stats (views, conversions)
- Actions dropdown
- QR code preview (optional)

**Interface:**
```typescript
interface LinkCardProps {
  link: PaymentLink
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
  onCopy?: (url: string) => void
  onShowQR?: (url: string) => void
}
```

**Design Pattern:**
```tsx
<div className="bg-surface border-4 border-border p-6 hover:border-brand transition-all">
  {/* Header with status */}
  <div className="flex items-start justify-between mb-4">
    <h3 className="font-display text-lg text-foreground">{link.name}</h3>
    <StatusBadge status={link.status} />
  </div>

  {/* Description */}
  <p className="font-mono text-sm text-muted mb-4 line-clamp-2">
    {link.description}
  </p>

  {/* Amount and recurrence */}
  <div className="mb-4">
    <p className="font-mono text-2xl text-brand">{link.amount} SOL</p>
    <p className="font-mono text-sm text-muted">{link.recurrence}</p>
  </div>

  {/* Stats */}
  <LinkStats views={link.views} conversions={link.conversions} />

  {/* Actions */}
  <LinkActions
    onEdit={() => onEdit?.(link.id)}
    onDelete={() => onDelete?.(link.id)}
    onToggle={() => onToggle?.(link.id)}
    onCopy={() => onCopy?.(link.url)}
    onShowQR={() => onShowQR?.(link.url)}
  />
</div>
```

---

## 📋 Table Components

### `TransactionTable` (`components/dashboard/tables/TransactionTable.tsx`)

**Purpose:** Main table for transaction listing

**Features:**
- Sortable columns
- Status badges
- Clickable rows
- Loading skeleton
- Pagination support
- Empty state

**Interface:**
```typescript
interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  onSort?: (column: string) => void
  onRowClick?: (id: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}
```

**Columns:**
- Transaction ID (short hash)
- Date & Time
- Amount (SOL + USD)
- Status
- Source Link (if applicable)
- From Wallet (truncated)

---

### `Pagination` (`components/dashboard/tables/Pagination.tsx`)

**Purpose:** Pagination controls for tables

**Features:**
- Page numbers
- Previous/Next buttons
- Items per page selector
- Total count display

**Interface:**
```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (count: number) => void
}
```

---

## 📝 Form Components

### `LinkFormWizard` (`components/dashboard/forms/LinkFormWizard.tsx`)

**Purpose:** Multi-step wizard for creating/editing links

**Features:**
- Step navigation
- Form validation (Zod + React Hook Form)
- Progress indicator
- Draft saving
- Live preview

**Interface:**
```typescript
interface LinkFormWizardProps {
  initialData?: Partial<PaymentLink>
  onSubmit: (data: PaymentLink) => void
  onSaveDraft?: (data: Partial<PaymentLink>) => void
  onCancel: () => void
}
```

**Steps:**
1. Basic Information (name, description)
2. Payment Configuration (amount, recurrence)
3. Advanced Options (expiration, limits, redirect)
4. Review & Preview

---

### `FormField` (`components/dashboard/forms/FormField.tsx`)

**Purpose:** Reusable form input field

**Features:**
- Label and error display
- Required indicator
- Multiple input types
- Pixel art styling

**Interface:**
```typescript
interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date'
  placeholder?: string
  error?: string
  required?: boolean
  options?: { label: string; value: string }[] // for select
  register?: UseFormRegister<any>
  className?: string
}
```

**Design Pattern:**
```tsx
<div className="mb-4">
  <label className="block font-mono text-sm text-foreground mb-2">
    {label}
    {required && <span className="text-error ml-1">*</span>}
  </label>

  {type === 'text' && (
    <input
      type="text"
      className={cn(
        "w-full px-4 py-3 bg-surface border-4 border-border",
        "font-mono text-base text-foreground",
        "placeholder:text-muted",
        "focus:border-brand focus:ring-2 focus:ring-brand/20",
        "outline-none transition-all",
        error && "border-error"
      )}
      placeholder={placeholder}
      {...register?.(name)}
    />
  )}

  {error && (
    <p className="mt-1 font-mono text-xs text-error">{error}</p>
  )}
</div>
```

---

### `StepIndicator` (`components/dashboard/forms/StepIndicator.tsx`)

**Purpose:** Visual progress indicator for multi-step forms

**Features:**
- Current step highlighting
- Completed steps marked
- Click to navigate (if allowed)
- Responsive design

**Interface:**
```typescript
interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
  allowNavigation?: boolean
}
```

---

## 📈 Chart Components

### `ActivityChart` (`components/dashboard/charts/ActivityChart.tsx`)

**Purpose:** Line chart for activity visualization

**Features:**
- Recharts integration
- Toggle between volume/count
- Last 30 days data
- Hover tooltips
- Pixel art grid lines
- Responsive sizing

**Interface:**
```typescript
interface ActivityChartProps {
  data: {
    date: string
    volume: number
    count: number
  }[]
  mode: 'volume' | 'count'
  onModeChange: (mode: 'volume' | 'count') => void
  loading?: boolean
}
```

---

## 🛠️ Utility Components

### `StatusBadge` (`components/dashboard/shared/StatusBadge.tsx`)

**Purpose:** Visual status indicator

**Features:**
- Color-coded by status
- Dot indicator
- Pixel art styling
- Multiple sizes

**Interface:**
```typescript
interface StatusBadgeProps {
  status: 'success' | 'pending' | 'failed' | 'active' | 'paused' | 'expired'
  size?: 'sm' | 'md' | 'lg'
  showDot?: boolean
}
```

**Status Colors:**
- Success: `#10b981` (green)
- Pending: `#f59e0b` (yellow, with pulse animation)
- Failed: `#ef4444` (red)
- Active: `#3b82f6` (blue)
- Paused: `#6b7280` (gray)
- Expired: `#ef4444` (red)

---

### `CopyButton` (`components/dashboard/shared/CopyButton.tsx`)

**Purpose:** Copy text to clipboard with feedback

**Features:**
- Click to copy
- Visual feedback (checkmark)
- Timeout reset
- Optional tooltip

**Interface:**
```typescript
interface CopyButtonProps {
  text: string
  label?: string
  onCopy?: () => void
}
```

**Design Pattern:**
```tsx
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
  onCopy?.()
}

return (
  <button
    onClick={handleCopy}
    className="px-3 py-1 bg-surface border-2 border-border hover:border-brand font-mono text-xs transition-all"
  >
    {copied ? '✓ Copied' : label || 'Copy'}
  </button>
)
```

---

### `EmptyState` (`components/dashboard/shared/EmptyState.tsx`)

**Purpose:** Display when no data is available

**Features:**
- Pixel art illustration
- Title and description
- Call-to-action button
- Centered layout

**Interface:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Design Pattern:**
```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  {/* Illustration */}
  {icon && (
    <div className="mb-6 opacity-50">
      {icon}
    </div>
  )}

  {/* Title */}
  <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>

  {/* Description */}
  <p className="font-mono text-sm text-muted mb-6 max-w-md">
    {description}
  </p>

  {/* CTA */}
  {action && (
    <PixelButton onClick={action.onClick}>
      {action.label}
    </PixelButton>
  )}
</div>
```

---

### `LoadingSkeleton` (`components/dashboard/shared/LoadingSkeleton.tsx`)

**Purpose:** Loading placeholder

**Features:**
- Shimmer animation
- Multiple variants (card, table row, text)
- Pixel art styling

**Interface:**
```typescript
interface LoadingSkeletonProps {
  variant: 'card' | 'table-row' | 'text'
  count?: number
}
```

---

### `ConfirmDialog` (`components/dashboard/shared/ConfirmDialog.tsx`)

**Purpose:** Confirmation modal for destructive actions

**Features:**
- Title and message
- Confirm/Cancel buttons
- Danger variant (red confirm button)
- Escape to close
- Backdrop click to close

**Interface:**
```typescript
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}
```

---

## 🎯 Component Usage Guidelines

### When to Use Shadcn/UI

**ALWAYS check Shadcn/UI first** before creating these components:
- Tables → `table`
- Cards → `card`
- Buttons → `button`
- Dialogs → `dialog`
- Dropdowns → `dropdown-menu`
- Forms → `form` + `input`
- Badges → `badge`
- Tabs → `tabs`
- Selects → `select`
- Skeletons → `skeleton`
- Tooltips → `tooltip`
- Alerts → `alert`

### Customization Process

1. Add Shadcn component via CLI
2. Customize with pixel art styling
3. Apply brand colors and fonts
4. Document changes from original
5. Use in dashboard components

### Example

```bash
# 1. Add table from Shadcn
npx shadcn@latest add table

# 2. Customize in components/ui/table.tsx
export const Table = ({ className, ...props }) => (
  <table
    className={cn(
      "w-full border-4 border-brand", // pixel art border
      className
    )}
    {...props}
  />
)

# 3. Use in TransactionTable component
import { Table, TableHeader, TableRow } from "@/components/ui/table"
```

---

## ✅ Component Checklist

Before finalizing any component:

- [ ] Follows pixel art design system
- [ ] Uses brand color tokens
- [ ] TypeScript interface defined
- [ ] Props have default values where applicable
- [ ] Loading state implemented (if applicable)
- [ ] Error state handled (if applicable)
- [ ] Empty state shown (if applicable)
- [ ] Mobile responsive
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Documented with JSDoc comments
- [ ] Reusable across multiple pages

---

**Next:** Review [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) for authentication implementation details.
