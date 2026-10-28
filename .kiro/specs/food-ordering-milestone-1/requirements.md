# Requirements Document

## Introduction

Milestone 1 of the SmartX Food Ordering Web Application establishes the foundational infrastructure for a single-restaurant food ordering platform built with Next.js 14 (App Router) and TypeScript. This milestone covers the in-memory data layer, authentication system, role-based access control middleware, public menu display, and manager menu administration. Customer ordering is fully public — no login is required to browse the menu. Only Staff and Manager roles require authentication. There is no online payment anywhere in this system; all orders use cash on delivery.

## Glossary

- **System**: The SmartX Food Ordering Web Application.
- **DataStore**: The in-memory data module (`/lib/db.ts`) that exports mutable arrays as the runtime data layer.
- **AuthModule**: The authentication module (`/lib/auth.ts`) responsible for login, session retrieval, and logout via Next.js cookies.
- **Middleware**: The Next.js middleware (`/middleware.ts`) that enforces role-based access control on protected routes.
- **LoginPage**: The page at `/app/login/page.tsx` that renders the login form.
- **MenuPage**: The server-rendered page at `/app/menu/page.tsx` that displays the public restaurant menu.
- **ManagerMenuPage**: The page at `/app/manager/menu/page.tsx` that allows Managers to administer menu items.
- **ServerActions**: The Next.js Server Actions defined in `/app/manager/menu/actions.ts` that mutate the in-memory data store.
- **User**: A person with a username, password, and role stored in the DataStore.
- **Role**: An enumerated type with values `"STAFF"` or `"MANAGER"`.
- **OrderStatus**: An enumerated type with values `"PENDING"`, `"ACTIVE"`, or `"COMPLETED"`.
- **MenuCategory**: A grouping entity containing a name and a collection of MenuItems.
- **MenuItem**: A single orderable dish with a name, description, price, category reference, and availability flag (`isAvailable`).
- **Order**: A record linking a list of OrderItems with a status and timestamp.
- **OrderItem**: A line item linking a MenuItem to a quantity within an Order.
- **Staff**: A User with `Role = "STAFF"` who manages the order queue.
- **Manager**: A User with `Role = "MANAGER"` who administers the menu and views sales.
- **PublicRoute**: Any route accessible without authentication: `/`, `/menu`, `/cart`, `/checkout`, `/checkout/confirmation`.
- **ProtectedRoute**: Any route under `/staff/*` or `/manager/*` that requires a valid authenticated session.
- **Cookie**: A Next.js cookie used to persist `user_id` and `user_role` for the duration of a session.

---

## Requirements

### Requirement 1: In-Memory Data Store

**User Story:** As a developer, I want a fully typed in-memory data store, so that all application modules share a consistent, mutable data layer without requiring an external database at runtime.

#### Acceptance Criteria

1. THE DataStore SHALL export a mutable array of `User` objects, each containing at minimum `id`, `username`, `password` (plaintext string), and `role` (of type `Role`).
2. THE DataStore SHALL export a mutable array of `MenuCategory` objects, each containing at minimum `id`, `name`, and `displayOrder` (number).
3. THE DataStore SHALL export a mutable array of `MenuItem` objects, each containing at minimum `id`, `name`, `description`, `price` (number greater than 0), `categoryId` (referencing a `MenuCategory`), and `isAvailable` (boolean).
4. THE DataStore SHALL export a mutable array of `Order` objects, each containing at minimum `id`, `customerName`, `phone`, `deliveryAddress`, `status` (of type `OrderStatus`), `totalAmount` (number), and `createdAt` (Date); and a separate mutable array of `OrderItem` objects each containing `id`, `orderId`, `menuItemId`, `itemNameSnapshot`, `quantity` (integer ≥ 1), and `unitPrice` (number > 0).
5. THE DataStore SHALL be pre-populated with seed data including at least two `User` records (one with `Role = "STAFF"` and one with `Role = "MANAGER"`), at least two `MenuCategory` records, at least four `MenuItem` records with at least one per category, and an empty `Order` array and empty `OrderItem` array.
6. THE DataStore SHALL define all types using TypeScript without using the `any` type.
7. THE DataStore SHALL define the `Role` type as a TypeScript union type `"STAFF" | "MANAGER"`.
8. THE DataStore SHALL define the `OrderStatus` type as a TypeScript union type `"PENDING" | "ACTIVE" | "COMPLETED"`.
9. THE DataStore SHALL NOT import or instantiate any Prisma runtime client; Prisma types MAY be used solely for type shape consistency.

---

### Requirement 2: Authentication Module

