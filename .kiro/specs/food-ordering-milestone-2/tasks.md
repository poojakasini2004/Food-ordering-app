# Implementation Plan: Food Ordering Milestone 2

## Overview

Implement the complete customer-facing ordering flow and staff order management dashboard. Cart state lives in React context backed by `sessionStorage`. All DataStore writes go through Next.js Server Actions. Cash on delivery is a static label only — no payment code exists anywhere. No HTML `<form>` tags, no `any` TypeScript types, no modifications to `/lib/auth.ts`, `/middleware.ts`, or `/lib/db.ts` type definitions.

## Tasks

- [ ] 1. Create CartContext with state management and sessionStorage persistence
  - Create `/context/CartContext.tsx` with `CartProvider` and `useCart` hook
  - Define local `CartItem` interface (`{ menuItem: MenuItem; quantity: number }`) — not exported from db.ts
  - Define `CartContextValue` interface with `cartItems`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`, `subtotal`
  - Implement `addItem`: append new `CartItem` with `quantity = 1` when item not present; increment `quantity` by 1 when already present
  - Implement `updateQuantity`: set quantity to given value; remove item when quantity ≤ 0
  - Implement `removeItem`: filter out `CartItem` by `menuItem.id`
  - Implement `clearCart`: set `cartItems` to `[]`
  - Compute `subtotal` as `sum(price × quantity)` rounded to 2 decimal places
  - Hydration guard: read `sessionStorage` only inside `useEffect`; initial render starts with `[]`
  - Persist `cartItems` to `sessionStorage` key `"smartx_cart"` on every change via `useEffect`
  - Wrap `JSON.parse` in `try/catch`; fall back to `[]` on error
  - `useCart` throws `Error("useCart must be used within a CartProvider")` when called outside provider
  - No `any` types anywhere in the file
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

  - [ ]* 1.1 Write property tests for CartContext — Properties 1 & 2 (addItem)
    - **Property 1: addItem grows the cart** — for any `MenuItem` not in cart, `addItem` appends one entry with `quantity = 1`
    - **Property 2: addItem increments existing quantity** — for any `MenuItem` already in cart, `addItem` increments its `quantity` by 1 and does not change array length
    - Place in `__tests__/CartContext.test.tsx`; tag each test with `// Feature: food-ordering-milestone-2, Property N`
    - **Validates: Requirements 1.3**

  - [ ]* 1.2 Write property tests for CartContext — Properties 3, 4 & 5 (updateQuantity, removeItem, subtotal)
    - **Property 3: updateQuantity ≤ 0 removes item** — calling `updateQuantity(id, q)` where `q <= 0` removes that item; all other items unchanged
    - **Property 4: removeItem eliminates exactly the target** — `removeItem(id)` removes only the matching entry; all other entries unchanged
    - **Property 5: subtotal correctness** — `subtotal` equals `sum(price × quantity)` rounded to 2 dp for any `CartItem[]`
    - Place in `__tests__/CartContext.test.tsx`
    - **Validates: Requirements 1.4, 1.5, 1.7**

  - [ ]* 1.3 Write property test for CartContext — Property 6 (sessionStorage round-trip)
    - **Property 6: sessionStorage round-trip** — serialising any `CartItem[]` to `"smartx_cart"` and reading it back on mount produces an equivalent array
    - Place in `__tests__/CartContext.test.tsx`; mock `sessionStorage` via `vitest.setup.ts` helpers
    - **Validates: Requirements 1.8, 1.9**

- [ ] 2. Wrap root layout with CartProvider
  - Update `/app/layout.tsx` to import `CartProvider` from `/context/CartContext`
  - Wrap `{children}` inside `<CartProvider>` — layout itself remains a server component
  - No other changes to layout structure or metadata
  - _Requirements: 1.12_

- [ ] 3. Implement AddToCartButton client component
  - Create `/components/menu/AddToCartButton.tsx` with `"use client"` directive
  - Accept single prop `menuItem: MenuItem` (import type from `/lib/db`)
  - Call `useCart().addItem(menuItem)` on click
  - Render enabled button labelled "Add to Cart" when `menuItem.isAvailable === true`
  - Render button with `disabled` attribute and label "Unavailable" when `menuItem.isAvailable === false`
  - No internal state beyond what `useCart` provides; no `any` types
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ]* 3.1 Write unit tests for AddToCartButton
    - Test: renders enabled with label "Add to Cart" for an available item
    - Test: renders with `disabled` attribute for an unavailable item
    - Test: `addItem` is called with the correct `MenuItem` on click
    - Place in `__tests__/AddToCartButton.test.tsx`
    - _Requirements: 2.2, 2.3_

- [ ] 4. Update menu page to use AddToCartButton
  - Update `/app/menu/page.tsx` to import `AddToCartButton` from `/components/menu/AddToCartButton`
  - Replace the inline `<button>` element in each item card with `<AddToCartButton menuItem={item} />`
  - Page remains a server component — no other changes to structure or styling
  - _Requirements: 2.4_

