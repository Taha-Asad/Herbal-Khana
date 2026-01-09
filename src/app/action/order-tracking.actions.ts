// lib/actions/order-tracking.actions.ts
"use server";

import { ORDER_STATUS } from "@prisma/client";
import {
  OrderDetails,
  TrackingEvent,
  TrackingSearchParams,
} from "@/types/order";
import prisma from "@/lib/prisma";

// Status step mapping for progress indicator
const STATUS_STEPS: Record<ORDER_STATUS, number> = {
  PENDING: 1,
  PAID: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 0,
  REFUNDED: 0,
};

const TOTAL_STEPS = 5;

function formatAddress(address: unknown): {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} {
  if (!address || typeof address !== "object") {
    return {
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    };
  }

  const addr = address as Record<string, string>;
  return {
    name: addr.name || "",
    phone: addr.phone || "",
    street: addr.line1 || addr.street || "",
    city: addr.city || "",
    state: addr.state || "",
    postalCode: addr.postal || addr.postalCode || "",
    country: addr.country || "Pakistan",
  };
}

function formatTrackingHistory(
  timeline: {
    id: string;
    status: ORDER_STATUS;
    message: string | null;
    createdAt: Date;
  }[],
  currentStatus: ORDER_STATUS
): TrackingEvent[] {
  return timeline.map((event, index) => ({
    id: event.id,
    status: event.status,
    message: event.message,
    timestamp: event.createdAt.toISOString(),
    isCompleted: index < timeline.length - 1 || currentStatus === "DELIVERED",
    isCurrent: index === timeline.length - 1 && currentStatus !== "DELIVERED",
  }));
}

export async function searchOrder(
  params: TrackingSearchParams
): Promise<{ success: boolean; data?: OrderDetails; error?: string }> {
  try {
    const { orderId, email, phone } = params;

    // Build the query
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId.toUpperCase() }, { id: orderId }],
        user: {
          OR: [
            email ? { email: email.toLowerCase() } : {},
            phone ? { phone } : {},
          ].filter((obj) => Object.keys(obj).length > 0),
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

    const orderDetails: OrderDetails = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || "",
      trackingNumber: order.trackingNumber,
      currentStep: STATUS_STEPS[order.status],
      totalSteps: TOTAL_STEPS,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image,
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
      shippingAddress: formatAddress(order.shippingAddress),
      billingAddress: formatAddress(order.billingAddress),
      trackingHistory: formatTrackingHistory(order.timeline, order.status),
    };

    return { success: true, data: orderDetails };
  } catch (error) {
    console.error("Error searching order:", error);
    return {
      success: false,
      error: "An error occurred while searching for your order.",
    };
  }
}

export async function getOrderById(
  orderId: string,
  userId: string
): Promise<{ success: boolean; data?: OrderDetails; error?: string }> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId,
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
      return { success: false, error: "Order not found." };
    }

    const orderDetails: OrderDetails = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || "",
      trackingNumber: order.trackingNumber,
      currentStep: STATUS_STEPS[order.status],
      totalSteps: TOTAL_STEPS,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image,
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
      shippingAddress: formatAddress(order.shippingAddress),
      billingAddress: formatAddress(order.billingAddress),
      trackingHistory: formatTrackingHistory(order.timeline, order.status),
    };

    return { success: true, data: orderDetails };
  } catch (error) {
    console.error("Error getting order:", error);
    return { success: false, error: "An error occurred." };
  }
}

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

export async function getUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data?: {
    orders: OrderDetails[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}> {
  try {
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          timeline: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const orderDetails: OrderDetails[] = orders.map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || "",
      trackingNumber: order.trackingNumber,
      currentStep: STATUS_STEPS[order.status],
      totalSteps: TOTAL_STEPS,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image,
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
      shippingAddress: formatAddress(order.shippingAddress),
      billingAddress: formatAddress(order.billingAddress),
      trackingHistory: formatTrackingHistory(order.timeline, order.status),
    }));

    return {
      success: true,
      data: {
        orders: orderDetails,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return { success: false, error: "An error occurred." };
  }
}
