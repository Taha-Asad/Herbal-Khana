// src/app/action/comments.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "./user.action";

// =============================================================================
// TYPES
// =============================================================================

export interface CommentInput {
  productId: string;
  content: string;
}

export interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isOwner: boolean;
}

export interface PaginatedComments {
  comments: CommentData[];
  total: number;
  pages: number;
  currentPage: number;
  hasMore: boolean;
}

type CommentResult =
  | { success: true; data: CommentData; message: string }
  | { success: false; message: string };

type CommentsResult =
  | { success: true; data: PaginatedComments }
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

// =============================================================================
// COMMENT ACTIONS
// =============================================================================

/**
 * Create a new comment on a product
 */
export async function createComment(
  input: CommentInput
): Promise<CommentResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, message: "You must be logged in to comment" };
    }

    // Validate content
    if (!input.content || input.content.trim().length < 3) {
      return {
        success: false,
        message: "Comment must be at least 3 characters long",
      };
    }

    if (input.content.trim().length > 1000) {
      return {
        success: false,
        message: "Comment must be less than 1000 characters",
      };
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId, isActive: true },
      select: { id: true, slug: true },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Rate limiting: Check if user has commented too recently
    const recentComment = await prisma.comment.findFirst({
      where: {
        userId,
        productId: input.productId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 1000), // 30 seconds cooldown
        },
      },
    });

    if (recentComment) {
      return {
        success: false,
        message: "Please wait a moment before posting another comment",
      };
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        productId: input.productId,
        content: input.content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    revalidatePath(`/products/${product.slug}`);
    revalidatePath(`/home/shop/products/${product.slug}`);

    return {
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
        isOwner: true,
      },
      message: "Comment posted successfully!",
    };
  } catch (error) {
    console.error("createComment error:", error);
    return { success: false, message: "Failed to post comment" };
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<CommentResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to update a comment",
      };
    }

    if (!content || content.trim().length < 3) {
      return {
        success: false,
        message: "Comment must be at least 3 characters long",
      };
    }

    if (content.trim().length > 1000) {
      return {
        success: false,
        message: "Comment must be less than 1000 characters",
      };
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        product: { select: { slug: true } },
      },
    });

    if (!existingComment) {
      return { success: false, message: "Comment not found" };
    }

    if (existingComment.userId !== userId) {
      return {
        success: false,
        message: "You can only update your own comments",
      };
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    revalidatePath(`/products/${existingComment.product.slug}`);
    revalidatePath(`/home/shop/products/${existingComment.product.slug}`);

    return {
      success: true,
      data: {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        user: updatedComment.user,
        isOwner: true,
      },
      message: "Comment updated successfully!",
    };
  } catch (error) {
    console.error("updateComment error:", error);
    return { success: false, message: "Failed to update comment" };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to delete a comment",
      };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        product: { select: { slug: true } },
      },
    });

    if (!comment) {
      return { success: false, message: "Comment not found" };
    }

    // Check if user is owner or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (comment.userId !== userId && user?.role !== "ADMIN") {
      return {
        success: false,
        message: "You can only delete your own comments",
      };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/products/${comment.product.slug}`);
    revalidatePath(`/home/shop/products/${comment.product.slug}`);

    return { success: true, message: "Comment deleted successfully" };
  } catch (error) {
    console.error("deleteComment error:", error);
    return { success: false, message: "Failed to delete comment" };
  }
}

/**
 * Get paginated comments for a product
 */
export async function getProductComments(
  productId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: "newest" | "oldest";
  } = {}
): Promise<CommentsResult> {
  try {
    const userId = await getCurrentUserId();
    const { page = 1, limit = 20, sortBy = "newest" } = options;
    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { productId } }),
    ]);

    const commentsWithOwnership = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user,
      isOwner: userId === comment.userId,
    }));

    const pages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        comments: commentsWithOwnership,
        total,
        pages,
        currentPage: page,
        hasMore: page < pages,
      },
    };
  } catch (error) {
    console.error("getProductComments error:", error);
    return { success: false, message: "Failed to load comments" };
  }
}

/**
 * Get total comment count for a product
 */
export async function getProductCommentCount(productId: string): Promise<{
  success: boolean;
  count?: number;
  message?: string;
}> {
  try {
    const count = await prisma.comment.count({
      where: { productId },
    });

    return { success: true, count };
  } catch (error) {
    console.error("getProductCommentCount error:", error);
    return { success: false, message: "Failed to get comment count" };
  }
}
