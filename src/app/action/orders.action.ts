// actions/order.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  CreateOrderInput,
  OrderResponse,
  PaymentInstructions,
  OrderConfirmation,
  PaymentMethod,
} from "@/types/checkout";
import { PAYMENT_ACCOUNTS } from "@/lib/payment-config";

import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "./user.action";
import {
  sendOrderConfirmationEmail,
  sendPaymentPendingEmail,
} from "@/lib/email/order-emails";
import { Prisma } from "@prisma/client";
import { TrackingData } from "@/types/order";

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = nanoid(6).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// Create a new order
export async function createOrder(
  input: CreateOrderInput
): Promise<OrderResponse> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login to place order" };
    }

    const userId = session.user.id;

    // Get cart with items
    const cart = await prisma.cart.findFirst({
      where: {
        id: input.cartId,
        userId,
        status: "ACTIVE",
      },
      include: {
        items: {
          where: { isSavedForLater: false },
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Your cart is empty" };
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.variant.product.name} - ${item.variant.name}`,
        };
      }
    }

    // Get or create shipping address
    let shippingAddress;
    if (input.shippingAddressId) {
      const address = await prisma.address.findUnique({
        where: { id: input.shippingAddressId, userId },
      });
      if (!address) {
        return { success: false, message: "Invalid shipping address" };
      }
      shippingAddress = {
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal: address.postal,
        country: address.country,
      };
    } else if (input.shippingAddress) {
      shippingAddress = input.shippingAddress;

      // Optionally save the new address
      await prisma.address.create({
        data: {
          userId,
          name: input.shippingAddress.name,
          phone: input.shippingAddress.phone,
          line1: input.shippingAddress.line1,
          line2: input.shippingAddress.line2,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          postal: input.shippingAddress.postal,
          country: input.shippingAddress.country,
        },
      });
    } else {
      return { success: false, message: "Shipping address is required" };
    }

    // Get billing address
    let billingAddress = shippingAddress;
    if (!input.sameAsShipping) {
      if (input.billingAddressId) {
        const address = await prisma.address.findUnique({
          where: { id: input.billingAddressId, userId },
        });
        if (!address) {
          return { success: false, message: "Invalid billing address" };
        }
        billingAddress = {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal: address.postal,
          country: address.country,
        };
      } else if (input.billingAddress) {
        billingAddress = input.billingAddress;
      }
    }

    // Get shipping method
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: input.shippingMethodId },
    });

    if (!shippingMethod) {
      return { success: false, message: "Invalid shipping method" };
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    let shippingCost = Number(shippingMethod.price);
    if (
      shippingMethod.freeAbove &&
      subtotal >= Number(shippingMethod.freeAbove)
    ) {
      shippingCost = 0;
    }

    // Add COD fee if applicable
    if (input.paymentMethod === "cod" && PAYMENT_ACCOUNTS.cod.additionalFee) {
      shippingCost += PAYMENT_ACCOUNTS.cod.additionalFee;
    }

    // Handle promo code
    let promoDiscount = 0;
    let promoSnapshot = null;
    let promoCodeId = null;

    if (cart.appliedPromoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: cart.appliedPromoCode },
      });

      if (promo && promo.isActive) {
        promoCodeId = promo.id;

        if (promo.type === "PERCENTAGE") {
          promoDiscount = subtotal * (Number(promo.value) / 100);
          if (promo.maxDiscount) {
            promoDiscount = Math.min(promoDiscount, Number(promo.maxDiscount));
          }
        } else if (promo.type === "FIXED") {
          promoDiscount = Number(promo.value);
        } else if (promo.type === "FREE_SHIPPING") {
          shippingCost = 0;
        }

        promoSnapshot = {
          code: promo.code,
          type: promo.type,
          value: Number(promo.value),
          discount: promoDiscount,
        };
      }
    }

    const tax = 0; // Usually 0 in Pakistan for most products
    const total = subtotal + shippingCost + tax - promoDiscount;
    const shippingAddressJson: Prisma.JsonValue | typeof Prisma.JsonNull =
      shippingAddress
        ? { ...shippingAddress, line2: shippingAddress.line2 ?? null }
        : Prisma.JsonNull;

    const billingAddressJson: Prisma.JsonValue | typeof Prisma.JsonNull =
      billingAddress
        ? { ...billingAddress, line2: billingAddress.line2 ?? null }
        : Prisma.JsonNull;

    const promoSnapshotJson: Prisma.JsonValue | typeof Prisma.JsonNull =
      promoSnapshot
        ? {
            ...promoSnapshot,
            value: Number(promoSnapshot.value),
            discount: promoDiscount,
          }
        : Prisma.JsonNull;
    // Create order in a transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal,
          shippingCost,
          tax,
          discount: 0,
          promoDiscount,
          total,
          currency: "PKR",
          shippingMethodId: shippingMethod.id,
          shippingSnapshot: {
            name: shippingMethod.name,
            price: shippingCost,
            estimatedDays: shippingMethod.estimatedDays,
          },
          shippingAddress: shippingAddressJson,
          billingAddress: billingAddressJson,
          paymentMethod: input.paymentMethod,
          customerNote: input.customerNote,
          promoCodeId,
          promoSnapshot: promoSnapshotJson,
          estimatedDelivery: new Date(
            Date.now() +
              parseInt(shippingMethod.estimatedDays) * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Create order items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.variant.productId,
            name: `${item.variant.product.name} - ${item.variant.name}`,
            sku: item.variant.sku,
            image: item.variant.product.images[0]?.url,
            price: Number(item.variant.price),
            quantity: item.quantity,
            subtotal: Number(item.variant.price) * item.quantity,
          },
        });

        // Reduce stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Update product sales count
        await tx.product.update({
          where: { id: item.variant.productId },
          data: {
            salesCount: { increment: item.quantity },
          },
        });
      }

      // Create initial timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          message: "Order placed successfully",
        },
      });

      // Check for existing promo code usage before using it
      if (promoCodeId) {
        const existingUsage = await tx.userPromoCode.findUnique({
          where: { userId_promoCodeId: { userId, promoCodeId } },
        });
        if (existingUsage) {
          throw new Error("You have already used this promo code");
        }
      }

      // Record promo code usage
      if (promoCodeId) {
        await tx.userPromoCode.create({
          data: {
            userId,
            promoCodeId,
            orderId: newOrder.id,
          },
        });

        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Mark cart as completed
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "COMPLETED" },
      });

      return newOrder;
    });

    const order = orderResult;

    // Generate payment instructions for non-COD orders
    let paymentInstructions: PaymentInstructions | undefined;

    if (input.paymentMethod !== "cod") {
      const paymentConfig =
        PAYMENT_ACCOUNTS[
          input.paymentMethod as Exclude<keyof typeof PAYMENT_ACCOUNTS, "cod">
        ];

      paymentInstructions = {
        method: input.paymentMethod,
        accountTitle: paymentConfig.accountTitle,
        accountNumber: paymentConfig.accountNumber,
        amount: total,
        currency: "PKR",
        reference: order.orderNumber,
        instructions: paymentConfig.instructions,
        expiresAt: new Date(
          Date.now() + (paymentConfig.expiryHours ?? 24) * 60 * 60 * 1000
        ),
      };

      await sendPaymentPendingEmail({
        email: session.user.email!,
        name: session.user.name ?? undefined,
        orderNumber: order.orderNumber,
        total: total,
        paymentMethod: input.paymentMethod,
        paymentProofUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upload-payment-proof?order=${order.id}`,
      });
    }

    // Send order confirmation email for COD orders
    if (input.paymentMethod === "cod") {
      if (session.user.email != null) {
        await sendOrderConfirmationEmail({
          email: session.user.email,
          name: session.user.name ?? undefined,
          orderNumber: order.orderNumber,
          total: total,
          estimatedDelivery: order.estimatedDelivery,
          items: cart.items.map((item) => ({
            name: `${item.variant.product.name} - ${item.variant.name}`,
            quantity: item.quantity,
            price: Number(item.variant.price),
          })),
        });
      }
    }

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentInstructions,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Failed to create order" };
  }
}