**User Story:** As a Staff or Manager user, I want to log in with a username and password, so that I can access role-protected areas of the application.

#### Acceptance Criteria

1. THE AuthModule SHALL export a `login` function that accepts a username and password and searches for a User record where both fields match exactly.
2. WHEN a matching `User` record is found, THE AuthModule SHALL establish an authenticated session for that user and return the matched `User` object.
3. IF no matching `User` record is found, THEN THE AuthModule SHALL return `null` and SHALL NOT establish any session.
4. IF the username or password provided to `login` is an empty string, THEN THE AuthModule SHALL return `null` without searching the DataStore.
5. THE AuthModule SHALL export a `getCurrentUser` function that retrieves the currently authenticated user from the active session and returns the matching `User` object from the DataStore.
6. IF no active session exists or the session's user identifier does not match any `User` in the DataStore, THEN THE `getCurrentUser` function SHALL return `null`.
7. WHEN the `logout` function is called, THE AuthModule SHALL terminate the authenticated session such that a subsequent call to `getCurrentUser` returns `null`.
8. THE AuthModule SHALL NOT use JWT, session libraries, encryption, or any external authentication service.
9. THE AuthModule SHALL NOT use the `any` TypeScript type.

---

### Requirement 3: Login Page

**User Story:** As a Staff or Manager user, I want a login form, so that I can enter my credentials and be redirected to my role-appropriate dashboard.

#### Acceptance Criteria

1. THE LoginPage SHALL render username and password input fields as controlled React components backed by component state.
2. THE LoginPage SHALL NOT use any HTML `<form>` element; submission SHALL be triggered by an `onClick` handler on a button element.
3. WHEN the user clicks the submit button, THE LoginPage SHALL call the `login` function from the AuthModule with the current values of the username and password fields, and SHALL clear any previously displayed error message before the new attempt resolves.
4. WHEN the `login` function returns a `User` with `role = "STAFF"`, THE LoginPage SHALL redirect the user to `/staff/orders`.
5. WHEN the `login` function returns a `User` with `role = "MANAGER"`, THE LoginPage SHALL redirect the user to `/manager/sales`.
6. IF the `login` function returns `null`, THEN THE LoginPage SHALL display an inline error message within the login form area indicating that the credentials are invalid, without navigating away from the page.
7. THE LoginPage SHALL treat a `null` return from the `login` function as the authoritative failure result and SHALL display the error message, regardless of any other state.
8. THE LoginPage SHALL NOT display the error message before a submission attempt has been made.
9. THE LoginPage SHALL NOT use the `any` TypeScript type.
10. IF the `login` function throws an exception, THEN THE LoginPage SHALL display an inline error message within the login form area and SHALL NOT propagate the exception to an unhandled error boundary.
11. WHILE the `login` function call is pending, THE LoginPage SHALL disable the submit button to prevent duplicate submission attempts.

---

### Requirement 4: Role-Based Access Control Middleware

**User Story:** As a system operator, I want route-level access control, so that only authenticated users with the appropriate role can access protected pages.

#### Acceptance Criteria

1. WHEN a request arrives for a path matching `/staff/*`, THE Middleware SHALL permit access only when the request carries an authenticated session containing a `user_id` that resolves to an existing `User` record with `role = "STAFF"` or `role = "MANAGER"`.
2. WHEN a request arrives for a path matching `/manager/*`, THE Middleware SHALL permit access only when the request carries an authenticated session containing a `user_id` that resolves to an existing `User` record with `role = "MANAGER"`.
3. IF a request to `/staff/*` is made without a valid authenticated session, or with a session whose `user_id` does not resolve to an existing `User`, or with a `User` whose role is neither `"STAFF"` nor `"MANAGER"`, THEN THE Middleware SHALL redirect the request to `/login`.
4. IF a request to `/manager/*` is made without a valid authenticated session, or with a session whose `user_id` does not resolve to an existing `User`, or with a `User` whose role is not `"MANAGER"`, THEN THE Middleware SHALL redirect the request to `/login`.
5. THE Middleware SHALL treat the following paths as public and SHALL NOT redirect them: `/`, `/menu`, `/cart`, `/checkout`, and `/checkout/confirmation`.
6. IF a request arrives for a path that is neither a public route nor under `/staff/*` or `/manager/*`, THEN THE Middleware SHALL allow the request to proceed without authentication checks.
7. THE Middleware SHALL NOT use the `any` TypeScript type.

---

### Requirement 5: Public Menu Page

**User Story:** As a customer, I want to browse the restaurant menu without logging in, so that I can see all available dishes grouped by category before placing an order.

#### Acceptance Criteria

