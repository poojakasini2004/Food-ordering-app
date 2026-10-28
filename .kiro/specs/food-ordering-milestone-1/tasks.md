# Implementation Plan: Food Ordering Milestone 1

## Overview

Scaffold and implement the foundational infrastructure of the SmartX Food Ordering Web Application using Next.js 14 App Router, TypeScript strict mode, and Tailwind CSS. All data lives in module-level in-memory arrays. There is no external database, no Prisma runtime client, no online payment code, no HTML `<form>` elements, and no `any` TypeScript types anywhere in project-authored source files.

---

## Tasks

- [x] 1. Scaffold Next.js 14 project with TypeScript strict mode and Tailwind CSS
  - Run `npx create-next-app@latest` with `--typescript`, `--tailwind`, `--app`, `--src-dir no`, `--import-alias "@/*"` flags (or equivalent manual setup)
  - Verify `tsconfig.json` has `"strict": true` and all strict sub-flags are not overridden to `false`
  - Confirm `tailwind.config.ts` content paths include `./app/**/*.{ts,tsx}` and `./lib/**/*.{ts,tsx}`
  - Remove any placeholder `page.tsx` boilerplate that uses `any` types
  - Confirm `next.config.ts` (or `.mjs`) does not reference payment SDKs or external DB drivers
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_

  - [x] 1.1 Configure tsconfig.json for strict mode
    - Ensure `"strict": true` is present in `compilerOptions`
    - Ensure `"noImplicitAny": true`, `"strictNullChecks": true` are not overridden to `false`
    - Ensure `"noEmit": true` is NOT present (build must emit); add a separate `tsc --noEmit` script in `package.json` under key `"typecheck"`
    - _Requirements: 7.1, 7.2_

  - [x] 1.2 Install Vitest and fast-check for property-based testing
    - Install dev dependencies: `vitest`, `@vitejs/plugin-react`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Create `vitest.config.ts` at project root with `environment: "jsdom"` and `globals: true`
    - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
    - Create `vitest.setup.ts` importing `@testing-library/jest-dom`; reference it in `vitest.config.ts` under `setupFiles`
    - _Requirements: 7.1_

- [x] 2. Implement `/lib/db.ts` — In-Memory DataStore
  - [x] 2.1 Define all TypeScript types and interfaces
    - Export `Role` as `"STAFF" | "MANAGER"` union type
    - Export `OrderStatus` as `"PENDING" | "ACTIVE" | "COMPLETED"` union type
    - Export interfaces: `User`, `MenuCategory`, `MenuItem`, `Order`, `OrderItem` — all fields typed without `any`
    - `MenuItem.price` typed as `number` (constraint enforced at mutation layer, not type level)
    - `OrderItem.quantity` and `OrderItem.unitPrice` typed as `number`
    - _Requirements: 1.6, 1.7, 1.8_

  - [x] 2.2 Export mutable seed arrays
    - Export `users: User[]` with exactly one `STAFF` record and one `MANAGER` record (ids `"u1"`, `"u2"`)
    - Export `menuCategories: MenuCategory[]` with at least two categories (`displayOrder: 1` and `displayOrder: 2`)
    - Export `menuItems: MenuItem[]` with at least four items, at least one per category; include one item with `isAvailable: false`
    - Export `orders: Order[]` initialized as `[]`
    - Export `orderItems: OrderItem[]` initialized as `[]`
    - Do NOT import or instantiate any Prisma runtime client or any external DB driver
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.9_

  - [ ]* 2.3 Write unit tests for DataStore seed data shape
    - Verify `users` has ≥ 2 records, exactly one `STAFF` and one `MANAGER`
    - Verify `menuCategories` has ≥ 2 records, each with `id`, `name`, `displayOrder`
    - Verify `menuItems` has ≥ 4 records, each with all required fields; `price > 0`; at least one per category
    - Verify `orders` and `orderItems` are empty arrays
    - _Requirements: 1.1–1.5_

