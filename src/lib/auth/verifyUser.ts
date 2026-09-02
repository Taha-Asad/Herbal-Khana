// lib/auth/verifyUser.ts
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function verifyUser(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Admin login
  if (email === adminEmail) {
    if (password !== adminPassword) return null;

    return {
      id: "admin",
      email: adminEmail,
      role: "ADMIN",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) return null;

  const validPassword = await compare(password, user.password);
  if (!validPassword) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
