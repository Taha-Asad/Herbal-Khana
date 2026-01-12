// app/action/admin/orders.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ORDER_STATUS, Prisma } from "@prisma/client";
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

// Helper to safely parse JSON address
function parseAddress(
  address: Prisma.JsonValue | null
): StoredAddress | undefined {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return undefined;
  }

  const addr = address as Record<string, unknown>;
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
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const orderByField = sortBy as keyof Prisma.OrderOrderByWithRelationInput;
    const orderByValue = sortOrder as Prisma.SortOrder;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [orderByField]: orderByValue },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customer: {
            name: order.user.name || "Unknown",
            email: order.user.email,
          },
          total: Number(order.total),
          status: order.status,
          paymentStatus: order.paymentStatus,
          itemCount: order._count.items,
          createdAt: order.createdAt.toISOString(),
        })),
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

export async function getOrder(id: string): Promise<ActionResponse<Order>> {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || undefined,
        customer: {
          id: order.user.id,
          name: order.user.name || "Unknown",
          email: order.user.email,
          phone: order.user.phone || undefined,
        },
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId || undefined,
          name: item.name,
          sku: item.sku,
          image: item.image || undefined,
          price: Number(item.price),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        })),
        timeline: order.timeline.map((t) => ({
          id: t.id,
          status: t.status,
          message: t.message || undefined,
          createdBy: t.createdBy || undefined,
          createdAt: t.createdAt.toISOString(),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        promoDiscount: Number(order.promoDiscount),
        total: Number(order.total),
        currency: order.currency,
        shippingAddress: parseAddress(order.shippingAddress),
        billingAddress: parseAddress(order.billingAddress),
        trackingNumber: order.trackingNumber || undefined,
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        customerNote: order.customerNote || undefined,
        adminNote: order.adminNote || undefined,
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString(),
        shippedAt: order.shippedAt?.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error("getOrder error:", error);
    return { success: false, error: "Failed to load order" };
  }
}

export async function updateOrder(
  id: string,
  data: UpdateOrderData
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await prisma.$transaction(async (tx) => {
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

      if (data.paymentStatus) {
        updateData.paymentStatus = data.paymentStatus;
        if (data.paymentStatus === "SUCCESS" && !updateData.paidAt) {
          updateData.paidAt = now;
        }
      }

      if (data.trackingNumber !== undefined) {
        updateData.trackingNumber = data.trackingNumber;
      }

      if (data.adminNote !== undefined) {
        updateData.adminNote = data.adminNote;
      }

      await tx.order.update({
        where: { id },
        data: updateData,
      });

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

export async function getOrderStats(): Promise<
  ActionResponse<{
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }>
> {
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
      data: { pending, processing, shipped, delivered, cancelled },
    };
  } catch (error) {
    console.error("getOrderStats error:", error);
    return { success: false, error: "Failed to load order stats" };
  }
}
