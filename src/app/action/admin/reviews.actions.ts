// app/action/admin/reviews.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-auth";
import {
  ActionResponse,
  PaginatedData,
  QueryFilters,
  Review,
} from "@/types/admin";

export async function getReviews(
  filters: QueryFilters = {}
): Promise<ActionResponse<PaginatedData<Review>>> {
  try {
    await requireAdmin();

    const {
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
    } = filters;

    const where: Prisma.ReviewWhereInput = {};

    if (status === "approved") {
      where.isApproved = true;
    } else if (status === "pending") {
      where.isApproved = false;
    }

    const orderByField = sortBy as keyof Prisma.ReviewOrderByWithRelationInput;
    const orderByValue = sortOrder as Prisma.SortOrder;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [orderByField]: orderByValue },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: {
            select: {
              id: true,
              name: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title || undefined,
          content: review.content || undefined,
          isApproved: review.isApproved,
          user: {
            id: review.user.id,
            name: review.user.name || undefined,
            email: review.user.email,
          },
          product: {
            id: review.product.id,
            name: review.product.name,
            image: review.product.images[0]?.url,
          },
          createdAt: review.createdAt.toISOString(),
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("getReviews error:", error);
    return { success: false, error: "Failed to load reviews" };
  }
}

export async function approveReview(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });

    revalidatePath("/admin/reviews");
    return { success: true, message: "Review approved" };
  } catch (error) {
    console.error("approveReview error:", error);
    return { success: false, error: "Failed to approve review" };
  }
}

export async function rejectReview(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.review.update({
      where: { id },
      data: { isApproved: false },
    });

    revalidatePath("/admin/reviews");
    return { success: true, message: "Review rejected" };
  } catch (error) {
    console.error("rejectReview error:", error);
    return { success: false, error: "Failed to reject review" };
  }
}

export async function deleteReview(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.review.delete({ where: { id } });

    revalidatePath("/admin/reviews");
    return { success: true, message: "Review deleted" };
  } catch (error) {
    console.error("deleteReview error:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

export async function bulkApproveReviews(
  ids: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { isApproved: true },
    });

    revalidatePath("/admin/reviews");
    return { success: true, message: `${ids.length} reviews approved` };
  } catch (error) {
    console.error("bulkApproveReviews error:", error);
    return { success: false, error: "Failed to approve reviews" };
  }
}

export async function bulkDeleteReviews(
  ids: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.review.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/reviews");
    return { success: true, message: `${ids.length} reviews deleted` };
  } catch (error) {
    console.error("bulkDeleteReviews error:", error);
    return { success: false, error: "Failed to delete reviews" };
  }
}

export async function getReviewStats(): Promise<
  ActionResponse<{
    total: number;
    pending: number;
    approved: number;
    averageRating: number;
  }>
> {
  try {
    await requireAdmin();

    const [total, pending, approved, avgRating] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        averageRating: avgRating._avg.rating || 0,
      },
    };
  } catch (error) {
    console.error("getReviewStats error:", error);
    return { success: false, error: "Failed to load review stats" };
  }
}
