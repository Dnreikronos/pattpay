# 🎨 PattPay Frontend

Modern Next.js 15 application with React 19, featuring the unique **"Pixel Finance City"** design language for Web3 subscription payments on Solana.

![Frontend Stack](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or 20+
- **pnpm** (recommended) or npm
- Backend API running on port 3001 (see [backend README](../backend/README.md))

### Installation

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Open browser
# http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## 📦 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 15.5.5 |
| **React** | UI library | 19.1.0 |
| **TypeScript** | Type safety | 5.x |
| **TailwindCSS** | Styling (v4) | 4.x |
| **Turbopack** | Fast bundler (dev & build) | Built-in |
| **TanStack Query** | Server state management | 5.90.5 |
| **Zustand** | Client/UI state | 5.0.8 |
| **React Hook Form** | Form handling | 7.65.0 |
| **Zod** | Schema validation | 4.1.12 |
| **Solana Web3.js** | Blockchain integration | 1.98.4 |
| **Anchor** | Smart contract interaction | 0.32.1 |

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages (grouped route)
│   │   ├── login/
│   │   └── register/
│   ├── (checkout)/              # Public checkout (grouped route)
│   │   └── [planId]/
│   ├── (home)/                  # Landing page (grouped route)
│   │   └── page.tsx
│   ├── dashboard/               # Merchant dashboard (protected)
│   │   ├── links/
│   │   ├── payments/
│   │   ├── subscriptions/
│   │   └── settings/
│   ├── payment/                 # Payment success/failure pages
│   │   ├── success/
│   │   └── failure/
│   ├── api/                     # API routes (proxy to backend)
│   ├── globals.css              # Global styles + design tokens
│   ├── layout.tsx               # Root layout with fonts
│   └── not-found.tsx            # 404 page
│
├── components/                   # React components
│   ├── ui/                      # Base UI components (shadcn-like)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── shared/                  # Shared business components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── wallet-button.tsx
│   │   └── filters/
│   └── dashboard/               # Dashboard-specific components
│       ├── stats-card.tsx
│       ├── payment-table.tsx
│       └── ...
│
├── lib/                         # Core utilities
│   ├── api/                    # API client functions
│   │   ├── auth.ts             # Auth API calls
│   │   ├── links.ts            # Payment links API
│   │   └── payments.ts         # Payments API
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # TanStack Query auth hook
│   │   ├── useAuthMutations.ts # Signin/signup mutations
│   │   └── useLinks.ts         # Payment links queries
│   ├── stores/                 # Zustand stores (UI state only)
│   │   └── filter-store.ts     # Dashboard filters
│   ├── utils/                  # Utility functions
│   │   ├── token.ts            # localStorage token management
│   │   ├── validation.ts       # Zod schemas
│   │   └── solana.ts           # Solana helpers
│   └── providers/              # React context providers
│       └── query-provider.tsx  # TanStack Query provider
│
├── public/                      # Static assets
│   ├── logo.svg                # PattPay icon logo
│   └── logo-text.svg           # Logo with text
│
├── .eslintrc.mjs               # ESLint config
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # TailwindCSS config (v4)
├── postcss.config.mjs          # PostCSS config
└── package.json                # Dependencies
```

## 🎨 Design System

### The Pixel Finance City

PattPay's visual identity represents the digital economy as a living, organized pixel art city - blending retro aesthetics with futuristic technology.

#### Color Palette

```css
/* Base Layers */
--background: #E5DEF6;     /* Lavender - serene off-white */
--surface: #fafafb;        /* Pure white surfaces */

/* Brand Colors */
--brand: #4F46E5;          /* Primary indigo - technology & stability */
--brand-300: #818CF8;      /* Secondary blue - lightness & dynamism */
--brand-500: #6366f1;
--brand-600: #4f46e5;

/* Accent */
--accent: #F2B94B;         /* Golden - energy & value */

/* Text */
--foreground: #111827;     /* Dark gray - primary text */
--muted: #6b7280;          /* Gray - secondary text */

/* Borders */
--border: #e4e7ec;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

#### Typography

```typescript
// Headings & Branding - Press Start 2P (retro-tech aesthetic)
<h1 className="font-display text-4xl tracking-display leading-tight">
  PattPay
</h1>

// UI & Body Text - DM Mono (precision & clarity)
<p className="font-sans text-base leading-normal">
  Interface text with modern monospace feel
</p>
```

**Font Variables:**
- `--font-press-start` → Press Start 2P (weight 400)
- `--font-dm-mono` → DM Mono (weights 300, 400, 500)

**Type Scale:**
- `text-sm`: 0.875rem (--step--1)
- `text-base`: 1rem (--step-0)
- `text-lg`: 1.125rem (--step-1)
- `text-xl`: 1.25rem (--step-2)
- `text-2xl`: 1.5rem (--step-3)
- `text-3xl`: 2rem (--step-4)
- `text-4xl`: 2.5rem (--step-5)

### Design Conventions

**✅ DO:**
- Use semantic tokens (`bg-background`, `text-foreground`)
- Apply `font-display` for headings, `font-sans` for body
- Follow 8px grid system for spacing
- Use smooth micro-animations (recurring loops theme)
- Maintain minimalist, clean UI (Phantom + Linear inspired)
- Isometric pixel art for hero imagery

**❌ DON'T:**
- Hardcode color values (use CSS variables)
- Mix font families inconsistently
- Use aggressive animations
- Add unnecessary visual noise

## 🔐 Authentication System

PattPay supports **dual authentication**:

### 1. Email/Password (Traditional)

```typescript
// Sign up
POST /api/auth/register
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Sign in
POST /api/auth/login
{
  "authMethod": "email_password",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 2. Solana Wallet (SIWS Standard)

```typescript
// Get sign-in data
POST /api/auth/solana-signin-data
{ "walletAddress": "9WzDXwBb..." }

// Verify signature
POST /api/auth/solana-verify
{
  "signInData": { ... },
  "signInOutput": { signature, account },
  "name": "John Doe"
}
```

## 📡 Data Fetching Architecture

**CRITICAL RULE: TanStack Query for ALL server state**

### ✅ TanStack Query (React Query)

Use for ALL API interactions:

```typescript
// lib/hooks/useAuthMutations.ts
export const useSignin = () => {
  return useMutation({
    mutationFn: authApi.signin,
    onSuccess: (data) => TokenStorage.set(data.token)
  });
};

// lib/hooks/useLinks.ts
export const useLinks = (filters: LinkFilters) => {
  return useQuery({
    queryKey: ['links', filters],
    queryFn: () => linksApi.list(filters)
  });
};

// Usage in components
const { mutate: signin } = useSignin();
const { data: links, isLoading } = useLinks({ status: 'active' });
```

### ✅ Zustand

Use ONLY for complex UI state:

```typescript
// lib/stores/filter-store.ts
export const useFilterStore = create((set) => ({
  filters: { status: 'all', date: null },
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  }))
}));

