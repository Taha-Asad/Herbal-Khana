"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  CartItem,
  CartResult,
  CartSummary,
  PROMO_TYPE,
  PromoCodeData,
} from "@/types/cart";

// =============================================================================
// TYPES
// =============================================================================

// =============================================================================
// CONSTANTS
// =============================================================================

const SESSION_COOKIE_NAME = "cart_session_id";
const SESSION_EXPIRY_DAYS = 30;
const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 5000;

const SHIPPING_PRICES: Record<string, number> = {
  standard: 200,
  express: 400,
  overnight: 700,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = uuidv4();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      path: "/",
    });
  }

  return sessionId;
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

async function getOrCreateCart(): Promise<string> {
  try {
    const userId = await getCurrentUserId();
    const sessionId = await getOrCreateSessionId();

    // 1. Prefer user cart if logged in
    if (userId) {
      const userCart = await prisma.cart.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
      });

      if (userCart) {
        return userCart.id;
      }

      const sessionCart = await prisma.cart.findFirst({
        where: { sessionId, status: "ACTIVE", userId: null },
        orderBy: { updatedAt: "desc" },
      });

      if (sessionCart) {
        await prisma.cart.update({
          where: { id: sessionCart.id },
          data: { userId, expiresAt: null },
        });
        return sessionCart.id;
      }
    }

    // 2. Fallback to session cart
    const sessionCart = await prisma.cart.findFirst({
      where: { sessionId, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
    });

    if (sessionCart) {
      if (userId && !sessionCart.userId) {
        await prisma.cart.update({
          where: { id: sessionCart.id },
          data: { userId, expiresAt: null },
        });
      }
      return sessionCart.id;
    }

    // 3. Create new cart (safe user check)
    let validUserId: string | null = null;

    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (userExists) {
        validUserId = userId;
      }
    }

    const newCart = await prisma.cart.create({
      data: {
        userId: validUserId,
        sessionId,
        status: "ACTIVE",
        expiresAt: validUserId
          ? null
          : new Date(Date.now() + SESSION_EXPIRY_DAYS * 86400000),
      },
    });

    return newCart.id;
  } catch (error) {
    console.error("getOrCreateCart error:", error);
    throw new Error("Failed to get or create cart");
  }
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getShippingCost(
  shippingId: string | null | undefined,
  subtotal: number
): number {
  const id = shippingId || "standard";

  if (id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_PRICES[id] ?? SHIPPING_PRICES.standard;
}

function calculatePromoDiscount(
  promo: PromoCodeData,
  subtotal: number,
  shippingCost: number
): number {
  const value = Number(promo.value);
  const maxDiscount = promo.maxDiscount ? Number(promo.maxDiscount) : null;

  switch (promo.type) {
    case "PERCENTAGE": {
      const percentageDiscount = (subtotal * value) / 100;
      return maxDiscount
        ? Math.min(percentageDiscount, maxDiscount)
        : percentageDiscount;
    }
    case "FIXED":
      return Math.min(value, subtotal);
    case "FREE_SHIPPING":
      return shippingCost;
    default:
      return 0;
  }
}

function calculateCartSummary(
  items: CartItem[],
  shippingCost: number,
  promoDiscount: number
): CartSummary {
  const subtotal = calculateSubtotal(items);

  const savingsTotal = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const taxableAmount = Math.max(0, subtotal - promoDiscount);
  const tax = Math.round(taxableAmount * TAX_RATE);
  const total = Math.max(0, subtotal + shippingCost + tax - promoDiscount);

  return {
    subtotal,
    shipping: shippingCost,
    tax,
    discount: savingsTotal,
    promoDiscount,
    total,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    savingsTotal,
  };
}

function mapCartItems(
  items: Array<{
    id: string;
    quantity: number;
    variant: {
      id: string;
      name: string;
      size: string;
      scent: string | null;
      price: unknown;
      stock: number;
      sku: string;
      product: {
        name: string;
        costPrice: unknown;
        images: Array<{ url: string; isPrimary: boolean }>;
      };
    };
  }>
): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    variantId: item.variant.id,
    quantity: item.quantity,
    price: Number(item.variant.price),
    // Use costPrice as originalPrice if it exists and is higher than price
    originalPrice: item.variant.product.costPrice
      ? Number(item.variant.product.costPrice) > Number(item.variant.price)
        ? Number(item.variant.product.costPrice)
        : undefined
      : undefined,
    name: item.variant.product.name,
    variantName: item.variant.name,
    size: item.variant.size,
    scent: item.variant.scent,
    image:
      item.variant.product.images.find((i) => i.isPrimary)?.url ??
      item.variant.product.images[0]?.url,
    stock: item.variant.stock,
    sku: item.variant.sku,
  }));
}

