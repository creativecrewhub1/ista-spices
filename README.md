# Ista Spices — Admin Panel

A mobile-first admin dashboard for a homemade spices & cooking oils business — products/inventory (batch stock, pack sizes 250g–2kg), orders (processing → packed → shipped → delivered), revenue analytics, and customer management.

Frontend-only, backed by mock data. Built with React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui.

## Getting started

```bash
npm install
npm run dev
```

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

## License

Proprietary — see [LICENSE](./LICENSE).
