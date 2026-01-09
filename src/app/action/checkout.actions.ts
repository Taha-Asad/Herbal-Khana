// lib/actions/checkout.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  AddressOption,
  CartItemWithDetails,
  CheckoutFormData,
  CheckoutSummary,
  ShippingMethodOption,
} from "@/types/checkout";
import { sendPaymentPendingEmail } from "@/lib/order-emails";

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Calculate estimated delivery date
function calculateEstimatedDelivery(estimatedDays: string): Date {
  const days = parseInt(
    estimatedDays.split("-")[1] || estimatedDays.split("-")[0] || "7"
  );
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function getCurrentUser() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Get cart with items for checkout
export async function getCheckoutCart(): Promise<{
  success: boolean;
  data?: {
    cart: {
      id: string;
      appliedPromoCode: string | null;
    };
    items: CartItemWithDetails[];
    subtotal: number;
  };
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please login to continue." };
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
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
      return { success: false, error: "Your cart is empty." };
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return {
          success: false,
          error: `${item.variant.product.name} (${item.variant.size}) is out of stock.`,
        };
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    return {
      success: true,
      data: {
        cart: {
          id: cart.id,
          appliedPromoCode: cart.appliedPromoCode,
        },
        items: cart.items as unknown as CartItemWithDetails[],
        subtotal,
      },
    };
  } catch (error) {
    console.error("Error getting checkout cart:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Get user addresses
export async function getUserAddresses(): Promise<{
  success: boolean;
  data?: AddressOption[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please login to continue." };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error getting addresses:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Create new address
export async function createAddress(data: {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal: string;
  isDefault?: boolean;
}): Promise<{ success: boolean; data?: AddressOption; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please login to continue." };
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label,
        name: data.name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postal: data.postal,
        isDefault: data.isDefault || false,
      },
    });

    revalidatePath("/checkout");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Get available shipping methods
export async function getShippingMethods(): Promise<{
  success: boolean;
  data?: ShippingMethodOption[];
  error?: string;
}> {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return { success: true, data: methods as ShippingMethodOption[] };
  } catch (error) {
    console.error("Error getting shipping methods:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Validate and apply promo code
export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<{
  success: boolean;
  data?: {
    id: string;
    code: string;
    type: string;
    value: number;
    discount: number;
    message: string;
  };
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please login to continue." };
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usedBy: {
          where: { userId: user.id },
        },
      },
    });

    if (!promo) {
      return { success: false, error: "Invalid promo code." };
    }

    if (!promo.isActive) {
      return { success: false, error: "This promo code is no longer active." };
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return { success: false, error: "This promo code has expired." };
    }

    if (promo.startsAt && new Date() < promo.startsAt) {
      return { success: false, error: "This promo code is not yet active." };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return {
        success: false,
        error: "This promo code has reached its usage limit.",
      };
    }

    if (promo.usedBy.length >= promo.maxUsesPerUser) {
      return {
        success: false,
        error: "You have already used this promo code.",
      };
    }

    if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
      return {
        success: false,
        error: `Minimum order amount is PKR ${Number(
          promo.minOrderAmount
        ).toLocaleString()}.`,
      };
    }

    // Check first order only
    if (promo.isFirstOrderOnly) {
      const orderCount = await prisma.order.count({
        where: { userId: user.id },
      });
      if (orderCount > 0) {
        return {
          success: false,
          error: "This promo code is for first orders only.",
        };
      }
    }

    // Calculate discount
    let discount = 0;
    const value = Number(promo.value);

    switch (promo.type) {
      case "PERCENTAGE":
        discount = (subtotal * value) / 100;
        if (promo.maxDiscount) {
          discount = Math.min(discount, Number(promo.maxDiscount));
        }
        break;
      case "FIXED":
        discount = value;
        break;
      case "FREE_SHIPPING":
        // Handled separately in checkout
        discount = 0;
        break;
    }

    return {
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value,
        discount,
        message:
          promo.type === "FREE_SHIPPING"
            ? "Free shipping applied!"
            : `PKR ${discount.toLocaleString()} discount applied!`,
      },
    };
  } catch (error) {
    console.error("Error validating promo code:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Calculate checkout summary
export async function calculateCheckoutSummary(data: {
  shippingMethodId: string;
  promoCode?: string;
}): Promise<{ success: boolean; data?: CheckoutSummary; error?: string }> {
  try {
    const cartResult = await getCheckoutCart();
    if (!cartResult.success || !cartResult.data) {
      return { success: false, error: cartResult.error };
    }

    const { subtotal } = cartResult.data;

    // Get shipping method
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: data.shippingMethodId },
    });

    if (!shippingMethod) {
      return { success: false, error: "Invalid shipping method." };
    }

    let shippingCost = Number(shippingMethod.price);
    let promoDiscount = 0;

    // Apply promo code if provided
    if (data.promoCode) {
      const promoResult = await validatePromoCode(data.promoCode, subtotal);
      if (promoResult.success && promoResult.data) {
        if (promoResult.data.type === "FREE_SHIPPING") {
          shippingCost = 0;
        } else {
          promoDiscount = promoResult.data.discount;
        }
      }
    }

    // Check free shipping threshold
    if (
      shippingMethod.freeAbove &&
      subtotal >= Number(shippingMethod.freeAbove)
    ) {
      shippingCost = 0;
    }

    // Calculate tax (assuming 0% for Pakistan, adjust if needed)
    const tax = 0;

    const total = subtotal + shippingCost + tax - promoDiscount;

    return {
      success: true,
      data: {
        subtotal,
        shippingCost,
        tax,
        discount: 0,
        promoDiscount,
        total: Math.max(0, total),
        currency: "PKR",
      },
    };
  } catch (error) {
    console.error("Error calculating summary:", error);
    return { success: false, error: "An error occurred." };
  }
}

