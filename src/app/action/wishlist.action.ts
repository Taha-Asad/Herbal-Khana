// actions/wishlist.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// =============================================================================
// TYPES
// =============================================================================

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount: number;
  defaultVariantId: string;
  addedAt: Date;
}

type WishlistResult =
  | { success: true; data: WishlistItem[]; message?: string }
  | { success: false; message: string };

type ToggleResult =
  | { success: true; isWishlisted: boolean; message: string }
  | { success: false; message: string };

type CountResult =
  | { success: true; count: number }
  | { success: false; message: string };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getVerifiedUserId(): Promise<string | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error("getVerifiedUserId error:", error);
    return null;
  }
}

// =============================================================================
// PUBLIC ACTIONS
// =============================================================================

export async function getWishlist(): Promise<WishlistResult> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login to view wishlist" };
    }

    const bookmarks = await prisma.bookmarkedProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            productVariants: {
              orderBy: { price: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlistItems: WishlistItem[] = bookmarks
      .filter((b) => b.product.isActive && b.product.productVariants.length > 0)
      .map((bookmark) => {
        const product = bookmark.product;
        const variant = product.productVariants[0];
        const primaryImage = product.images[0];

        const costPrice = product.costPrice ? Number(product.costPrice) : null;
        const variantPrice = Number(variant.price);
        const hasDiscount = costPrice && costPrice > variantPrice;

        const totalStock = product.productVariants.reduce(
          (sum, v) => sum + v.stock,
          0
        );

        return {
          id: bookmark.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: primaryImage?.url || "/images/placeholder.png",
          price: variantPrice,
          originalPrice: hasDiscount ? costPrice : undefined,
          inStock: totalStock > 0,
          stockCount: totalStock,
          defaultVariantId: variant.id,
          addedAt: bookmark.createdAt,
        };
      });

    return { success: true, data: wishlistItems, message: "Wishlist loaded" };
  } catch (error) {
    console.error("getWishlist error:", error);
    return { success: false, message: "Failed to load wishlist" };
  }
}

export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login to add to wishlist" };
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, name: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Check if already bookmarked
    const existing = await prisma.bookmarkedProduct.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.bookmarkedProduct.delete({
        where: { id: existing.id },
      });

      revalidatePath("/wishlist");
      revalidatePath("/home/shop/products");

      return {
        success: true,
        isWishlisted: false,
        message: "Removed from wishlist",
      };
    } else {
      // Add to wishlist
      await prisma.bookmarkedProduct.create({
        data: { userId, productId },
      });

      revalidatePath("/wishlist");
      revalidatePath("/home/shop/products");

      return {
        success: true,
        isWishlisted: true,
        message: "Added to wishlist",
      };
    }
  } catch (error) {
    console.error("toggleWishlist error:", error);
    return { success: false, message: "Failed to update wishlist" };
  }
}

export async function addToWishlist(productId: string): Promise<ToggleResult> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login to add to wishlist" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Check if already exists
    const existing = await prisma.bookmarkedProduct.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return {
        success: true,
        isWishlisted: true,
        message: "Already in wishlist",
      };
    }

    await prisma.bookmarkedProduct.create({
      data: { userId, productId },
    });

    revalidatePath("/wishlist");
    return { success: true, isWishlisted: true, message: "Added to wishlist" };
  } catch (error) {
    console.error("addToWishlist error:", error);
    return { success: false, message: "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(
  productId: string
): Promise<ToggleResult> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login" };
    }

    const existing = await prisma.bookmarkedProduct.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!existing) {
      return { success: true, isWishlisted: false, message: "Not in wishlist" };
    }

    await prisma.bookmarkedProduct.delete({
      where: { id: existing.id },
    });

    revalidatePath("/wishlist");
    return {
      success: true,
      isWishlisted: false,
      message: "Removed from wishlist",
    };
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return { success: false, message: "Failed to remove from wishlist" };
  }
}

export async function isProductWishlisted(productId: string): Promise<boolean> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) return false;

    const existing = await prisma.bookmarkedProduct.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
      select: { id: true },
    });

    return !!existing;
  } catch {
    return false;
  }
}

export async function getWishlistProductIds(): Promise<string[]> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) return [];

    const bookmarks = await prisma.bookmarkedProduct.findMany({
      where: { userId },
      select: { productId: true },
    });

    return bookmarks.map((b) => b.productId);
  } catch {
    return [];
  }
}

export async function getWishlistCount(): Promise<CountResult> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: true, count: 0 };
    }

    const count = await prisma.bookmarkedProduct.count({
      where: { userId },
    });

    return { success: true, count };
  } catch (error) {
    console.error("getWishlistCount error:", error);
    return { success: false, message: "Failed to get wishlist count" };
  }
}

export async function clearWishlist(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login" };
    }

    await prisma.bookmarkedProduct.deleteMany({
      where: { userId },
    });

    revalidatePath("/wishlist");
    return { success: true, message: "Wishlist cleared" };
  } catch (error) {
    console.error("clearWishlist error:", error);
    return { success: false, message: "Failed to clear wishlist" };
  }
}

export async function moveWishlistToCart(
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return { success: false, message: "Please login" };
    }

    // Get product with available variant
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        productVariants: {
          where: { stock: { gt: 0 } },
          orderBy: { price: "asc" },
          take: 1,
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.productVariants.length === 0) {
      return { success: false, message: "Product is out of stock" };
    }

    const variantId = product.productVariants[0].id;

    // Import and use addToCart
    const { addToCart } = await import("./cart.actions");
    const cartResult = await addToCart(variantId, 1);

    if (!cartResult.success) {
      return {
        success: false,
        message: cartResult.message || "Failed to add to cart",
      };
    }

    // Remove from wishlist
    await prisma.bookmarkedProduct.deleteMany({
      where: { userId, productId },
    });

    revalidatePath("/wishlist");
    revalidatePath("/cart");

    return { success: true, message: "Moved to cart" };
  } catch (error) {
    console.error("moveWishlistToCart error:", error);
    return { success: false, message: "Failed to move to cart" };
  }
}

export async function moveAllWishlistToCart(): Promise<{
  success: boolean;
  message: string;
  movedCount: number;
  failedCount: number;
}> {
  try {
    const userId = await getVerifiedUserId();

    if (!userId) {
      return {
        success: false,
        message: "Please login",
        movedCount: 0,
        failedCount: 0,
      };
    }

    const wishlist = await getWishlist();

    if (!wishlist.success || wishlist.data.length === 0) {
      return {
        success: true,
        message: "Wishlist is empty",
        movedCount: 0,
        failedCount: 0,
      };
    }

    let movedCount = 0;
    let failedCount = 0;

    for (const item of wishlist.data) {
      if (item.inStock) {
        const result = await moveWishlistToCart(item.productId);
        if (result.success) {
          movedCount++;
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    return {
      success: true,
      message: `Moved ${movedCount} items to cart`,
      movedCount,
      failedCount,
    };
  } catch (error) {
    console.error("moveAllWishlistToCart error:", error);
    return {
      success: false,
      message: "Failed to move items to cart",
      movedCount: 0,
      failedCount: 0,
    };
  }
}
