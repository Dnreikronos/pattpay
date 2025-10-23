# Frontend Development Rules - PattPay

**Document:** Frontend Best Practices & Accessibility Rules
**Last Update:** 2025-10-18

---

## 🎯 Overview

This document defines **MUST/SHOULD/NEVER** rules for building accessible, fast, and delightful UIs in the PattPay dashboard. These rules are based on industry best practices and should be followed rigorously.

---

## ⌨️ Interactions

### Keyboard Navigation

**MUST:**
- ✅ Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- ✅ Visible focus rings using `:focus-visible`
- ✅ Group related elements with `:focus-within`
- ✅ Manage focus (trap, move, and return) per APG patterns
- ✅ Tab order follows visual order

**Example:**
```tsx
// ✅ CORRECT: Visible focus ring
<button className="focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
  Click me
</button>

// ❌ WRONG: No focus indicator
<button className="outline-none">
  Click me
</button>
```

---

### Targets & Input

**MUST:**
- ✅ Hit target ≥24px (mobile ≥44px)
- ✅ If visual <24px, expand hit area with padding/pseudo-elements
- ✅ Mobile `<input>` font-size ≥16px to prevent zoom, or use:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
  ```
- ✅ `touch-action: manipulation` to prevent double-tap zoom
- ✅ Set `-webkit-tap-highlight-color` to match design

**NEVER:**
- ❌ Disable browser zoom

**Example:**
```tsx
// ✅ CORRECT: Adequate hit target
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon size={16} />
</button>

// ✅ CORRECT: Mobile-friendly input
<input
  type="email"
  className="text-base" // 16px, prevents zoom on iOS
/>
```

---

### Inputs & Forms

**MUST:**
- ✅ Hydration-safe inputs (no lost focus/value)
- ✅ Loading buttons show spinner and keep original label
- ✅ Enter submits focused text input
- ✅ In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
- ✅ Keep submit enabled until request starts; then disable, show spinner, use idempotency key
- ✅ Accept free text and validate after (don't block typing)
- ✅ Allow submitting incomplete forms to surface validation
- ✅ Errors inline next to fields; on submit, focus first error
- ✅ Use correct `autocomplete`, meaningful `name`, proper `type` and `inputmode`
- ✅ Trim values to handle text expansion/trailing spaces
- ✅ No dead zones on checkboxes/radios; label+control share one generous hit target
- ✅ Warn on unsaved changes before navigation
- ✅ Compatible with password managers & 2FA; allow pasting one-time codes

**NEVER:**
- ❌ Block paste in `<input>/<textarea>`

**SHOULD:**
- 💡 Disable spellcheck for emails/codes/usernames
- 💡 Placeholders end with ellipsis and show example pattern

**Example:**
```tsx
// ✅ CORRECT: Proper input configuration
<input
  type="email"
  name="email"
  autoComplete="email"
  spellCheck={false}
  placeholder="user@example.com…"
  className="text-base"
/>

// ✅ CORRECT: Loading button
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Creating Link…
    </>
  ) : (
    'Create Link'
  )}
</button>

// ✅ CORRECT: Generous checkbox hit area
<label className="flex items-center gap-3 cursor-pointer p-3">
  <input type="checkbox" name="agree" />
  <span>I agree to terms</span>
</label>
```

---

### State & Navigation

**MUST:**
- ✅ URL reflects state (deep-link filters/tabs/pagination/expanded panels)
- ✅ Back/Forward restores scroll
- ✅ Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)

**SHOULD:**
- 💡 Prefer libraries like [nuqs](https://nuqs.dev) for URL state management

**Example:**
```tsx
// ✅ CORRECT: Proper link (not button)
<Link href="/dashboard/transactions">
  View Transactions
</Link>

// ❌ WRONG: Button for navigation
<button onClick={() => router.push('/dashboard/transactions')}>
  View Transactions
</button>
```

---

### Feedback

**MUST:**
- ✅ Confirm destructive actions or provide Undo window
- ✅ Use polite `aria-live` for toasts/inline validation

**SHOULD:**
- 💡 Optimistic UI; reconcile on response
- 💡 On failure, show error and rollback or offer Undo
- 💡 Ellipsis (`…`) for options that open follow-ups (eg, "Rename…")
- 💡 Loading states use ellipsis (eg, "Loading…", "Saving…", "Generating…")

**Example:**
```tsx
// ✅ CORRECT: Optimistic update with rollback
const handleToggle = async () => {
  // Optimistic update
  setStatus('paused')

  try {
    await updateLink({ status: 'paused' })
  } catch (error) {
    // Rollback on error
    setStatus('active')
    toast.error('Failed to pause link')
  }
}

// ✅ CORRECT: Confirm destructive action
<ConfirmDialog
  title="Delete Payment Link?"
  message="Are you sure? This action cannot be undone."
  onConfirm={handleDelete}