// Usage
const { filters, setFilter } = useFilterStore();
```

### ❌ Never Do This

```typescript
// ❌ WRONG - API calls in Zustand
const useAuthStore = create((set) => ({
  signin: async (email, password) => {
    const response = await fetch(...); // NO!
  }
}));

// ❌ WRONG - Direct fetch in components without TanStack Query
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/links').then(r => r.json()).then(setData); // NO!
}, []);
```

## 🔗 API Integration

### Configuration

```typescript
// lib/api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### API Layer Structure

```typescript
// lib/api/auth.ts - Pure API functions
export const authApi = {
  signin: async (data: SigninData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// lib/hooks/useAuthMutations.ts - TanStack Query wrapper
export const useSignin = () => {
  return useMutation({
    mutationFn: authApi.signin,
    onSuccess: (data) => TokenStorage.set(data.token)
  });
};

// Component usage
const SigninForm = () => {
  const { mutate: signin, isPending } = useSignin();

  const handleSubmit = (data: SigninData) => {
    signin(data, {
      onSuccess: () => router.push('/dashboard'),
      onError: (error) => toast.error(error.message)
    });
  };
};
```

## 💳 Payment Integration

### Recurring Subscriptions

```typescript
// 1. Approve delegation on Solana
const { signature, delegateAuthority } = await approve_delegate({
  subscriptionId: uuidv4(),
  approvedAmount: totalAmount,
  payer: walletAddress,
  receiver: planReceiverWallet,
  tokenMint: selectedToken.mint
});

// 2. Create subscription via API
await fetch('/api/subscribe', {
  method: 'POST',
  body: JSON.stringify({
    payer: { walletAddress, name, email },
    planId,
    tokenMint,
    delegateTxSignature: signature,
    delegateAuthority: delegateAuthority.toString(),
    delegateApprovedAt: new Date().toISOString()
  })
});
```

