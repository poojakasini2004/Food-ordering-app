# Design Document — food-ordering-milestone-2

## Overview

Milestone 2 extends the SmartX Food Ordering app by adding the complete customer-facing ordering flow and a staff order management dashboard. It builds directly on top of the Milestone 1 foundation (auth, middleware, menu page, manager admin) without touching any of those files' type definitions.

The ordering flow spans five pages: the existing menu page (updated to use an `AddToCartButton` client component), a cart page, a checkout page, an order confirmation page, and the staff Kanban dashboard. Cart state lives entirely on the client in React context, backed by `sessionStorage` for cross-navigation persistence. All writes to the DataStore go through Next.js Server Actions. Cash on delivery is the sole payment mechanism — it is a static label only and no payment code exists anywhere in the system.

**Key constraints carried through the entire design:**
- No HTML `<form>` tags
- No `any` TypeScript type
- No online payment code
- No mutations to `/lib/auth.ts`, `/middleware.ts`, or `/lib/db.ts` type definitions
- In-memory DataStore only (`/lib/db.ts` exported arrays)

---

## Architecture

```mermaid
flowchart TD
    A[Customer browser] -->|navigates| B[/app/menu/page.tsx\nServer Component]
    B --> C[AddToCartButton\nClient Component]
    C -->|addItem| D[CartContext\n/context/CartContext.tsx]
    D -->|persists| E[sessionStorage\nsmartx_cart]

    A -->|navigates| F[/app/cart/page.tsx\nClient Component]
    F -->|reads/writes| D

    F -->|navigates| G[/app/checkout/page.tsx\nClient Component]
    G -->|calls| H[createOrder\nServer Action]
    H -->|writes| I[DataStore\n/lib/db.ts]
    G -->|navigates on success| J[/app/checkout/confirmation/page.tsx\nClient Component]
    J -->|reads| I
    J -->|clearCart| D

    K[Staff browser] -->|navigates \n/staff/orders| L[StaffOrderDashboard\nClient Component]
    L -->|polls every 5s| M[getOrders\nServer Action]
    L -->|on button click| N[updateOrderStatus\nServer Action]
    M --> I
    N --> I

    O[middleware.ts] -->|guards /staff/*| L
    O -->|guards /manager/*| P[/app/manager/menu/]
```

The architecture follows a clear separation of concerns:
- **Client state layer**: `CartContext` owns cart state and sessionStorage sync.
- **Server action layer**: `createOrder`, `getOrders`, `updateOrderStatus` own DataStore mutations and reads.
- **Middleware layer**: Unchanged from Milestone 1; guards `/staff/` and `/manager/` routes.
- **Page layer**: Client components orchestrate UI, call hooks and server actions.

---

## Components and Interfaces

### `/context/CartContext.tsx`

Provides cart state to the entire application via React context.

```typescript
// CartItem is a runtime type — NOT exported from /lib/db.ts
interface CartItem {
  menuItem: MenuItem;   // from /lib/db.ts
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  subtotal: number; // rounded to 2 decimal places
}

// Exported:
export function CartProvider({ children }: { children: React.ReactNode }): JSX.Element
export function useCart(): CartContextValue  // throws if called outside CartProvider
```

**sessionStorage key**: `"smartx_cart"` — stores JSON-serialised `CartItem[]`.

**Hydration guard**: The context reads `sessionStorage` only inside `useEffect` (i.e., after mount) to avoid SSR/hydration mismatches. Initial render always starts with an empty array; the effect immediately restores from storage.

### `/components/menu/AddToCartButton.tsx`

```typescript
"use client";

interface AddToCartButtonProps {
  menuItem: MenuItem;
}

export default function AddToCartButton({ menuItem }: AddToCartButtonProps): JSX.Element
```

- Calls `useCart().addItem(menuItem)` on click.
- Renders disabled when `menuItem.isAvailable === false`.
- No internal state beyond what `useCart` provides.

### `/app/menu/page.tsx` (updated)

Remains a server component. Replaces the inline `<button>` with `<AddToCartButton menuItem={item} />`. No other changes.

### `/app/cart/page.tsx`

```typescript
"use client";

// No props — reads entirely from useCart()
export default function CartPage(): JSX.Element
```

