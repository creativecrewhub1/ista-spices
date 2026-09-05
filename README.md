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
- **Customer storefront** (`/shop`) — a marketing homepage with a featured-products teaser, a full browsable catalog with category/search filtering (`/shop/all`), cart, and checkout. Public browsing; checkout, order history, and the account menu (`/shop/profile`) require sign-in.

## Authentication

One login page (`/login`) for everyone. Password sign-in is the single-admin path (`role='admin'`, enforced server-side — see `services/auth.service.ts`); "Continue with Google" is the customer path and can never produce an admin (`role='customer'` is the DB trigger's default for every new auth user, see `db/migrations/*_add_profiles_role_table_and_customer_user_link.sql`). After sign-in, redirect target is decided by role, not by which form was used.

A Google sign-up also gets a `customers` row immediately — not just at first checkout — prefilled from whatever Google provides (name, email, photo); `phone`/`address` stay null until the customer fills them in via Profile or checkout (see `db/migrations/*_customer_signup_and_profile.sql`). This is what makes a customer visible in the admin's Customers page as soon as they log in, not only after their first order. If a walk-in customer was already entered manually under that email, the signup links that existing row instead of creating a duplicate — see `db/migrations/*_link_existing_customer_on_google_signup.sql`.

The admin can reset a forgotten password from `/login` ("Forgot password?") via Supabase's email-based recovery flow (`/reset-password` completes it) — depends on Supabase's email sending actually being deliverable for this project; nothing else in the app touches this.

A customer can export everything their account holds (`GET /storefront/me/export`, wired to a "Export my data" button on `/shop/profile`) or delete their account (`DELETE /storefront/me`) at any time. Deletion anonymizes the `customers` row rather than removing it — past orders stay attached to a real business record with the personal details scrubbed — then deletes the underlying auth user (`profiles` goes with it via cascade). Blocked server-side for the admin's own account; there's no self-service way to delete the single admin here by design.

## Known gap

No email deliverability configured for the admin account — it's created pre-confirmed via the Admin API, and the password-reset flow above depends on Supabase's own (rate-limited) email sending, which hasn't been tested past what its shared sender allows. Fine for one internal admin; revisit (custom SMTP) before adding staff accounts beyond the single admin.

## License

Proprietary — see [LICENSE](./LICENSE).
