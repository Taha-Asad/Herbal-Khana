// src/app/action/reviews.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "./user.action";

// =============================================================================
// TYPES
// =============================================================================

export interface ReviewInput {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface ReviewUpdateInput {
  rating?: number;
  title?: string;
  content?: string;
}

export interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  verifiedPurchaseCount: number;
}

export interface PaginatedReviews {
  reviews: ReviewData[];
  total: number;
  pages: number;
  currentPage: number;
  hasMore: boolean;
}

type ReviewResult =
  | { success: true; data: ReviewData; message: string }
  | { success: false; message: string };

type ReviewsResult =
  | { success: true; data: PaginatedReviews }
  | { success: false; message: string };

type ReviewStatsResult =
  | { success: true; data: ReviewStats }
  | { success: false; message: string };

type CanReviewResult =
  | {
      success: true;
      data: { canReview: boolean; reason?: string; hasPurchased: boolean };
    }
  | { success: false; message: string };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getServerAuthSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error("getCurrentUserId error:", error);
    return null;
  }
}

async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "PAID"] },
        },
      },
    });
    return !!purchase;
  } catch (error) {
    console.error("hasUserPurchasedProduct error:", error);
    return false;
  }
}

// =============================================================================
// REVIEW ACTIONS
// =============================================================================

/**
 * Create a new review for a product
 */
