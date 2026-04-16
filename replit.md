# ClankerTV Workspace

## Overview

Full-stack pnpm monorepo — ClankerTV is a real-time token discovery platform for Clanker (clanker.world), which deploys meme coins on Base via Farcaster/X social posts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (dark terminal aesthetic)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (for watchlist/portfolio)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **External data**: Clanker API (https://www.clanker.world/api/tokens)

## Architecture

- `artifacts/clankertv/` — React+Vite frontend (dark terminal UI, IBM Plex Mono font)
- `artifacts/api-server/` — Express API server proxying Clanker data + portfolio DB
- `lib/db/` — Drizzle schema (portfolio/watchlist table)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Generated React Query hooks (via Orval)
- `lib/api-zod/` — Generated Zod schemas (via Orval)

## Key Features

- **Discovery Feed** (`/`) — Real-time latest tokens from Clanker, auto-refreshing every 30s
- **Trending** (`/trending`) — Top movers with 1h/6h/24h timeframe toggle
- **Token Detail** (`/token/:address`) — Full token info, copyable contract address, add to watchlist
- **Watchlist** (`/portfolio`) — Saved tokens with notes, persistent via PostgreSQL
- **About/FAQ** (`/about`) — Platform info + legal disclaimer

## Security Features

- Rate limiting (100 req/min per IP)
- Security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
- CORS restricted to Replit domains in production
- Input sanitization for Ethereum addresses (regex validation)
- Request body size limits (50kb)
- Zod validation on all inputs

## Clanker API Notes

- Base URL: `https://www.clanker.world/api/tokens`
- Max limit per request: 20 (API rejects higher values)
- Default sort: newest (desc) — no sort param needed
- For oldest: `?sort=asc`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `portfolio` table: id, contract_address (unique, validated hex), name, symbol, notes, added_at

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
