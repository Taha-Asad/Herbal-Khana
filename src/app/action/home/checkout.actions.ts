// app/action/checkout.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  CheckoutState,
  CheckoutItem,
  CheckoutSummary,
  ShippingMethodOption,
  CheckoutAddress,
  CheckoutValidationResult,
} from "@/types/checkout";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "./user.action";
import { getTaxRate } from "@/lib/order-helpers";

// Get checkout data for a user's cart
export async function getCheckoutData(): Promise<{
  success: boolean;
  data?: CheckoutState;
  savedAddresses?: CheckoutAddress[];
  shippingMethods?: ShippingMethodOption[];
  userEmail?: string;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login to checkout" };
    }

    const userId = session.user.id;

    // Get user with addresses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get active cart with items
    const cart = await prisma.cart.findFirst({
      where: {
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
      return { success: false, error: "Your cart is empty" };
    }

    // Transform cart items (exclude unavailable products)
    const items: CheckoutItem[] = cart.items
      .filter((item) => item.variant.product.isActive)
      .map((item) => ({
        variantId: item.variantId,
        productId: item.variant.productId,
        name: item.variant.product.name,
        variantName: item.variant.name,
        sku: item.variant.sku,
        image: item.variant.product.images[0]?.url || null,
        price: Number(item.variant.price),
        quantity: item.quantity,
        subtotal: Number(item.variant.price) * item.quantity,
        stock: item.variant.stock,
      }));

    if (items.length === 0) {
      return { success: false, error: "All items in your cart are no longer available" };
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Transform saved addresses
    const savedAddresses: CheckoutAddress[] = user.addresses.map((addr) => ({
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || undefined,
      city: addr.city,
      state: addr.state || undefined,
      postal: addr.postal,
      country: addr.country,
      isDefault: addr.isDefault,
      label: addr.label || undefined,
    }));

    // Get default address
    const defaultAddress =
      savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

    // Get shipping methods
    const shippingMethodsData = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const shippingMethods: ShippingMethodOption[] = shippingMethodsData.map(
      (method) => ({
        id: method.id,
        name: method.name,
        description: method.description || undefined,
        price: Number(method.price),
        freeAbove: method.freeAbove ? Number(method.freeAbove) : undefined,
        estimatedDays: method.estimatedDays,
      })
    );

    // Default shipping method
    const defaultShipping = shippingMethods[0] || null;

    // Calculate initial shipping cost
    let shippingCost = defaultShipping?.price || 0;
    if (defaultShipping?.freeAbove && subtotal >= defaultShipping.freeAbove) {
      shippingCost = 0;
    }

    // Check for applied promo code
    let promoDiscount = 0;
    let appliedPromoCode: string | undefined;

    if (cart.appliedPromoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: cart.appliedPromoCode },
      });

      if (promo && promo.isActive) {
        appliedPromoCode = promo.code;

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
      }
    }

    const taxRate = await getTaxRate();
    const taxableAmount = Math.max(0, subtotal - promoDiscount);
    const tax = Math.round(taxableAmount * taxRate * 100) / 100;

    const summary: CheckoutSummary = {
      subtotal,
      shippingCost,
      tax,
      discount: 0,
      promoDiscount,
      total: subtotal + shippingCost + tax - promoDiscount,
      appliedPromoCode,
    };

    const checkoutState: CheckoutState = {
      cartId: cart.id,
      items,
      shippingAddress: defaultAddress,
      billingAddress: defaultAddress,
      sameAsShipping: true,
      shippingMethod: defaultShipping,
      paymentMethod: null,
      summary,
      customerNote: cart.notes || undefined,
    };

    return {
      success: true,
      data: checkoutState,
      savedAddresses,
      shippingMethods,
      userEmail: user.email,
    };
  } catch (error) {
    console.error("Error getting checkout data:", error);
    return { success: false, error: "Failed to load checkout data" };
  }
}

// Validate cart for checkout
export async function validateCheckout(
  cartId: string
): Promise<CheckoutValidationResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login to checkout" };
    }

    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        items: {
          where: { isSavedForLater: false },
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { success: false, message: "Cart not found" };
    }

    if (cart.items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    // Validate stock for each item
    const stockIssues: string[] = [];

    for (const item of cart.items) {
      if (!item.variant.product.isActive) {
        stockIssues.push(`${item.variant.product.name} is no longer available`);
      } else if (item.variant.stock < item.quantity) {
        if (item.variant.stock === 0) {
          stockIssues.push(
            `${item.variant.product.name} - ${item.variant.name} is out of stock`
          );
        } else {
          stockIssues.push(
            `Only ${item.variant.stock} units available for ${item.variant.product.name} - ${item.variant.name}`
          );
        }
      }
    }

    if (stockIssues.length > 0) {
      return {
        success: false,
        message: "Some items have stock issues",
        issues: stockIssues,
      };
    }

    return { success: true, message: "Cart is valid for checkout" };
  } catch (error) {
    console.error("Error validating checkout:", error);
    return { success: false, message: "Failed to validate cart" };
  }
}