Displays cart contents, quantity controls (–/+), Remove buttons, subtotal, and a "Proceed to Checkout" link (rendered as `<button>` calling `router.push('/checkout')`).

### `/app/checkout/page.tsx`

```typescript
"use client";

// Local state:
// customerName: string
// deliveryAddress: string
// phone: string
// errors: { customerName?: string; deliveryAddress?: string; phone?: string }
// submitting: boolean
// serverError: string | null

export default function CheckoutPage(): JSX.Element
```

- Uses `useRouter` for redirect when cart is empty.
- All inputs are controlled `<input>` elements — **no `<form>` tag**.
- Validation runs on blur and on submit attempt.
- Phone validation: `/^\d{7,}$/` applied to the trimmed value.
- Calls `createOrder` server action; navigates to `/checkout/confirmation?orderId={id}` on success.

### `/app/checkout/actions.ts`

```typescript
"use server";

interface CreateOrderInput {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  cartItems: {
    menuItemId: string;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: number;
  }[];
}

type CreateOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult>
```

### `/app/checkout/confirmation/page.tsx`

```typescript
"use client";

// Reads orderId from useSearchParams()
// Calls clearCart() once on mount when order is found

export default function ConfirmationPage(): JSX.Element
```

### `/app/staff/orders/page.tsx`

```typescript
"use client";

// Local state:
// orders: OrderWithItems[]
// loading: boolean

// OrderWithItems is a local type:
interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export default function StaffOrderDashboard(): JSX.Element
```

- Calls `getOrders()` on mount and every 5 seconds via `setInterval` in a `useEffect`.
- Cleans up interval on unmount.
- Renders three column layout: Pending / Active / Completed.

### `/app/staff/orders/actions.ts`

```typescript
"use server";

interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

type UpdateStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function getOrders(): Promise<OrderWithItems[]>

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateStatusResult>
```

### `/app/layout.tsx` (updated)

Wraps `{children}` with `<CartProvider>` imported from `/context/CartContext.tsx`. The `CartProvider` is a client component; the layout itself stays a server component.

---

## Data Models

### Runtime types (client-side only — not in DataStore)

```typescript
// Defined in /context/CartContext.tsx
interface CartItem {
  menuItem: MenuItem;  // full MenuItem record
  quantity: number;    // integer >= 1
}
```

`CartItem` is intentionally separate from `OrderItem`. It holds a full `MenuItem` reference for display purposes (name, price, image) without duplicating DataStore types.

### DataStore types (from `/lib/db.ts` — NOT modified)

| Type | Key fields relevant to Milestone 2 |
|---|---|
| `MenuItem` | `id`, `name`, `price`, `isAvailable` |
| `Order` | `id`, `customerName`, `phone`, `deliveryAddress`, `status`, `totalAmount`, `createdAt` |
| `OrderItem` | `id`, `orderId`, `menuItemId`, `itemNameSnapshot`, `quantity`, `unitPrice` |
| `OrderStatus` | `"PENDING" \| "ACTIVE" \| "COMPLETED"` |

### sessionStorage schema

Key: `"smartx_cart"`
Value: JSON string representing `CartItem[]` where each entry is:
```json
{
  "menuItem": { "id": "...", "name": "...", "price": 0.00, "isAvailable": true, ... },
  "quantity": 1
}
```

On parse error or missing key, `cartItems` initialises to `[]`.

### `createOrder` → DataStore write

When `createOrder` succeeds it pushes:

**One `Order` record:**
```typescript
{
  id: crypto.randomUUID(),
  customerName,
  phone,
  deliveryAddress,
  status: "PENDING",
  totalAmount: /* server-computed sum */,
  createdAt: new Date(),
}
```

