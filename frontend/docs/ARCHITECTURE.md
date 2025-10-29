# PattPay Dashboard - Technical Architecture

**Document:** Technical Architecture & Stack
**Last Update:** 2025-10-18

---

## 🏗️ Technology Stack

| Technology | Purpose | Version | Status |
|------------|---------|---------|--------|
| **Next.js** | React framework | 15.5.5 | ✅ Installed |
| **React** | UI library | 19.1.0 | ✅ Installed |
| **TypeScript** | Type safety | 5.x | ✅ Configured |
| **TailwindCSS** | Styling | v4 | ✅ Configured |
| **Framer Motion** | Animations | Latest | ✅ Installed |
| **Shadcn/UI** | Component library | Latest | ✅ Configured |
| **MSW** | Mock API | Latest | 🟡 To install |
| **React Hook Form** | Form management | Latest | 🟡 To install |
| **Zod** | Schema validation | Latest | 🟡 To install |
| **Recharts** | Charts/graphs | Latest | 🟡 To install |

---

## 📐 Architectural Decisions

### 1. Authentication Strategy

**Decision**: Mock authentication via Context API

**Rationale**:
- Fast development without backend dependency
- Easy to swap for real auth later
- Simulates realistic user flows
- Persists with localStorage

**Implementation**:
- `AuthContext` with mock user data
- Route protection via layout middleware
- Simulated 500ms login delay

**Future**: Replace with Solana Wallet Adapter

---

### 2. Data Management

**Decision**: Mock Service Worker (MSW) for API simulation

**Rationale**:
- Develop frontend independently
- Test edge cases easily
- No backend bottleneck
- Realistic API simulation

**Implementation**:
- MSW handlers for all endpoints
- Mock data in `mocks/data.ts`
- Enabled only in development

**Future**: Connect to real backend API

---

### 3. Layout Architecture

**Decision**: Responsive sidebar with collapse on mobile

**Rationale**:
- Standard dashboard pattern
- Good for navigation-heavy apps
- Familiar to users
- Space-efficient

**Implementation**:
- Sidebar component with mobile toggle
- App Router layout system
- Sticky positioning
- Animated transitions

**Alternative Considered**: Top navbar (rejected - less space for content)

---

### 4. State Management

**Decision**: React Context + native hooks (no Redux/Zustand initially)

**Rationale**:
- Simpler architecture
- Less boilerplate
- Sufficient for MVP scope
- Easy to upgrade later if needed

**Implementation**:
- AuthContext for user state
- Local state with useState/useReducer
- Server state with SWR/React Query (future)

**When to add Redux**: If state becomes complex (>5 contexts, prop drilling >3 levels)

---

### 5. Routing

**Decision**: Next.js App Router with file-based routing

**Rationale**:
- Modern Next.js standard
- Server components by default
- Nested layouts
- Built-in loading/error states

**Structure**:
```
app/
├── dashboard/
│   ├── layout.tsx (sidebar + auth)
│   ├── page.tsx (home)
│   ├── transactions/
│   └── links/
```

---

### 6. Component Strategy

**Decision**: Shadcn/UI as base, customized with pixel art styling

**Rationale**:
- Don't reinvent the wheel
- Accessible components
- Full control (copy-paste, not npm package)
- Customizable with Tailwind

**Process**:
1. Check Shadcn/UI first
2. Add via CLI
3. Customize with brand styling
4. Document changes

**Alternative Considered**: Build from scratch (rejected - too slow)

---

### 7. Design System

**Decision**: CSS variables + Tailwind v4 for design tokens

**Rationale**:
- Centralized theme management
- Easy to update globally
- Dark mode ready
- Type-safe with Tailwind

**Implementation**:
```css
:root {
  --brand: #4f46e5;
  --brand-300: #818cf8;
  --accent: #F2B94B;
  /* ... */
}
```

---

## 🔌 API Architecture

### Endpoints (MSW Mock)

```
GET  /api/stats                  → Dashboard statistics
GET  /api/transactions           → List transactions
GET  /api/transactions/:id       → Transaction details
GET  /api/links                  → List payment links
POST /api/links                  → Create link
PATCH /api/links/:id             → Update link
DELETE /api/links/:id            → Delete link
GET  /api/activity?period=30d    → Activity chart data
```

### Request/Response Format

**Standard Response**:
```typescript
{
  data: T | T[]
  error?: string
  meta?: {
    total: number
    page: number
    perPage: number
  }
}
```

**Error Response**:
```typescript
{
  error: string
  code: string // e.g., "NOT_FOUND"
  details?: Record<string, any>
}
```

---

## 📦 Code Organization