1. THE MenuPage SHALL be implemented as a Next.js server component that reads menu data directly from the DataStore at render time.
2. THE MenuPage SHALL group and display `MenuItem` records under their respective `MenuCategory` headings, ordered by the category's `displayOrder` field.
3. THE MenuPage SHALL display the `name`, `description`, and `price` of each `MenuItem`, with price formatted to two decimal places preceded by a currency symbol.
4. WHEN a `MenuItem` has `isAvailable = true`, THE MenuPage SHALL render its "Add to Cart" button without the `disabled` attribute.
5. WHEN a `MenuItem` has `isAvailable = false`, THE MenuPage SHALL render the item with an `aria-disabled="true"` attribute or a CSS class that visually distinguishes it, and SHALL render its "Add to Cart" button with the `disabled` attribute set.
6. IF a `MenuCategory` contains no `MenuItem` records, THEN THE MenuPage SHALL either omit the category heading or render it with a visible "No items available" indicator.
7. THE MenuPage SHALL be accessible without authentication and SHALL NOT require any cookie to render.
8. THE MenuPage SHALL NOT use the `any` TypeScript type.

---

### Requirement 6: Manager Menu Administration

**User Story:** As a Manager, I want to add, edit, delete, and toggle the availability of menu items, so that I can keep the menu up to date.

#### Acceptance Criteria

1. THE ManagerMenuPage SHALL be accessible only to users with `role = "MANAGER"`, enforced by the Middleware defined in Requirement 4.
2. THE ManagerMenuPage SHALL display the current list of `MenuItem` records retrieved from the DataStore, and SHALL display a visible "No menu items" indicator when the list is empty.
3. THE ServerActions SHALL export an `addMenuItem` action that accepts a new item's `name` (non-empty string, ≤ 100 characters), `description` (string, ≤ 500 characters), `price` (number in the range 0.01–9999.99), and `categoryId` (non-empty string referencing an existing `MenuCategory`), creates a new `MenuItem` record with a unique `id` and `isAvailable = true`, and appends it to the DataStore's `MenuItem` array.
4. THE ServerActions SHALL export an `editMenuItem` action that accepts a `MenuItem` `id` and updated values for one or more of the fields `name`, `description`, `price`, and `categoryId`, and updates only those fields on the matching record in the DataStore's `MenuItem` array.
5. IF the `id` provided to `editMenuItem` does not match any record in the DataStore, THEN THE ServerActions SHALL leave the DataStore unchanged.
6. THE ServerActions SHALL export a `deleteMenuItem` action that accepts a `MenuItem` `id` and removes the matching record from the DataStore's `MenuItem` array.
7. IF the `id` provided to `deleteMenuItem` does not match any record in the DataStore, THEN THE ServerActions SHALL leave the DataStore unchanged.
8. THE ServerActions SHALL export a `toggleAvailability` action that accepts a `MenuItem` `id` and sets the `isAvailable` field of the matching record to the logical opposite of its current value.
9. IF the `id` provided to `toggleAvailability` does not match any record in the DataStore, THEN THE ServerActions SHALL leave the DataStore unchanged.
10. ALL mutations performed by the ServerActions SHALL update the DataStore's in-memory arrays directly without writing to any external database or file system.
11. THE ServerActions SHALL NOT use the `any` TypeScript type.
12. IF `addMenuItem` is called with missing or out-of-range field values, THEN THE ServerAction SHALL return an error result without modifying the DataStore.

---

### Requirement 7: TypeScript Strict Mode

**User Story:** As a developer, I want the entire codebase to compile under TypeScript strict mode, so that type safety is guaranteed across all modules.

#### Acceptance Criteria

1. THE System SHALL enable `"strict": true` in `tsconfig.json`.
2. THE System SHALL compile without TypeScript errors under strict mode, and project-authored source files SHALL NOT contain `@ts-ignore` or `@ts-expect-error` directives that suppress genuine type errors.
3. THE System SHALL NOT use the `any` type, nor `as any` type assertions, in any project-authored source file within the scope of Milestone 1.

---

### Requirement 8: No Online Payment

**User Story:** As a system operator, I want to ensure no online payment code exists in the codebase, so that the platform complies with its cash-on-delivery-only policy for this milestone.

#### Acceptance Criteria

1. THE System SHALL NOT contain any code, component, route, configuration, environment variable, dependency manifest entry, or comment that initiates, processes, references, or integrates card payments, digital wallet payments, bank transfers, or third-party payment gateway transactions, including dormant or unused payment gateway credentials.
2. THE System SHALL NOT import or reference any library or SDK whose primary purpose is processing card payments, digital wallet payments, bank transfers, or third-party payment gateway integrations.
