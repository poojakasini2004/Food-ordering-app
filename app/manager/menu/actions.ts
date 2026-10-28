"use server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export type ActionResult = { success: true } | { success: false; error: string };

export async function addMenuItem(input: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}): Promise<ActionResult> {
  try {
    const { name, description, price, categoryId } = input;

    if (!name || name.trim().length === 0) {
      logger.warn("addMenuItem: missing name");
      return { success: false, error: "Name is required." };
    }
    if (name.length > 100) {
      logger.warn("addMenuItem: name too long", { length: name.length });
      return { success: false, error: "Name must be 100 characters or fewer." };
    }
    if (description.length > 500) {
      logger.warn("addMenuItem: description too long");
      return { success: false, error: "Description must be 500 characters or fewer." };
    }
    if (price < 0.01 || price > 9999.99) {
      logger.warn("addMenuItem: invalid price", { price });
      return { success: false, error: "Price must be between 0.01 and 9999.99." };
    }
    if (!categoryId || categoryId.trim().length === 0) {
      logger.warn("addMenuItem: missing categoryId");
      return { success: false, error: "Category is required." };
    }
    
    const categoryExists = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });
    
    if (!categoryExists) {
      logger.warn("addMenuItem: category not found", { categoryId });
      return { success: false, error: "Category does not exist." };
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        categoryId,
        isAvailable: true,
      },
    });
    
    logger.info("addMenuItem: success", { id: newItem.id, name });
    return { success: true };
  } catch (err) {
    logger.error("addMenuItem: unexpected error", { error: String(err) });
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function editMenuItem(input: {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}): Promise<ActionResult> {
  try {
    const { id, name, description, price, categoryId } = input;
    
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });
    
    if (!item) {
      return { success: true }; // Item doesn't exist, treat as success
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    logger.info("editMenuItem: success", { id });
    return { success: true };
  } catch (err) {
    logger.error("editMenuItem: unexpected error", { id: input.id, error: String(err) });
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });
    
    logger.info("deleteMenuItem: success", { id });
    return { success: true };
  } catch (err) {
    logger.error("deleteMenuItem: unexpected error", { id, error: String(err) });
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function toggleAvailability(id: string): Promise<ActionResult> {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });
    
    if (item) {
      await prisma.menuItem.update({
        where: { id },
        data: { isAvailable: !item.isAvailable },
      });
      
      logger.info("toggleAvailability: success", { id, isAvailable: !item.isAvailable });
    }
    
    return { success: true };
  } catch (err) {
    logger.error("toggleAvailability: unexpected error", { id, error: String(err) });
    return { success: false, error: "An unexpected error occurred." };
  }
}
