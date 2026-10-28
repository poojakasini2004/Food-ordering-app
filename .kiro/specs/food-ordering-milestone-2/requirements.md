# Requirements Document

## Introduction

Milestone 2 of the SmartX Food Ordering Web Application adds the customer-facing ordering flow and the staff order management dashboard on top of the foundation established in Milestone 1. This milestone covers cart state management, cart UI, checkout, order creation, order confirmation, and a staff order dashboard. All ordering uses cash on delivery; there is no online payment anywhere in this system. Data is stored exclusively in the in-memory DataStore from Milestone 1 — no external database is introduced.

## Glossary

- **System**: The SmartX Food Ordering Web Application.
- **DataStore**: The in-memory data module (`/lib/db.ts`) whose exported mutable arrays are the sole runtime data layer. Type definitions in this file SHALL NOT be modified.
- **CartContext**: The React context module at `/context/CartContext.tsx` that manages client-side cart state and exposes it via `CartProvider` and `useCart`.
- **CartProvider**: The React context provider component exported from `CartContext` that wraps the root layout and supplies cart state to all descendant components.
- **CartItem**: A runtime object (not a DataStore type) with shape `{ menuItem: MenuItem; quantity: number }` held in CartContext state.
- **CartPage**: The client-rendered page at `/app/cart/page.tsx` that displays the current cart contents.
- **AddToCartButton**: The client component at `/components/menu/AddToCartButton.tsx` that receives a `MenuItem` prop and triggers `addItem` from `useCart`.
- **CheckoutPage**: The client-rendered page at `/app/checkout/page.tsx` where a customer enters delivery details and places an order.
- **ConfirmationPage**: The page at `/app/checkout/confirmation/page.tsx` that displays the finalised order details after successful placement.
- **OrderActions**: The Next.js Server Actions module at `/app/checkout/actions.ts` that validates and persists new orders to the DataStore.
- **StaffOrderDashboard**: The client-rendered page at `/app/staff/orders/page.tsx` that displays all orders in a three-column Kanban-style layout.
- **StaffOrderActions**: The Next.js Server Actions module at `/app/staff/orders/actions.ts` that fetches orders and updates order status.
- **MenuItem**: A menu item record from the DataStore as defined in Milestone 1.
- **Order**: An order record in the DataStore as defined in Milestone 1.
- **OrderItem**: An order-item line record in the DataStore as defined in Milestone 1.
- **OrderStatus**: The union type `"PENDING" | "ACTIVE" | "COMPLETED"` as defined in Milestone 1.
- **sessionStorage**: The browser's `sessionStorage` Web API used to persist cart state across page navigations within a single browser session.
- **ServerAction**: A Next.js Server Action function that executes on the server and is callable from client components.
- **Subtotal**: The computed sum of `(unitPrice × quantity)` for all CartItems, rounded to two decimal places.

---

## Requirements

### Requirement 1: Cart Context and State Management

**User Story:** As a customer, I want my cart to persist as I navigate the site, so that I can add items from the menu and then proceed to checkout without losing my selections.

#### Acceptance Criteria

1. THE CartContext SHALL export a `CartProvider` component and a `useCart` hook from `/context/CartContext.tsx`.
2. THE CartContext SHALL maintain a `cartItems` state variable containing an array of `CartItem` objects, each with a `menuItem` field of type `MenuItem` and a `quantity` field of type `number`.
3. THE CartContext SHALL expose an `addItem(menuItem: MenuItem)` function that, when the `MenuItem` is not already present in `cartItems`, appends a new `CartItem` with `quantity = 1`; and when the `MenuItem` is already present, increments its `quantity` by 1.
4. THE CartContext SHALL expose an `updateQuantity(menuItemId: string, quantity: number)` function that sets the quantity of the matching `CartItem` to the specified value; WHEN the specified quantity is less than or equal to 0, THE CartContext SHALL remove that `CartItem` from `cartItems` entirely.
5. THE CartContext SHALL expose a `removeItem(menuItemId: string)` function that removes the `CartItem` whose `menuItem.id` matches `menuItemId` from `cartItems`.
6. THE CartContext SHALL expose a `clearCart()` function that sets `cartItems` to an empty array.
7. THE CartContext SHALL expose a `subtotal` value computed as the sum of `(cartItem.menuItem.price × cartItem.quantity)` for all entries in `cartItems`, rounded to two decimal places.
8. WHEN the `CartProvider` mounts, THE CartContext SHALL read the value stored at the `sessionStorage` key `"smartx_cart"` and, if valid JSON representing an array of `CartItem` objects, restore it as the initial `cartItems` state.
9. WHEN `cartItems` changes, THE CartContext SHALL serialise the updated array to JSON and write it to the `sessionStorage` key `"smartx_cart"`.
10. IF the `useCart` hook is called outside a `CartProvider`, THEN THE CartContext SHALL throw an error with a descriptive message.
11. THE CartContext SHALL NOT use the `any` TypeScript type.
12. THE CartProvider SHALL be added as a wrapper in `/app/layout.tsx` so that all pages share the same cart state.

