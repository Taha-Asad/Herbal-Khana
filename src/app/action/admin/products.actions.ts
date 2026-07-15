"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-auth";
import {
  ActionResponse,
  PaginatedData,
  QueryFilters,
  Product,
  ProductListItem,
  ProductFormData,
} from "@/types/admin";
import { utapi } from "@/utils/uploadThing";

/* -------------------------------------------------------------------------- */
/*                               IMAGE UPLOAD                                 */
/* -------------------------------------------------------------------------- */

export async function uploadImageFromFile(
  file?: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const uploadRes = await utapi.uploadFiles(file);
    return uploadRes?.data?.ufsUrl ?? null;
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               GET PRODUCTS                                 */
/* -------------------------------------------------------------------------- */

export async function getProducts(
  filters: QueryFilters = {},
): Promise<ActionResponse<PaginatedData<ProductListItem>>> {
  try {
    await requireAdmin();

    const {
      search,
      status,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 20,
    } = filters;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        {
          productVariants: {
            some: { sku: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    else if (status === "featured") where.isFeatured = true;
    else if (status === "lowstock") {
      where.productVariants = {
        some: { stock: { gt: 0, lte: 10 } },
      };
    }

    if (category) where.categoryId = category;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          productVariants: {
            select: { price: true, stock: true, lowStockThreshold: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const items: ProductListItem[] = products.map((p) => {
      const prices = p.productVariants.map((v) => Number(v.price));
      const stocks = p.productVariants.map((v) => v.stock);
      const isLowStock = p.productVariants.some(
        (v) => v.stock > 0 && v.stock <= v.lowStockThreshold,
      );

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const costPrice = p.costPrice ? Number(p.costPrice) : null;
      const hasDiscount = costPrice !== null && costPrice > minPrice;
      const discount = hasDiscount
        ? Math.round(((costPrice - minPrice) / costPrice) * 100)
        : undefined;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        image: p.images[0]?.url,
        categoryName: p.category?.name,
        price: minPrice,
        costPrice: costPrice ?? undefined,
        originalPrice: hasDiscount ? costPrice : undefined,
        discount,
        stock: stocks.reduce((a, b) => a + b, 0),
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        salesCount: p.salesCount,
        variantCount: p.productVariants.length,
        isLowStock,
      };
    });

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("getProducts error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

/* -------------------------------------------------------------------------- */
/*                               GET PRODUCT                                  */
/* -------------------------------------------------------------------------- */

export async function getProduct(id: string): Promise<ActionResponse<Product>> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        productVariants: { orderBy: { name: "asc" } },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

      return {
        success: true,
        data: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description || undefined,
          shortDescription: product.shortDescription || undefined,
          costPrice: product.costPrice ? Number(product.costPrice) : undefined,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
        metaTitle: product.metaTitle || undefined,
        metaDescription: product.metaDescription || undefined,
        categoryId: product.categoryId || undefined,
        categoryName: product.category?.name,
        images: product.images.map((img) => ({
          ...img,
          alt: img.alt ?? undefined,
        })),

        variants: product.productVariants.map((v) => ({
          ...v,
          scent: v.scent ?? undefined,
          price: Number(v.price),
          concentration: v.concentration ?? undefined,
        })),

        viewCount: product.viewCount,
        salesCount: product.salesCount,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("getProduct error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

/* -------------------------------------------------------------------------- */
/*                               CREATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export async function createProduct(
  data: ProductFormData,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existingSlug) {
      return { success: false, error: "A product with this slug already exists" };
    }

    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
      select: { id: true },
    });
    if (existingSku) {
      return { success: false, error: "A product with this SKU already exists" };
    }

    /* ------------------------------- UPLOAD IMAGES -------------------------- */

    const resolvedImages: { url: string; alt: string | null | undefined; sortOrder: number; isPrimary: boolean }[] = [];
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i];
      let imageUrl: string | null = null;

      if (img.file) {
        imageUrl = await uploadImageFromFile(img.file);
      } else {
        imageUrl = img.url ?? null;
      }

      if (!imageUrl) continue;

      resolvedImages.push({
        url: imageUrl,
        alt: img.alt,
        sortOrder: img.sortOrder ?? i,
        isPrimary: img.isPrimary ?? i === 0,
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description,
          shortDescription: data.shortDescription,
          costPrice: data.costPrice ?? null,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          categoryId: data.categoryId || null,
        },
      });

      /* ------------------------------- IMAGES -------------------------------- */

      if (resolvedImages.length > 0) {
        await tx.productImage.createMany({
          data: resolvedImages.map((img) => ({
            productId: newProduct.id,
            ...img,
          })),
        });
      }

      /* ------------------------------ VARIANTS ------------------------------- */

      if (data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: newProduct.id,
            name: v.name,
            size: v.size,
            scent: v.scent,
            concentration: v.concentration,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
          })),
        });
      }

      return newProduct;
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      data: { id: product.id },
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

/* -------------------------------------------------------------------------- */
/*                               UPDATE PRODUCT                               */
/* -------------------------------------------------------------------------- */

export async function updateProduct(
  id: string,
  data: ProductFormData,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const existingSlug = await prisma.product.findFirst({
      where: { slug: data.slug, id: { not: id } },
      select: { id: true },
    });
    if (existingSlug) {
      return { success: false, error: "A product with this slug already exists" };
    }

    const existingSku = await prisma.product.findFirst({
      where: { sku: data.sku, id: { not: id } },
      select: { id: true },
    });
    if (existingSku) {
      return { success: false, error: "A product with this SKU already exists" };
    }

    /* ------------------------------- UPLOAD IMAGES -------------------------- */

    const resolvedImages: { url: string; alt: string | null | undefined; sortOrder: number; isPrimary: boolean }[] = [];
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i];
      let imageUrl: string | null = null;

      if (img.file) {
        imageUrl = await uploadImageFromFile(img.file);
      } else {
        imageUrl = img.url ?? null;
      }

      if (!imageUrl) continue;

      resolvedImages.push({
        url: imageUrl,
        alt: img.alt,
        sortOrder: img.sortOrder ?? i,
        isPrimary: img.isPrimary ?? i === 0,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description,
          shortDescription: data.shortDescription,
          costPrice: data.costPrice ?? null,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          categoryId: data.categoryId || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });

      if (resolvedImages.length > 0) {
        await tx.productImage.createMany({
          data: resolvedImages.map((img) => ({
            productId: id,
            ...img,
          })),
        });
      }

      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: id,
            name: v.name,
            size: v.size,
            scent: v.scent,
            concentration: v.concentration,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
          })),
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    console.error("updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    // Soft-delete: set inactive so cart items still reference the variant
    // Cart UI will detect this and show "no longer available"
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.product.update({
      where: { id },
      data: { isFeatured },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("toggleProductFeatured error:", error);
    return { success: false, error: "Failed to update featured status" };
  }
}

export async function updateProductStock(
  variantId: string,
  stock: number,
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("updateProductStock error:", error);
    return { success: false, error: "Failed to update stock" };
  }
}
