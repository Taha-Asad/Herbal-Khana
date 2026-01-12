// lib/admin-auth.ts
import { getServerAuthSession } from "@/app/action/home/user.action";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function checkAdminAccess() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return true;
}