---

### Requirement 2: Menu Page — Add to Cart Integration

**User Story:** As a customer, I want to add available menu items to my cart directly from the menu page, so that I can build my order while browsing.

#### Acceptance Criteria

1. THE System SHALL extract a client component `AddToCartButton` at `/components/menu/AddToCartButton.tsx` that accepts a single prop of type `MenuItem`.
2. WHEN the `MenuItem` prop has `isAvailable = true`, THE `AddToCartButton` SHALL render an enabled button labelled "Add to Cart" that calls `addItem(menuItem)` from `useCart` when clicked.
3. WHEN the `MenuItem` prop has `isAvailable = false`, THE `AddToCartButton` SHALL render a button with the `disabled` attribute and SHALL NOT call `addItem` on click.
4. THE `/app/menu/page.tsx` SHALL replace its current inline "Add to Cart" button with the `AddToCartButton` component, passing the corresponding `MenuItem` as a prop.
5. THE `AddToCartButton` SHALL NOT use the `any` TypeScript type.

---

### Requirement 3: Cart Page

**User Story:** As a customer, I want to view and manage the contents of my cart, so that I can review items, adjust quantities, remove items, and proceed to checkout.

#### Acceptance Criteria

1. THE CartPage SHALL be implemented as a Next.js client component at `/app/cart/page.tsx`.
2. WHEN `cartItems` is not empty, THE CartPage SHALL render one row per `CartItem` displaying the item name, unit price formatted to two decimal places with a currency symbol, quantity controls, the row total (`unitPrice × quantity`) formatted to two decimal places with a currency symbol, and a Remove button.
3. THE CartPage SHALL render a decrement button (labelled "–") and an increment button (labelled "+") for each cart row as quantity controls.
4. WHEN the decrement button is clicked and the `CartItem` has `quantity > 1`, THE CartPage SHALL call `updateQuantity(menuItemId, quantity - 1)`.
5. WHEN a `CartItem` has `quantity = 1`, THE CartPage SHALL render the decrement button with the `disabled` attribute so that the quantity cannot be decremented below 1.
6. WHEN the increment button is clicked, THE CartPage SHALL call `updateQuantity(menuItemId, quantity + 1)`.
7. WHEN the Remove button is clicked, THE CartPage SHALL call `removeItem(menuItemId)`.
8. THE CartPage SHALL display the cart `subtotal` at the bottom of the item list, formatted to two decimal places with a currency symbol.
9. WHEN `cartItems` is empty, THE CartPage SHALL render an empty-state message and a navigation link to `/menu`.
10. THE CartPage SHALL render a "Proceed to Checkout" button that navigates to `/checkout`.
11. WHEN `cartItems` is empty, THE CartPage SHALL render the "Proceed to Checkout" button with the `disabled` attribute.
12. THE CartPage SHALL NOT use the `any` TypeScript type.

---

### Requirement 4: Checkout Page

**User Story:** As a customer, I want to enter my delivery details and place an order, so that the restaurant knows where and to whom to deliver my food.

#### Acceptance Criteria