// =============================================================================
// PUBLIC ACTIONS
// =============================================================================

export async function addToCart(
  variantId: string,
  quantity: number = 1
): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.product?.isActive) {
      return { success: false, message: "Product unavailable" };
    }

    // Check existing quantity in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId_isSavedForLater: {
          cartId,
          variantId,
          isSavedForLater: false,
        },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (variant.stock < newQuantity) {
      return {
        success: false,
        message: `Only ${variant.stock} items available in stock`,
      };
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId_isSavedForLater: {
          cartId,
          variantId,
          isSavedForLater: false,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId,
        variantId,
        quantity,
      },
    });

    return getCartForUI();
  } catch (error) {
    console.error("addToCart error:", error);
    return { success: false, message: "Failed to add item to cart" };
  }
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<CartResult> {
  try {
    if (quantity < 1) {
      return removeCartItem(cartItemId);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: true },
    });

    if (!item) {
      return { success: false, message: "Cart item not found" };
    }

    if (item.variant.stock < quantity) {
      return {
        success: false,
        message: `Only ${item.variant.stock} items available in stock`,
      };
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return getCartForUI();
  } catch (error) {
    console.error("updateCartItem error:", error);
    return { success: false, message: "Failed to update cart item" };
  }
}

export async function removeCartItem(cartItemId: string): Promise<CartResult> {
  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return getCartForUI();
  } catch (error) {
    console.error("removeCartItem error:", error);
    return { success: false, message: "Failed to remove item from cart" };
  }
}

export async function toggleSaveForLater(
  cartItemId: string
): Promise<CartResult> {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    // Check if item already exists in target state
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId_isSavedForLater: {
          cartId: item.cartId,
          variantId: item.variantId,
          isSavedForLater: !item.isSavedForLater,
        },
      },
    });

    if (existingItem) {
      // Merge quantities and delete original
      await prisma.$transaction([
        prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        }),
        prisma.cartItem.delete({
          where: { id: cartItemId },
        }),
      ]);
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { isSavedForLater: !item.isSavedForLater },
      });
    }

    return getCartForUI();
  } catch (error) {
    console.error("toggleSaveForLater error:", error);
    return { success: false, message: "Failed to update item" };
  }
}

export async function updateShippingMethod(
  shippingId: string
): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();

    await prisma.cart.update({
      where: { id: cartId },
      data: { selectedShippingId: shippingId },
    });

    return getCartForUI();
  } catch (error) {
    console.error("updateShippingMethod error:", error);
    return { success: false, message: "Failed to update shipping method" };
  }
}

export async function applyPromoCode(code: string): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();
    const userId = await getCurrentUserId();

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return { success: false, message: "Invalid promo code" };
    }

    const now = new Date();

    if (promo.startsAt && promo.startsAt > now) {
      return { success: false, message: "Promo code is not yet active" };
    }

    if (promo.expiresAt && promo.expiresAt < now) {
      return { success: false, message: "Promo code has expired" };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return { success: false, message: "Promo code usage limit reached" };
    }

    // Check user-specific limits
    if (userId) {
      const userUsage = await prisma.userPromoCode.count({
        where: { userId, promoCodeId: promo.id },
      });

      if (userUsage >= promo.maxUsesPerUser) {
        return {
          success: false,
          message: "You have already used this promo code",
        };
      }

      // Check first order only
      if (promo.isFirstOrderOnly) {
        const hasOrders = await prisma.order.count({
          where: { userId },
        });

        if (hasOrders > 0) {
          return {
            success: false,
            message: "This promo code is for first orders only",
          };
        }
      }
    }

    await prisma.cart.update({
      where: { id: cartId },
      data: { appliedPromoCode: code.toUpperCase() },
    });

    return getCartForUI();
  } catch (error) {
    console.error("applyPromoCode error:", error);
    return { success: false, message: "Failed to apply promo code" };
  }
}

export async function removePromoCode(): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();

    await prisma.cart.update({
      where: { id: cartId },
      data: { appliedPromoCode: null },
    });

    return getCartForUI();
  } catch (error) {
    console.error("removePromoCode error:", error);
    return { success: false, message: "Failed to remove promo code" };
  }
}

