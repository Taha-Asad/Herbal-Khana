// app/action/admin/orders.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma, ORDER_STATUS, PAYMENT_STATUS } from "@prisma/client";
import {
  ActionResponse,
  PaginatedData,
  QueryFilters,
  Order,
  OrderListItem,
  UpdateOrderData,
} from "@/types/admin";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { StoredAddress } from "@/types/order";

// ============================================================================
// TYPES
// ============================================================================

// JSON value type for Prisma fields

// Order with relations type
interface OrderWithRelations {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  paymentMethod: string | null;
  subtotal: number | { toNumber(): number };
  shippingCost: number | { toNumber(): number };
  tax: number | { toNumber(): number };
  discount: number | { toNumber(): number };
  promoDiscount: number | { toNumber(): number };
  total: number | { toNumber(): number };
  currency: string;
  shippingAddress: unknown;
  billingAddress: unknown;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  customerNote: string | null;
  adminNote: string | null;
  createdAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productId: string | null;
    name: string;
    sku: string;
    image: string | null;
    price: number | { toNumber(): number };
    quantity: number;
    subtotal: number | { toNumber(): number };
  }>;
  timeline: Array<{
    id: string;
    status: ORDER_STATUS;
    message: string | null;
    createdBy: string | null;
    createdAt: Date;
  }>;
}

interface OrderListItemWithRelations {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  total: number | { toNumber(): number };
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  _count: {
    items: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper to safely parse JSON address
function parseAddress(address: unknown): StoredAddress | undefined {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return undefined;
  }

  const addr = address as Record<string, unknown>;

  // Check for required fields
  if (!addr.name || !addr.line1 || !addr.city || !addr.postal) {
    return undefined;
  }

  return {
    name: String(addr.name || ""),
    phone: String(addr.phone || ""),
    line1: String(addr.line1 || ""),
    line2: addr.line2 ? String(addr.line2) : undefined,
    city: String(addr.city || ""),
    state: addr.state ? String(addr.state) : undefined,
    postal: String(addr.postal || ""),
    country: String(addr.country || "Pakistan"),
  };
}

// Helper to get default status message
function getDefaultStatusMessage(status: ORDER_STATUS): string {
  const messages: Record<ORDER_STATUS, string> = {
    PENDING: "Order is pending",
    PAID: "Payment confirmed",
    PROCESSING: "Order is being processed",
    SHIPPED: "Order has been shipped",
    DELIVERED: "Order delivered successfully",
    CANCELLED: "Order cancelled",
    REFUNDED: "Order refunded",
  };
  return messages[status];
}

// Helper to convert Decimal to number
function toNumber(value: number | { toNumber(): number } | null): number {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}

// ============================================================================
// GET ORDERS (LIST)
// ============================================================================

export async function getOrders(
  filters: QueryFilters = {}
): Promise<ActionResponse<PaginatedData<OrderListItem>>> {
  try {
    await requireAdmin();

    const {
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
      dateFrom,
      dateTo,
    } = filters;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status as ORDER_STATUS;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Build orderBy
    const validSortFields = [
      "createdAt",
      "total",
      "orderNumber",
      "status",
    ] as const;
    const sortField = validSortFields.includes(
      sortBy as (typeof validSortFields)[number]
    )
      ? sortBy
      : "createdAt";

    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortField]: sortOrder === "asc" ? "asc" : "desc",
    };