1. THE CheckoutPage SHALL be implemented as a Next.js client component at `/app/checkout/page.tsx`.
2. WHEN the CheckoutPage loads and `cartItems` is empty, THE CheckoutPage SHALL redirect the customer to `/menu`.
3. THE CheckoutPage SHALL render a read-only order summary section displaying each `CartItem`'s item name, quantity, unit price formatted to two decimal places with a currency symbol, and the cart `subtotal` formatted to two decimal places with a currency symbol.
4. THE CheckoutPage SHALL render a controlled text input for Full Name, a controlled text input for Delivery Address, and a controlled text input for Phone Number; none of these SHALL use an HTML `<form>` element.
5. THE CheckoutPage SHALL display a static, non-interactive label reading "Payment: Cash on Delivery" and SHALL NOT render any payment input, dropdown, or selector of any kind.
6. WHEN the Full Name input is empty, THE CheckoutPage SHALL display an inline validation error beneath the Full Name input.
7. WHEN the Delivery Address input is empty, THE CheckoutPage SHALL display an inline validation error beneath the Delivery Address input.
8. WHEN the Phone Number input contains non-numeric characters or has fewer than 7 digits, THE CheckoutPage SHALL display an inline validation error beneath the Phone Number input.
9. THE CheckoutPage SHALL render a "Place Order" button that is disabled when any validation error exists or when an order submission is in progress.
10. WHEN the "Place Order" button is clicked and all inputs are valid, THE CheckoutPage SHALL call the `createOrder` ServerAction from `OrderActions` with `customerName`, `phone`, `deliveryAddress`, and `cartItems` mapped to `{ menuItemId, itemNameSnapshot, quantity, unitPrice }[]`.
11. WHEN the `createOrder` ServerAction returns `{ success: true, orderId }`, THE CheckoutPage SHALL navigate to `/checkout/confirmation?orderId={orderId}`.
12. WHEN the `createOrder` ServerAction returns `{ success: false, error }`, THE CheckoutPage SHALL display the error message inline on the page without navigating away.
13. THE CheckoutPage SHALL NOT use the `any` TypeScript type.

---

### Requirement 5: Order Creation Server Action

**User Story:** As a customer, I want my order to be validated and saved on the server, so that the restaurant receives a reliable, tamper-proof record of my order.

#### Acceptance Criteria

1. THE OrderActions module SHALL export a `createOrder` ServerAction at `/app/checkout/actions.ts` that accepts `customerName: string`, `phone: string`, `deliveryAddress: string`, and `cartItems: { menuItemId: string; itemNameSnapshot: string; quantity: number; unitPrice: number }[]`.
2. IF `customerName`, `deliveryAddress`, or `phone` is an empty string, THEN THE OrderActions SHALL return `{ success: false, error: string }` without modifying the DataStore.
3. IF `phone` contains any non-numeric character or has fewer than 7 digits, THEN THE OrderActions SHALL return `{ success: false, error: string }` without modifying the DataStore.
4. FOR EACH item in `cartItems`, IF the `menuItemId` does not correspond to an existing `MenuItem` in the DataStore, or the corresponding `MenuItem` has `isAvailable = false`, THEN THE OrderActions SHALL return `{ success: false, error: string }` without modifying the DataStore.
5. WHEN all validation checks pass, THE OrderActions SHALL generate a unique order `id` using `crypto.randomUUID()`.
6. WHEN all validation checks pass, THE OrderActions SHALL compute `totalAmount` server-side as the sum of `(item.quantity × item.unitPrice)` for all items in `cartItems`, ignoring any subtotal value sent from the client.
7. WHEN all validation checks pass, THE OrderActions SHALL atomically push one `Order` record to the DataStore's `orders` array and one `OrderItem` record per cart item to the DataStore's `orderItems` array, with the new `Order` having `status = "PENDING"` and `createdAt` set to the current date and time.
8. WHEN the write to the DataStore succeeds, THE OrderActions SHALL return `{ success: true, orderId: string }`.
9. THE OrderActions SHALL NOT use the `any` TypeScript type.

---

### Requirement 6: Order Confirmation Page

**User Story:** As a customer, I want to see a confirmation of my placed order, so that I know the order was received and can review what I ordered.

#### Acceptance Criteria

1. THE ConfirmationPage SHALL be implemented as a Next.js page at `/app/checkout/confirmation/page.tsx`.
2. THE ConfirmationPage SHALL read the `orderId` query parameter from the URL.
3. WHEN a valid `orderId` is present and matches an `Order` in the DataStore, THE ConfirmationPage SHALL display the Order ID, customer name, delivery address, all order items with their quantities, the total amount formatted to two decimal places with a currency symbol, and a static label reading "Payment: Cash on Delivery".
4. WHEN `orderId` is absent or does not match any `Order` in the DataStore, THE ConfirmationPage SHALL display an error message and a navigation link to `/menu`.
5. WHEN the ConfirmationPage successfully displays an order, THE ConfirmationPage SHALL call `clearCart()` to empty the cart.
6. THE ConfirmationPage SHALL NOT render a Back or Edit button; the displayed order is final and non-modifiable.
7. THE ConfirmationPage SHALL NOT use the `any` TypeScript type.

---

### Requirement 7: Staff Order Dashboard

**User Story:** As a Staff member, I want to see all orders organised by status and update their status, so that I can manage the order queue efficiently.