### Directory Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── dashboard/                 # Dashboard section
│   │   ├── layout.tsx             # Dashboard layout
│   │   ├── page.tsx               # Dashboard home
│   │   ├── _components/           # Dashboard home components
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── transactions/
│   │   │   ├── page.tsx           # Transaction list
│   │   │   ├── _components/       # Transaction list components
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   │
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Transaction details
│   │   │       └── _components/   # Transaction details components
│   │   │           ├── TransactionDetails.tsx
│   │   │           └── TransactionTimeline.tsx
│   │   │
│   │   └── links/
│   │       ├── page.tsx           # Links list
│   │       ├── _components/       # Links list components
│   │       │   ├── LinkCard.tsx
│   │       │   ├── LinkActions.tsx
│   │       │   └── QRCodeModal.tsx
│   │       │
│   │       ├── new/
│   │       │   ├── page.tsx       # Create link
│   │       │   └── _components/   # Create link components
│   │       │       ├── LinkFormWizard.tsx
│   │       │       ├── StepIndicator.tsx
│   │       │       └── LinkPreview.tsx
│   │       │
│   │       └── [id]/
│   │           └── edit/
│   │               ├── page.tsx   # Edit link
│   │               └── _components/ # Edit link components
│   │                   ├── EditLinkForm.tsx
│   │                   └── ChangeHistory.tsx
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
│
├── components/                    # Shared components
│   ├── shared/                    # Shared dashboard components (by type)
│   │   ├── layout/                # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── UserMenu.tsx
│   │   │
│   │   ├── cards/                 # Reusable card components
│   │   │   └── StatCard.tsx
│   │   │
│   │   ├── forms/                 # Reusable form components
│   │   │   └── FormField.tsx
│   │   │
│   │   └── ui/                    # UI utilities
│   │       ├── StatusBadge.tsx
│   │       ├── CopyButton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── sections/                  # Landing page sections
│   │   ├── Hero.tsx
│   │   └── FAQ.tsx
│   │
│   ├── ui/                        # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── Navbar.tsx                 # Global navbar
│   └── PixelButton.tsx            # Reusable button
│
├── contexts/                      # React contexts
│   └── AuthContext.tsx            # Mock auth
│
├── lib/                           # Utilities
│   ├── api.ts                     # API client
│   ├── hooks/                     # Custom hooks
│   └── utils/                     # Helper functions
│
├── mocks/                         # MSW mocks
│   ├── browser.ts                 # MSW setup
│   ├── handlers.ts                # Request handlers
│   └── data.ts                    # Mock data
│
├── types/                         # TypeScript types
│   ├── transaction.ts
│   ├── link.ts
│   └── user.ts
│
└── docs/                          # Documentation
    ├── README.md
    ├── ARCHITECTURE.md            # This file
    └── pages/                     # Page specs
```

---

## 🔐 Security Considerations

### Mock Phase (Current)
- No real authentication
- Data only in localStorage
- No sensitive data handling

### Production Phase (Future)
- [ ] Solana wallet signature authentication
- [ ] HTTPS only
- [ ] Content Security Policy (CSP)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Input sanitization

---

## 🚀 Performance Strategy

### Build Optimization
- [ ] Code splitting per route
- [ ] Tree shaking
- [ ] Minification
- [ ] Image optimization (Next.js Image)
- [ ] Font optimization (next/font)

### Runtime Optimization
- [ ] Lazy loading for charts (Recharts)
- [ ] Memoization (useMemo, useCallback)
- [ ] Virtual scrolling for large lists
- [ ] Debouncing search inputs
- [ ] Caching API responses (SWR)

### Metrics
- Target: LCP < 2.5s
- Target: FID < 100ms
- Target: CLS < 0.1
- Target: Lighthouse Score > 90

---

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)
- [ ] Components render correctly
- [ ] Functions return expected values
- [ ] Hooks work as intended

### Integration Tests (Playwright)
- [ ] User flows work end-to-end
- [ ] Forms submit correctly
- [ ] Navigation works
- [ ] API integration works

### Visual Regression (Chromatic)
- [ ] Components look correct
- [ ] No unintended visual changes
- [ ] Responsive layouts work

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    - Install dependencies
    - Run linter (ESLint)
    - Run type check (tsc)
    - Run unit tests
    - Run build

  deploy:
    - Build Next.js app
    - Deploy to Vercel
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring
- [ ] Vercel Analytics (built-in)
- [ ] Web Vitals tracking
- [ ] Error tracking (Sentry)

### User Analytics
- [ ] Page views
- [ ] User flows
- [ ] Conversion tracking
- [ ] Feature usage

---

## 🔮 Scalability Plan

### Current (MVP)
- Client-side rendering
- Mock API
- localStorage

### Phase 2
- Server-side rendering (SSR) for SEO
- Real backend API
- Database for persistent data

### Phase 3
- Edge caching (Vercel Edge)
- CDN for static assets
- Database read replicas

### Phase 4
- Microservices architecture
- WebSocket for real-time
- Multi-region deployment

---

## 🛠️ Development Tools

### Required
- **Node.js**: >= 18.x
- **pnpm**: >= 8.x
- **VS Code**: Recommended IDE

### VS Code Extensions
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Error Translator
- Prettier

### Browser Extensions
- React DevTools
- MSW DevTools (for debugging mocks)

---

## 📝 Environment Variables

### Development (`.env.local`)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api # MSW intercepts
NODE_ENV=development
```

### Production (`.env.production`)
```bash
NEXT_PUBLIC_APP_URL=https://app.pattpay.com
NEXT_PUBLIC_API_URL=https://api.pattpay.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NODE_ENV=production
```

---

## 🔄 Migration Path

### From Mock to Real Backend

1. **Replace MSW**:
   - Remove MSW setup
   - Update API client to use real URLs
   - Add authentication headers

2. **Update Auth**:
   - Install Solana Wallet Adapter
   - Replace AuthContext with real wallet connection
   - Add signature verification

3. **Data Fetching**:
   - Add SWR or React Query
   - Implement caching strategy
   - Add error handling

4. **Environment**:
   - Configure production env vars
   - Set up API keys
   - Configure CORS

---

## ⚡ Quick Start Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run type check
pnpm type-check
```

---

**Next:** Review [RULES.md](./RULES.md) for coding standards and conventions.
