// app/action/order-tracking.actions.ts
"use server";

import { ORDER_STATUS } from "@prisma/client";
import {
  TrackingData,
  TrackingEvent,
  TrackingSearchParams,
  OrderDetails,
  OrderListItem,
  OrderStats,
} from "@/types/order";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "./user.action";
import {
  formatTrackingHistory,
  STATUS_STEPS,
  toDisplayAddress,
  TOTAL_STEPS,
} from "@/lib/order-helpers";

// Get order stats for the current user
export async function getOrderStats(): Promise<{
  success: boolean;
  data?: OrderStats;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const [total, pending, processing, shipped, delivered, cancelled] =
      await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.order.count({ where: { userId, status: "PENDING" } }),
        prisma.order.count({
          where: { userId, status: { in: ["PAID", "PROCESSING"] } },
        }),
        prisma.order.count({ where: { userId, status: "SHIPPED" } }),
        prisma.order.count({ where: { userId, status: "DELIVERED" } }),
        prisma.order.count({
          where: { userId, status: { in: ["CANCELLED", "REFUNDED"] } },
        }),
      ]);

    return {
      success: true,
      data: {
        total,
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
      },
    };
  } catch (error) {
    console.error("Error getting order stats:", error);
    return { success: false, error: "Failed to get order stats" };
  }
}

// Get user orders with pagination and filtering
export async function getUserOrders(
  page: number = 1,
  limit: number = 10,
  status?: ORDER_STATUS
): Promise<{
  success: boolean;
  data?: {
    items: OrderListItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            take: 1,
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const items: OrderListItem[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      itemCount: order._count.items,
      createdAt: order.createdAt.toISOString(),
      firstItemImage: order.items[0]?.image || null,
      firstItemName: order.items[0]?.name || null,
    }));

    return {
      success: true,
      data: {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return { success: false, error: "Failed to load orders" };
  }
}

// Get single order details
export async function getOrderById(orderId: string): Promise<{
  success: boolean;
  data?: OrderDetails;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId.toUpperCase() }],
        userId: session.user.id,
      },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: "asc" },
        },
        shippingMethod: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const orderDetails: OrderDetails = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || "unknown",
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      trackingNumber: order.trackingNumber ?? undefined,
      currentStep: STATUS_STEPS[order.status],
      totalSteps: TOTAL_STEPS,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image ?? undefined,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      discount: Number(order.discount),
      promoDiscount: Number(order.promoDiscount),
      total: Number(order.total),
      currency: order.currency,
      shippingAddress: toDisplayAddress(order.shippingAddress),
      billingAddress: toDisplayAddress(order.billingAddress),
      trackingHistory: formatTrackingHistory(order.timeline, order.status),
      shippingMethod: order.shippingMethod
        ? {
            name: order.shippingMethod.name,
            estimatedDays: order.shippingMethod.estimatedDays,
          }
        : undefined,
    };

    return { success: true, data: orderDetails };
  } catch (error) {
    console.error("Error getting order:", error);
    return { success: false, error: "Failed to load order details" };
  }
}

// Search order (for public tracking)
export async function searchOrder(
  params: TrackingSearchParams
): Promise<{ success: boolean; data?: TrackingData; error?: string }> {
  try {
    const { orderId, email, phone } = params;

    const whereConditions: object[] = [];
    if (email) whereConditions.push({ email: email.toLowerCase() });
    if (phone) whereConditions.push({ phone });

    if (whereConditions.length === 0) {
      return { success: false, error: "Email or phone is required" };
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId.toUpperCase() }, { id: orderId }],
        user: {
          OR: whereConditions,
        },
      },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: "asc" },
        },
        shippingMethod: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error:
          "Order not found. Please check your Order ID and contact information.",
      };
    }

    const trackingData: TrackingData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || "unknown",
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      trackingNumber: order.trackingNumber ?? undefined,
      currentStep: STATUS_STEPS[order.status],
      totalSteps: TOTAL_STEPS,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image ?? undefined,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      discount: Number(order.discount),
      promoDiscount: Number(order.promoDiscount),
      total: Number(order.total),
      currency: order.currency,
      shippingAddress: toDisplayAddress(order.shippingAddress),
      billingAddress: toDisplayAddress(order.billingAddress),
      trackingHistory: formatTrackingHistory(order.timeline, order.status),
      shippingMethod: order.shippingMethod
        ? {
            name: order.shippingMethod.name,
            estimatedDays: order.shippingMethod.estimatedDays,
          }
        : undefined,
    };

    return { success: true, data: trackingData };
  } catch (error) {
    console.error("Error searching order:", error);
    return {
      success: false,
      error: "An error occurred while searching for your order.",
    };
  }
}

// Refresh tracking data
export async function refreshOrderTracking(
  orderId: string
): Promise<{ success: boolean; data?: TrackingEvent[]; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const trackingHistory = formatTrackingHistory(order.timeline, order.status);
    return { success: true, data: trackingHistory };
  } catch (error) {
    console.error("Error refreshing tracking:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Cancel order (only if pending)
export async function cancelOrder(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Only allow cancellation of pending orders
    if (!["PENDING", "PAID"].includes(order.status)) {
      return {
        success: false,
        error: "Only pending or paid orders can be cancelled",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Restore stock
      for (const item of order.items) {
        if (item.productId) {
          // Get the variant by SKU
          const variant = await tx.productVariant.findFirst({
            where: { sku: item.sku },
          });

          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: { increment: item.quantity },
              },
            });

            // Decrease sales count
            await tx.product.update({
              where: { id: item.productId },
              data: {
                salesCount: { decrement: item.quantity },
              },
            });
          }
        }
      }

      // Add timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId,
          status: "CANCELLED",
          message: "Order cancelled by customer",
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

// Add this to app/action/order-tracking.actions.ts

// Reorder - add items from a previous order to cart
export async function reorder(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Get or create active cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          status: "ACTIVE",
        },
      });
    }

    // Add items to cart
    for (const item of order.items) {
      // Find the variant by SKU
      const variant = await prisma.productVariant.findFirst({
        where: { sku: item.sku },
        include: { product: true },
      });

      if (!variant || !variant.product.isActive) {
        continue; // Skip unavailable products
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variantId: variant.id,
          isSavedForLater: false,
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = Math.min(
          existingItem.quantity + item.quantity,
          variant.stock
        );
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        // Add new item
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: Math.min(item.quantity, variant.stock),
            isSavedForLater: false,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error reordering:", error);
    return { success: false, error: "Failed to add items to cart" };
  }
}
