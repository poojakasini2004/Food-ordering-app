"use server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export type SalesFilter = "today" | "week" | "month" | "custom";

export interface SalesData {
  totalOrders: number;
  totalRevenue: number;
  topItems: { itemName: string; quantitySold: number }[];
  isEmpty: boolean;
}

function getDateRange(filter: SalesFilter, from?: Date, to?: Date): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (filter === "custom" && from && to) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const customEnd = new Date(to);
    customEnd.setHours(23, 59, 59, 999);
    return { start, end: customEnd };
  }

  const start = new Date(now);
  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (filter === "week") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (filter === "month") {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export async function getSalesData(
  filter: SalesFilter,
  customRange?: { from: Date; to: Date }
): Promise<SalesData> {
  try {
    const { start, end } = getDateRange(filter, customRange?.from, customRange?.to);

    const [orderCount, revenueResult, orderItems] = await Promise.all([
      prisma.order.count({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: "COMPLETED",
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        select: {
          itemNameSnapshot: true,
          quantity: true,
        },
      }),
    ]);

    if (orderCount === 0) {
      logger.info("getSalesData: no completed orders", { filter });
      return { totalOrders: 0, totalRevenue: 0, topItems: [], isEmpty: true };
    }

    const totalOrders = orderCount;
    const totalRevenue = Math.round((revenueResult._sum.totalAmount ?? 0) * 100) / 100;

    const itemTotals: Record<string, number> = {};
    for (const item of orderItems) {
      itemTotals[item.itemNameSnapshot] =
        (itemTotals[item.itemNameSnapshot] ?? 0) + item.quantity;
    }

    const topItems = Object.entries(itemTotals)
      .map(([itemName, quantitySold]) => ({ itemName, quantitySold }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    logger.info("getSalesData: success", { filter, totalOrders, totalRevenue });

    return { totalOrders, totalRevenue, topItems, isEmpty: false };
  } catch (err) {
    logger.error("getSalesData: unexpected error", {
      filter,
      error: String(err),
    });
    return { totalOrders: 0, totalRevenue: 0, topItems: [], isEmpty: true };
  }
}
