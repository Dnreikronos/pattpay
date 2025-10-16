# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for **PattPay — The Future of Recurring Payments on Solana**, built with Next.js 15 using the App Router. The frontend is part of a larger monorepo that includes `backend` and `crypto` components at the parent directory level.

### About PattPay

PattPay is an on-chain subscription and recurring payment platform built on the Solana ecosystem. Our mission is to automate payments between individuals, creators, and Web3 businesses, eliminating intermediaries and reducing costs — all with blockchain transparency, speed, and security.

At PattPay, each transaction is a piece within an open and connected financial system, where smart contracts manage recurring flows, enabling new forms of monetization and engagement in the decentralized world.

**Value Proposition:**
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
