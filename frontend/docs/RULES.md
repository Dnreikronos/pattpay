# PattPay Dashboard - Development Rules

**Document:** Coding Rules & Conventions
**Last Update:** 2025-10-18

---

## ⚠️ CRITICAL RULES

These rules are **non-negotiable** and must be followed at all times.

---

## 🧩 Rule #1: Shadcn/UI Components First

**ALWAYS check Shadcn/UI before creating components from scratch**

### Workflow

1. **Search in Shadcn/UI**
   - Use `mcp__shadcn__search_items_in_registries`
   - Or visit [ui.shadcn.com](https://ui.shadcn.com)

2. **Add via CLI**
   ```bash
   npx shadcn@latest add [component-name]
   ```

3. **Customize with pixel art styling**
   - Apply brand colors
   - Add pixel art borders (4px solid)
   - Include hover effects
   - Use proper fonts

4. **Document modifications**
   - Comment what was changed from original
   - Explain why customization was needed

### Useful Shadcn Components

| Dashboard Component | Shadcn Base |
|---------------------|-------------|
| TransactionTable | `table` |
| DashboardCard, LinkCard | `card` |
| ConfirmDialog | `dialog` |
| LinkActions, UserMenu | `dropdown-menu` |
| FormField, LinkFormWizard | `form` + `input` |
| StatusBadge | `badge` |
| Filters | `tabs`, `select` |
| Loading states | `skeleton` |
| Tooltips | `tooltip` |
| Feedback messages | `alert` |

### Example: Customizing Shadcn Table

```bash
# 1. Add component
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

# 3. Use in dashboard
import { Table, TableHeader, TableRow } from "@/components/ui/table"
```

---

## 🎨 Rule #2: Creativity & Visual Identity

**Be creative and maintain the "Pixel Finance City" design pattern**

Every component must have **personality** and reflect the established visual identity.

### Design Principles

#### 1. Pixel Art Borders & Shadows

```tsx
// ✅ CORRECT: Stylized pixel art shadow
<div className="shadow-[4px_4px_0_0_rgba(79,70,229,0.3)]">

// ❌ WRONG: Default/generic shadow
<div className="shadow-lg">
```

#### 2. Brand Colors

```tsx
// ✅ CORRECT: Use design system color tokens
<div className="bg-brand text-surface border-brand-300">

// ❌ WRONG: Hardcoded or generic colors
<div className="bg-blue-500 text-white">
```

#### 3. Consistent Typography

```tsx
// ✅ CORRECT: System fonts (Press Start 2P for headings, DM Mono for body)
<h2 className="font-display text-2xl">Dashboard</h2>
<p className="font-mono text-base">Description</p>

// ❌ WRONG: System default fonts
<h2 className="font-bold text-2xl">Dashboard</h2>
```

#### 4. Pixel Art Micro-interactions

```tsx
// ✅ CORRECT: Hover with pixel-perfect movement
<button className="hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_rgba(79,70,229,1)] transition-all">

// ❌ WRONG: Generic hover
<button className="hover:opacity-80">
```

#### 5. Icons and Illustrations

```tsx
// ✅ CORRECT: Use custom pixel art icons
<Image src="/icons/wallet-pixel.png" className="pixelated" style={{ imageRendering: 'pixelated' }} />

// ❌ WRONG: Generic library icons without customization
<LucideWallet />
```

### Creativity Checklist

Before finalizing any component, ask yourself:

- [ ] Does this component have **personality** or is it generic?
- [ ] Does it reflect the **pixel art aesthetic** of PattPay?
- [ ] Are colors using **brand tokens** (brand, brand-300, accent)?
- [ ] Are borders **pixel art style** (4px, solid, no rounded)?
- [ ] Are animations **smooth but with pixel-perfect character** (200-300ms)?
- [ ] Do hover/focus states have **interesting visual feedback**?
- [ ] Does the component fit the **"Pixel Finance City" narrative**?

### Creative Example

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

**Generic Card - Avoid ❌**
```tsx
<div className="bg-white rounded-lg shadow p-4">
  <h3 className="text-lg font-bold">Total Volume</h3>
  <p className="text-2xl">5,234 SOL</p>
  <span className="text-green-500">+12.5%</span>
</div>
```

### Visual Inspiration

Get inspired by:
- **8-bit/16-bit games** (limited palettes, geometric shapes)
- **Isometric pixel cities** (perspective, depth)
- **Phantom Wallet UI** (clean, modern, personality)
- **Linear app** (minimalism, micro-interactions)
- **Pixel art dashboards** (Behance, Dribbble)

### Anti-Patterns (AVOID)

❌ Components that look like "Bootstrap"
❌ Very soft shadows (blur-lg, blur-xl)
❌ Excessive rounded corners (rounded-full on everything)
❌ Complex multi-colored gradients
❌ Too fast or too slow animations (keep 200-300ms)
❌ Inconsistent typography (mixing too many fonts)

---

## 📝 Rule #3: Naming Conventions

### Components
- **PascalCase**: `DashboardCard.tsx`, `TransactionTable.tsx`
- **Descriptive names**: Clear what the component does
- **No abbreviations**: `Button` not `Btn`

### Hooks
- **camelCase with `use` prefix**: `useTransactions.ts`, `useAuth.ts`
- **Descriptive**: `useTransactionFilters` not `useFilters`

### Utilities
- **camelCase**: `formatSOL()`, `formatDate()`, `validateEmail()`
- **Verb-first**: Action-oriented naming

### Types/Interfaces
- **PascalCase**: `Transaction`, `PaymentLink`, `User`
- **Descriptive**: `TransactionTableProps` not `Props`
- **No `I` prefix**: `User` not `IUser`

---

## 📂 Rule #4: File Organization

### Import Order

```tsx
// 1. External libraries
import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. Internal components
import { DashboardCard } from '@/components/dashboard/DashboardCard'

// 3. Types
import type { Transaction } from '@/types/transaction'

// 4. Styles (if any)
import './styles.css'
```

### Component Structure

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
  // Component logic
}
```

---

## 💬 Rule #5: Comments

### Good Comments (Explain WHY)

```tsx
// ✅ Good: Explains reasoning
// Disable sorting when filtering to avoid user confusion
const shouldEnableSort = !isFiltering