- [ ] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement cart page UI
  - Create `/app/cart/page.tsx` with `"use client"` directive
  - Read `cartItems`, `subtotal`, `updateQuantity`, `removeItem` from `useCart()`
  - When `cartItems` is empty: render empty-state message and a `<Link>` to `/menu`
  - When `cartItems` is not empty: render one row per item showing name, unit price (2 dp + `$`), quantity controls, row total (2 dp + `$`), and Remove button
  - Decrement button labelled "–": calls `updateQuantity(id, quantity - 1)`; render with `disabled` when `quantity === 1`
  - Increment button labelled "+": calls `updateQuantity(id, quantity + 1)`
  - Remove button: calls `removeItem(id)`
  - Display `subtotal` at bottom formatted to 2 dp with `$`
  - "Proceed to Checkout" button: calls `router.push('/checkout')` via `useRouter`; render with `disabled` when `cartItems` is empty
  - No `any` types; no `<form>` tag
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ]* 6.1 Write unit tests for CartPage
    - Test: empty state renders empty-state message and link to `/menu`
    - Test: decrement button is disabled when `quantity = 1`
    - Test: "Proceed to Checkout" button is disabled when cart is empty
    - Place in `__tests__/CartPage.test.tsx`
    - _Requirements: 3.5, 3.9, 3.11_

- [ ] 7. Implement createOrder Server Action
  - Create `/app/checkout/actions.ts` with `"use server"` directive
  - Define `CreateOrderInput` interface and `CreateOrderResult` discriminated union (`{ success: true; orderId: string } | { success: false; error: string }`)
  - Validate: return `{ success: false, error }` if `customerName`, `deliveryAddress`, or `phone` is an empty string
  - Validate: return `{ success: false, error }` if trimmed `phone` fails `/^\d{7,}$/`
  - Validate: for each cart item, return `{ success: false, error }` if `menuItemId` not found in DataStore or its `MenuItem` has `isAvailable === false`
  - On success: generate `id` via `crypto.randomUUID()`, compute `totalAmount` server-side as `sum(quantity × unitPrice)`, push one `Order` (status `"PENDING"`, `createdAt: new Date()`) and one `OrderItem` per cart item to the DataStore arrays
  - Return `{ success: true, orderId }` on success
  - No `any` types; no `<form>` tag; no payment code
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 7.1 Write property tests for createOrder — Properties 7, 8 & 9
    - **Property 7: createOrder totalAmount** — for any valid cart items, `totalAmount` in DataStore equals server-computed `sum(quantity × unitPrice)`; client-supplied totals are ignored
    - **Property 8: createOrder rejects invalid inputs** — for any input with empty name/address or invalid phone, returns `{ success: false }` and DataStore arrays are unchanged
    - **Property 9: createOrder rejects unavailable items** — for any cart item referencing an unavailable or missing `menuItemId`, returns `{ success: false }` and DataStore is unchanged
    - Place in `__tests__/createOrder.test.ts`; reset `orders` and `orderItems` arrays between runs
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.6**

- [ ] 8. Implement checkout page
  - Create `/app/checkout/page.tsx` with `"use client"` directive
  - Local state: `customerName`, `deliveryAddress`, `phone` (strings), `errors` object typed `{ customerName?: string; deliveryAddress?: string; phone?: string }`, `submitting: boolean`, `serverError: string | null`
  - On mount via `useEffect`: if `cartItems` is empty, call `router.push('/menu')`
  - Render read-only order summary: each `CartItem`'s name, quantity, unit price (2 dp + `$`), and `subtotal` (2 dp + `$`)
  - Render three controlled `<input>` elements for Full Name, Delivery Address, Phone — **no `<form>` tag**
  - Display static non-interactive label "Payment: Cash on Delivery" — no input, dropdown, or selector
  - Run validation on blur and on submit attempt; show inline errors beneath each field
  - Phone validation: `/^\d{7,}$/` on trimmed value
  - "Place Order" button: disabled when any validation error exists or `submitting === true`
  - On valid click: set `submitting = true`, call `createOrder` with cart items mapped to `{ menuItemId, itemNameSnapshot, quantity, unitPrice }[]`; on `{ success: true }` navigate to `/checkout/confirmation?orderId={id}`; on `{ success: false }` set `serverError` and display inline; always reset `submitting = false`
  - No `any` types; no payment code
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13_

  - [ ]* 8.1 Write unit tests for CheckoutPage
    - Test: inline validation errors appear for blank Full Name, blank Address, and invalid Phone
    - Test: server error message is displayed when `createOrder` returns `{ success: false }`
    - Test: navigates to confirmation URL when `createOrder` returns `{ success: true }`
    - Place in `__tests__/CheckoutPage.test.tsx`
    - _Requirements: 4.6, 4.7, 4.8, 4.11, 4.12_

