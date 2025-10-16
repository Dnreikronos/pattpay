This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to deliver [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) for headings and [DM Mono](https://fonts.google.com/specimen/DM+Mono) for interface text.

## Design System

Tailwind consumes the design tokens declared in `app/globals.css`. Use `bg-background` and `bg-surface` for base layers, `border-border` for dividers, and `text-foreground` / `text-muted` for primary and secondary copy. Interactive moments lean on `text-brand`, `bg-brand-300`, and the shared focus `ring`; status messaging should reuse `bg-success`, `bg-warning`, or `bg-error` as needed.

Typography is fixed: headings use Press Start 2P via `font-display` with `tracking-display` and `leading-tight`, while UI copy stays on DM Mono through `font-sans` or `font-mono` with `leading-normal`. Leverage the predefined scale (`text-sm` through `text-4xl`) to stay aligned with the CSS variable-powered type steps.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
