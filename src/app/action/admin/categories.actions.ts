// app/action/admin/categories.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ActionResponse, Category, CategoryFormData } from "@/types/admin";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { uploadImageFromFile } from "./products.actions";

// ============================================================================
// GET ALL CATEGORIES
// ============================================================================

export async function getCategories(): Promise<ActionResponse<Category[]>> {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formattedCategories: Category[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? undefined,
      image: cat.image ?? null,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
      productCount: cat._count.products,
      createdAt: cat.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedCategories,
    };
  } catch (error) {
    console.error("getCategories error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}

// ============================================================================
// GET SINGLE CATEGORY
// ============================================================================

export async function getCategory(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? undefined,
        image: category.image ?? null,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("getCategory error:", error);
    return { success: false, error: "Failed to load category" };
  }
}

// ============================================================================
// CREATE CATEGORY
// ============================================================================

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    // Check unique slug
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { success: false, error: "Slug already exists" };
    }

    // Handle image upload
    let imageUrl: string | null = null;
    if (data.image instanceof File) {
      imageUrl = await uploadImageFromFile(data.image);
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: imageUrl,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      data: { id: category.id },
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("createCategory error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// ============================================================================
// UPDATE CATEGORY
// ============================================================================

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return { success: false, error: "Slug already exists" };
      }
    }

    // Handle image upload
    let imageUrl: string | null | undefined = undefined;

    if (data.image instanceof File) {
      imageUrl = await uploadImageFromFile(data.image);
    } else if (data.image === null) {
      // Explicitly removing image
      imageUrl = null;
    }
    // If data.image is undefined, we don't change the image

    // Build update data
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description ?? null;
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    await prisma.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);

    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    console.error("updateCategory error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// ============================================================================
// DELETE CATEGORY
// ============================================================================

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check if category exists and has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${
          category._count.products
        } product${
          category._count.products === 1 ? "" : "s"
        }. Please reassign or delete products first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("deleteCategory error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// ============================================================================
// REORDER CATEGORIES
// ============================================================================

export async function reorderCategories(
  orderedIds: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Validate all IDs exist
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true },
    });

    if (existingCategories.length !== orderedIds.length) {
      return { success: false, error: "Some categories not found" };
    }

    // Update sort order in transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/admin/categories");

    return { success: true, message: "Categories reordered successfully" };
  } catch (error) {
    console.error("reorderCategories error:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}

// ============================================================================
// TOGGLE CATEGORY STATUS
// ============================================================================

export async function toggleCategoryStatus(
  id: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: `Category ${
        category.isActive ? "deactivated" : "activated"
      } successfully`,
    };
  } catch (error) {
    console.error("toggleCategoryStatus error:", error);
    return { success: false, error: "Failed to update category status" };
  }
}

// ============================================================================
// GET CATEGORIES FOR SELECT (Lightweight version for dropdowns)
// ============================================================================

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export async function getCategoryOptions(): Promise<
  ActionResponse<CategoryOption[]>
> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("getCategoryOptions error:", error);
    return { success: false, error: "Failed to load category options" };
  }
}