- [ ] 9. Implement order confirmation page
  - Create `/app/checkout/confirmation/page.tsx` with `"use client"` directive
  - Read `orderId` from `useSearchParams()`
  - Look up matching `Order` in DataStore `orders` array and its `OrderItem[]` from `orderItems`
  - When valid order found: display Order ID, customer name, delivery address, all order items with quantities, total amount (2 dp + `$`), and static label "Payment: Cash on Delivery"; call `clearCart()` once on mount via `useEffect`
  - When `orderId` absent or no matching order: render error message and a `<Link>` to `/menu` — do not redirect
  - No Back or Edit button; order is final and non-modifiable
  - No `any` types; no payment code
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 9.1 Write unit tests for ConfirmationPage
    - Test: error state is rendered for a missing or invalid orderId
    - Test: order details are displayed correctly for a valid orderId
    - Test: `clearCart` is called exactly once on mount when order is found
    - Place in `__tests__/ConfirmationPage.test.tsx`
    - _Requirements: 6.3, 6.4, 6.5_

- [ ] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement staff order Server Actions
  - Create `/app/staff/orders/actions.ts` with `"use server"` directive
  - Define local `OrderWithItems` interface: `{ order: Order; items: OrderItem[] }`
  - Define `UpdateStatusResult` discriminated union: `{ success: true } | { success: false; error: string }`
  - Export `getOrders(): Promise<OrderWithItems[]>` — map each `Order` to its associated `OrderItem[]` from the DataStore
  - Export `updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<UpdateStatusResult>`
    - Return `{ success: false, error: "Order not found." }` when `orderId` not in DataStore
    - Return `{ success: false, error: "Cannot update a completed order." }` when order's `status === "COMPLETED"`
    - Mutate the `status` field in-place; return `{ success: true }` on success
  - No `any` types
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 11.1 Write property tests for updateOrderStatus — Properties 10 & 11
    - **Property 10: updateOrderStatus rejects completed orders** — for any order with `status = "COMPLETED"`, any call to `updateOrderStatus` returns `{ success: false }` and DataStore is unchanged
    - **Property 11: updateOrderStatus rejects unknown orderId** — for any orderId not in DataStore, returns `{ success: false }` and DataStore is not modified
    - Place in `__tests__/updateOrderStatus.test.ts`; reset DataStore between runs
    - **Validates: Requirements 8.3, 8.4**

- [ ] 12. Implement staff order dashboard
  - Create `/app/staff/orders/page.tsx` with `"use client"` directive
  - Define local `OrderWithItems` interface: `{ order: Order; items: OrderItem[] }`
  - Local state: `orders: OrderWithItems[]`, `loading: boolean`
  - On mount: call `getOrders()` and set `orders`; set up `setInterval` repeating every 5000 ms to re-call `getOrders()`; clean up interval on unmount via `useEffect` return
  - Render three-column layout with column headers "Pending", "Active", "Completed"
  - Place each order card in the column matching its `order.status`
  - Each card displays: Order ID, customer name, delivery address, phone, all order items with quantities, total amount (2 dp + `$`), and `createdAt` as a readable date/time string
  - PENDING cards: render "Accept" button; on click call `updateOrderStatus(orderId, "ACTIVE")` then re-call `getOrders()`
  - ACTIVE cards: render "Complete" button; on click call `updateOrderStatus(orderId, "COMPLETED")` then re-call `getOrders()`
  - COMPLETED cards: no action buttons
  - Surface `updateOrderStatus` errors inline on the relevant order card
  - No `any` types; no `<form>` tag
  - Route protected by existing middleware — no middleware changes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ]* 12.1 Write unit tests for StaffOrderDashboard
    - Test: order cards appear in correct columns based on `order.status`
    - Test: "Accept" button present on PENDING cards; "Complete" button on ACTIVE cards; no action buttons on COMPLETED cards
    - Test: `setInterval` is initialised with 5000 ms and cleaned up on unmount
    - Place in `__tests__/StaffOrderDashboard.test.tsx`
    - _Requirements: 7.2, 7.3, 7.5, 7.7, 7.9_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Hard constraints apply to every task: no `<form>` tags, no `any` types, no payment code, no modifications to `/lib/auth.ts`, `/middleware.ts`, or `/lib/db.ts` type definitions
- "Cash on Delivery" appears as a static label only — on CheckoutPage (Req 4.5) and ConfirmationPage (Req 6.3)
- Property tests use `fast-check` (already in `devDependencies`); unit tests use Vitest + `@testing-library/react` (already configured)
- DataStore arrays must be reset between property test runs to avoid cross-run state bleed
- All new files compile under `"strict": true` — no `@ts-ignore` or `@ts-expect-error` allowed
- Each property test is tagged with a comment: `// Feature: food-ordering-milestone-2, Property N: <description>`
- Properties 1–6 are tested in `CartContext.test.tsx`; Properties 7–9 in `createOrder.test.ts`; Properties 10–11 in `updateOrderStatus.test.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["3.1", "7.1", "11.1"] },
    { "id": 2, "tasks": ["6.1", "8.1", "9.1", "12.1"] }
  ]
}
```
