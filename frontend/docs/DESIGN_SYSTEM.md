# PattPay Dashboard - Design System

**Document:** Dashboard Design System
**Last Update:** 2025-10-18

---

## 🎨 Design Philosophy

The dashboard embodies the **"Pixel Finance City"** aesthetic - a unique blend of retro pixel art, modern minimalism, and isometric perspective. Every component should feel like part of a cohesive, living DeFi ecosystem.

### Core Principles

- **Retro pixel art** (8-bit/16-bit inspired)
- **Modern minimalism** (clean, functional)
- **Isometric perspective** (depth and dimension)
- **Brand colors** (lavender background, indigo primary, golden accents)

---

## 🎨 Color System

### Dashboard-Specific Tokens

```css
/* Dashboard specific tokens */
--dashboard-sidebar-bg: var(--surface);
--dashboard-sidebar-border: var(--brand-300);
--dashboard-card-bg: var(--background);
--dashboard-card-shadow: 0 4px 0 0 rgba(79, 70, 229, 0.1);

/* Status colors */
--status-success: #10b981;
--status-pending: #f59e0b;
--status-failed: #ef4444;
--status-active: #3b82f6;
--status-paused: #6b7280;
```

### Status Color Usage

| Status | Color | Usage |
|--------|-------|-------|
| **Success** | `#10b981` | Completed transactions, active links |
| **Pending** | `#f59e0b` | Processing transactions, pending actions |
| **Failed** | `#ef4444` | Failed transactions, errors |
| **Active** | `#3b82f6` | Active payment links |
| **Paused** | `#6b7280` | Paused/inactive items |

### Brand Color Application

- **Primary (Brand)**: `#4F46E5` - Main actions, interactive elements
- **Brand 300**: `#818CF8` - Hover states, secondary elements
- **Brand 600**: Darker shade for borders and shadows
- **Accent**: `#F2B94B` - Highlights, call-to-action, important metrics

---

## 📐 Typography Rules

### Hierarchy

- **Page Headers**: Press Start 2P, `text-3xl`, `text-foreground`
- **Card Titles**: Press Start 2P, `text-lg`, `text-brand`
- **Body/Tables**: DM Mono, `text-base`, `text-foreground`
- **Labels**: DM Mono, `text-sm`, `text-muted`

### Font Usage Guidelines

```tsx
// ✅ CORRECT: Page header
<h1 className="font-display text-3xl text-foreground">Dashboard</h1>

// ✅ CORRECT: Card title
<h2 className="font-display text-lg text-brand">Total Volume</h2>

// ✅ CORRECT: Body text
<p className="font-mono text-base text-foreground">Transaction details</p>

// ✅ CORRECT: Label
<label className="font-mono text-sm text-muted">Filter by status</label>

// ❌ WRONG: Mixed fonts without purpose
<h1 className="font-sans text-3xl">Dashboard</h1>
```

---

## 🧩 Component Patterns

### Cards

**Base Card Pattern**:
```tsx
<div className="bg-dashboard-card-bg border-4 border-border p-6 shadow-[4px_4px_0_0_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-transform">
  {/* content */}
</div>
```

**Stats Card Pattern**:
```tsx
<motion.div
  className="relative bg-surface border-4 border-brand p-6 shadow-[4px_4px_0_0_rgba(79,70,229,0.2)]
             hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(79,70,229,0.3)] transition-all"
  whileHover={{ scale: 1.02 }}
>
  {/* Corner pixel decorations */}
  <div className="absolute top-0 right-0 w-2 h-2 bg-brand" />
  <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent" />

  {/* Content */}
  <h3 className="font-display text-lg text-brand mb-2">Title</h3>
  <div className="h-[2px] w-12 bg-brand mb-3" /> {/* pixel separator */}
  <p className="font-mono text-3xl text-foreground">Value</p>
</motion.div>
```

### Tables

**Base Table Pattern**:
```tsx
<table className="w-full border-4 border-brand">
  <thead className="bg-brand-300/20">
    <tr className="border-b-2 border-brand">
      <th className="px-4 py-3 text-left font-display text-xs">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-brand/5 cursor-pointer transition-colors">
      <td className="px-4 py-3 font-mono text-sm">Content</td>
    </tr>
  </tbody>
</table>
```

### Buttons

**Dashboard Primary Button**:
```tsx
<button className="px-6 py-3 bg-brand text-surface font-display text-sm border-2 border-brand-600 shadow-[2px_2px_0_0_rgba(79,70,229,1)] hover:shadow-[4px_4px_0_0_rgba(79,70,229,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
  {label}
</button>
```

**Dashboard Secondary Button**:
```tsx
<button className="px-6 py-3 bg-surface text-brand font-display text-sm border-2 border-brand shadow-[2px_2px_0_0_rgba(79,70,229,0.3)] hover:shadow-[4px_4px_0_0_rgba(79,70,229,0.5)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
  {label}
</button>
```