- [x] 3. Implement `/lib/auth.ts` — Authentication Module
  - [x] 3.1 Implement `login` function
    - Accept `(username: string, password: string): Promise<User | null>`
    - Return `null` immediately when `username === ""` or `password === ""`
    - Search `users` array for exact match on both fields; return `null` if none found
    - On match: set cookies `user_id` and `user_role` via `cookies()` from `next/headers`; return matched `User`
    - No JWT, no session libraries, no encryption, no `any` types
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8, 2.9_

  - [x] 3.2 Implement `getCurrentUser` function
    - Accept no arguments; return `Promise<User | null>`
    - Read `user_id` cookie via `cookies()` from `next/headers`
    - Look up matching record in `users` array; return it or `null` if not found or cookie absent
    - _Requirements: 2.5, 2.6_

  - [x] 3.3 Implement `logout` function
    - Accept no arguments; return `Promise<void>`
    - Delete both `user_id` and `user_role` cookies
    - _Requirements: 2.7_

  - [ ]* 3.4 Write property test for login with valid credentials (Property 1)
    - `// Feature: food-ordering-milestone-1, Property 1: Login with valid credentials returns the matching user`
    - Use `fc.constantFrom(...users)` to generate a seeded `User`; call `login(user.username, user.password)`; assert returned object `id` matches
    - **Property 1: Login with valid credentials returns the matching user**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 3.5 Write property test for login returning null on non-matching or empty inputs (Property 2)
    - `// Feature: food-ordering-milestone-1, Property 2: Login with non-matching or empty credentials returns null`
    - Generate pairs where at least one field is `""` (via `fc.constant("")`) OR both are arbitrary strings that do not match any seeded record; assert `login` returns `null`
    - **Property 2: Login with non-matching or empty credentials returns null**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 3.6 Write property test for session round-trip (Property 3)
    - `// Feature: food-ordering-milestone-1, Property 3: Session round-trip — login then getCurrentUser returns the same user`
    - For each seeded `User`, call `login` then `getCurrentUser`; assert returned `id` equals logged-in user's `id`
    - **Property 3: Session round-trip — login then getCurrentUser returns the same user**
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 3.7 Write property test for logout invalidating session (Property 4)
    - `// Feature: food-ordering-milestone-1, Property 4: Logout invalidates the session`
    - For each seeded `User`, call `login`, then `logout`, then `getCurrentUser`; assert result is `null`
    - **Property 4: Logout invalidates the session**
    - **Validates: Requirements 2.7**

- [x] 4. Checkpoint — Verify auth module and DataStore
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `/middleware.ts` — RBAC Middleware
  - [x] 5.1 Implement middleware function and matcher config
    - Export `middleware(request: NextRequest): NextResponse`
    - Export `config = { matcher: ["/staff/:path*", "/manager/:path*"] }`
    - Read `user_id` and `user_role` from `request.cookies`
    - For `/staff/*`: look up `user_id` in `users`; allow if role is `"STAFF"` or `"MANAGER"`; else redirect to `/login`
    - For `/manager/*`: look up `user_id` in `users`; allow only if role is `"MANAGER"`; else redirect to `/login`
    - No `any` types; use `NextResponse.next()` and `NextResponse.redirect(new URL("/login", request.url))`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 5.2 Write unit tests for middleware RBAC rules
    - Mock `NextRequest` with various cookie combinations
    - STAFF session on `/staff/orders` → `NextResponse.next()`
    - MANAGER session on `/manager/menu` → `NextResponse.next()`
    - STAFF session on `/manager/menu` → redirect to `/login`
    - No session on `/staff/orders` → redirect to `/login`
    - No session on `/manager/menu` → redirect to `/login`
    - Unknown `user_id` on `/staff/*` → redirect to `/login`
    - _Requirements: 4.1–4.7_