// ✅ Good: Complex logic explanation
// Convert SOL to USD using current price, with 2 decimal precision
const usdAmount = (solAmount * currentPrice).toFixed(2)
```

### Bad Comments (Obvious)

```tsx
// ❌ Bad: States the obvious
// Set loading to true
setLoading(true)

// ❌ Bad: Redundant
// Loop through transactions
transactions.forEach(...)
```

### Documentation Comments

```tsx
/**
 * Formats a Solana wallet address for display
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 4)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address like "8x7f...3a2b"
 */
export function formatWalletAddress(
  address: string,
  startChars = 4,
  endChars = 4
): string {
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}
```

---

## 🎯 Rule #6: TypeScript Strictness

### Always Define Types

```tsx
// ✅ Good: Proper typing
interface Transaction {
  id: string
  amount: number
  status: 'success' | 'pending' | 'failed'
}

function processTransaction(tx: Transaction): void {
  // ...
}

// ❌ Bad: Using 'any'
function processTransaction(tx: any) {
  // ...
}
```

### Use Type Inference When Obvious

```tsx
// ✅ Good: Type is obvious from value
const count = 5 // number inferred

// ❌ Unnecessary: Redundant type annotation
const count: number = 5
```

### Avoid Non-null Assertions

```tsx
// ✅ Good: Proper null checking
const user = users.find(u => u.id === id)
if (user) {
  console.log(user.name)
}

// ❌ Bad: Non-null assertion (dangerous)
const user = users.find(u => u.id === id)!
console.log(user.name)
```

---

## 🔄 Rule #7: React Best Practices

### Use Functional Components

```tsx
// ✅ Good: Functional component
export function DashboardCard({ title, value }: Props) {
  return <div>...</div>
}