// Validate promo code
export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<{
  success: boolean;
  discount?: number;
  message?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return { success: false, message: "Invalid promo code" };
    }

    if (!promo.isActive) {
      return { success: false, message: "This promo code is no longer active" };
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { success: false, message: "This promo code has expired" };
    }

    if (promo.startsAt && promo.startsAt > new Date()) {
      return { success: false, message: "This promo code is not yet active" };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return {
        success: false,
        message: "This promo code has reached its usage limit",
      };
    }

    if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
      return {
        success: false,
        message: `Minimum order amount is PKR ${Number(
          promo.minOrderAmount
        ).toLocaleString()}`,
      };
    }

    // Check if user has already used this code
    const userUsage = await prisma.userPromoCode.findUnique({
      where: {
        userId_promoCodeId: {
          userId: session.user.id,
          promoCodeId: promo.id,
        },
      },
    });

    if (userUsage) {
      return {
        success: false,
        message: "You have already used this promo code",
      };
    }

    // Check first order only
    if (promo.isFirstOrderOnly) {
      const previousOrders = await prisma.order.count({
        where: { userId: session.user.id },
      });

      if (previousOrders > 0) {
        return {
          success: false,
          message: "This promo code is only valid for first orders",
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === "PERCENTAGE") {
      discount = subtotal * (Number(promo.value) / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, Number(promo.maxDiscount));
      }
    } else if (promo.type === "FIXED") {
      discount = Math.min(Number(promo.value), subtotal);
    }

    // Apply to cart
    await prisma.cart.updateMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      data: {
        appliedPromoCode: promo.code,
      },
    });

    revalidatePath("/home/checkout");

    return {
      success: true,
      discount,
      message: `Promo code applied! You save PKR ${discount.toLocaleString()}`,
    };
  } catch (error) {
    console.error("Error validating promo code:", error);
    return { success: false, message: "Failed to validate promo code" };
  }
}

// Remove promo code
export async function removePromoCodeFromCart(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    await prisma.cart.updateMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      data: {
        appliedPromoCode: null,
      },
    });

    revalidatePath("/home/checkout");

    return { success: true, message: "Promo code removed" };
  } catch (error) {
    console.error("Error removing promo code:", error);
    return { success: false, message: "Failed to remove promo code" };
  }
}

// Save new address
export async function saveAddress(
  address: Omit<CheckoutAddress, "id">,
  setAsDefault: boolean = false
): Promise<{
  success: boolean;
  data?: CheckoutAddress;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login" };
    }

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal: address.postal,
        country: address.country,
        isDefault: setAsDefault,
      },
    });

    revalidatePath("/home/checkout");

    return {
      success: true,
      data: {
        id: newAddress.id,
        name: newAddress.name,
        phone: newAddress.phone,
        line1: newAddress.line1,
        line2: newAddress.line2 || undefined,
        city: newAddress.city,
        state: newAddress.state || undefined,
        postal: newAddress.postal,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
      },
    };
  } catch (error) {
    console.error("Error saving address:", error);
    return { success: false, error: "Failed to save address" };
  }
}

// Update address
export async function updateAddress(
  addressId: string,
  address: Partial<CheckoutAddress>
): Promise<{
  success: boolean;
  data?: CheckoutAddress;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login" };
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
        userId: session.user.id,
      },
      data: {
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal: address.postal,
        country: address.country,
      },
    });

    revalidatePath("/home/checkout");

    return {
      success: true,
      data: {
        id: updatedAddress.id,
        name: updatedAddress.name,
        phone: updatedAddress.phone,
        line1: updatedAddress.line1,
        line2: updatedAddress.line2 || undefined,
        city: updatedAddress.city,
        state: updatedAddress.state || undefined,
        postal: updatedAddress.postal,
        country: updatedAddress.country,
        isDefault: updatedAddress.isDefault,
      },
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}

// Delete address
export async function deleteAddress(addressId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login" };
    }

    await prisma.address.delete({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });

    revalidatePath("/home/checkout");

    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

// Set address as default
export async function setDefaultAddress(addressId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login" };
    }

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.address.update({
      where: {
        id: addressId,
        userId: session.user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/home/checkout");

    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