// Create order
export async function createOrder(formData: CheckoutFormData): Promise<{
  success: boolean;
  data?: {
    orderId: string;
    orderNumber: string;
    requiresProof: boolean;
    redirectUrl: string;
  };
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please login to continue." };
    }

    // Get cart
    const cartResult = await getCheckoutCart();
    if (!cartResult.success || !cartResult.data) {
      return { success: false, error: cartResult.error };
    }

    const { cart, items, subtotal } = cartResult.data;

    // Get addresses
    const shippingAddress = await prisma.address.findUnique({
      where: { id: formData.shippingAddressId, userId: user.id },
    });

    if (!shippingAddress) {
      return { success: false, error: "Invalid shipping address." };
    }

    const billingAddress = formData.sameAsShipping
      ? shippingAddress
      : await prisma.address.findUnique({
          where: { id: formData.billingAddressId, userId: user.id },
        });

    if (!billingAddress) {
      return { success: false, error: "Invalid billing address." };
    }

    // Get shipping method
    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: formData.shippingMethodId },
    });

    if (!shippingMethod) {
      return { success: false, error: "Invalid shipping method." };
    }

    // Calculate shipping cost
    let shippingCost = Number(shippingMethod.price);
    if (
      shippingMethod.freeAbove &&
      subtotal >= Number(shippingMethod.freeAbove)
    ) {
      shippingCost = 0;
    }

    // Handle promo code
    let promoDiscount = 0;
    let promoCodeRecord = null;
    let promoSnapshot = null;

    if (formData.promoCode) {
      const promoResult = await validatePromoCode(formData.promoCode, subtotal);
      if (promoResult.success && promoResult.data) {
        promoCodeRecord = await prisma.promoCode.findUnique({
          where: { code: formData.promoCode.toUpperCase() },
        });

        if (promoResult.data.type === "FREE_SHIPPING") {
          shippingCost = 0;
        } else {
          promoDiscount = promoResult.data.discount;
        }

        promoSnapshot = {
          code: promoResult.data.code,
          type: promoResult.data.type,
          value: promoResult.data.value,
          discount: promoResult.data.discount,
        };
      }
    }

    const total = subtotal + shippingCost - promoDiscount;
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = calculateEstimatedDelivery(
      shippingMethod.estimatedDays
    );

    // Determine initial payment status
    const requiresProof = formData.paymentMethod !== "COD";
    const initialPaymentStatus =
      formData.paymentMethod === "COD" ? "PENDING" : "PENDING";

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: "PENDING",
          paymentStatus: initialPaymentStatus,
          subtotal,
          shippingCost,
          tax: 0,
          discount: 0,
          promoDiscount,
          total,
          currency: "PKR",
          shippingMethodId: shippingMethod.id,
          shippingSnapshot: {
            name: shippingMethod.name,
            price: Number(shippingMethod.price),
            estimatedDays: shippingMethod.estimatedDays,
          },
          estimatedDelivery,
          shippingAddress: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal: shippingAddress.postal,
            country: shippingAddress.country,
          },
          billingAddress: {
            name: billingAddress.name,
            phone: billingAddress.phone,
            line1: billingAddress.line1,
            line2: billingAddress.line2,
            city: billingAddress.city,
            state: billingAddress.state,
            postal: billingAddress.postal,
            country: billingAddress.country,
          },
          paymentMethod: formData.paymentMethod,
          customerNote: formData.customerNote,
          promoCodeId: promoCodeRecord?.id,
          promoSnapshot: promoSnapshot || undefined,
          items: {
            create: items.map((item) => ({
              productId: item.variant.product.id,
              name: `${item.variant.product.name} - ${item.variant.size}`,
              sku: item.variant.sku,
              image: item.variant.product.images[0]?.url || null,
              price: item.variant.price,
              quantity: item.quantity,
              subtotal: Number(item.variant.price) * item.quantity,
            })),
          },
          timeline: {
            create: {
              status: "PENDING",
              message: "Order placed successfully",
            },
          },
        },
      });

      // Update stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Update product sales count
        await tx.product.update({
          where: { id: item.variant.product.id },
          data: {
            salesCount: { increment: item.quantity },
          },
        });
      }

      // Update promo code usage
      if (promoCodeRecord) {
        await tx.promoCode.update({
          where: { id: promoCodeRecord.id },
          data: { usedCount: { increment: 1 } },
        });

        await tx.userPromoCode.create({
          data: {
            userId: user.id,
            promoCodeId: promoCodeRecord.id,
            orderId: newOrder.id,
          },
        });
      }

      // Mark cart as completed
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "COMPLETED" },
      });

      return newOrder;
    });

    // Send appropriate email
    if (requiresProof) {
      await sendPaymentPendingEmail({
        email: user.email,
        orderNumber,
        total,
        paymentMethod: formData.paymentMethod,
        paymentProofUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/payment-proof?orderId=${order.id}`,
      });
    }

    const redirectUrl = requiresProof
      ? `/checkout/payment-proof?orderId=${order.id}`
      : `/checkout/confirmation?orderId=${order.id}`;

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        requiresProof,
        redirectUrl,
      },
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: "An error occurred while placing your order.",
    };
  }
}
