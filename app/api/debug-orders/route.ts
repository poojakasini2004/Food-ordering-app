import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { orderItems: true },
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ordersCount: orders.length,
    orders: orders.map(o => ({
      id: o.id.slice(-8),
      customer: o.customerName,
      email: o.email,
      status: o.status,
      total: o.totalAmount,
      createdAt: o.createdAt,
      itemCount: o.orderItems.length,
    })),
    orderItemsCount: orders.reduce((sum, o) => sum + o.orderItems.length, 0),
  });
}
