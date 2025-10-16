# Repository Guidelines

## Project Structure & Module Organization
App Router code lives in `app/`; `layout.tsx` supplies shared chrome and route groups (e.g., `app/(billing)/page.tsx`) keep features isolated. Tailwind tokens and resets live in `app/globals.css`, static assets reside in `public/`, and root configs (`eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs`) govern linting, TypeScript, and PostCSS. Co-locate helpers with consumers and promote shared UI into `app/components/` only when duplication appears.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies and stay in sync with the lockfile.
- `pnpm dev` — run the Next.js dev server (Turbopack) at `localhost:3000`.
- `pnpm build` — produce the production bundle; run before submitting changes.
- `pnpm start` — serve the production build locally for smoke tests.
- `pnpm lint` — enforce ESLint with the Next.js core-web-vitals rules.

## Coding Style & Naming Conventions
Code in TypeScript, use PascalCase for React components and camelCase for utilities, and keep files focused on one responsibility. Indent with two spaces and run `pnpm lint -- --fix` before pushing. Tailwind utilities stay inline; `app/globals.css` is reserved for tokens and base styles.

## Design Tokens & Typography
Design tokens in `app/globals.css` back Tailwind aliases such as `bg-background`, `bg-surface`, `border-border`, `text-foreground`, and `text-muted`. Brand interactions lean on `text-brand`, `bg-brand-300`, and the shared focus `ring`; state messaging uses `*-success`, `*-warning`, and `*-error`. Headings use Press Start 2P via `font-display` plus `tracking-display` and `leading-tight`, while UI copy sticks to DM Mono through `font-sans`/`font-mono` with `leading-normal`.

## Testing Guidelines
Introduce the first suite alongside a `pnpm test` script. Prefer colocated `*.test.tsx` files with React Testing Library for components and Playwright for end-to-end flows. Keep tests deterministic, mock outbound network calls, and document required env vars at the top of each spec. Update `README.md` whenever a new testing command is added.

## Commit & Pull Request Guidelines
Follow the conventional commits pattern in history (`type: subject`, e.g., `chore: scaffold payments page`) and keep subjects under 72 characters. PRs should link issues, summarize user-facing impact, attach UI captures when visuals change, and list manual validation steps so reviewers can reproduce them quickly.
