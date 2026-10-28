"use server";

import { prisma } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/db";
import { logger } from "@/lib/logger";

export interface DashboardSummary {
  totalOrdersToday: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedToday: number;
  revenueToday: number;
  revenueAllTime: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface TopSellingItem {
  itemName: string;
  quantitySold: number;
  revenue: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrdersToday,
      pendingOrders,
      inProgressOrders,
      completedToday,
      revenueTodayResult,
      revenueAllTimeResult,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.count({
        where: { status: "PENDING" },
      }),
      prisma.order.count({
        where: { status: "ACTIVE" },
      }),
      prisma.order.count({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalOrdersToday,
      pendingOrders,
      inProgressOrders,
      completedToday,
      revenueToday: revenueTodayResult._sum.totalAmount ?? 0,
      revenueAllTime: revenueAllTimeResult._sum.totalAmount ?? 0,
    };
  } catch (err) {
    logger.error("getDashboardSummary: unexpected error", { error: String(err) });
    return {
      totalOrdersToday: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedToday: 0,
      revenueToday: 0,
      revenueAllTime: 0,
    };
  }
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  try {
    const recent = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    return recent;
  } catch (err) {
    logger.error("getRecentOrders: unexpected error", { error: String(err) });
    return [];
  }
}

export async function getTopSellingItemsToday(): Promise<TopSellingItem[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: "COMPLETED",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      },
      select: {
        itemNameSnapshot: true,
        quantity: true,
        unitPrice: true,
      },
    });

    if (todayItems.length === 0) {
      return [];
    }

    const itemTotals: Record<string, { quantity: number; revenue: number }> = {};
    
    for (const item of todayItems) {
      if (!itemTotals[item.itemNameSnapshot]) {
        itemTotals[item.itemNameSnapshot] = { quantity: 0, revenue: 0 };
      }
      itemTotals[item.itemNameSnapshot].quantity += item.quantity;
      itemTotals[item.itemNameSnapshot].revenue += item.quantity * item.unitPrice;
    }

    const topItems = Object.entries(itemTotals)
      .map(([itemName, data]) => ({
        itemName,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return topItems;
  } catch (err) {
    logger.error("getTopSellingItemsToday: unexpected error", { error: String(err) });
    return [];
  }
}
