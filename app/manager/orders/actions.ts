"use server";

import { prisma } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/db";
import { logger } from "@/lib/logger";

export interface OrderWithDetails {
  order: Order;
  items: OrderItem[];
}

export async function getAllOrders(): Promise<OrderWithDetails[]> {
  try {
    const allOrders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return allOrders.map((order) => ({
      order,
      items: order.orderItems,
    }));
  } catch (err) {
    logger.error("getAllOrders: unexpected error", { error: String(err) });
    return [];
  }
}
