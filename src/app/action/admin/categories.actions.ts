// app/action/admin/categories.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ActionResponse, Category, CategoryFormData } from "@/types/admin";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { uploadImageFromFile } from "./products.actions";

export async function getCategories(): Promise<ActionResponse<Category[]>> {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return {
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || undefined,
        image: cat.image || null,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder,
        productCount: cat._count.products,
        createdAt: cat.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getCategories error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}

export async function getCategory(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
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
        description: category.description || undefined,
        image: category.image || null,
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

    const imageUrl = await uploadImageFromFile(data.image);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: imageUrl,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/admin/categories");
    return {
      success: true,
      data: { id: category.id },
      message: "Category created",
    };
  } catch (error) {
    console.error("createCategory error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        return { success: false, error: "Slug already exists" };
      }
    }
    let imageUrl: string | null | undefined = undefined;

    if (data.image instanceof File) {
      imageUrl = await uploadImageFromFile(data.image);
    } else if (data.image === null) {
      imageUrl = null;
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: imageUrl,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category updated" };
  } catch (error) {
    console.error("updateCategory error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.products} products. Please reassign or delete products first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted" };
  } catch (error) {
    console.error("deleteCategory error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("reorderCategories error:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}
