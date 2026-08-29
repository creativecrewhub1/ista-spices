# Ista Spices — Admin Panel

A mobile-first admin dashboard for a homemade spices & cooking oils business — products/inventory (batch stock, pack sizes 250g–2kg), orders (processing → packed → shipped → delivered), revenue analytics, and customer management.

## Architecture

The frontend never talks to the database directly. Every read and write goes through a single Supabase Edge Function (`supabase/functions/api`), which is the only thing holding the service-role key. Row Level Security denies `anon`/`authenticated` at the database level — the function's service-role client is the sole path to data.

```
Browser (React) → fetch() → Edge Function (Hono, layered) → Postgres (RLS-locked)
                             routes → services → repositories
```

- **Frontend** (`src/`) — React, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query. `src/lib/apiClient.ts` is the only file that knows the API's base URL; `src/data/queries.ts` / `mutations.ts` are thin fetch wrappers with zero business logic.
- **Backend** (`supabase/functions/api/`) — Deno Edge Function using Hono for routing.
  - `routes/` — HTTP handlers only (parse request, call a service, return JSON)
  - `services/` — all business logic: revenue math, date-range deltas, stock-level classification, "needs attention" rules, ID generation, the single-admin sign-up rule
  - `repositories/` — the only files that call Postgres or the Supabase Auth admin API
  - `middleware/requireAuth.ts` — verifies every request (except `/auth/*`) carries a real signed-in user's session, not just the public anon key
  - `types/domain.ts` — response shapes, kept in lockstep with `src/data/types.ts`

### Authentication

Single-admin model via Supabase Auth. The login page (`src/pages/LoginPage.tsx`) shows a Sign up tab only until an admin exists (`GET /auth/status`); after that, sign-up disappears everywhere — enforced server-side in `services/auth.service.ts`, not just hidden in the UI. `src/lib/supabaseAuthClient.ts` is used *only* for auth (sign in/up/out, session refresh) — it never queries a data table; all business data still goes through `apiClient.ts` → the Edge Function, now carrying the real user's JWT instead of the anon key.

## Getting started

```bash
npm install
npm run dev
```

Requires `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`) — the anon key is only used to authenticate the browser to the Edge Function gateway, not for direct database access.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Modules

- **Dashboard** — revenue KPIs, needs-attention feed, per-product revenue trend, top-selling items, stock levels
- **Products & Inventory** — spice powders & cooking oils, pack-size pricing, batch capacity, discounts
- **Orders** — status tracking, ETA, order detail with a visual fulfillment tracker
- **Revenue** — weekly/monthly charts, product-wise revenue with sort & CSV export
- **Customers** — segments, lifetime value, order history

## Known gap

Single-admin auth only — no per-user roles or permissions, no password-reset flow, and no email deliverability configured (accounts are created pre-confirmed via the Admin API). Fine for one internal admin; revisit before adding more staff accounts.

## License

Proprietary — see [LICENSE](./LICENSE).