- [x] 6. Implement `/app/login/page.tsx` — Login Page
  - [x] 6.1 Build controlled-input login form (Client Component)
    - Add `"use client"` directive
    - Declare state: `username: string`, `password: string`, `error: string | null`, `loading: boolean`
    - Render two `<input>` elements (type `text` and `password`) bound via `value` + `onChange` — no `<form>` element anywhere in this file
    - Render a `<button>` with `disabled={loading}` and `onClick` handler
    - _Requirements: 3.1, 3.2, 3.11_

  - [x] 6.2 Implement submit handler
    - On click: set `loading = true`, clear `error` to `null`
    - Await `login(username, password)` from `lib/auth.ts`
    - On `User` with `role === "STAFF"`: call `router.push("/staff/orders")`
    - On `User` with `role === "MANAGER"`: call `router.push("/manager/sales")`
    - On `null` result: set `error = "Invalid credentials"`
    - On thrown exception: set `error = "Something went wrong. Please try again."` — do NOT re-throw
    - Always set `loading = false` in a `finally` block
    - No `any` types
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.10, 3.11_

  - [ ]* 6.3 Write unit tests for Login Page component behavior
    - Error is NOT rendered before any submission attempt
    - Submit button has `disabled` attribute while loading state is true
    - When `login` mock returns `null`: inline error message is rendered
    - When `login` mock throws: inline error message is rendered, error does not propagate
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_

- [x] 7. Implement `/app/menu/page.tsx` — Public Menu Page (Server Component)
  - [x] 7.1 Implement server component that groups and renders menu items
    - No `"use client"` directive — this is a pure server component
    - Import `menuCategories` and `menuItems` directly from `lib/db.ts`
    - Sort categories by `displayOrder` ascending; group `menuItems` by `categoryId`
    - For each category with items: render category heading followed by item cards
    - For each `MenuItem`: display `name`, `description`, price formatted as `$X.XX`
    - When `isAvailable === true`: render `<button>Add to Cart</button>` (no `disabled` attribute)
    - When `isAvailable === false`: render item with `aria-disabled="true"` and `<button disabled>Add to Cart</button>`
    - When a category has no items: render category heading with a visible "No items available" indicator
    - No authentication cookie required; no `any` types; no `<form>` elements
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 7.2 Write property test for menu availability rendering (Property 10)
    - `// Feature: food-ordering-milestone-1, Property 10: Menu page renders item availability state correctly`
    - Use `fc.array(fc.record({ ..., isAvailable: fc.boolean() }))` to generate arbitrary `menuItems`; render component; assert enabled buttons for available items and `disabled` + `aria-disabled="true"` for unavailable items
    - **Property 10: Menu page renders item availability state correctly**
    - **Validates: Requirements 5.4, 5.5**

  - [ ]* 7.3 Write property test for menu category ordering (Property 11)
    - `// Feature: food-ordering-milestone-1, Property 11: Menu items are grouped and sorted by category displayOrder`
    - Generate arbitrary `menuCategories` with shuffled `displayOrder` values and `menuItems` referencing them; render component; assert rendered category headings appear in strictly ascending `displayOrder` order and each item appears only in its correct category section
    - **Property 11: Menu items are grouped and sorted by category displayOrder**
    - **Validates: Requirements 5.2**