/>
```

---

### Touch/Drag/Scroll

**MUST:**
- ✅ Design forgiving interactions (generous targets, clear affordances)
- ✅ Delay first tooltip in a group; subsequent peers no delay
- ✅ Intentional `overscroll-behavior: contain` in modals/drawers
- ✅ During drag, disable text selection and set `inert` on dragged element
- ✅ No "dead-looking" interactive zones—if it looks clickable, it is

---

### Autofocus

**SHOULD:**
- 💡 Autofocus on desktop when there's a single primary input
- 💡 Rarely on mobile (to avoid layout shift)

---

## 🎬 Animation

**MUST:**
- ✅ Honor `prefers-reduced-motion` (provide reduced variant)
- ✅ Animate compositor-friendly props (`transform`, `opacity`)
- ✅ Animations are interruptible and input-driven
- ✅ Correct `transform-origin` (motion starts where it "physically" should)

**SHOULD:**
- 💡 Prefer CSS > Web Animations API > JS libraries
- 💡 Animate only to clarify cause/effect or add deliberate delight
- 💡 Choose easing to match the change (size/distance/trigger)

**NEVER:**
- ❌ Animate layout/repaint props (`top/left/width/height`)
- ❌ Autoplay animations without user trigger

**Example:**
```tsx
// ✅ CORRECT: Respects reduced motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.3,
    ease: 'easeOut'
  }}
  // Disable animation if user prefers reduced motion
  {...(prefersReducedMotion && {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 }
  })}
>
  Content
</motion.div>

// ✅ CORRECT: CSS animation with compositor-friendly props
<div className="hover:-translate-y-1 transition-transform duration-200">
  Card
</div>

// ❌ WRONG: Animating layout props
<div className="hover:top-[-4px] transition-all">
  Card
</div>
```

---

## 📐 Layout

**MUST:**
- ✅ Deliberate alignment to grid/baseline/edges/optical centers
- ✅ Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- ✅ Respect safe areas (use `env(safe-area-inset-*)`)
- ✅ Avoid unwanted scrollbars; fix overflows

**SHOULD:**
- 💡 Optical alignment; adjust by ±1px when perception beats geometry
- 💡 Balance icon/text lockups (stroke/weight/size/spacing/color)

**Example:**
```css
/* ✅ CORRECT: Safe area insets for iOS */
.container {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}

/* ✅ CORRECT: Prevent unwanted horizontal scroll */
.page {
  overflow-x: hidden;
  max-width: 100vw;
}
```

---

## 📝 Content & Accessibility

**MUST:**
- ✅ Skeletons mirror final content to avoid layout shift
- ✅ `<title>` matches current context
- ✅ No dead ends; always offer next step/recovery
- ✅ Design empty/sparse/dense/error states
- ✅ Tabular numbers for comparisons (`font-variant-numeric: tabular-nums`)
- ✅ Redundant status cues (not color-only); icons have text labels
- ✅ Don't ship the schema—visuals may omit labels but accessible names still exist
- ✅ Use the ellipsis character `…` (not `...`)
- ✅ `scroll-margin-top` on headings for anchored links
- ✅ Include a "Skip to content" link
- ✅ Hierarchical `<h1–h6>`
- ✅ Resilient to user-generated content (short/avg/very long)
- ✅ Locale-aware dates/times/numbers/currency
- ✅ Accurate names (`aria-label`), decorative elements `aria-hidden`
- ✅ Icon-only buttons have descriptive `aria-label`
- ✅ Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- ✅ Use non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`

**SHOULD:**
- 💡 Inline help first; tooltips last resort
- 💡 Curly quotes (" "); avoid widows/orphans
- 💡 Right-clicking the nav logo surfaces brand assets

**Example:**
```tsx
// ✅ CORRECT: Accessible icon button
<button aria-label="Delete payment link">
  <TrashIcon aria-hidden />
</button>

// ✅ CORRECT: Tabular numbers for comparison
<div className="font-mono tabular-nums">
  $1,234.56
</div>

// ✅ CORRECT: Non-breaking spaces
<span>10&nbsp;SOL</span>
<span>Ctrl&nbsp;+&nbsp;K</span>

// ✅ CORRECT: Locale-aware formatting
{new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(1234.56)}
```

---

## ⚡ Performance

**MUST:**
- ✅ Measure reliably (disable extensions that skew runtime)
- ✅ Track and minimize re-renders (React DevTools/React Scan)
- ✅ Profile with CPU/network throttling
- ✅ Batch layout reads/writes; avoid unnecessary reflows/repaints
- ✅ Mutations (`POST/PATCH/DELETE`) target <500 ms
- ✅ Virtualize large lists (eg, `virtua`)
- ✅ Preload only above-the-fold images; lazy-load the rest
- ✅ Prevent CLS from images (explicit dimensions or reserved space)

**SHOULD:**
- 💡 Test iOS Low Power Mode and macOS Safari
- 💡 Prefer uncontrolled inputs; make controlled loops cheap

