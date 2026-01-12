// app/action/admin/dashboard.actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-auth";
import prisma from "@/lib/prisma";
import {
  ActionResponse,
  DashboardStats,
  ChartDataPoint,
  RecentOrderSummary,
  TopProductSummary,
} from "@/types/admin";

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats>
> {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      currentMonthRevenue,
      lastMonthRevenue,
      currentMonthOrders,
      lastMonthOrders,
      pendingOrders,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalCustomers,
      newCustomersThisMonth,
    ] = await Promise.all([
      // Current month revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      }),
      // Last month revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      }),
      // Current month orders
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      // Last month orders
      prisma.order.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      // Pending orders
      prisma.order.count({
        where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } },
      }),
      // Total products
      prisma.product.count({ where: { isActive: true } }),
      // Low stock
      prisma.productVariant.count({
        where: {
          stock: { gt: 0, lte: 10 },
          product: { isActive: true },
        },
      }),
      // Out of stock
      prisma.productVariant.count({
        where: {
          stock: 0,
          product: { isActive: true },
        },
      }),
      // Total customers
      prisma.user.count({ where: { role: "USER" } }),
      // New customers this month
      prisma.user.count({
        where: { role: "USER", createdAt: { gte: startOfMonth } },
      }),
    ]);

    const currentRevenue = Number(currentMonthRevenue._sum.total || 0);
    const previousRevenue = Number(lastMonthRevenue._sum.total || 0);
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    const ordersChange =
      lastMonthOrders > 0
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : currentMonthOrders > 0
        ? 100
        : 0;

    return {
      success: true,
      data: {
        revenue: {
          total: currentRevenue,
          change: revenueChange,
          period: "This month",
        },
        orders: {
          total: currentMonthOrders,
          change: ordersChange,
          pending: pendingOrders,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth,
        },
      },
    };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return { success: false, error: "Failed to load dashboard stats" };
  }
}

export async function getRevenueChart(
  days: number = 30
): Promise<ActionResponse<ChartDataPoint[]>> {
  try {
    await requireAdmin();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      select: { total: true, createdAt: true },
    });

    // Group by date
    const dataMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const key = date.toISOString().split("T")[0];
      dataMap.set(key, { revenue: 0, orders: 0 });
    }

    // Fill in data
    orders.forEach((order) => {
      const key = order.createdAt.toISOString().split("T")[0];
      const existing = dataMap.get(key);
      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      }
    });

    const data: ChartDataPoint[] = Array.from(dataMap.entries()).map(
      ([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: values.orders,
      })
    );

    return { success: true, data };
  } catch (error) {
    console.error("getRevenueChart error:", error);
    return { success: false, error: "Failed to load chart data" };
  }
}

export async function getRecentOrders(
  limit: number = 10
): Promise<ActionResponse<RecentOrderSummary[]>> {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: { select: { items: true } },
      },
    });

    return {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name || "Unknown",
          email: order.user.email,
          avatar: order.user.image || undefined,
        },
        total: Number(order.total),
        status: order.status,
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getRecentOrders error:", error);
    return { success: false, error: "Failed to load recent orders" };
  }
}

export async function getTopProducts(
  limit: number = 5
): Promise<ActionResponse<TopProductSummary[]>> {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { salesCount: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        productVariants: { select: { price: true, stock: true } },
      },
    });

    return {
      success: true,
      data: products.map((product) => {
        const minPrice =
          product.productVariants.length > 0
            ? Math.min(...product.productVariants.map((v) => Number(v.price)))
            : 0;
        const totalStock = product.productVariants.reduce(
          (sum, v) => sum + v.stock,
          0
        );

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url,
          price: minPrice,
          sold: product.salesCount,
          revenue: product.salesCount * minPrice,
          stock: totalStock,
        };
      }),
    };
  } catch (error) {
    console.error("getTopProducts error:", error);
    return { success: false, error: "Failed to load top products" };
  }
}
