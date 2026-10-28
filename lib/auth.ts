import { cookies } from "next/headers";
import { prisma } from "./db";
import type { User } from "./db";

export async function login(username: string, password: string): Promise<User | null> {
  // Return null immediately for empty inputs
  if (username === "" || password === "") {
    return null;
  }

  // Find exact match in database
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== password) {
    return null;
  }

  // Set session cookies
  const cookieStore = await cookies();
  cookieStore.set("user_id", user.id, { httpOnly: true, path: "/" });
  cookieStore.set("user_role", user.role, { httpOnly: true, path: "/" });

  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("user_id");
  cookieStore.delete("user_role");
}