**Example:**
```tsx
// ✅ CORRECT: Image with dimensions to prevent CLS
<Image
  src="/hero.png"
  alt="Dashboard"
  width={1200}
  height={630}
  priority // Above the fold
/>

// ✅ CORRECT: Lazy load below-the-fold images
<Image
  src="/feature.png"
  alt="Feature"
  width={800}
  height={400}
  loading="lazy"
/>

// ✅ CORRECT: Virtualized list
import { VirtualList } from 'virtua'

<VirtualList>
  {items.map(item => (
    <TransactionRow key={item.id} data={item} />
  ))}
</VirtualList>
```

---

## 🎨 Design

**MUST:**
- ✅ Accessible charts (color-blind-friendly palettes)
- ✅ Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- ✅ Increase contrast on `:hover/:active/:focus`

**SHOULD:**
- 💡 Layered shadows (ambient + direct)
- 💡 Crisp edges via semi-transparent borders + shadows
- 💡 Nested radii: child ≤ parent; concentric
- 💡 Hue consistency: tint borders/shadows/text toward bg hue
- 💡 Match browser UI to bg
- 💡 Avoid gradient banding (use masks when needed)

**Example:**
```css
/* ✅ CORRECT: Layered shadows (pixel art variation) */
.card {
  box-shadow:
    0 1px 2px 0 rgba(79, 70, 229, 0.05), /* ambient */
    4px 4px 0 0 rgba(79, 70, 229, 0.2);  /* direct (pixel art) */
}

/* ✅ CORRECT: Nested border radius */
.parent {
  border-radius: 12px;
  padding: 8px;
}

.child {
  border-radius: 8px; /* 12px - 8px/2 = 8px */
}

/* ✅ CORRECT: Increased contrast on hover */
.button {
  background: var(--brand);
  color: var(--surface);
}

.button:hover {
  background: var(--brand-600); /* darker = more contrast */
}
```

---

## 🔍 Pixel Art Specific Rules (PattPay)

**MUST:**
- ✅ Use `image-rendering: pixelated` for pixel art assets
- ✅ 4px solid borders (no rounded corners on pixel art elements)
- ✅ Pixel-perfect shadows: `shadow-[4px_4px_0_0_rgba(79,70,229,0.2)]`
- ✅ Sharp edges, no blur effects on pixel art components

**SHOULD:**
- 💡 Corner pixel decorations for visual interest
- 💡 Pixel art separators (2px solid lines)
- 💡 Geometric shapes over organic curves

**Example:**
```tsx
// ✅ CORRECT: Pixel art image
<Image
  src="/icons/wallet-pixel.png"
  alt="Wallet"
  width={24}
  height={24}
  className="pixelated"
  style={{ imageRendering: 'pixelated' }}
/>

// ✅ CORRECT: Pixel art card
<div className="border-4 border-brand shadow-[4px_4px_0_0_rgba(79,70,229,0.2)]">
  {/* Corner decorations */}
  <div className="absolute top-0 right-0 w-2 h-2 bg-brand" />
  <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent" />

  {/* Content */}
  <h3 className="font-display">Title</h3>
  <div className="h-[2px] w-12 bg-brand" /> {/* pixel separator */}
</div>
```

---

## ✅ Pre-Commit Checklist

Before committing any frontend code, verify:

### Accessibility
- [ ] Full keyboard navigation works
- [ ] Visible focus indicators on all interactive elements
- [ ] Screen reader friendly (proper ARIA labels, semantic HTML)
- [ ] Color contrast meets APCA/WCAG standards
- [ ] Works with reduced motion preference

### Performance
- [ ] No unnecessary re-renders
- [ ] Images have explicit dimensions or reserved space
- [ ] Large lists are virtualized
- [ ] No layout shifts (CLS = 0)

### Interactions
- [ ] Hit targets ≥24px (mobile ≥44px)
- [ ] Forms allow paste, don't block typing
- [ ] Loading states show spinner
- [ ] Destructive actions require confirmation
- [ ] Links use `<Link>`, not buttons with onClick

### Content
- [ ] Empty states designed
- [ ] Error states handled
- [ ] Locale-aware formatting
- [ ] Ellipsis character (`…`) used correctly
- [ ] Non-breaking spaces for compound terms

### Design
- [ ] Matches pixel art design system
- [ ] Proper focus states with increased contrast
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Mobile responsive (tested at 375px, 768px, 1024px, 1440px+)

---

## 📚 Resources

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [APCA Contrast Calculator](https://apcacontrast.com/)
- [nuqs - URL State Management](https://nuqs.dev)
- [React Scan - Performance](https://github.com/aidenybai/react-scan)
- [Virtua - Virtualized Lists](https://github.com/inokawa/virtua)

---

**Remember:** These are not suggestions—they are requirements for building a production-quality, accessible, performant frontend. Follow them rigorously.
