# SmartX Food Ordering App

A single-restaurant food ordering platform built with Next.js 14 App Router, TypeScript strict mode, and Tailwind CSS. All data is stored in-memory — no external database required.

## Live URL

> Deploy to Vercel and add your URL here: `https://your-app.vercel.app`

## User Flows

### Customer
1. Browse menu at `/menu`
2. Add items to cart
3. View cart at `/cart`
4. Checkout at `/checkout` — fill in name, address, phone
5. Order confirmed at `/checkout/confirmation`

### Staff (`staff` / `staff123`)
1. Login at `/login`
2. Manage orders at `/staff/orders`
3. Accept (→ Active) or Decline (→ Cancelled) pending orders
4. Complete active orders

### Manager (`manager` / `manager123`)
1. Login at `/login`
2. View sales dashboard at `/manager/sales` — filter by Today / Week / Month / Custom
3. Manage menu at `/manager/menu` — add, edit, delete, toggle availability

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run Vitest tests |

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Auth**: Cookie-based, in-memory users
- **Data**: In-memory arrays (no external DB)
- **Hosting**: Vercel

## Deployment

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Framework preset: **Next.js**
4. No environment variables required (in-memory only)
5. Deploy
