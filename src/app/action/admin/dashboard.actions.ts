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
import { ORDER_STATUS } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

// =============================================================================
// TYPES
// =============================================================================

interface OrderWithTotal {
  total: Decimal;
  createdAt: Date;
}

// types/admin.ts
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface OrderWithUser {
  id: string;
  orderNumber: string;
  total: Decimal;
  status: OrderStatus;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: {
    items: number;
  };
}

interface ProductWithVariants {
  id: string;
  name: string;
  slug: string;
  salesCount: number;
  images: Array<{
    url: string;
  }>;
  productVariants: Array<{
    price: Decimal;
    stock: number;
  }>;
}

// =============================================================================
// GET DASHBOARD STATS
// =============================================================================

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

// =============================================================================
// GET REVENUE CHART
// =============================================================================

export async function getRevenueChart(
  days: number = 30
): Promise<ActionResponse<ChartDataPoint[]>> {
  try {
    await requireAdmin();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders: OrderWithTotal[] = await prisma.order.findMany({
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
    orders.forEach((order: OrderWithTotal) => {
      const key = order.createdAt.toISOString().split("T")[0];
      const existing = dataMap.get(key);
      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      }
    });

    const data: ChartDataPoint[] = Array.from(dataMap.entries()).map(
      ([date, values]: [string, { revenue: number; orders: number }]) => ({
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

// =============================================================================
// GET RECENT ORDERS
// =============================================================================

export async function getRecentOrders(
  limit: number = 10
): Promise<ActionResponse<RecentOrderSummary[]>> {
  try {
    await requireAdmin();

    const orders: OrderWithUser[] = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: { select: { items: true } },
      },
    });

    const formattedOrders: RecentOrderSummary[] = orders.map(
      (order: OrderWithUser) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name || "Unknown",
          email: order.user.email || "",
          avatar: order.user.image || undefined,
        },
        total: Number(order.total),
        status: order.status,
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
      })
    );

    return {
      success: true,
      data: formattedOrders,
    };
  } catch (error) {
    console.error("getRecentOrders error:", error);
    return { success: false, error: "Failed to load recent orders" };
  }
}

// =============================================================================
// GET TOP PRODUCTS
// =============================================================================

export async function getTopProducts(
  limit: number = 5
): Promise<ActionResponse<TopProductSummary[]>> {
  try {
    await requireAdmin();

    const products: ProductWithVariants[] = await prisma.product.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { salesCount: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        productVariants: { select: { price: true, stock: true } },
      },
    });

    const formattedProducts: TopProductSummary[] = products.map(
      (product: ProductWithVariants) => {
        const minPrice =
          product.productVariants.length > 0
            ? Math.min(
                ...product.productVariants.map(
                  (v: { price: Decimal; stock: number }) => Number(v.price)
                )
              )
            : 0;

        const totalStock = product.productVariants.reduce(
          (sum: number, v: { price: Decimal; stock: number }) => sum + v.stock,
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
      }
    );

    return {
      success: true,
      data: formattedProducts,
    };
  } catch (error) {
    console.error("getTopProducts error:", error);
    return { success: false, error: "Failed to load top products" };
  }
}

// =============================================================================
// GET ORDER STATUS DISTRIBUTION
// =============================================================================

interface StatusCount {
  status: ORDER_STATUS;
  count: number;
}

export async function getOrderStatusDistribution(): Promise<
  ActionResponse<StatusCount[]>
> {
  try {
    await requireAdmin();

    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const data: StatusCount[] = statusCounts.map(
      (item: { status: ORDER_STATUS; _count: { status: number } }) => ({
        status: item.status,
        count: item._count.status,
      })
    );

    return { success: true, data };
  } catch (error) {
    console.error("getOrderStatusDistribution error:", error);
    return { success: false, error: "Failed to load order status data" };
  }
}

// =============================================================================
// GET LOW STOCK PRODUCTS
// =============================================================================

interface LowStockProduct {
  id: string;
  name: string;
  variantName: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
}

export async function getLowStockProducts(
  limit: number = 10
): Promise<ActionResponse<LowStockProduct[]>> {
  try {
    await requireAdmin();

    const variants = await prisma.productVariant.findMany({
      where: {
        stock: { lte: 10 },
        product: { isActive: true },
      },
      take: limit,
      orderBy: { stock: "asc" },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    const data: LowStockProduct[] = variants.map(
      (variant: {
        id: string;
        name: string;
        sku: string;
        stock: number;
        lowStockThreshold: number;
        product: { id: string; name: string };
      }) => ({
        id: variant.id,
        name: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
      })
    );

    return { success: true, data };
  } catch (error) {
    console.error("getLowStockProducts error:", error);
    return { success: false, error: "Failed to load low stock products" };
  }
}

// =============================================================================
// GET SALES BY CATEGORY
// =============================================================================

interface CategorySales {
  categoryId: string;
  categoryName: string;
  totalSales: number;
  totalRevenue: number;
}

export async function getSalesByCategory(): Promise<
  ActionResponse<CategorySales[]>
> {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isActive: true },
          select: {
            salesCount: true,
            productVariants: {
              select: { price: true },
              take: 1,
            },
          },
        },
      },
    });

    const data: CategorySales[] = categories.map(
      (category: {
        id: string;
        name: string;
        products: Array<{
          salesCount: number;
          productVariants: Array<{ price: Decimal }>;
        }>;
      }) => {
        const totalSales = category.products.reduce(
          (sum: number, p: { salesCount: number }) => sum + p.salesCount,
          0
        );

        const totalRevenue = category.products.reduce(
          (
            sum: number,
            p: {
              salesCount: number;
              productVariants: Array<{ price: Decimal }>;
            }
          ) => {
            const price =
              p.productVariants.length > 0
                ? Number(p.productVariants[0].price)
                : 0;
            return sum + p.salesCount * price;
          },
          0
        );

        return {
          categoryId: category.id,
          categoryName: category.name,
          totalSales,
          totalRevenue,
        };
      }
    );

    // Sort by total sales descending
    data.sort(
      (a: CategorySales, b: CategorySales) => b.totalSales - a.totalSales
    );

    return { success: true, data };
  } catch (error) {
    console.error("getSalesByCategory error:", error);
    return { success: false, error: "Failed to load sales by category" };
  }
}