// ❌ Avoid: Class components (unless necessary)
class DashboardCard extends React.Component {
  render() {
    return <div>...</div>
  }
}
```

### Proper Hook Usage

```tsx
// ✅ Good: Hooks at top level
export function TransactionList() {
  const [filter, setFilter] = useState('')
  const { data, loading } = useTransactions()

  return <div>...</div>
}

// ❌ Bad: Conditional hooks
export function TransactionList() {
  if (someCondition) {
    const [filter, setFilter] = useState('') // ERROR!
  }
  return <div>...</div>
}
```

### Memoization When Needed

```tsx
// ✅ Good: Memoize expensive calculations
const filteredTransactions = useMemo(
  () => transactions.filter(tx => tx.status === filter),
  [transactions, filter]
)

// ✅ Good: Memoize callbacks passed to children
const handleClick = useCallback(
  (id: string) => {
    onTransactionClick(id)
  },
  [onTransactionClick]
)
```

---

## 🎨 Rule #8: Styling Conventions

### Use Tailwind Classes

```tsx
// ✅ Good: Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-surface border-4 border-brand">

// ❌ Avoid: Inline styles (unless dynamic values)
<div style={{ display: 'flex', padding: '24px' }}>
```

### Group Related Classes

```tsx
// ✅ Good: Logical grouping
<button className="
  px-6 py-3
  bg-brand text-surface
  border-4 border-brand-600
  shadow-[2px_2px_0_0_rgba(79,70,229,1)]
  hover:shadow-[4px_4px_0_0_rgba(79,70,229,1)]
  transition-all
">

// ❌ Bad: Random order
<button className="hover:shadow-[4px_4px_0_0_rgba(79,70,229,1)] px-6 border-4 bg-brand py-3 text-surface">
```

### Use cn() for Conditional Classes

```tsx
import { cn } from '@/lib/utils'

// ✅ Good: Clean conditional styling
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  hasError && "error-classes"
)}>
```

---

## 📦 Rule #9: Component Props

### Destructure Props

```tsx
// ✅ Good: Destructure for clarity
export function DashboardCard({ title, value, trend }: Props) {
  return <div>{title}: {value}</div>
}

// ❌ Avoid: Using props object
export function DashboardCard(props: Props) {
  return <div>{props.title}: {props.value}</div>
}
```

### Provide Defaults

```tsx
// ✅ Good: Default values
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ size = 'md' }: Props) {
  // ...
}
```

### Make Required Props Obvious

```tsx
// ✅ Good: Required props are not optional
interface Props {
  title: string // required
  value: number // required
  trend?: { value: number; direction: 'up' | 'down' } // optional
}
```

---

## ✅ Pre-Commit Checklist

Before committing code, verify:

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Components use Shadcn/UI when possible
- [ ] Pixel art styling applied correctly
- [ ] Proper TypeScript types defined
- [ ] Mobile responsive tested
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] Comments explain WHY not WHAT

---

## 🚫 Common Mistakes to Avoid

1. **Not checking Shadcn/UI first** → Reinventing the wheel
2. **Using generic styling** → Losing brand identity
3. **Hardcoding colors** → Breaking design system
4. **Skipping TypeScript types** → Runtime errors
5. **Forgetting mobile** → Poor UX on phones
6. **No loading states** → Confusing user experience
7. **Using `any` type** → Defeating TypeScript purpose
8. **Inline styles everywhere** → Hard to maintain
9. **No error handling** → App crashes
10. **Mixing fonts** → Inconsistent typography

---

## 📖 Additional Resources

For comprehensive frontend best practices covering accessibility, performance, and interactions, see:
- **[FRONTEND_RULES.md](./FRONTEND_RULES.md)** - Complete guide with MUST/SHOULD/NEVER rules for building delightful UIs

---

**Next:** Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design tokens and patterns.
