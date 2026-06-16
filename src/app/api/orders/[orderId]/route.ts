// app/api/orders/[orderId]/route.ts
import { getServerAuthSession } from "@/app/action/home/user.action";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get order details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        shippingMethod: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
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
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        timeline: order.timeline.map((event) => ({
          status: event.status,
          message: event.message,
          createdAt: event.createdAt.toISOString(),
        })),
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cancel order
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (action === "cancel") {
      // Only allow cancellation for pending orders
      if (!["PENDING"].includes(order.status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Order cannot be cancelled at this stage",
          },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });

        // Add timeline entry
        await tx.orderTimeline.create({
          data: {
            orderId: order.id,
            status: "CANCELLED",
            message: "Order cancelled by customer",
          },
        });

        // Restore stock
        const items = await tx.orderItem.findMany({
          where: { orderId: order.id },
        });

        for (const item of items) {
          if (item.productId) {
            // Find the variant by SKU
            const variant = await tx.productVariant.findUnique({
              where: { sku: item.sku },
            });

            if (variant) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  stock: { increment: item.quantity },
                },
              });
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: "Order cancelled successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
