// Re-export Prisma types for convenience
export type { User, MenuCategory, MenuItem, Order, OrderItem } from "@prisma/client";

// Export types that aren't directly from Prisma
export type Role = "STAFF" | "MANAGER";
export type OrderStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

// Export the prisma client
export { prisma } from "./prisma";
