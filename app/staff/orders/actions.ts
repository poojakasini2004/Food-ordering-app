"use server";

import { prisma } from "@/lib/db";
import type { Order, OrderItem, OrderStatus } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendOrderReadyEmail } from "@/lib/email";

export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export interface DailySummary {
  totalOrdersToday: number;
  pendingCount: number;
  inProgressCount: number;
  completedToday: number;
  revenueCollected: number;
}

type UpdateStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function getOrders(): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    logger.info("getOrders: returning orders", { count: orders.length });

    return orders.map((order) => ({
      order,
      items: order.orderItems,
    }));
  } catch (err) {
    logger.error("getOrders: unexpected error", { error: String(err) });
    return [];
  }
}

export async function getSummary(): Promise<DailySummary> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrdersToday,
      pendingCount,
      inProgressCount,
      completedToday,
      revenueResult,
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
    ]);

    return {
      totalOrdersToday,
      pendingCount,
      inProgressCount,
      completedToday,
      revenueCollected: revenueResult._sum.totalAmount ?? 0,
    };
  } catch (err) {
    logger.error("getSummary: unexpected error", { error: String(err) });
    return {
      totalOrdersToday: 0,
      pendingCount: 0,
      inProgressCount: 0,
      completedToday: 0,
      revenueCollected: 0,
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateStatusResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      logger.warn("updateOrderStatus: order not found", { orderId });
      return { success: false, error: "Order not found." };
    }

    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      logger.warn("updateOrderStatus: illegal transition", {
        orderId,
        currentStatus: order.status,
        requestedStatus: newStatus,
      });
      return {
        success: false,
        error: `Cannot update a ${order.status.toLowerCase()} order.`,
      };
    }

    // Validate transitions: PENDING -> ACTIVE, ACTIVE -> COMPLETED
    if (order.status === "PENDING" && newStatus !== "ACTIVE") {
      logger.warn("updateOrderStatus: invalid transition from PENDING", {
        orderId,
        requestedStatus: newStatus,
      });
      return {
        success: false,
        error: "Pending orders can only be moved to Active.",
      };
    }

    if (order.status === "ACTIVE" && newStatus !== "COMPLETED") {
      logger.warn("updateOrderStatus: invalid transition from ACTIVE", {
        orderId,
        requestedStatus: newStatus,
      });
      return {
        success: false,
        error: "Active orders can only be moved to Completed.",
      };
    }

    const previousStatus = order.status;
    
    // Update order status in database
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    
    logger.info("updateOrderStatus: success", {
      orderId,
      previousStatus,
      newStatus,
    });

    // Send "Order Ready" email when transitioning to COMPLETED
    if (previousStatus === "ACTIVE" && newStatus === "COMPLETED") {
      logger.info("updateOrderStatus: Attempting to send order ready email", { 
        orderId,
        customerEmail: order.email,
        customerName: order.customerName,
      });
      
      if (!order.email) {
        logger.error("updateOrderStatus: Cannot send email - customer email is missing", { orderId });
      } else {
        try {
          const emailResult = await sendOrderReadyEmail({
            customerEmail: order.email,
            customerName: order.customerName,
            orderId: order.id,
            items: order.orderItems.map(item => ({
              itemNameSnapshot: item.itemNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            totalAmount: order.totalAmount,
          });

          if (emailResult.success) {
            logger.info("updateOrderStatus: Order ready email sent successfully", { orderId });
          } else {
            logger.error("updateOrderStatus: Order ready email failed", { 
              orderId,
              error: emailResult.error 
            });
          }
        } catch (emailError) {
          logger.error("updateOrderStatus: Exception while sending order ready email", { 
            orderId,
            error: String(emailError),
          });
        }
      }
    }

    return { success: true };
  } catch (err) {
    logger.error("updateOrderStatus: unexpected error", { orderId, error: String(err) });
    return { success: false, error: "An unexpected error occurred." };
  }
}