- [x] 8. Checkpoint — Verify menu page and middleware
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement `/app/manager/menu/actions.ts` — Server Actions
  - [x] 9.1 Implement `addMenuItem` Server Action
    - Add `"use server"` directive at top of file
    - Export `ActionResult` type: `{ success: true } | { success: false; error: string }`
    - Validate: `name` non-empty and ≤ 100 chars; `description` ≤ 500 chars; `price` in [0.01, 9999.99]; `categoryId` non-empty and references an existing `MenuCategory`
    - On validation failure: return `{ success: false, error: "..." }` without touching `menuItems` array
    - On success: generate id via `crypto.randomUUID()`, create record with `isAvailable: true`, push to `menuItems`, return `{ success: true }`
    - No `any` types; no external DB writes; no Prisma client
    - _Requirements: 6.3, 6.10, 6.11, 6.12_

  - [ ]* 9.2 Write property test for addMenuItem valid inputs (Property 5)
    - `// Feature: food-ordering-milestone-1, Property 5: addMenuItem with valid inputs appends a correctly shaped record`
    - Generate valid `(name, description, price, categoryId)` via `fc.tuple(fc.string({minLength:1, maxLength:100}), fc.string({maxLength:500}), fc.float({min:0.01, max:9999.99}), fc.constantFrom(...seededCategoryIds))`; assert array grows by exactly 1, new record has correct field values and `isAvailable: true`, id is unique non-empty string
    - **Property 5: addMenuItem with valid inputs appends a correctly shaped record**
    - **Validates: Requirements 6.3**

  - [ ]* 9.3 Write property test for addMenuItem invalid inputs (Property 6)
    - `// Feature: food-ordering-milestone-1, Property 6: addMenuItem with invalid inputs does not mutate the DataStore`
    - Generate at least one constraint violation per run (empty name, price < 0.01, price > 9999.99, description > 500 chars, empty/unknown categoryId); snapshot `menuItems.length` before; assert length unchanged and result `success === false`
    - **Property 6: addMenuItem with invalid inputs does not mutate the DataStore**
    - **Validates: Requirements 6.12**

  - [x] 9.4 Implement `editMenuItem` Server Action
    - Accept `{ id: string; name?: string; description?: string; price?: number; categoryId?: string }`
    - Find record by `id`; if not found, return `{ success: true }` (no-op)
    - Apply only the fields present in the payload; leave `isAvailable` and `id` untouched
    - Return `{ success: true }` on completion; no `any` types
    - _Requirements: 6.4, 6.5, 6.10, 6.11_

  - [ ]* 9.5 Write property test for editMenuItem updating only supplied fields (Property 7)
    - `// Feature: food-ordering-milestone-1, Property 7: editMenuItem updates only the supplied fields`
    - For an existing item, generate a random non-empty subset of `{name, description, price, categoryId}`; call `editMenuItem`; assert only those fields changed, `isAvailable` and `id` are identical to before
    - **Property 7: editMenuItem updates only the supplied fields**
    - **Validates: Requirements 6.4**

  - [x] 9.6 Implement `deleteMenuItem` Server Action
    - Accept `id: string`; filter `menuItems` array to remove matching record
    - If no record matches, leave array unchanged and return `{ success: true }`
    - Return `{ success: true }` on completion; no `any` types
    - _Requirements: 6.6, 6.7, 6.10, 6.11_

  - [x] 9.7 Implement `toggleAvailability` Server Action
    - Accept `id: string`; find record by id
    - If found: flip `isAvailable` to `!isAvailable`; return `{ success: true }`
    - If not found: return `{ success: true }` (no-op)
    - No `any` types
    - _Requirements: 6.8, 6.9, 6.10, 6.11_

  - [ ]* 9.8 Write property test for unknown id mutations being no-ops (Property 8)
    - `// Feature: food-ordering-milestone-1, Property 8: Mutations with an unknown MenuItem id are no-ops`
    - Generate strings that do not match any existing `MenuItem` id (use `fc.string()` filtered to exclude known ids); snapshot array before; call `editMenuItem`, `deleteMenuItem`, `toggleAvailability` in sequence with that id; assert array length and contents are identical after each call
    - **Property 8: Mutations with an unknown MenuItem id are no-ops**
    - **Validates: Requirements 6.5, 6.7, 6.9**

  - [ ]* 9.9 Write property test for toggleAvailability involution (Property 9)
    - `// Feature: food-ordering-milestone-1, Property 9: toggleAvailability is an involution`
    - Use `fc.constantFrom(...menuItems)` to pick an existing item; record its `isAvailable`; call `toggleAvailability` twice; assert `isAvailable` equals original value and all other fields are unchanged
    - **Property 9: toggleAvailability is an involution (round-trip restores original state)**
    - **Validates: Requirements 6.8**

