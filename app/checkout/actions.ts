"use server";

import { prisma } from "@/lib/db";
import type { Order, OrderItem } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface CartItemInput {
  menuItemId: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderInput {
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  cartItems: CartItemInput[];
}

type CreateOrderResult =
  | { success: true; orderId: string; order: Order; items: OrderItem[] }
  | { success: false; error: string };

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    const { customerName, email, phone, deliveryAddress, cartItems } = input;

    if (!customerName.trim()) {
      logger.warn("createOrder: missing customerName");
      return { success: false, error: "Full name is required." };
    }
    if (!email.trim()) {
      logger.warn("createOrder: missing email");
      return { success: false, error: "Email is required." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      logger.warn("createOrder: invalid email", { email });
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }
    if (!deliveryAddress.trim()) {
      logger.warn("createOrder: missing deliveryAddress");
      return { success: false, error: "Delivery address is required." };
    }
    if (!phone.trim()) {
      logger.warn("createOrder: missing phone");
      return { success: false, error: "Phone number is required." };
    }
    if (!/^\d{7,}$/.test(phone.trim())) {
      logger.warn("createOrder: invalid phone", { phone });
      return {
        success: false,
        error: "Phone number must be numeric and at least 7 digits.",
      };
    }

    // Verify all items are available in database
    for (const item of cartItems) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!menuItem || !menuItem.isAvailable) {
        logger.warn("createOrder: item unavailable", { menuItemId: item.menuItemId });
        return {
          success: false,
          error: "One or more items are no longer available.",
        };
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Create order with items in database
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        status: "PENDING",
        totalAmount: Math.round(totalAmount * 100) / 100,
        orderItems: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            itemNameSnapshot: item.itemNameSnapshot,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    logger.info("createOrder: success", { 
      orderId: newOrder.id, 
      totalAmount: newOrder.totalAmount,
      orderStatus: newOrder.status,
      customerEmail: newOrder.email,
    });

    // Send confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      customerEmail: email.trim(),
      customerName: customerName.trim(),
      orderId: newOrder.id,
      items: newOrder.orderItems.map(item => ({
        itemNameSnapshot: item.itemNameSnapshot,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      totalAmount: newOrder.totalAmount,
    });

    if (!emailResult.success) {
      logger.warn("createOrder: email failed but order created", { orderId: newOrder.id });
      // Still return success since order was created
    }

    return { 
      success: true, 
      orderId: newOrder.id, 
      order: newOrder, 
      items: newOrder.orderItems 
    };
  } catch (err) {
    logger.error("createOrder: unexpected error", { error: String(err) });
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
