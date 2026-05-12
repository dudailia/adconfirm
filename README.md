# AdConfirm Monorepo

pnpm + Turborepo monorepo for the AdConfirm SaaS platform.

## Structure

```
adconfirm/
├── apps/
│   ├── web/          Next.js 14 — public marketing site (port 3000)
│   ├── dashboard/    Next.js 14 — business + advertiser portals (port 3001)
│   └── backend/      Express 4 + TypeScript — REST API (port 4000)
└── packages/
    ├── db/           Supabase client, generated types, query helpers
    ├── ui/           Shared React component library (shadcn base)
    └── config/       Shared tsconfig, eslint, tailwind presets
```

## Prerequisites

- Node.js >= 20
- pnpm 9 (`npm i -g pnpm@9`)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files and fill in values
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/backend/.env.example apps/backend/.env
```

## Running apps

```bash
# All apps in parallel (recommended for development)
pnpm dev

# Individual apps
pnpm --filter @adconfirm/web dev       # http://localhost:3000
pnpm --filter @adconfirm/dashboard dev # http://localhost:3001
pnpm --filter @adconfirm/backend dev   # http://localhost:4000
```

## Common tasks

```bash
pnpm build       # Build all apps
pnpm lint        # Lint all packages
pnpm typecheck   # Type-check all packages
```

## Supabase type generation

After connecting to a real Supabase project, regenerate types:

```bash
npx supabase gen types typescript --project-id <your-project-id> \
  > packages/db/src/types.ts
```

## Vercel deployment

`apps/web` and `apps/dashboard` deploy independently to Vercel. Each must be linked once:

```bash
cd apps/web && vercel link
cd apps/dashboard && vercel link
```

Both deploy automatically on push to `main`.

## CI

GitHub Actions runs on every push to `main` and on all PRs:
`install → lint → typecheck → build`