**Dashboard Danger Button**:
```tsx
<button className="px-6 py-3 bg-error text-surface font-display text-sm border-2 border-red-700 shadow-[2px_2px_0_0_rgba(239,68,68,1)] hover:shadow-[4px_4px_0_0_rgba(239,68,68,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all">
  Delete
</button>
```

### Badges

**Status Badge Pattern**:
```tsx
// Success
<span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success border-2 border-success font-mono text-xs">
  <span className="w-2 h-2 bg-success rounded-full" />
  Success
</span>

// Pending
<span className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning border-2 border-warning font-mono text-xs">
  <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
  Pending
</span>

// Failed
<span className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error border-2 border-error font-mono text-xs">
  <span className="w-2 h-2 bg-error rounded-full" />
  Failed
</span>
```

### Form Inputs

**Text Input Pattern**:
```tsx
<input
  type="text"
  className="w-full px-4 py-3 bg-surface border-4 border-border font-mono text-base text-foreground placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
  placeholder="Enter value..."
/>
```

**Select Dropdown Pattern**:
```tsx
<select className="w-full px-4 py-3 bg-surface border-4 border-border font-mono text-base text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all cursor-pointer">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 🎭 Animation Patterns

### Hover Animations

**Card Hover**:
```tsx
// Lift + shadow increase
className="hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(79,70,229,0.3)] transition-all duration-200"
```

**Button Hover**:
```tsx
// Shadow expansion + slight movement
className="hover:shadow-[4px_4px_0_0_rgba(79,70,229,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-200"
```

**Row Hover**:
```tsx
// Background tint
className="hover:bg-brand/5 transition-colors duration-150"
```

### Loading Animations

**Skeleton Loading**:
```tsx
<div className="animate-pulse bg-border rounded">
  <div className="h-4 bg-muted rounded mb-2"></div>
  <div className="h-4 bg-muted rounded w-3/4"></div>
</div>
```

**Spinner**:
```tsx
<div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
```

---

## 🖼️ Icons & Illustrations

### Icon Guidelines

- **Size**: 16x16 or 24x24 for navigation, 32x32 for features
- **Style**: Pixel art, custom-designed
- **Rendering**: Always use `imageRendering: 'pixelated'`

```tsx
<Image
  src="/icons/wallet-pixel.png"
  alt="Wallet"
  width={24}
  height={24}
  className="pixelated"
  style={{ imageRendering: 'pixelated' }}
/>
```

### Common Icons Needed

- 🏠 Dashboard (home icon)
- 💳 Transactions (card/money icon)
- 🔗 Payment Links (link/chain icon)
- ⚙️ Settings (gear icon)
- 🚪 Logout (door/exit icon)
- ✓ Success (checkmark)
- ⚠️ Warning (exclamation)
- ✗ Error (x mark)
- 📊 Chart (graph icon)
- 👤 User (profile icon)

### Empty State Illustrations

Use pixel art illustrations that fit the "Pixel Finance City" theme:
- Empty transactions: Pixel art of empty inbox/list
- No links: Pixel art of broken chain
- Loading: Pixel art of spinning coin

---

## 📱 Responsive Patterns

### Breakpoints

```tsx
// Mobile: < 768px
// Tablet: 768px - 1024px
// Desktop: > 1024px
```

### Layout Adjustments

**Stats Cards**:
- Desktop: 4 columns grid
- Tablet: 2 columns grid
- Mobile: 1 column stack

**Sidebar**:
- Desktop: Always visible, 256px width
- Tablet: Collapsible
- Mobile: Overlay drawer

**Tables**:
- Desktop: Full table with all columns
- Tablet: Hide less important columns
- Mobile: Card-style list

---

## ♿ Accessibility

### Color Contrast

All color combinations must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### Keyboard Navigation

- All interactive elements must be focusable
- Focus indicators must be visible
- Tab order must be logical

**Focus State Pattern**:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
```

### ARIA Labels

```tsx
// Buttons with icons only
<button aria-label="Copy transaction hash">
  <CopyIcon />
</button>

// Status badges
<span role="status" aria-label="Transaction successful">
  ✓ Success
</span>
```

---

## 🎯 Component Checklist

Before finalizing any component, verify:

- [ ] Uses brand color tokens (not hardcoded colors)
- [ ] Follows pixel art styling (4px borders, pixel shadows)
- [ ] Typography uses Press Start 2P for headings, DM Mono for body
- [ ] Hover states have interesting visual feedback
- [ ] Animations are 200-300ms duration
- [ ] Mobile responsive
- [ ] Accessible (ARIA labels, keyboard nav, focus states)
- [ ] Loading state implemented
- [ ] Error state handled

---

## 🚫 Anti-Patterns

Avoid these common mistakes:

❌ Using `shadow-lg` or `blur-xl` (use pixel shadows instead)
❌ Using `rounded-full` everywhere (maintain sharp pixel edges)
❌ Hardcoding colors like `bg-blue-500` (use tokens)
❌ Mixing too many fonts
❌ Animations faster than 150ms or slower than 400ms
❌ Generic Bootstrap-like designs

---

**Next:** Review [ROADMAP.md](./ROADMAP.md) for development phases and timeline.
