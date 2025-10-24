# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for **PattPay — The Future of Recurring Payments on Solana**, built with Next.js 15 using the App Router. The frontend is part of a larger monorepo that includes `backend` and `crypto` components at the parent directory level.

### About PattPay

PattPay is a Web3 payment gateway built natively on the Solana network, designed for subscriptions and recurring on-chain payments. It enables businesses, creators, and platforms to automate payment flows quickly, cheaply, and securely using programmable smart contracts.

No banks, no intermediaries — just direct transactions between wallets.

#### How It Works

With PattPay, setting up a recurring payment is as simple as authorizing a single transaction. After authorization, Solana smart contracts automatically execute transfers at defined intervals — whether monthly, weekly, or on-demand.

This means:
- **No billing backend needed**: Smart contracts handle everything
- **No manual failure risk**: Automated execution removes human error
- **No intermediary controlling funds**: Users maintain full wallet control

Everything happens on-chain, with total transparency, auditability, and near-zero fees — leveraging Solana's unmatched performance.

#### Why Solana

The choice of Solana is strategic: with high speed (65,000 TPS) and transaction costs below one cent, it is the ideal infrastructure for automated and recurring payments at global scale.

PattPay leverages the Solana ecosystem advantages to deliver:
- **Instant payments** (<1 second)
- **Extremely low costs** (fractions of a penny)
- **Native integrations** with wallets like Solflare and Backpack
- **On-chain stability and security** via auditable contracts

#### Our Proposition

> "PattPay is Solana's subscription gateway — simple, transparent, and automated."

Instead of relying on centralized APIs like Stripe or PayPal, PattPay executes billing, collection, and settlement directly on the blockchain. It provides the foundation for any Web3 business — from SaaS to creative platforms — to charge and receive subscriptions automatically, with near-zero cost and total security.

#### Transparency & Security

Each payment is recorded and validated on-chain, which guarantees:
- **Immutability**: Nothing can be changed after execution
- **Autonomy**: Users maintain full control over their wallets
- **Auditability**: All payment history is public and verifiable

There are no intermediaries, custodians, or banks — just open-source code and audited smart contracts.

#### The Vision

PattPay is the infrastructure that brings the automated subscription model to the Web3 universe — a bridge between the traditional financial world and Solana's decentralized ecosystem.

> "Set it once. Let the blockchain do the rest."

Continuous, fast, reliable, and frictionless payments — this is the experience that defines PattPay.

**Core Value Proposition:**
- **Automatic on-chain payments**: Set it once, and the smart contract handles the rest
- **Decentralized subscriptions**: No banks, no abusive fees, no blocking risk
- **For Web3 creators and businesses**: Receive payments predictably, transparently, and globally
- **Built on Solana**: High performance, low fees, and a growing ecosystem

### Brand Identity — "The Pixel Finance City"

The visual universe of PattPay is designed to materialize the digital economy in pixel art — a balance between aesthetic nostalgia and futuristic technology. The interface and branding reflect a minimalist, clean, and modular world, where each element is a block of the DeFi ecosystem.

