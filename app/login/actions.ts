"use server";

import { login } from "@/lib/auth";
import type { Role } from "@/lib/db";

export type LoginResult =
  | { success: true; role: Role }
  | { success: false; error: string };

export async function loginAction(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    const user = await login(username, password);
    if (user === null) {
      return { success: false, error: "Invalid credentials" };
    }
    return { success: true, role: user.role };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