#### Acceptance Criteria

1. THE StaffOrderDashboard SHALL be implemented as a Next.js client component at `/app/staff/orders/page.tsx`, accessible only to authenticated users with `role = "STAFF"` or `role = "MANAGER"`, enforced by the existing Middleware from Milestone 1.
2. THE StaffOrderDashboard SHALL call the `getOrders` ServerAction on mount and repeat the call every 5 seconds to receive an updated snapshot of all orders.
3. THE StaffOrderDashboard SHALL display orders in three columns labelled "Pending", "Active", and "Completed", placing each order card in the column corresponding to its `OrderStatus`.
4. EACH order card SHALL display the Order ID, customer name, delivery address, phone number, all order items with their quantities, total amount formatted to two decimal places with a currency symbol, and the time the order was placed.
5. WHEN an order card has `status = "PENDING"`, THE StaffOrderDashboard SHALL render an "Accept" button on that card.
6. WHEN the "Accept" button is clicked, THE StaffOrderDashboard SHALL call `updateOrderStatus(orderId, "ACTIVE")` and re-fetch all orders after the call resolves.
7. WHEN an order card has `status = "ACTIVE"`, THE StaffOrderDashboard SHALL render a "Complete" button on that card.
8. WHEN the "Complete" button is clicked, THE StaffOrderDashboard SHALL call `updateOrderStatus(orderId, "COMPLETED")` and re-fetch all orders after the call resolves.
9. WHEN an order card has `status = "COMPLETED"`, THE StaffOrderDashboard SHALL render the card without any action buttons.
10. THE StaffOrderDashboard SHALL NOT use the `any` TypeScript type.

---

### Requirement 8: Staff Order Server Actions

**User Story:** As a Staff member, I want the server to return accurate order data and enforce status transition rules, so that the order queue cannot be corrupted by invalid updates.

#### Acceptance Criteria

1. THE StaffOrderActions module SHALL export a `getOrders` ServerAction at `/app/staff/orders/actions.ts` that returns a snapshot of all `Order` records from the DataStore, each enriched with its associated `OrderItem` records.
2. THE StaffOrderActions module SHALL export an `updateOrderStatus` ServerAction that accepts `orderId: string` and `newStatus: OrderStatus` and updates the `status` field of the matching `Order` in the DataStore to `newStatus`.
3. IF `orderId` does not match any `Order` in the DataStore, THEN THE `updateOrderStatus` ServerAction SHALL return `{ success: false, error: string }` without modifying the DataStore.
4. IF the matching `Order` has `status = "COMPLETED"`, THEN THE `updateOrderStatus` ServerAction SHALL return `{ success: false, error: string }` without modifying the DataStore, regardless of the requested `newStatus`.
5. WHEN the status update succeeds, THE `updateOrderStatus` ServerAction SHALL return `{ success: true }`.
6. THE StaffOrderActions SHALL NOT use the `any` TypeScript type.

---

### Requirement 9: No Online Payment

**User Story:** As a system operator, I want to ensure no online payment code exists in Milestone 2, so that the cash-on-delivery-only policy from Milestone 1 is preserved throughout the ordering flow.

#### Acceptance Criteria

1. THE System SHALL NOT contain any code, component, route, input, configuration, environment variable, dependency manifest entry, or comment that initiates, processes, references, or integrates card payments, digital wallet payments, bank transfers, or third-party payment gateway transactions anywhere in the Milestone 2 additions.
2. THE CheckoutPage SHALL display only the static label "Payment: Cash on Delivery" as the sole payment-related UI element, with no input, dropdown, or selector of any kind.
3. THE ConfirmationPage SHALL display only the static label "Payment: Cash on Delivery" as the sole payment-related UI element.

---

### Requirement 10: TypeScript Strict Mode Compliance

**User Story:** As a developer, I want all Milestone 2 additions to compile under TypeScript strict mode without errors, so that type safety is maintained across the entire codebase.

#### Acceptance Criteria

1. THE System SHALL compile all Milestone 2 source files without TypeScript errors under the existing `"strict": true` configuration in `tsconfig.json`.
2. THE System SHALL NOT introduce the `any` type or `as any` type assertions in any Milestone 2 source file.
3. THE System SHALL NOT add `@ts-ignore` or `@ts-expect-error` directives to suppress genuine type errors in any Milestone 2 source file.
4. THE System SHALL NOT modify the type definitions in `/lib/db.ts`, `/lib/auth.ts`, or `/middleware.ts`.