    // Execute queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Format orders
    const formattedOrders: OrderListItem[] = orders.map(
      (order: OrderListItemWithRelations) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name || "Unknown",
          email: order.user.email,
        },
        total: toNumber(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
      })
    );

    return {
      success: true,
      data: {
        items: formattedOrders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("getOrders error:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

// ============================================================================
// GET SINGLE ORDER
// ============================================================================

export async function getOrder(id: string): Promise<ActionResponse<Order>> {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Cast to typed order
    const typedOrder = order as unknown as OrderWithRelations;

    return {
      success: true,
      data: {
        id: typedOrder.id,
        orderNumber: typedOrder.orderNumber,
        status: typedOrder.status,
        paymentStatus: typedOrder.paymentStatus,
        paymentMethod: typedOrder.paymentMethod ?? undefined,
        customer: {
          id: typedOrder.user.id,
          name: typedOrder.user.name || "Unknown",
          email: typedOrder.user.email,
          phone: typedOrder.user.phone ?? undefined,
        },
        items: typedOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId ?? undefined,
          name: item.name,
          sku: item.sku,
          image: item.image ?? undefined,
          price: toNumber(item.price),
          quantity: item.quantity,
          subtotal: toNumber(item.subtotal),
        })),
        timeline: typedOrder.timeline.map((t) => ({
          id: t.id,
          status: t.status,
          message: t.message ?? undefined,
          createdBy: t.createdBy ?? undefined,
          createdAt: t.createdAt.toISOString(),
        })),
        subtotal: toNumber(typedOrder.subtotal),
        shippingCost: toNumber(typedOrder.shippingCost),
        tax: toNumber(typedOrder.tax),
        discount: toNumber(typedOrder.discount),
        promoDiscount: toNumber(typedOrder.promoDiscount),
        total: toNumber(typedOrder.total),
        currency: typedOrder.currency,
        shippingAddress: parseAddress(typedOrder.shippingAddress),
        billingAddress: parseAddress(typedOrder.billingAddress),
        trackingNumber: typedOrder.trackingNumber ?? undefined,
        estimatedDelivery: typedOrder.estimatedDelivery?.toISOString(),
        customerNote: typedOrder.customerNote ?? undefined,
        adminNote: typedOrder.adminNote ?? undefined,
        createdAt: typedOrder.createdAt.toISOString(),
        paidAt: typedOrder.paidAt?.toISOString(),
        shippedAt: typedOrder.shippedAt?.toISOString(),
        deliveredAt: typedOrder.deliveredAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getOrder error:", error);
    return { success: false, error: "Failed to load order" };
  }
}

// ============================================================================
// UPDATE ORDER
// ============================================================================

export async function updateOrder(
  id: string,
  data: UpdateOrderData
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await prisma.$transaction(async (tx) => {
      const updateData: Prisma.OrderUpdateInput = {};
      const now = new Date();

      // Handle status update
      if (data.status) {
        updateData.status = data.status;

        switch (data.status) {
          case "PAID":
            updateData.paidAt = now;
            updateData.paymentStatus = "SUCCESS";
            break;
          case "SHIPPED":
            updateData.shippedAt = now;
            break;
          case "DELIVERED":
            updateData.deliveredAt = now;
            break;
          case "CANCELLED":
            updateData.cancelledAt = now;
            break;
        }
      }

      // Handle payment status update
      if (data.paymentStatus) {
        updateData.paymentStatus = data.paymentStatus;
        if (data.paymentStatus === "SUCCESS" && !updateData.paidAt) {
          updateData.paidAt = now;
        }
      }

      // Handle tracking number update
      if (data.trackingNumber !== undefined) {
        updateData.trackingNumber = data.trackingNumber || null;
      }

      // Handle admin note update
      if (data.adminNote !== undefined) {
        updateData.adminNote = data.adminNote || null;
      }

      // Update the order
      await tx.order.update({
        where: { id },
        data: updateData,
      });

      // Create timeline entry for status changes
      if (data.status) {
        await tx.orderTimeline.create({
          data: {
            orderId: id,
            status: data.status,
            message: data.statusMessage || getDefaultStatusMessage(data.status),
            createdBy: admin.id,
          },
        });
      }

      // Restore stock if order is cancelled
      if (data.status === "CANCELLED") {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });

        if (order) {
          for (const item of order.items) {
            const variant = await tx.productVariant.findFirst({
              where: { sku: item.sku },
            });

            if (variant) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { success: true, message: "Order updated successfully" };
  } catch (error) {
    console.error("updateOrder error:", error);
    return { success: false, error: "Failed to update order" };
  }
}

// ============================================================================
// GET ORDER STATS
// ============================================================================

interface OrderStats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export async function getOrderStats(): Promise<ActionResponse<OrderStats>> {
  try {
    await requireAdmin();

    const [pending, processing, shipped, delivered, cancelled] =
      await Promise.all([
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({
          where: { status: { in: ["PAID", "PROCESSING"] } },
        }),
        prisma.order.count({ where: { status: "SHIPPED" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
        prisma.order.count({
          where: { status: { in: ["CANCELLED", "REFUNDED"] } },
        }),
      ]);

    return {
      success: true,
      data: {
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
      },
    };
  } catch (error) {
    console.error("getOrderStats error:", error);
    return { success: false, error: "Failed to load order stats" };
  }
}

// ============================================================================
// BULK UPDATE ORDERS
// ============================================================================

interface BulkUpdateData {
  orderIds: string[];
  status?: ORDER_STATUS;
  trackingNumber?: string;
}

export async function bulkUpdateOrders(
  data: BulkUpdateData
): Promise<ActionResponse<{ updated: number }>> {
  try {
    const admin = await requireAdmin();

    if (!data.orderIds || data.orderIds.length === 0) {
      return { success: false, error: "No orders selected" };
    }

    let updatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const orderId of data.orderIds) {
        const updateData: Prisma.OrderUpdateInput = {};
        const now = new Date();

        if (data.status) {
          updateData.status = data.status;

          switch (data.status) {
            case "PAID":
              updateData.paidAt = now;
              updateData.paymentStatus = "SUCCESS";
              break;
            case "SHIPPED":
              updateData.shippedAt = now;
              break;
            case "DELIVERED":
              updateData.deliveredAt = now;
              break;
            case "CANCELLED":
              updateData.cancelledAt = now;
              break;
          }
        }

        if (data.trackingNumber) {
          updateData.trackingNumber = data.trackingNumber;
        }

        await tx.order.update({
          where: { id: orderId },
          data: updateData,
        });

        if (data.status) {
          await tx.orderTimeline.create({
            data: {
              orderId,
              status: data.status,
              message: `Bulk update: ${getDefaultStatusMessage(data.status)}`,
              createdBy: admin.id,
            },
          });
        }

        updatedCount++;
      }
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      data: { updated: updatedCount },
      message: `${updatedCount} orders updated successfully`,
    };
  } catch (error) {
    console.error("bulkUpdateOrders error:", error);
    return { success: false, error: "Failed to update orders" };
  }
}

// ============================================================================
// EXPORT ORDERS
// ============================================================================

interface ExportFilters {
  status?: ORDER_STATUS;
  dateFrom?: string;
  dateTo?: string;
}

interface ExportedOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export async function exportOrders(
  filters: ExportFilters = {}
): Promise<ActionResponse<ExportedOrder[]>> {
  try {
    await requireAdmin();

    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportedOrders: ExportedOrder[] = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.user.name || "Unknown",
      customerEmail: order.user.email,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: toNumber(order.total),
      itemCount: order._count.items,
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: exportedOrders,
    };
  } catch (error) {
    console.error("exportOrders error:", error);
    return { success: false, error: "Failed to export orders" };
  }
}