**One `OrderItem` per cart item:**
```typescript
{
  id: crypto.randomUUID(),
  orderId: order.id,
  menuItemId,
  itemNameSnapshot,
  quantity,
  unitPrice,
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: addItem grows the cart

*For any* `MenuItem` that is not already in `cartItems`, calling `addItem(menuItem)` must result in `cartItems` having exactly one more entry, and the new entry must have `quantity = 1`.

**Validates: Requirements 1.3**

---

### Property 2: addItem increments existing quantity

*For any* `cartItems` array that already contains a `CartItem` for a given `MenuItem`, calling `addItem(menuItem)` must result in that item's `quantity` being incremented by exactly 1, and the length of `cartItems` must remain unchanged.

**Validates: Requirements 1.3**

---

### Property 3: updateQuantity to zero or below removes item

*For any* `cartItems` array containing a `CartItem`, calling `updateQuantity(menuItemId, q)` where `q <= 0` must result in that item being absent from `cartItems`, and all other items being unchanged.

**Validates: Requirements 1.4**

---

### Property 4: removeItem eliminates exactly the target item

*For any* `cartItems` array and any `menuItemId` present in it, calling `removeItem(menuItemId)` must result in a `cartItems` array that does not contain an entry with that `menuItemId`, and all other entries remain unchanged.

**Validates: Requirements 1.5**

---

### Property 5: subtotal is the correct sum

*For any* `cartItems` array, the `subtotal` value must equal the sum of `(item.menuItem.price × item.quantity)` for all items, rounded to two decimal places.

**Validates: Requirements 1.7**

---

### Property 6: cart sessionStorage round-trip

*For any* array of `CartItem` objects, serialising it to `sessionStorage` under key `"smartx_cart"` and then reading it back (as the `CartProvider` does on mount) must produce an array of `CartItem` objects equivalent to the original.

**Validates: Requirements 1.8, 1.9**

---

### Property 7: createOrder server-side totalAmount

*For any* valid `cartItems` input array, the `totalAmount` stored in the DataStore after a successful `createOrder` call must equal the server-computed sum of `(item.quantity × item.unitPrice)` for all items in the array, independent of any client-supplied total.

**Validates: Requirements 5.6**

---

### Property 8: createOrder rejects invalid inputs

*For any* `createOrder` input where `customerName`, `deliveryAddress`, or `phone` is empty, or `phone` contains non-numeric characters or has fewer than 7 digits, `createOrder` must return `{ success: false, error: string }` and the DataStore `orders` and `orderItems` arrays must be unchanged.

**Validates: Requirements 5.2, 5.3**

---

### Property 9: createOrder rejects unavailable menu items

*For any* `cartItems` input array where at least one `menuItemId` references a `MenuItem` with `isAvailable = false` or does not exist in the DataStore, `createOrder` must return `{ success: false, error: string }` and the DataStore must be unchanged.

**Validates: Requirements 5.4**

---

### Property 10: updateOrderStatus rejects completed orders

*For any* `Order` whose current `status` is `"COMPLETED"`, calling `updateOrderStatus(orderId, newStatus)` with any `newStatus` must return `{ success: false, error: string }` and leave the order's status unchanged in the DataStore.

**Validates: Requirements 8.4**

---

### Property 11: updateOrderStatus rejects unknown orderId

*For any* `orderId` that does not match any `Order` in the DataStore, `updateOrderStatus(orderId, newStatus)` must return `{ success: false, error: string }` and not modify the DataStore.

**Validates: Requirements 8.3**

---

**Property Reflection — redundancy check:**

- Properties 8 and 9 both test `createOrder` rejection paths but cover distinct validation rules (field emptiness/phone format vs. item availability), so both are kept.
- Properties 10 and 11 both test `updateOrderStatus` rejection but cover distinct failure conditions (wrong status vs. missing order), so both are kept.
- Properties 1 and 2 both cover `addItem` but test the two distinct branches (new item vs. existing item), so both are kept.
- No further redundancy found; each property provides unique validation value.

---

## Error Handling

### CartContext

| Scenario | Handling |
|---|---|
| `sessionStorage` not available (SSR, private browsing) | Caught inside `useEffect` — silently initialises to `[]` and skips writes |
| `sessionStorage` value is invalid JSON | `JSON.parse` wrapped in `try/catch` — falls back to `[]` |
| `useCart` called outside `CartProvider` | Throws `Error("useCart must be used within a CartProvider")` |

### `createOrder` Server Action

| Scenario | Response |
|---|---|
| Empty `customerName`, `deliveryAddress`, or `phone` | `{ success: false, error: "..." }` — no DataStore write |
| `phone` fails regex `/^\d{7,}$/` | `{ success: false, error: "..." }` — no DataStore write |
| `menuItemId` not found or item unavailable | `{ success: false, error: "..." }` — no DataStore write |
| Successful write | `{ success: true, orderId: string }` |

Client-side `CheckoutPage` also validates before calling the action (belt-and-suspenders). Any `error` returned by the action is displayed inline beneath the "Place Order" button.

### `updateOrderStatus` Server Action

| Scenario | Response |
|---|---|
| `orderId` not found | `{ success: false, error: "Order not found." }` |
| Order already `"COMPLETED"` | `{ success: false, error: "Cannot update a completed order." }` |
| Successful update | `{ success: true }` |

The `StaffOrderDashboard` surfaces action errors inline on the relevant order card.

### Checkout → Confirmation navigation

If the user navigates directly to `/checkout/confirmation` with a missing or invalid `orderId`, the `ConfirmationPage` renders an error state with a link back to `/menu`. It does not redirect (to avoid a redirect loop if the orderId is in a broken state).

### Empty cart redirect

`CheckoutPage` uses `useEffect` + `useRouter` to redirect to `/menu` when `cartItems` is empty. This handles both direct navigation and the case where the cart empties during a session.

---

## Testing Strategy

### Framework

- **Unit / property tests**: Vitest + `@testing-library/react` (already in `package.json`)
- **Property-based tests**: `fast-check` (already in `devDependencies` at `^4.8.0`)
- No new test dependencies required.

### Dual Testing Approach

Unit tests cover specific examples, edge cases, and integration points between components. Property-based tests verify universal properties across generated inputs. Together they give comprehensive coverage.

### Property-Based Test Configuration

Each property test runs with a minimum of **100 iterations** (fast-check default). Each test is tagged with a comment referencing the design property:

```
// Feature: food-ordering-milestone-2, Property N: <property text>
```

### Property Test Targets

| Property | Test Location | What's Generated |
|---|---|---|
| P1: addItem grows the cart | `__tests__/CartContext.test.tsx` | Random `MenuItem` not in current cart |
| P2: addItem increments quantity | `__tests__/CartContext.test.tsx` | Random `MenuItem` already in cart at random quantity |
| P3: updateQuantity ≤ 0 removes | `__tests__/CartContext.test.tsx` | Random cart + random negative/zero quantity |
| P4: removeItem exact removal | `__tests__/CartContext.test.tsx` | Random cart + random target menuItemId |
| P5: subtotal correctness | `__tests__/CartContext.test.tsx` | Random `CartItem[]` with random prices/quantities |
| P6: sessionStorage round-trip | `__tests__/CartContext.test.tsx` | Random `CartItem[]` |
| P7: createOrder totalAmount | `__tests__/createOrder.test.ts` | Random valid cart items with random prices |
| P8: createOrder invalid inputs | `__tests__/createOrder.test.ts` | Random empty/invalid field combinations |
| P9: createOrder unavailable items | `__tests__/createOrder.test.ts` | Cart items with unavailable or missing menuItemIds |
| P10: updateOrderStatus completed | `__tests__/updateOrderStatus.test.ts` | Random completed orders + random newStatus |
| P11: updateOrderStatus unknown | `__tests__/updateOrderStatus.test.ts` | Random non-existent orderId strings |

### Unit / Example Test Targets

| Component | What's tested |
|---|---|
| `AddToCartButton` | Renders enabled for available items; renders disabled for unavailable items; `addItem` called on click |
| `CartPage` | Empty state renders; decrement disabled at quantity=1; "Proceed to Checkout" disabled when empty |
| `CheckoutPage` | Inline validation errors shown for bad inputs; server error displayed; navigates on success |
| `ConfirmationPage` | Error state for missing/invalid orderId; order details rendered for valid orderId |
| `StaffOrderDashboard` | Correct column placement; Accept/Complete buttons on right status cards; no buttons on Completed |

### What is NOT property-tested

- **UI rendering / layout** — snapshot or example tests only (e.g., column labels, button labels)
- **sessionStorage availability failures** — a single example-based edge case test
- **Polling setup** — verified with a single example asserting `setInterval` is called with a 5-second interval
