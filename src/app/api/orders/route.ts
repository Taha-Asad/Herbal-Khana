// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ORDER_STATUS, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { PAYMENT_ACCOUNTS } from "@/lib/payment-config";

import { getServerAuthSession } from "@/app/action/user.action";
import prisma from "@/lib/prisma";
import {
  sendOrderConfirmationEmail,
  sendPaymentPendingEmail,
} from "@/lib/email/order-emails";

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = nanoid(6).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please login to place an order" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      cartId,
      shippingAddressId,
      shippingAddress,
      billingAddressId,
      billingAddress,
      sameAsShipping,
      shippingMethodId,
      paymentMethod,
      promoCode,
      customerNote,
    } = body;

    // Validate required fields
    if (!shippingMethodId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!shippingAddressId && !shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get cart with items
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
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
      return NextResponse.json(
        { success: false, message: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${item.variant.product.name} - ${item.variant.name}. Only ${item.variant.stock} available.`,
          },
          { status: 400 }
        );
      }
    }

    // Get or validate shipping address
    let finalShippingAddress;
    if (shippingAddressId) {
      const address = await prisma.address.findUnique({
        where: { id: shippingAddressId, userId },
      });
      if (!address) {
        return NextResponse.json(
          { success: false, message: "Invalid shipping address" },
          { status: 400 }
        );
      }
      finalShippingAddress = {
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal: address.postal,
        country: address.country,
      };
    } else if (shippingAddress) {
      finalShippingAddress = shippingAddress;

      // Save the new address for future use
      await prisma.address.create({
        data: {
          userId,
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state || null,
          postal: shippingAddress.postal,
          country: shippingAddress.country || "Pakistan",
          isDefault: false,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Get billing address
    let finalBillingAddress = finalShippingAddress;
    if (!sameAsShipping) {
      if (billingAddressId) {
        const address = await prisma.address.findUnique({
          where: { id: billingAddressId, userId },
        });
        if (!address) {
          return NextResponse.json(
            { success: false, message: "Invalid billing address" },
            { status: 400 }
          );
        }
        finalBillingAddress = {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal: address.postal,
          country: address.country,
        };
      } else if (billingAddress) {
        finalBillingAddress = billingAddress;
      }
    }

    // Get shipping method
    const shippingMethodRecord = await prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });

    if (!shippingMethodRecord || !shippingMethodRecord.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive shipping method" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    let shippingCost = Number(shippingMethodRecord.price);

    // Check for free shipping threshold
    if (
      shippingMethodRecord.freeAbove &&
      subtotal >= Number(shippingMethodRecord.freeAbove)
    ) {
      shippingCost = 0;
    }

    // Add COD fee if applicable
    const codFee =
      paymentMethod === "cod" ? PAYMENT_ACCOUNTS.cod?.additionalFee || 0 : 0;

    // Handle promo code
    let promoDiscount = 0;
    let promoSnapshot = null;
    let promoCodeId = null;

    if (promoCode || cart.appliedPromoCode) {
      const codeToUse = promoCode || cart.appliedPromoCode;
      const promo = await prisma.promoCode.findUnique({
        where: { code: codeToUse },
      });

      if (promo && promo.isActive) {
        // Validate promo code
        const now = new Date();
        const isValid =
          (!promo.startsAt || promo.startsAt <= now) &&
          (!promo.expiresAt || promo.expiresAt > now) &&
          (!promo.maxUses || promo.usedCount < promo.maxUses) &&
          (!promo.minOrderAmount || subtotal >= Number(promo.minOrderAmount));

        if (isValid) {
          // Check if user already used this code
          const userUsage = await prisma.userPromoCode.findUnique({
            where: {
              userId_promoCodeId: {
                userId,
                promoCodeId: promo.id,
              },
            },
          });

          if (!userUsage) {
            // Check first order only restriction
            let canUse = true;
            if (promo.isFirstOrderOnly) {
              const previousOrders = await prisma.order.count({
                where: { userId },
              });
              canUse = previousOrders === 0;
            }

            if (canUse) {
              promoCodeId = promo.id;

              if (promo.type === "PERCENTAGE") {
                promoDiscount = subtotal * (Number(promo.value) / 100);
                if (promo.maxDiscount) {
                  promoDiscount = Math.min(
                    promoDiscount,
                    Number(promo.maxDiscount)
                  );
                }
              } else if (promo.type === "FIXED") {
                promoDiscount = Math.min(Number(promo.value), subtotal);
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
        }
      }
    }

    const tax = 0; // Usually 0 in Pakistan for most products
    const total = subtotal + shippingCost + codFee + tax - promoDiscount;

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal,
          shippingCost: shippingCost + codFee,
          tax,
          discount: 0,
          promoDiscount,
          total,
          currency: "PKR",
          shippingMethodId: shippingMethodRecord.id,
          shippingSnapshot: {
            name: shippingMethodRecord.name,
            price: shippingCost + codFee,
            estimatedDays: shippingMethodRecord.estimatedDays,
            codFee: codFee,
          },
          shippingAddress: finalShippingAddress,
          billingAddress: finalBillingAddress,
          paymentMethod,
          customerNote: customerNote || null,
          promoCodeId,
          promoSnapshot: promoSnapshot || Prisma.DbNull,
          estimatedDelivery: new Date(
            Date.now() +
              parseInt(shippingMethodRecord.estimatedDays) * 24 * 60 * 60 * 1000
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
            image: item.variant.product.images[0]?.url || null,
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
          message: "Order placed successfully. Awaiting payment confirmation.",
        },
      });

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
        data: {
          status: "COMPLETED",
          appliedPromoCode: null,
        },
      });

      return newOrder;
    });

    // Generate payment instructions for non-COD orders
    let paymentInstructions = null;

    if (paymentMethod !== "cod") {
      const paymentConfig =
        PAYMENT_ACCOUNTS[paymentMethod as keyof typeof PAYMENT_ACCOUNTS];

      if (paymentConfig && "accountNumber" in paymentConfig) {
        paymentInstructions = {
          method: paymentMethod,
          accountTitle: paymentConfig.accountTitle,
          accountNumber: paymentConfig.accountNumber,
          amount: total,
          currency: "PKR",
          reference: order.orderNumber,
          instructions: paymentConfig.instructions,
          expiresAt: new Date(
            Date.now() + (paymentConfig.expiryHours || 24) * 60 * 60 * 1000
          ),
        };

        // Send payment pending email
        if (session.user.email) {
          const paymentData = JSON.parse(order.paymentId || "{}");

          await sendPaymentPendingEmail({
            email: session.user.email,
            name: session.user.name ?? undefined,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            paymentMethod: order.paymentMethod ?? "N/A",
            paymentProofUrl: paymentData.proofImageUrl || "", // <-- ensure it's a string
          });
        }
      }
    } else {
      // Send order confirmation email for COD

      if (session.user.email) {
        await sendOrderConfirmationEmail({
          email: session.user.email,
          name: session.user.name ?? undefined,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          estimatedDelivery: order.estimatedDelivery,
          items: cart.items.map((item) => ({
            name: `${item.variant.product.name} - ${item.variant.name}`,
            quantity: item.quantity,
            price: Number(item.variant.price),
          })),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total,
        paymentInstructions,
        message:
          paymentMethod === "cod"
            ? "Order placed successfully!"
            : "Order created. Please complete your payment.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order. Please try again.",
      },
      { status: 500 }
    );
  }
}

// GET - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please login to view orders" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId: session.user.id };
    if (status) {
      if (Object.values(ORDER_STATUS).includes(status as ORDER_STATUS)) {
        where.status = status as ORDER_STATUS;
      } else {
        // Optional: handle invalid status
        throw new Error(`Invalid order status: ${status}`);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            take: 3,
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      currency: order.currency,
      itemCount: order._count.items,
      items: order.items.map((item) => ({
        name: item.name,
        image: item.image,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get orders" },
      { status: 500 }
    );
  }
}