// Get order confirmation details
export async function getOrderConfirmation(orderId: string): Promise<{
  success: boolean;
  data?: OrderConfirmation;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login" };
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        shippingMethod: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const paymentMethod = order.paymentMethod as PaymentMethod;
    let paymentInstructions: PaymentInstructions | undefined;

    if (paymentMethod !== "cod" && order.paymentStatus === "PENDING") {
      const paymentConfig =
        PAYMENT_ACCOUNTS[
          paymentMethod as Exclude<keyof typeof PAYMENT_ACCOUNTS, "cod">
        ];

      paymentInstructions = {
        method: paymentMethod,
        accountTitle: paymentConfig.accountTitle,
        accountNumber: paymentConfig.accountNumber,
        amount: Number(order.total),
        currency: order.currency,
        reference: order.orderNumber,
        instructions: paymentConfig.instructions,
      };
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod,
        total: Number(order.total),
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        paymentInstructions,
        requiresProof:
          paymentMethod !== "cod" && order.paymentStatus === "PENDING",
      },
    };
  } catch (error) {
    console.error("Error getting order confirmation:", error);
    return { success: false, error: "Failed to load order details" };
  }
}

type StoredAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postal: string;
  country: string;
};

function mapAddress(address: unknown) {
  if (!address || typeof address !== "object") return undefined;

  const a = address as {
    name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postal: string;
    country: string;
  };

  return {
    name: a.name,
    phone: a.phone,
    street: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state ?? undefined,
    postalCode: a.postal,
    country: a.country,
  };
}