export async function clearCart(): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();

    await prisma.cartItem.deleteMany({
      where: { cartId, isSavedForLater: false },
    });

    return getCartForUI();
  } catch (error) {
    console.error("clearCart error:", error);
    return { success: false, message: "Failed to clear cart" };
  }
}

export async function getCartForUI(): Promise<CartResult> {
  try {
    const cartId = await getOrCreateCart();

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      const emptySummary: CartSummary = {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        promoDiscount: 0,
        total: 0,
        itemCount: 0,
        savingsTotal: 0,
      };

      return {
        success: true,
        data: {
          items: [],
          savedItems: [],
          summary: emptySummary,
          appliedPromoCode: null,
          selectedShippingId: null,
        },
      };
    }

    const activeItems = cart.items.filter((i) => !i.isSavedForLater);
    const savedItems = cart.items.filter((i) => i.isSavedForLater);

    const items = mapCartItems(activeItems);
    const savedItemsMapped = mapCartItems(savedItems);

    const subtotal = calculateSubtotal(items);
    const shippingCost = getShippingCost(cart.selectedShippingId, subtotal);

    // Get promo code details
    let promoDiscount = 0;
    let appliedPromoCode: PromoCodeData | null = null;

    if (cart.appliedPromoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: cart.appliedPromoCode },
      });

      if (promo && promo.isActive) {
        const minOrderAmount = promo.minOrderAmount
          ? Number(promo.minOrderAmount)
          : 0;

        if (subtotal >= minOrderAmount) {
          appliedPromoCode = {
            code: promo.code,
            type: promo.type as unknown as PROMO_TYPE,
            value: Number(promo.value),
            maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
            minOrderAmount: minOrderAmount || null,
          };

          promoDiscount = calculatePromoDiscount(
            appliedPromoCode,
            subtotal,
            shippingCost
          );
        } else {
          // Clear invalid promo code
          await prisma.cart.update({
            where: { id: cartId },
            data: { appliedPromoCode: null },
          });
        }
      } else {
        // Clear expired/inactive promo code
        await prisma.cart.update({
          where: { id: cartId },
          data: { appliedPromoCode: null },
        });
      }
    }

    const summary = calculateCartSummary(items, shippingCost, promoDiscount);

    return {
      success: true,
      data: {
        items,
        savedItems: savedItemsMapped,
        summary,
        appliedPromoCode,
        selectedShippingId: cart.selectedShippingId,
      },
    };
  } catch (error) {
    console.error("getCartForUI error:", error);
    return { success: false, message: "Failed to load cart" };
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const cartId = await getOrCreateCart();

    const result = await prisma.cartItem.aggregate({
      where: { cartId, isSavedForLater: false },
      _sum: { quantity: true },
    });

    return result._sum.quantity || 0;
  } catch (error) {
    console.error("getCartItemCount error:", error);
    return 0;
  }
}
// Add to actions/cart.ts

export async function getRecommendedProducts(): Promise<{
  success: boolean;
  data?: RecommendedProduct[];
  message?: string;
}> {
  try {
    // Get featured products or products from similar categories
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 8,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        productVariants: {
          take: 1,
          orderBy: { price: "asc" },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const recommendations: RecommendedProduct[] = products
      .filter((p) => p.productVariants.length > 0)
      .map((product) => {
        const variant = product.productVariants[0];
        const avgRating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0;

        return {
          id: product.id,
          name: product.name,
          image: product.images[0]?.url || "/placeholder-product.jpg",
          price: Number(variant.price),
          originalPrice: product.costPrice
            ? Number(product.costPrice) > Number(variant.price)
              ? Number(product.costPrice)
              : undefined
            : undefined,
          rating: avgRating,
          reviewCount: product.reviews.length,
          variantId: variant.id,
        };
      });

    return { success: true, data: recommendations };
  } catch (error) {
    console.error("getRecommendedProducts error:", error);
    return { success: false, message: "Failed to load recommendations" };
  }
}

interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  variantId: string;
}

export async function clearCartAction() {
  try {
    const cartId = await getOrCreateCart();

    // Delete all items that are not saved for later
    await prisma.cartItem.deleteMany({
      where: {
        cartId,
        isSavedForLater: false,
      },
    });

    // Return updated cart for UI
    return getCartForUI();
  } catch (error) {
    console.error("clearCartAction error:", error);
    return {
      success: false,
      message: "Failed to clear cart",
    };
  }
}