- [x] 10. Implement `/app/manager/menu/page.tsx` — Manager Menu Page
  - [x] 10.1 Build server component scaffold and item list display
    - No `"use client"` at this level — page is a Server Component
    - Import `menuItems` and `menuCategories` from `lib/db.ts`
    - Render a list of all `MenuItem` records; when list is empty render a visible "No menu items" indicator
    - Each row displays item name, category, price (formatted `$X.XX`), availability badge, and action buttons (Edit, Delete, Toggle Availability)
    - No `<form>` elements anywhere; no `any` types
    - _Requirements: 6.1, 6.2_

  - [x] 10.2 Build Client Component island for Add / Edit forms
    - Create `/app/manager/menu/MenuAdminClient.tsx` with `"use client"` directive
    - Controlled inputs (no `<form>`) for `name`, `description`, `price`, `categoryId` (select)
    - `onClick` on "Add Item" button calls `addMenuItem` Server Action; clears fields on success; shows inline error on `success === false`
    - `onClick` on per-item "Edit" button populates fields and calls `editMenuItem` on save
    - `onClick` on per-item "Delete" button calls `deleteMenuItem`
    - `onClick` on per-item "Toggle" button calls `toggleAvailability`
    - No `any` types
    - _Requirements: 6.2, 6.3, 6.4, 6.6, 6.8_

  - [ ]* 10.3 Write unit tests for Manager Menu Page Server Actions integration
    - `deleteMenuItem` with known id removes exactly that item from `menuItems` array
    - `editMenuItem` with known id updates only the specified fields
    - `addMenuItem` with valid data appends to array and returns `{ success: true }`
    - `addMenuItem` with invalid data returns `{ success: false }` and does not mutate array
    - _Requirements: 6.3, 6.4, 6.6, 6.7_

- [ ] 11. Final checkpoint — Full suite green
  - Run `npm run typecheck` (tsc --noEmit) and confirm zero TypeScript errors under strict mode
  - Run `npm run test` (vitest --run) and confirm all 11 property tests and all unit tests pass
  - Verify no `<form>` elements exist in the codebase (`grep -r "<form" app/` returns nothing)
  - Verify no `any` types in project source (`grep -rn ": any\|as any\|<any>" lib/ app/ middleware.ts` returns nothing)
  - Verify no payment-related imports or references exist
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; they represent property-based and unit tests
- All 11 correctness properties from the design document are covered: P1–P4 in task 3, P5–P9 in task 9, P10–P11 in task 7
- Each property test file must include the comment `// Feature: food-ordering-milestone-1, Property N: <text>` immediately above the test
- Hard constraints apply throughout: no `<form>` elements, no `any` types, no external DB, no Prisma runtime, no online payment code
- Cookie helpers (`cookies()`) require `next/headers` and work only in Server Components and Server Actions — the Login Page calls `login()` which is an async function that can be called from a Client Component via a direct import
- Vitest with jsdom enables rendering and asserting on server component output for P10 and P11 — use a lightweight render utility or extract the grouping/sorting logic into a pure function and test that directly

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3"] },
    { "id": 5, "tasks": ["3.4", "3.5", "3.6", "3.7", "5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1"] },
    { "id": 7, "tasks": ["6.2"] },
    { "id": 8, "tasks": ["6.3", "7.1", "9.1"] },
    { "id": 9, "tasks": ["7.2", "7.3", "9.2", "9.3", "9.4"] },
    { "id": 10, "tasks": ["9.5", "9.6", "9.7"] },
    { "id": 11, "tasks": ["9.8", "9.9", "10.1"] },
    { "id": 12, "tasks": ["10.2"] },
    { "id": 13, "tasks": ["10.3"] }
  ]
}
```