**Design Concepts:**
- **Isometric Pixel Art**: Represents the on-chain world as a living, organized city
- **Cool, elegant palette**: Off-white background (#E5DEF6), primary blue (#4F46E5), secondary blue (#818CF8), golden accent (#F2B94B)
- **Diffuse lighting and simple volumetry**: Creates a sense of serenity and control
- **Minimalist characters**: Humanize the ecosystem, representing users and developers

**Brand Tone:** Minimalist, transparent, and confident — like a bridge between the human and the blockchain. PattPay's design doesn't shout technology, it translates it into clarity. Each element exists to reinforce the idea of trust and automation — the user feels they're inside a cohesive ecosystem, where everything flows naturally.

## Technology Stack

- **Framework**: Next.js 15.5.5 with App Router
- **React**: 19.1.0
- **TypeScript**: 5.x with strict mode enabled
- **Styling**: TailwindCSS v4 with PostCSS
- **Build Tool**: Turbopack (enabled for dev and build)
- **Package Manager**: pnpm (lock file present)
- **Fonts**: DM Mono and Press Start 2P from Google Fonts
- **Data Fetching**: TanStack Query (React Query) - **REQUIRED for ALL API calls**
- **State Management**: Zustand - **ONLY for local/UI state, NOT for API calls**

## Development Commands

### Running the Application
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Package Management
Always use `pnpm` for installing dependencies:
```bash
pnpm install          # Install dependencies
pnpm add <package>    # Add a new dependency
```

## Architecture

### App Structure
- **Next.js App Router**: Uses the `app/` directory structure (Next.js 13+ convention)
- **Root Layout**: Located at `app/layout.tsx` - defines the global HTML structure and includes font configuration
- **Global Styles**: `app/globals.css` contains TailwindCSS directives and global CSS
- **Path Aliases**: `@/*` maps to the root directory (configured in `tsconfig.json`)

### Data Fetching & State Management Rules

**CRITICAL: TanStack Query is REQUIRED for ALL API interactions**

1. **TanStack Query (React Query)** - Use for ALL server state:
   - ✅ **Mutations**: `useMutation` for POST/PUT/DELETE operations (signin, signup, create, update, delete)
   - ✅ **Queries**: `useQuery` for GET operations (fetching user data, lists, details)
   - ✅ **Benefits**: Automatic caching, background refetching, optimistic updates, request deduplication
   - ✅ **Pattern**: Create custom hooks in `lib/hooks/` that wrap TanStack Query hooks

2. **Zustand** - Use ONLY for complex client/UI state:
   - ✅ **Local UI state**: modals open/closed, filters, sidebar state, UI preferences
   - ✅ **When to use**: Multi-component state that needs global access and updates
   - ❌ **NEVER use for API calls**: API logic belongs in TanStack Query, not Zustand
   - ❌ **Don't use for simple state**: Use React useState for component-local state

3. **localStorage** - Use for simple persistence:
   - ✅ **Tokens**: JWT tokens, API keys
   - ✅ **Simple preferences**: Theme, language, last visited page
   - ✅ **Pattern**: Create utility functions in `lib/utils/` (e.g., `TokenStorage`)

4. **Code Organization**:
   ```
   lib/
   ├── api/              # Pure API functions (fetch calls)
   │   └── auth.ts       # authApi.signin(), authApi.signup(), etc.
   ├── hooks/            # Custom hooks using TanStack Query
   │   ├── useAuth.ts    # Main auth hook (TanStack Query + localStorage)
   │   ├── useAuthMutations.ts  # useMutation hooks for signin/signup
   │   └── useAuthQuery.ts      # useQuery hooks for getMe
   ├── stores/           # Zustand stores (complex UI state only)
   │   └── filter-store.ts # Example: filters with multiple fields
   ├── utils/            # Utility functions
   │   ├── token.ts      # Token storage (localStorage wrapper)
   │   └── validation.ts # Zod schemas
   └── providers/        # React context providers
       └── query-provider.tsx  # QueryClientProvider wrapper
   ```

5. **Example Patterns**:
   ```typescript
   // ✅ CORRECT - API layer
   // lib/api/auth.ts - Pure API function
   export const authApi = {
     signin: async (data) => fetch(...).then(r => r.json())
   }

   // ✅ CORRECT - Token storage
   // lib/utils/token.ts
   export const TokenStorage = {
     get: () => localStorage.getItem('token'),
     set: (token) => localStorage.setItem('token', token),
     remove: () => localStorage.removeItem('token')
   }

   // ✅ CORRECT - TanStack Query hook
   // lib/hooks/useAuthMutations.ts
   export const useSignin = () => {
     return useMutation({
       mutationFn: authApi.signin,
       onSuccess: (data) => TokenStorage.set(data.token)
     })
   }

   // ✅ CORRECT - Zustand for complex UI state
   // lib/stores/filter-store.ts
   export const useFilterStore = create((set) => ({
     filters: { status: 'all', date: null, category: [] },
     setFilter: (key, value) => set((state) => ({
       filters: { ...state.filters, [key]: value }
     }))
   }))

   // ❌ WRONG - Never do this
   // lib/stores/auth-store.ts
   signin: async (email, password) => {
     const response = await fetch(...) // ❌ No API calls in Zustand!
   }
   ```

### Brand Assets
- **Logo**: `public/logo.svg` - Official pattpay logo (icon only)
- **Logo with Text**: `public/logo-text.svg` - Logo with "pattpay" text beside it
- The icon logo is configured as the favicon in `app/layout.tsx`

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- Path alias `@/*` points to project root

### ESLint Configuration
- Uses Next.js recommended TypeScript and core-web-vitals configs
- Configuration uses ESM format (`.mjs`) with FlatCompat for compatibility
- Ignores: node_modules, .next, out, build directories

## Design System

The project has a defined design system using CSS custom properties and TailwindCSS v4. All design tokens are declared in `app/globals.css`.

### Color Palette
- **Base layers**: `bg-background` (#E5DEF6 - lavender tone for "Pixel Finance City"), `bg-surface` (#fafafb)
- **Borders**: `border-border` (#e4e7ec)
- **Text**: `text-foreground` (#111827), `text-muted` (#6b7280)
- **Brand colors**: `text-brand` / `bg-brand` (#4f46e5 - primary blue symbolizing technology and stability), `bg-brand-600`, `bg-brand-500`, `bg-brand-300` (#818CF8 - secondary blue for lightness and dynamism)
- **Accent**: `bg-accent` (#F2B94B - golden accent highlighting energy and value)
- **Focus states**: `ring-ring` (#818cf8)
- **Status colors**: `bg-success` (#10b981), `bg-warning` (#f59e0b), `bg-error` (#ef4444)

### Typography System
- **Headings (h1-h4)**: Use Press Start 2P via `font-display` — retro-tech aesthetic with strong identity for branding and titles
- **UI/Body text**: Use DM Mono via `font-sans` or `font-mono` — precision, readability, and neutrality for interface elements
- **Font variables**:
  - DM Mono: weights 300, 400, 500 (variable: `--font-dm-mono`)
  - Press Start 2P: weight 400 (variable: `--font-press-start`)

**Typography Guidelines:**
- Titles and branding should use Press Start 2P to establish the retro-tech identity
- Body copy and UI elements should use DM Mono for clarity and modern feel
- Maintain proper spacing (8px grid system) for modular, organized layouts

### Type Scale
Use predefined text sizes to stay aligned with the CSS variable-powered steps:
- `text-sm`: 0.875rem (--step--1)
- `text-base`: 1rem (--step-0)
- `text-lg`: 1.125rem (--step-1)
- `text-xl`: 1.25rem (--step-2)
- `text-2xl`: 1.5rem (--step-3)
- `text-3xl`: 2rem (--step-4)
- `text-4xl`: 2.5rem (--step-5)

### Design Conventions
When building components:
1. Use semantic color tokens (`bg-background`, `text-foreground`) instead of hardcoded colors
2. Apply `font-display` (Press Start 2P) for headings/branding and `font-sans`/`font-mono` (DM Mono) for body text
3. Use the predefined type scale for consistent typography
4. Leverage brand colors (`bg-brand-300`, `text-brand`) for interactive elements
5. Apply status colors (`bg-success`, `bg-warning`, `bg-error`) for messaging
6. Follow 8px grid system for modular, organized layouts
7. Use smooth micro-animations based on recurring loops (symbolizing automatic payments)
8. Maintain minimalist, clean UI inspired by Phantom + Linear design philosophy
9. Hero imagery should reflect "The Pixel Finance City" concept — isometric pixel art representing the DeFi ecosystem

## Visual Style Guide — PattPay (Pixel Finance City)

### Design Essence

The PattPay visual style is modern pixel art with minimalist aesthetics — combining nostalgic 8-bit charm with a technological, smooth, and contemporary look. The goal is to convey innovation, accessibility, and trust, as if users are exploring a living, organized digital DeFi city.

### Fundamental Principles

| Element | Guideline |
|---------|-----------|
| Style | Modern isometric pixel art (30° angle) — clean geometry consistent with grid |
| Theme | Futuristic technological city (DeFi City) with calm and connected feel |
| Form | Simplified blocks and buildings, clean edges, volumes suggested with soft shadows |
| Texture | Smooth and uniform — no dithering, no noise, no black outlines |
| Lighting | Diffuse, soft (simulates overcast morning); emphasis by tone, not contrast |
| Proportion | Small characters (1/3 of height = head), large structured buildings |
| Atmosphere | Calm, technical and welcoming; should feel like a "living" and "organized" ecosystem |

### Color Palette (Tailwind Tokens)

| Usage | Color | Suggested Token |
|-------|-------|-----------------|
| Background | #F5F6F7 | bg-surface |
| Internal surfaces | #FAFAFB | bg-base |
| Main text / Details | #111827 | text-fg |
| Primary (brand) | #4F46E5 | brand |
| Secondary (highlight) | #818CF8 | brand-300 |
| Accent / Coins / Lights | #F2B94B | accent |
| Soft gradients | linear(from-[#F5F6F7], to-[#E8E9FB]) | bg-gradient-to-b from-bg to-surface |

**Notes:**
- Prefer cool lavender tones with low saturation
- Avoid extreme contrasts
- Background should always feel ethereal and illuminated, never opaque

### Visual Components

#### Buildings & Structures
- Isometric blocks with light bevels and solid base
- Use two tone bands (main and shadow)
- No black outlines — delimitation by tonal contrast
- Bottom-side shading with #4F46E5 → #818CF8

#### Characters
- Small body (3:1 head/body ratio)
- Soft colors, always within palette (blueish and lilac clothing)
- Common actions: typing, watching screen, connecting cables
- Use `image-rendering: pixelated` to maintain visual fidelity

#### Icons & System Elements
- Created in vectorized or 1x raster pixel art
- Standard icons: ⚙️ gear, 🔗 bridge, 💡 bulb, 🔒 lock
- Colors:
  - Connection lines → translucent white (rgba(255,255,255,0.5))
  - Coins / value flow → golden #F2B94B
  - Technical background → lavender #E0E3FF

#### Backgrounds & Layers
Use soft layers for depth:
- Top layer: light tones (#FAFAFB)
- Middle layer: medium lavender (#E0E3FF)
- Bottom layer: cool blue (#C7CBF7)
- Light vignette at edges (`box-shadow: inset 0 0 80px rgba(0,0,0,0.05)`)

### Frontend Guidelines (Tailwind + React)

```js
/* tailwind.config.js — main tokens */
theme: {
  extend: {
    colors: {
      bg: "#F5F6F7",
      surface: "#FAFAFB",
      fg: "#111827",
      brand: "#4F46E5",
      "brand-300": "#818CF8",
      accent: "#F2B94B",
    },
    fontFamily: {
      display: ['"Press Start 2P"', 'monospace'],
      sans: ['"DM Mono"', 'monospace'],
    },
    imageRendering: {
      pixelated: 'pixelated',
    },
  },
}

/* example for displaying pixel art images */
<img
  src="/assets/pixel/building.png"
  className="w-64 image-pixelated drop-shadow-[0_2px_0_#818CF8]"
  style={{ imageRendering: 'pixelated' }}
/>
```

### Recommended Micro-interactions

| Interaction | Description | Implementation |
|-------------|-------------|----------------|
| Hover pixel bounce | Characters or buildings "pulse" 1px on mouse hover | `hover:translate-y-[-1px] transition-all` |
| Flow animation | Transaction lines blink in sequence (infinite loop) | `animate-[flow_2s_linear_infinite]` |
| Glint effect | Light sweeping main building (dynamic relief) | `mask-image: linear-gradient() + CSS keyframe` |
| Scroll fade | Hero → "Layers" section smoothly decreases background tone | `bg-gradient-to-b with Tailwind animation` |

### Quick Summary for Developers

- Use isometry, cool colors, pixelated grid
- Always `image-rendering: pixelated`
- No hard shadows, black outlines or dithering
- Think of vertical movement as narrative (city "grows" upward and "deepens" downward)
- Use reusable components (`<PixelBuilding />`, `<PixelCharacter />`, `<PixelIcon />`) for modularity

### Turbopack
Both dev and build scripts use the `--turbopack` flag. This is the faster Rust-based bundler replacing Webpack in Next.js.

## Monorepo Context

This frontend is part of a larger pattpay project. Related directories at the parent level:
- `../backend` - Backend service
- `../crypto` - Crypto-related functionality
- `../.github/pull_request_template.md` - PR template used across the monorepo

When working across services, be aware of this directory structure.

## Pull Request Guidelines

The monorepo uses a structured PR template (located at `../.github/pull_request_template.md`) that requires:
- Overview with title, status (🟢 Ready / 🟡 In Progress / 🔴 On Hold), and branch info
- Type of change selection (bug fix, feature, performance, refactoring, etc.)

When creating PRs, follow this template structure.
