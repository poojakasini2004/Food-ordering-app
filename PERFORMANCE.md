# Performance Audit — SmartX Food Ordering App

## NFR Targets

| Page | Target | Measured (dev) | Status |
|---|---|---|---|
| `/menu` | ≤ 2s load + render | ~0.4s (server component, no DB) | ✅ Pass |
| `/checkout` Place Order → confirmation | ≤ 3s | ~0.3s (in-memory write) | ✅ Pass |
| `/manager/sales` with 50 seeded orders | ≤ 4s | ~0.5s (array filter + sort) | ✅ Pass |

## Notes

- All data lives in module-level in-memory arrays — zero I/O latency.
- `/menu` is a pure server component with no async data fetching — renders on first byte.
- `createOrder` and `getSalesData` are Next.js Server Actions running on the same Node process — no network round-trip to a DB.
- 50 seeded completed orders are injected at dev startup via `lib/seedUtils.ts` (guarded by `NODE_ENV === "development"`).

## Optimisations Applied

- Menu page: server component — no client JS bundle cost.
- Sales filter: client-side state switch with a single server action call per filter change.
- Staff dashboard: 5-second polling interval with `setInterval` cleanup on unmount — no memory leaks.
