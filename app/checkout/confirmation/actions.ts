"use server";

import { prisma } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/db";

interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  
  if (!order) {
    return null;
  }

  return {
    order,
    items: order.orderItems,
  };
}
