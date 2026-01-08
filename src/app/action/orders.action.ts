// lib/actions/orders.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type {
  Order,
  OrderSummary,
  ActionResponse,
  PaginatedResponse,
  ShippingAddressSnapshot,
} from "@/types/account";
import { ORDER_STATUS } from "@/generated/prisma/enums";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get user orders with pagination
 */
export async function getOrders(
  page: number = 1,
  pageSize: number = 10,
  status?: ORDER_STATUS
): Promise<ActionResponse<PaginatedResponse<OrderSummary>>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const where = {
      userId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          items: {
            take: 1,
            select: {
              image: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    const orderSummaries: OrderSummary[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      itemCount: order._count.items,
      createdAt: order.createdAt,
      firstItemImage: order.items[0]?.image || null,
    }));

    return {
      success: true,
      data: {
        items: orderSummaries,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to get orders:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

/**
 * Get single order details
 */
export async function getOrder(
  orderId: string
): Promise<ActionResponse<Order>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const orderData: Order = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      discount: Number(order.discount),
      promoDiscount: Number(order.promoDiscount),
      total: Number(order.total),
      currency: order.currency,
      shippingAddress: order.shippingAddress as ShippingAddressSnapshot | null,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      paymentMethod: order.paymentMethod,
      customerNote: order.customerNote,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      timeline: order.timeline.map((t) => ({
        id: t.id,
        status: t.status,
        message: t.message,
        createdAt: t.createdAt,
      })),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    };

    return { success: true, data: orderData };
  } catch (error) {
    console.error("Failed to get order:", error);
    return { success: false, error: "Failed to load order" };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Only allow cancellation of pending orders
    if (!["PENDING", "PAID"].includes(order.status)) {
      return {
        success: false,
        error: "Cannot cancel order in current status",
      };
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          adminNote: reason ? `User cancelled: ${reason}` : "Cancelled by user",
        },
      }),
      prisma.orderTimeline.create({
        data: {
          orderId,
          status: "CANCELLED",
          message: reason || "Order cancelled by customer",
        },
      }),
    ]);

    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${orderId}`);

    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

/**
 * Reorder - add all items from a previous order to cart
 */
export async function reorder(orderId: string): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, status: "ACTIVE" },
      });
    }

    // Add items to cart
    for (const item of order.items) {
      if (!item.productId) continue;

      // Get default variant
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.productId,
          stock: { gt: 0 },
        },
      });

      if (!variant) continue;

      await prisma.cartItem.upsert({
        where: {
          cartId_variantId_isSavedForLater: {
            cartId: cart.id,
            variantId: variant.id,
            isSavedForLater: false,
          },
        },
        update: {
          quantity: { increment: item.quantity },
        },
        create: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: item.quantity,
        },
      });
    }

    revalidatePath("/cart");

    return { success: true, message: "Items added to cart" };
  } catch (error) {
    console.error("Failed to reorder:", error);
    return { success: false, error: "Failed to add items to cart" };
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<
  ActionResponse<{
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
  }>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const stats = await prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const stat of stats) {
      result.total += stat._count.status;
      switch (stat.status) {
        case "PENDING":
        case "PAID":
          result.pending += stat._count.status;
          break;
        case "PROCESSING":
        case "SHIPPED":
          result.processing += stat._count.status;
          break;
        case "DELIVERED":
          result.delivered += stat._count.status;
          break;
        case "CANCELLED":
        case "REFUNDED":
          result.cancelled += stat._count.status;
          break;
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to get order stats:", error);
    return { success: false, error: "Failed to load order statistics" };
  }
}
