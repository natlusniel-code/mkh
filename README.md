# MarketHub

A single-store e-commerce platform for the Nigerian market — a public storefront
plus a private admin dashboard. Built with React + tRPC + Drizzle/Postgres.

## Features

**Storefront**
- Home page with hero, category rail, featured / new-arrival / best-seller / deals sections
- Product listing with search, category filter, price range, sort and pagination
- Product detail with a swipeable image gallery, variants, reviews and related items
- Cart, wishlist, guest or signed-in checkout, order confirmation and a live payment-status page
- Hide-on-scroll-down / show-on-scroll-up header and a 5-tab bottom navigation bar

**Accounts**
- Email/password signup and login; each customer sees only their own orders, addresses and notifications

**Admin dashboard** (`/admin`, admin role only)
- Overview with real database figures: revenue chart, orders, payments to verify, customers, low stock
- Full CRUD for products, categories, orders, payment approval/rejection, bank-transfer settings, users and notifications

**Payments**
- Manual bank transfer: checkout shows the bank details, the customer submits a transfer reference, an admin verifies it

## Getting started

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL and the storage keys
pnpm db:migrate           # apply migrations
npx tsx scripts/seed.mts  # seed 200 products, categories, demo orders
pnpm dev                  # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the API and Vite dev server together |
| `pnpm build` | Build the SPA (`dist/public`) and bundle the server (`dist/index.js`) |
| `pnpm start` | Run the production server |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm test` | Vitest |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle migrations |

## Deployment

- **Vercel** — `vercel.json` rewrites every path to the serverless function in
  `api/index.ts`, which serves the tRPC API and the built SPA, so the deployed
  URL loads the site itself. Set `DATABASE_URL` and the storage variables in the
  Vercel project settings.
- **Docker** — the included `Dockerfile` builds and runs the single Hono process
  on port 3000.

## Demo logins (seeded data)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@markethub.test` | `admin12345` |
| Customer | `ada.okafor@example.com` | `password123` |
