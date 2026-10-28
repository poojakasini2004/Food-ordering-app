import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Users
  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      id: "u1",
      username: "staff",
      password: "staff123",
      role: "STAFF",
    },
  });

  await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      id: "u2",
      username: "manager",
      password: "manager123",
      role: "MANAGER",
    },
  });

  console.log("✅ Users seeded");

  // Seed Menu Categories
  const cat1 = await prisma.menuCategory.upsert({
    where: { id: "cat1" },
    update: {},
    create: {
      id: "cat1",
      name: "Starters",
      displayOrder: 1,
    },
  });

  const cat2 = await prisma.menuCategory.upsert({
    where: { id: "cat2" },
    update: {},
    create: {
      id: "cat2",
      name: "Mains",
      displayOrder: 2,
    },
  });

  const cat3 = await prisma.menuCategory.upsert({
    where: { id: "cat3" },
    update: {},
    create: {
      id: "cat3",
      name: "Drinks",
      displayOrder: 3,
    },
  });

  console.log("✅ Categories seeded");

  // Seed Menu Items
  await prisma.menuItem.upsert({
    where: { id: "item1" },
    update: {},
    create: {
      id: "item1",
      categoryId: cat1.id,
      name: "Spring Rolls",
      description: "Crispy veggie rolls",
      price: 5.99,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item2" },
    update: {},
    create: {
      id: "item2",
      categoryId: cat1.id,
      name: "Soup of the Day",
      description: "Chef's daily soup",
      price: 4.49,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item3" },
    update: {},
    create: {
      id: "item3",
      categoryId: cat2.id,
      name: "Grilled Chicken",
      description: "Served with fries and salad",
      price: 12.99,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item4" },
    update: {},
    create: {
      id: "item4",
      categoryId: cat2.id,
      name: "Veggie Burger",
      description: "Plant-based patty with fries",
      price: 10.99,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item5" },
    update: {},
    create: {
      id: "item5",
      categoryId: cat2.id,
      name: "Pasta Carbonara",
      description: "Creamy pasta with bacon",
      price: 11.49,
      isAvailable: false,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item6" },
    update: {},
    create: {
      id: "item6",
      categoryId: cat3.id,
      name: "Fresh Lemonade",
      description: "House-made lemonade",
      price: 2.99,
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "item7" },
    update: {},
    create: {
      id: "item7",
      categoryId: cat3.id,
      name: "Mango Lassi",
      description: "Chilled yogurt mango drink",
      price: 3.49,
      isAvailable: true,
    },
  });

  console.log("✅ Menu items seeded");

  // Seed some sample completed orders for testing
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const order1 = await prisma.order.create({
    data: {
      customerName: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      deliveryAddress: "123 Main St",
      status: "COMPLETED",
      totalAmount: 18.98,
      createdAt: yesterday,
      orderItems: {
        create: [
          {
            menuItemId: "item1",
            itemNameSnapshot: "Spring Rolls",
            quantity: 2,
            unitPrice: 5.99,
          },
          {
            menuItemId: "item3",
            itemNameSnapshot: "Grilled Chicken",
            quantity: 1,
            unitPrice: 12.99,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerName: "Jane Smith",
      email: "jane@example.com",
      phone: "0987654321",
      deliveryAddress: "456 Oak Ave",
      status: "COMPLETED",
      totalAmount: 14.48,
      createdAt: yesterday,
      orderItems: {
        create: [
          {
            menuItemId: "item4",
            itemNameSnapshot: "Veggie Burger",
            quantity: 1,
            unitPrice: 10.99,
          },
          {
            menuItemId: "item6",
            itemNameSnapshot: "Fresh Lemonade",
            quantity: 1,
            unitPrice: 2.99,
          },
        ],
      },
    },
  });

  console.log("✅ Sample orders seeded");
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