### One-Time Payments

```typescript
// 1. Send payment on-chain
const signature = await transferTokens({
  from: walletAddress,
  to: merchantWallet,
  amount: planAmount,
  tokenMint: selectedToken.mint
});

// 2. Record in backend
await fetch('/api/payment-executions', {
  method: 'POST',
  body: JSON.stringify({
    planId,
    txSignature: signature,
    tokenMint,
    amount,
    executedBy: walletAddress.toString()
  })
});
```

## 🧪 Environment Variables

Create `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Solana network
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🛠️ Development

### Local Development

```bash
# Start with Turbopack (fast HMR)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Code Quality

```bash
# TypeScript check
tsc --noEmit

# Format code
prettier --write "**/*.{ts,tsx,css,md}"

# Lint and fix
eslint . --fix
```

## 🌐 Routing

Next.js 15 App Router with grouped routes:

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing page | Public |
| `/(auth)/login` | Login page | Public |
| `/(auth)/register` | Register page | Public |
| `/(checkout)/[planId]` | Public checkout | Public |
| `/dashboard` | Main dashboard | Protected |
| `/dashboard/links` | Payment links | Protected |
| `/dashboard/payments` | Payment history | Protected |
| `/dashboard/subscriptions` | Subscriptions | Protected |
| `/payment/success` | Success page | Public |
| `/payment/failure` | Failure page | Public |

## 📱 Responsive Design

PattPay is fully responsive:

- **Mobile First** - Base styles for mobile (320px+)
- **Tablet** - `md:` breakpoint (768px+)
- **Desktop** - `lg:` breakpoint (1024px+)
- **Wide** - `xl:` breakpoint (1280px+)

```tsx
<div className="
  flex flex-col         /* mobile: stack vertically */
  md:flex-row          /* tablet: horizontal layout */
  lg:gap-8             /* desktop: larger spacing */
">
  {/* Content */}
</div>
```

## 🎯 Best Practices

### Component Guidelines

```typescript
// ✅ GOOD - Typed, reusable, single responsibility
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  return <button className={cn(baseStyles, variantStyles[variant])} {...props} />;
};

// ❌ BAD - Untyped, mixed concerns, hardcoded styles
export const Button = (props: any) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => { /* API call */ }; // Should be in parent
  return <button style={{ background: 'blue' }} {...props} />; // No Tailwind
};
```

### State Management

```typescript
// ✅ GOOD - TanStack Query for server state
const { data: links } = useQuery({
  queryKey: ['links', filters],
  queryFn: () => api.getLinks(filters)
});

// ✅ GOOD - Zustand for complex UI state
const { filters, setFilter } = useFilterStore();

// ✅ GOOD - React useState for local state
const [isOpen, setIsOpen] = useState(false);

// ❌ BAD - Mixing concerns
const [links, setLinks] = useState([]); // Server state in useState
```

## 📚 Related Documentation

- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - API documentation
- [Crypto README](../crypto/README.md) - Smart contracts
- [PAYMENT_FLOWS.md](../PAYMENT_FLOWS.md) - Payment integration guide
- [API_ENDPOINTS.md](../API_ENDPOINTS.md) - Complete API reference
- [CLAUDE.md](./CLAUDE.md) - Guidance for Claude Code

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Production
vercel --prod
```

### Environment Variables on Vercel

Add in project settings:
- `NEXT_PUBLIC_API_URL` → Your backend URL
- `NEXT_PUBLIC_SOLANA_NETWORK` → mainnet / devnet

## 🤝 Contributing

When working on the frontend:
1. Follow TypeScript strict mode
2. Use TanStack Query for ALL API calls
3. Maintain design system tokens
4. Write semantic HTML
5. Test on mobile + desktop
6. Update this README when adding features

---

**Built with Next.js 15 + React 19 + TailwindCSS v4**
