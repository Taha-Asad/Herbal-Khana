// app/action/admin/users.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-auth";
import {
  ActionResponse,
  PaginatedData,
  QueryFilters,
  User,
  UserListItem,
} from "@/types/admin";

type Role = "USER" | "ADMIN";

export async function getUsers(
  filters: QueryFilters = {}
): Promise<ActionResponse<PaginatedData<UserListItem>>> {
  try {
    await requireAdmin();

    const {
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
    } = filters;

    const where: Prisma.UserWhereInput = {
      role: "USER",
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
      where.isBanned = false;
    } else if (status === "banned") {
      where.isBanned = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const orderByField = sortBy as keyof Prisma.UserOrderByWithRelationInput;
    const orderByValue = sortOrder as Prisma.SortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [orderByField]: orderByValue },
        include: {
          orders: {
            where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
            select: { total: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          role: user.role,
          isActive: user.isActive,
          isBanned: user.isBanned,
          orderCount: user._count.orders,
          totalSpent: user.orders.reduce((sum, o) => sum + Number(o.total), 0),
          lastLoginAt: user.lastLoginAt?.toISOString(),
          createdAt: user.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("getUsers error:", error);
    return { success: false, error: "Failed to load users" };
  }
}

export async function getUser(id: string): Promise<ActionResponse<User>> {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
          select: { total: true },
        },
        _count: { select: { orders: true } },
        addresses: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        phone: user.phone || undefined,
        image: user.image || undefined,
        role: user.role,
        isActive: user.isActive,
        isBanned: user.isBanned,
        banReason: user.banReason || undefined,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        stats: {
          orderCount: user._count.orders,
          totalSpent: user.orders.reduce((sum, o) => sum + Number(o.total), 0),
        },
      },
    };
  } catch (error) {
    console.error("getUser error:", error);
    return { success: false, error: "Failed to load user" };
  }
}

export async function updateUserRole(
  id: string,
  role: Role
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User role updated" };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function banUser(
  id: string,
  reason: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id },
      data: { isBanned: true, banReason: reason },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("banUser error:", error);
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id },
      data: { isBanned: false, banReason: null },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("unbanUser error:", error);
    return { success: false, error: "Failed to unban user" };
  }
}

export async function toggleUserStatus(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

export async function getUserStats(): Promise<
  ActionResponse<{
    total: number;
    active: number;
    banned: number;
    newThisMonth: number;
  }>
> {
  try {
    await requireAdmin();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [total, active, banned, newThisMonth] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({
        where: { role: "USER", isActive: true, isBanned: false },
      }),
      prisma.user.count({ where: { role: "USER", isBanned: true } }),
      prisma.user.count({
        where: { role: "USER", createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      success: true,
      data: { total, active, banned, newThisMonth },
    };
  } catch (error) {
    console.error("getUserStats error:", error);
    return { success: false, error: "Failed to load user stats" };
  }
}