export async function createReview(input: ReviewInput): Promise<ReviewResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to leave a review",
      };
    }

    // Validate rating
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { success: false, message: "Rating must be between 1 and 5" };
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId, isActive: true },
      select: { id: true, slug: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: input.productId,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        message:
          "You have already reviewed this product. You can edit your existing review.",
      };
    }

    // Check if user has purchased this product
    const hasPurchased = await hasUserPurchasedProduct(userId, input.productId);

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: input.productId,
        rating: Math.round(input.rating),
        title: input.title?.trim() || null,
        content: input.content?.trim() || null,
        // Auto-approve verified purchases, others need moderation
        isApproved: hasPurchased,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Revalidate product page
    revalidatePath(`/products/${product.slug}`);
    revalidatePath(`/home/shop/products/${product.slug}`);

    return {
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        isApproved: review.isApproved,
        isVerifiedPurchase: hasPurchased,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
      },
      message: review.isApproved
        ? "Review submitted successfully!"
        : "Review submitted and pending approval. Thank you!",
    };
  } catch (error) {
    console.error("createReview error:", error);
    return {
      success: false,
      message: "Failed to submit review. Please try again.",
    };
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  input: ReviewUpdateInput
): Promise<ReviewResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to update a review",
      };
    }

    // Find the review and verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { slug: true } },
      },
    });

    if (!existingReview) {
      return { success: false, message: "Review not found" };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        message: "You can only update your own reviews",
      };
    }

    // Validate rating if provided
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      return { success: false, message: "Rating must be between 1 and 5" };
    }

    const hasPurchased = await hasUserPurchasedProduct(
      userId,
      existingReview.productId
    );

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating:
          input.rating !== undefined ? Math.round(input.rating) : undefined,
        title:
          input.title !== undefined ? input.title.trim() || null : undefined,
        content:
          input.content !== undefined
            ? input.content.trim() || null
            : undefined,
        // Keep approval status for verified purchases
        isApproved: hasPurchased ? true : existingReview.isApproved,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    revalidatePath(`/products/${existingReview.product.slug}`);
    revalidatePath(`/home/shop/products/${existingReview.product.slug}`);

    return {
      success: true,
      data: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        content: updatedReview.content,
        isApproved: updatedReview.isApproved,
        isVerifiedPurchase: hasPurchased,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt,
        user: updatedReview.user,
      },
      message: "Review updated successfully!",
    };
  } catch (error) {
    console.error("updateReview error:", error);
    return { success: false, message: "Failed to update review" };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to delete a review",
      };
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { slug: true } },
      },
    });

    if (!review) {
      return { success: false, message: "Review not found" };
    }

    // Check if user is owner or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (review.userId !== userId && user?.role !== "ADMIN") {
      return {
        success: false,
        message: "You can only delete your own reviews",
      };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/products/${review.product.slug}`);
    revalidatePath(`/home/shop/products/${review.product.slug}`);

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("deleteReview error:", error);
    return { success: false, message: "Failed to delete review" };
  }
}

/**
 * Get paginated reviews for a product
 */
export async function getProductReviews(
  productId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: "newest" | "oldest" | "highest" | "lowest";
  } = {}
): Promise<ReviewsResult> {
  try {
    const { page = 1, limit = 10, sortBy = "newest" } = options;
    const skip = (page - 1) * limit;

    // Build order by clause
    let orderBy: { createdAt?: "asc" | "desc"; rating?: "asc" | "desc" } = {
      createdAt: "desc",
    };
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          isApproved: true,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          productId,
          isApproved: true,
        },
      }),
    ]);

    // Check which reviews are from verified purchases
    const reviewsWithVerification = await Promise.all(
      reviews.map(async (review) => {
        const hasPurchased = await hasUserPurchasedProduct(
          review.userId,
          productId
        );
        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isApproved: review.isApproved,
          isVerifiedPurchase: hasPurchased,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: review.user,
        };
      })
    );

    const pages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        reviews: reviewsWithVerification,
        total,
        pages,
        currentPage: page,
        hasMore: page < pages,
      },
    };
  } catch (error) {
    console.error("getProductReviews error:", error);
    return { success: false, message: "Failed to load reviews" };
  }
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(
  productId: string
): Promise<ReviewStatsResult> {
  try {
    // Get all approved reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      select: {
        rating: true,
        userId: true,
      },
    });

    if (reviews.length === 0) {
      return {
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [
            { rating: 5, count: 0, percentage: 0 },
            { rating: 4, count: 0, percentage: 0 },
            { rating: 3, count: 0, percentage: 0 },
            { rating: 2, count: 0, percentage: 0 },
            { rating: 1, count: 0, percentage: 0 },
          ],
          verifiedPurchaseCount: 0,
        },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    // Calculate rating distribution
    const ratingCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    reviews.forEach((r) => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    });

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: ratingCounts[rating] || 0,
      percentage: Math.round(
        ((ratingCounts[rating] || 0) / reviews.length) * 100
      ),
    }));

    // Count verified purchases
    const verifiedPurchaseCounts = await Promise.all(
      reviews.map((r) => hasUserPurchasedProduct(r.userId, productId))
    );
    const verifiedPurchaseCount = verifiedPurchaseCounts.filter(Boolean).length;

    return {
      success: true,
      data: {
        averageRating,
        totalReviews: reviews.length,
        ratingDistribution,
        verifiedPurchaseCount,
      },
    };
  } catch (error) {
    console.error("getProductReviewStats error:", error);
    return { success: false, message: "Failed to load review statistics" };
  }
}

/**
 * Check if the current user can review a product
 */
export async function canUserReviewProduct(
  productId: string
): Promise<CanReviewResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: true,
        data: {
          canReview: false,
          reason: "You must be logged in to leave a review",
          hasPurchased: false,
        },
      };
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      return {
        success: true,
        data: {
          canReview: false,
          reason: "You have already reviewed this product",
          hasPurchased: await hasUserPurchasedProduct(userId, productId),
        },
      };
    }

    const hasPurchased = await hasUserPurchasedProduct(userId, productId);

    return {
      success: true,
      data: {
        canReview: true,
        hasPurchased,
      },
    };
  } catch (error) {
    console.error("canUserReviewProduct error:", error);
    return { success: false, message: "Failed to check review eligibility" };
  }
}

/**
 * Get the current user's review for a product
 */
export async function getUserReviewForProduct(productId: string): Promise<{
  success: boolean;
  data?: ReviewData | null;
  message?: string;
}> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: true, data: null };
    }

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!review) {
      return { success: true, data: null };
    }

    const hasPurchased = await hasUserPurchasedProduct(userId, productId);

    return {
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        isApproved: review.isApproved,
        isVerifiedPurchase: hasPurchased,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
      },
    };
  } catch (error) {
    console.error("getUserReviewForProduct error:", error);
    return { success: false, message: "Failed to load your review" };
  }
}

/**
 * Get all reviews by the current user
 */
export async function getUserReviews(
  page: number = 1,
  limit: number = 10
): Promise<{
  success: boolean;
  data?: {
    reviews: (ReviewData & {
      product: { id: string; name: string; slug: string; image: string };
    })[];
    total: number;
    pages: number;
  };
  message?: string;
}> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to view your reviews",
      };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        const hasPurchased = await hasUserPurchasedProduct(
          userId,
          review.productId
        );
        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isApproved: review.isApproved,
          isVerifiedPurchase: hasPurchased,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: review.user,
          product: {
            id: review.product.id,
            name: review.product.name,
            slug: review.product.slug,
            image: review.product.images[0]?.url || "/placeholder.svg",
          },
        };
      })
    );

    return {
      success: true,
      data: {
        reviews: reviewsWithProducts,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getUserReviews error:", error);
    return { success: false, message: "Failed to load your reviews" };
  }
}