// Track order by order number and email/phone
export async function trackOrder(
  orderNumber: string,
  contactInfo: string
): Promise<{
  success: boolean;
  data?: TrackingData;
  error?: string;
}> {
  try {
    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { email: true, phone: true },
        },
        items: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        shippingMethod: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify contact info matches
    const emailMatch =
      order.user.email?.toLowerCase() === contactInfo.toLowerCase();

    const phoneMatch = order.user.phone === contactInfo.replace(/\D/g, "");

    let shippingPhone: string | undefined;

    if (
      order.shippingAddress &&
      typeof order.shippingAddress === "object" &&
      !Array.isArray(order.shippingAddress)
    ) {
      const address = order.shippingAddress as StoredAddress;
      shippingPhone = address.phone;
    }

    const shippingPhoneMatch = shippingPhone === contactInfo.replace(/\D/g, "");

    if (!emailMatch && !phoneMatch && !shippingPhoneMatch) {
      return {
        success: false,
        error: "Contact information does not match this order",
      };
    }

    // Transform timeline to tracking events
    const trackingHistory = order.timeline.map((event, index) => ({
      id: event.id,
      status: event.status,
      message: event.message || getStatusMessage(event.status),
      timestamp: event.createdAt.toISOString(),
      isCompleted: true,
      isCurrent: index === 0,
    }));

    return {
      success: true,
      data: {
        orderId: order.orderNumber,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || "unknown",
        orderDate: order.createdAt.toISOString(),
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
        trackingNumber: order.trackingNumber ?? undefined,

        shippingAddress: mapAddress(order.shippingAddress)!,
        billingAddress: mapAddress(order.billingAddress),

        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          image: item.image ?? undefined,
          price: Number(item.price),
          quantity: item.quantity,
        })),

        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        promoDiscount: Number(order.promoDiscount),
        total: Number(order.total),
        currency: order.currency,

        trackingHistory,
        currentStep: trackingHistory.findIndex((event) => event.isCurrent) + 1,
        totalSteps: trackingHistory.length,

        shippingMethod: order.shippingMethod
          ? {
              name: order.shippingMethod.name,
              estimatedDays: order.shippingMethod.estimatedDays,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error tracking order:", error);
    return { success: false, error: "Failed to track order" };
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    PENDING: "Order placed, awaiting payment confirmation",
    PAID: "Payment confirmed",
    PROCESSING: "Order is being prepared",
    SHIPPED: "Order has been shipped",
    DELIVERED: "Order delivered successfully",
    CANCELLED: "Order has been cancelled",
    REFUNDED: "Order has been refunded",
  };
  return messages[status] || status;
}
