// app/api/orders/track/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST - Track order by order number and contact info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, contactInfo } = body;

    // Validate input
    if (!orderNumber || !contactInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Order number and contact information are required",
        },
        { status: 400 }
      );
    }

    // Clean up the order number
    const cleanOrderNumber = orderNumber.trim().toUpperCase();

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber: cleanOrderNumber },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                slug: true,
              },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        shippingMethod: {
          select: {
            name: true,
            estimatedDays: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found. Please check your order number.",
        },
        { status: 404 }
      );
    }

    // Clean contact info for comparison
    const cleanContactInfo = contactInfo.trim().toLowerCase();
    const cleanPhone = contactInfo.replace(/[\s\-\(\)]/g, "");

    // Get shipping address for phone verification
    const shippingAddress = order.shippingAddress as {
      phone?: string;
      name?: string;
    } | null;

    // Verify contact info matches
    const emailMatch = order.user.email?.toLowerCase() === cleanContactInfo;
    const userPhoneMatch =
      order.user.phone?.replace(/[\s\-\(\)]/g, "") === cleanPhone;
    const shippingPhoneMatch =
      shippingAddress?.phone?.replace(/[\s\-\(\)]/g, "") === cleanPhone;

    if (!emailMatch && !userPhoneMatch && !shippingPhoneMatch) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Contact information does not match this order. Please verify your email or phone number.",
        },
        { status: 403 }
      );
    }

    // Format shipping address
    const formattedShippingAddress = order.shippingAddress as {
      name: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal: string;
      country: string;
    };

    // Format billing address
    const formattedBillingAddress = order.billingAddress as {
      name: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal: string;
      country: string;
    };

    // Get status message
    const getStatusMessage = (status: string): string => {
      const messages: Record<string, string> = {
        PENDING: "Order placed, awaiting payment confirmation",
        PAID: "Payment confirmed, preparing your order",
        PROCESSING: "Your order is being prepared",
        SHIPPED: "Your order is on the way",
        DELIVERED: "Order delivered successfully",
        CANCELLED: "Order has been cancelled",
        REFUNDED: "Order has been refunded",
      };
      return messages[status] || status;
    };

    // Transform timeline to tracking events
    const trackingHistory = order.timeline.map((event) => ({
      status: event.status,
      message: event.message || getStatusMessage(event.status),
      timestamp: event.createdAt.toISOString(),
      isCompleted: true,
    }));

    // Add pending future events based on current status
    const statusOrder = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    if (
      currentStatusIndex >= 0 &&
      currentStatusIndex < statusOrder.length - 1 &&
      order.status !== "CANCELLED" &&
      order.status !== "REFUNDED"
    ) {
      // Add upcoming statuses as pending events
      for (let i = currentStatusIndex + 1; i < statusOrder.length; i++) {
        const futureStatus = statusOrder[i] as typeof order.status;
        // Don't add if already exists in timeline
        if (!trackingHistory.some((e) => e.status === futureStatus)) {
          trackingHistory.push({
            status: futureStatus,
            message: getStatusMessage(futureStatus),
            timestamp: "", // No timestamp for future events
            isCompleted: false,
          });
        }
      }
    }

    // Format response data
    const responseData = {
      orderId: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderDate: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null,
      trackingNumber: order.trackingNumber,
      shippingAddress: formattedShippingAddress,
      billingAddress: formattedBillingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        image: item.image,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        productSlug: item.product?.slug,
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.tax),
      discount: Number(order.discount),
      promoDiscount: Number(order.promoDiscount),
      total: Number(order.total),
      currency: order.currency,
      trackingHistory,
      shippingMethod: order.shippingMethod
        ? {
            name: order.shippingMethod.name,
            estimatedDays: order.shippingMethod.estimatedDays,
          }
        : null,
      customerNote: order.customerNote,
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track order. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET - Quick track by order number (for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    // For GET requests, we just return basic status info
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.toUpperCase() },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        estimatedDelivery: true,
        trackingNumber: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting order status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get order status" },
      { status: 500 }
    );
  }
}
