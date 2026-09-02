// actions/products.ts
"use server";

import prisma from "@/lib/prisma";
import type {
  FilterState,
  ProductListItem,
  ProductsResponse,
  AvailableFilters,
  Product,
  ProductReview,
  CategoryFilter,
  ProductComment,
} from "@/types/product";
import { Prisma } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

type ProductsResult =
  | { success: true; data: ProductsResponse; message: string }
  | { success: false; message: string };

type SingleProductResult =
  | { success: true; data: Product }
  | { success: false; message: string };

type CategoriesResult =
  | { success: true; data: CategoryFilter[] }
  | { success: false; message: string };

type FiltersResult =
  | { success: true; data: AvailableFilters }
  | { success: false; message: string };

// Prisma payload types for type safety
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
    productVariants: true;
    reviews: { select: { rating: true } };
  };
}>;

type FullProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: { orderBy: { sortOrder: "asc" } };
    category: true;
    productVariants: { orderBy: { price: "asc" } };
    reviews: {
      where: { isApproved: true };
      include: { user: { select: { id: true; name: true; image: true } } };
      orderBy: { createdAt: "desc" };
      take: 10;
    };
  };
}>;

// =============================================================================
// CONSTANTS
// =============================================================================

const BESTSELLER_THRESHOLD = 10; // Products with salesCount > this are bestsellers

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildWhereClause(
  filters: Partial<FilterState>
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  const andConditions: Prisma.ProductWhereInput[] = [];

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    andConditions.push({
      category: {
        slug: { in: filters.categories },
      },
    });
  }

  // Price range filter - filter by variant prices
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice > 0 || maxPrice < 100000) {
      andConditions.push({
        productVariants: {
          some: {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        },
      });
    }
  }

  // Availability filter
  if (filters.availability && filters.availability.includes("in-stock")) {
    andConditions.push({
      productVariants: {
        some: {
          stock: { gt: 0 },
        },
      },
    });
  }

  // Offers filter
  if (filters.offers && filters.offers.length > 0) {
    const offerConditions: Prisma.ProductWhereInput[] = [];

    if (filters.offers.includes("new")) {
      offerConditions.push({ isNew: true });
    }
    if (filters.offers.includes("bestseller")) {
      offerConditions.push({ salesCount: { gt: BESTSELLER_THRESHOLD } });
    }
    if (filters.offers.includes("featured")) {
      offerConditions.push({ isFeatured: true });
    }
    if (filters.offers.includes("on-sale")) {
      // Products with costPrice (which acts as original/compare price)
      offerConditions.push({
        costPrice: { not: null },
      });
    }

    if (offerConditions.length > 0) {
      andConditions.push({ OR: offerConditions });
    }
  }

  // Rating filter - products with at least one review at or above the rating
  if (filters.ratings && filters.ratings.length > 0) {
    const minRating = Math.min(...filters.ratings);
    andConditions.push({
      reviews: {
        some: {
          rating: { gte: minRating },
          isApproved: true,
        },
      },
    });
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { shortDescription: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        {
          category: {
            name: { contains: searchTerm, mode: "insensitive" },
          },
        },
        {
          productVariants: {
            some: {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { scent: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

function buildOrderByClause(
  sortBy: string
):
  | Prisma.ProductOrderByWithRelationInput
  | Prisma.ProductOrderByWithRelationInput[] {
  switch (sortBy) {
    case "newest":
      return { createdAt: "desc" };
    case "price-low":
      // Note: Prisma doesn't support ordering by relation aggregate directly
      // We'll handle this in post-processing or use raw query
      return { createdAt: "desc" };
    case "price-high":
      return { createdAt: "desc" };
    case "rating":
      // Order by review count as proxy (products with more reviews tend to be highly rated)
      return [{ reviews: { _count: "desc" } }, { createdAt: "desc" }];
    case "bestselling":
      return { salesCount: "desc" };
    case "discount":
      // Products with costPrice first (they have discounts)
      return [{ costPrice: "desc" }, { createdAt: "desc" }];
    case "featured":
    default:
      return [
        { isFeatured: "desc" },
        { isNew: "desc" },
        { salesCount: "desc" },
        { createdAt: "desc" },
      ];
  }
}

function calculateProductRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function calculateDiscount(
  costPrice: number | null,
  variantPrice: number
): number | undefined {
  if (!costPrice || costPrice <= variantPrice) return undefined;
  return Math.round(((costPrice - variantPrice) / costPrice) * 100);
}

function transformToListItem(product: ProductWithRelations): ProductListItem {
  // Get primary image or first image
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  // Get lowest price variant
  const sortedVariants = [...product.productVariants].sort(
    (a, b) => Number(a.price) - Number(b.price)
  );
  const lowestPriceVariant = sortedVariants[0];

  if (!lowestPriceVariant) {
    throw new Error(`Product ${product.id} has no variants`);
  }

  // Calculate total stock
  const totalStock = product.productVariants.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  // Calculate average rating
  const rating = calculateProductRating(product.reviews);

  // Calculate discount
  const costPrice = product.costPrice ? Number(product.costPrice) : null;
  const variantPrice = Number(lowestPriceVariant.price);
  const discount = calculateDiscount(costPrice, variantPrice);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    price: variantPrice,
    originalPrice: costPrice && discount ? costPrice : undefined,
    discount,
    rating,
    reviewCount: product.reviews.length,
    image: primaryImage?.url || "/placeholder.svg",
    category: product.category?.name || "Uncategorized",
    categorySlug: product.category?.slug || "uncategorized",
    defaultVariantId: lowestPriceVariant.id,
    inStock: totalStock > 0,
    stockCount: totalStock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    isBestseller: product.salesCount > BESTSELLER_THRESHOLD,
  };
}

function transformToFullProduct(product: FullProductWithRelations): Product {
  // Get sorted variants by price
  const sortedVariants = [...product.productVariants].sort(
    (a, b) => Number(a.price) - Number(b.price)
  );
  const lowestPriceVariant = sortedVariants[0];

  // Calculate total stock
  const totalStock = product.productVariants.reduce(
    (sum, v) => sum + v.stock,
    0
  );

  // Calculate average rating from approved reviews
  const rating = calculateProductRating(
    product.reviews.map((r) => ({ rating: r.rating }))
  );

  // Calculate discount
  const costPrice = product.costPrice ? Number(product.costPrice) : null;
  const variantPrice = lowestPriceVariant
    ? Number(lowestPriceVariant.price)
    : 0;
  const discount = calculateDiscount(costPrice, variantPrice);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    sku: product.sku,
    costPrice,
    weight: product.weight ? Number(product.weight) : null,
    price: variantPrice,
    originalPrice: costPrice && discount ? costPrice : undefined,
    discount,
    rating,
    reviewCount: product.reviews.length,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    variants: product.productVariants.map((v) => ({
      id: v.id,
      name: v.name,
      size: v.size,
      scent: v.scent,
      concentration: v.concentration,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku,
      lowStockThreshold: v.lowStockThreshold,
    })),
    inStock: totalStock > 0,
    stockCount: totalStock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    isBestseller: product.salesCount > BESTSELLER_THRESHOLD,
    viewCount: product.viewCount,
    salesCount: product.salesCount,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function getAvailableFiltersInternal(): Promise<AvailableFilters> {
  // Get categories with product count
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Get price range from all active product variants
  const priceStats = await prisma.productVariant.aggregate({
    where: {
      product: { isActive: true },
    },
    _min: { price: true },
    _max: { price: true },
  });

  // Get rating distribution from approved reviews
  const ratings = await prisma.review.groupBy({
    by: ["rating"],
    where: { isApproved: true },
    _count: { rating: true },
    orderBy: { rating: "desc" },
  });

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c._count.products,
    })),
    priceRange: {
      min: priceStats._min.price ? Number(priceStats._min.price) : 0,
      max: priceStats._max.price ? Number(priceStats._max.price) : 100000,
    },
    ratings: ratings.map((r) => ({
      value: r.rating,
      count: r._count.rating,
    })),
  };
}

// =============================================================================
// PUBLIC ACTIONS
// =============================================================================
// actions/products.ts - Update the getProducts function

export async function getProducts(
  filters: Partial<FilterState> = {},
  page: number = 1,
  limit: number = 12
): Promise<ProductsResult> {
  try {
    console.log("=== getProducts START ===");
    console.log("Filters:", JSON.stringify(filters));
    console.log("Page:", page, "Limit:", limit);

    const where = buildWhereClause(filters);
    console.log("Where clause built:", JSON.stringify(where));

    const orderBy = buildOrderByClause(filters.sortBy || "featured");
    console.log("OrderBy clause built");

    const skip = (page - 1) * limit;

    // Get total count for pagination
    console.log("Counting products...");
    const totalItems = await prisma.product.count({ where });
    console.log("Total products matching filter:", totalItems);

    // Get products with relations
    console.log("Fetching products...");
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        category: true,
        productVariants: {
          orderBy: { price: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    console.log("Raw products fetched:", products.length);

    // Transform products
    console.log("Transforming products...");
    const transformedProducts: ProductListItem[] = [];

    for (const product of products) {
      try {
        const transformed = transformToListItem(product);
        if (transformed) {
          transformedProducts.push(transformed);
        }
      } catch (transformError) {
        console.error(
          `Error transforming product ${product.id}:`,
          transformError
        );
      }
    }

    console.log("Transformed products:", transformedProducts.length);

    // Post-process sorting for price
    if (filters.sortBy === "price-low") {
      transformedProducts.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-high") {
      transformedProducts.sort((a, b) => b.price - a.price);
    }

    // Get available filters
    console.log("Getting available filters...");
    const availableFilters = await getAvailableFiltersInternal();

    const totalPages = Math.ceil(totalItems / limit);

    console.log("=== getProducts SUCCESS ===");
    console.log("Returning", transformedProducts.length, "products");

    return {
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
        },
        filters: availableFilters,
      },
      message: "Products loaded successfully",
    };
  } catch (error) {
    console.error("=== getProducts ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error name:", (error as Error)?.name);
    console.error("Error message:", (error as Error)?.message);
    console.error("Error stack:", (error as Error)?.stack);

    return { success: false, message: "Failed to load products" };
  }
}

export async function getProductById(id: string): Promise<SingleProductResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        productVariants: { orderBy: { price: "asc" } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.productVariants.length === 0) {
      return { success: false, message: "Product has no variants available" };
    }

    const transformedProduct = transformToFullProduct(product);

    return { success: true, data: transformedProduct };
  } catch (error) {
    console.error("getProductById error:", error);
    return { success: false, message: "Failed to load product" };
  }
}

export async function getFeaturedProducts(
  limit: number = 8
): Promise<ProductsResult> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        productVariants: { some: { stock: { gt: 0 } } },
      },
      take: limit,
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      include: {
        images: true,
        category: true,
        productVariants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    const transformedProducts = products
      .filter((p) => p.productVariants.length > 0)
      .map(transformToListItem);

    return {
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedProducts.length,
          itemsPerPage: limit,
        },
        filters: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          ratings: [],
        },
      },
      message: "Featured products loaded successfully",
    };
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    return { success: false, message: "Failed to load featured products" };
  }
}

export async function getNewArrivals(
  limit: number = 8
): Promise<ProductsResult> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isNew: true,
        productVariants: { some: { stock: { gt: 0 } } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        category: true,
        productVariants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    const transformedProducts = products
      .filter((p) => p.productVariants.length > 0)
      .map(transformToListItem);

    return {
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedProducts.length,
          itemsPerPage: limit,
        },
        filters: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          ratings: [],
        },
      },
      message: "New arrivals loaded successfully",
    };
  } catch (error) {
    console.error("getNewArrivals error:", error);
    return { success: false, message: "Failed to load new arrivals" };
  }
}

export async function getBestsellers(
  limit: number = 8
): Promise<ProductsResult> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        salesCount: { gt: BESTSELLER_THRESHOLD },
        productVariants: { some: { stock: { gt: 0 } } },
      },
      take: limit,
      orderBy: { salesCount: "desc" },
      include: {
        images: true,
        category: true,
        productVariants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    const transformedProducts = products
      .filter((p) => p.productVariants.length > 0)
      .map(transformToListItem);

    return {
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedProducts.length,
          itemsPerPage: limit,
        },
        filters: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          ratings: [],
        },
      },
      message: "Bestsellers loaded successfully",
    };
  } catch (error) {
    console.error("getBestsellers error:", error);
    return { success: false, message: "Failed to load bestsellers" };
  }
}

// Add to src/actions/products.ts

export async function getRelatedProducts(
  currentSlug: string,
  limit: number = 4
): Promise<ProductsResult> {
  try {
    // Get current product to find its category
    const currentProduct = await prisma.product.findUnique({
      where: { slug: currentSlug },
      select: { id: true, categoryId: true },
    });

    if (!currentProduct) {
      return {
        success: true,
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
          },
          filters: {
            categories: [],
            priceRange: { min: 0, max: 100000 },
            ratings: [],
          },
        },
        message: "Related products loaded successfully",
      };
    }

    const whereClause: Prisma.ProductWhereInput = {
      isActive: true,
      id: { not: currentProduct.id },
      productVariants: { some: { stock: { gt: 0 } } },
    };

    // If category exists, prioritize same category products
    if (currentProduct.categoryId) {
      whereClause.categoryId = currentProduct.categoryId;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        productVariants: { orderBy: { price: "asc" } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    });

    // If not enough products from same category, get more
    let allProducts = [...products];
    if (allProducts.length < limit) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { notIn: [currentProduct.id, ...allProducts.map((p) => p.id)] },
          productVariants: { some: { stock: { gt: 0 } } },
        },
        take: limit - allProducts.length,
        orderBy: [{ isFeatured: "desc" }, { salesCount: "desc" }],
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
          productVariants: { orderBy: { price: "asc" } },
          reviews: { where: { isApproved: true }, select: { rating: true } },
        },
      });
      allProducts = [...allProducts, ...additionalProducts];
    }

    const transformedProducts: ProductListItem[] = [];
    for (const product of allProducts) {
      if (product.productVariants.length === 0) continue;

      const primaryImage =
        product.images.find((img) => img.isPrimary) || product.images[0];
      const lowestPriceVariant = product.productVariants[0];
      const totalStock = product.productVariants.reduce(
        (sum, v) => sum + v.stock,
        0
      );
      const rating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      const costPrice = product.costPrice ? Number(product.costPrice) : null;
      const variantPrice = Number(lowestPriceVariant.price);
      const hasDiscount = costPrice && costPrice > variantPrice;

      transformedProducts.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        price: variantPrice,
        originalPrice: hasDiscount ? costPrice : undefined,
        discount: hasDiscount
          ? Math.round(((costPrice - variantPrice) / costPrice) * 100)
          : undefined,
        rating: Math.round(rating * 10) / 10,
        reviewCount: product.reviews.length,
        image: primaryImage?.url || "/placeholder.svg",
        category: product.category?.name || "Uncategorized",
        categorySlug: product.category?.slug || "uncategorized",
        defaultVariantId: lowestPriceVariant.id,
        inStock: totalStock > 0,
        stockCount: totalStock,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        isBestseller: product.salesCount > 10,
      });
    }

    return {
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedProducts.length,
          itemsPerPage: limit,
        },
        filters: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          ratings: [],
        },
      },
      message: "Related products loaded successfully",
    };
  } catch (error) {
    console.error("getRelatedProducts error:", error);
    return { success: false, message: "Failed to load related products" };
  }
}

export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<ProductsResult> {
  if (!query.trim()) {
    return {
      success: true,
      data: {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
        },
        filters: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          ratings: [],
        },
      },
      message: "No search query provided",
    };
  }

  return getProducts({ search: query }, 1, limit);
}

export async function getProductsByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 12
): Promise<ProductsResult> {
  return getProducts({ categories: [categorySlug] }, page, limit);
}

export async function getAvailableFilters(): Promise<FiltersResult> {
  try {
    const filters = await getAvailableFiltersInternal();
    return { success: true, data: filters };
  } catch (error) {
    console.error("getAvailableFilters error:", error);
    return { success: false, message: "Failed to load filters" };
  }
}

export async function getCategories(): Promise<CategoriesResult> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.products,
      })),
    };
  } catch (error) {
    console.error("getCategories error:", error);
    return { success: false, message: "Failed to load categories" };
  }
}

// export async function getProductReviews(
//   productId: string,
//   page: number = 1,
//   limit: number = 10
// ): Promise<{
//   success: boolean;
//   data?: { reviews: ProductReview[]; total: number; pages: number };
//   message?: string;
// }> {
//   try {
//     const skip = (page - 1) * limit;

//     const [reviews, total] = await Promise.all([
//       prisma.review.findMany({
//         where: {
//           productId,
//           isApproved: true,
//         },
//         include: {
//           user: {
//             select: { id: true, name: true, image: true },
//           },
//         },
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limit,
//       }),
//       prisma.review.count({
//         where: {
//           productId,
//           isApproved: true,
//         },
//       }),
//     ]);

//     return {
//       success: true,
//       data: {
//         reviews: reviews.map((r) => ({
//           id: r.id,
//           rating: r.rating,
//           title: r.title,
//           content: r.content,
//           isApproved: r.isApproved,
//           createdAt: r.createdAt,
//           user: {
//             id: r.user.id,
//             name: r.user.name,
//             image: r.user.image,
//           },
//         })),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     };
//   } catch (error) {
//     console.error("getProductReviews error:", error);
//     return { success: false, message: "Failed to load reviews" };
//   }
// }
// src/actions/products.ts (add to existing file)

export async function getProductBySlug(slug: string): Promise<{
  success: boolean;
  data?: Product;
  message?: string;
}> {
  try {
    if (!slug) {
      return { success: false, message: "Product slug is required" };
    }

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        productVariants: { orderBy: { price: "asc" } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    if (product.productVariants.length === 0) {
      return { success: false, message: "Product has no variants available" };
    }

    // Increment view count (fire and forget)
    prisma.product
      .update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(console.error);

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0;

    const totalStock = product.productVariants.reduce(
      (sum, v) => sum + v.stock,
      0
    );
    const lowestPriceVariant = product.productVariants[0];

    const costPrice = product.costPrice ? Number(product.costPrice) : null;
    const variantPrice = Number(lowestPriceVariant.price);
    const hasDiscount = costPrice && costPrice > variantPrice;

    const transformedProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      costPrice,
      weight: product.weight ? Number(product.weight) : null,
      price: variantPrice,
      originalPrice: hasDiscount ? costPrice : undefined,
      discount: hasDiscount
        ? Math.round(((costPrice - variantPrice) / costPrice) * 100)
        : undefined,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      variants: product.productVariants.map((v) => ({
        id: v.id,
        name: v.name,
        size: v.size,
        scent: v.scent,
        concentration: v.concentration,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku,
        lowStockThreshold: v.lowStockThreshold,
      })),
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isApproved: r.isApproved,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          image: r.user.image,
        },
      })),
      inStock: totalStock > 0,
      stockCount: totalStock,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      isBestseller: product.salesCount > 10,
      viewCount: product.viewCount,
      salesCount: product.salesCount,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return { success: true, data: transformedProduct };
  } catch (error) {
    console.error("getProductBySlug error:", error);
    return { success: false, message: "Failed to load product" };
  }
}
// Add to actions/products.ts

import {
  ReviewStats,
  getProductReviewStats,
  getProductReviews,
} from "./review.action";
import { getProductComments, getProductCommentCount } from "./comments.action";

/**
 * Get product with full details including reviews and comments
 */
export async function getProductWithReviews(slug: string): Promise<{
  success: boolean;
  data?: Product & {
    reviews: ProductReview[];
    reviewStats: ReviewStats;
    comments: ProductComment[];
    commentCount: number;
  };
  message?: string;
}> {
  try {
    // Get the product
    const productResult = await getProductBySlug(slug);

    if (!productResult.success || !productResult.data) {
      return {
        success: false,
        message: productResult.message || "Product not found",
      };
    }

    const product = productResult.data;

    // Fetch reviews, review stats, and comments in parallel
    const [reviewsResult, statsResult, commentsResult, commentCountResult] =
      await Promise.all([
        getProductReviews(product.id, { page: 1, limit: 10, sortBy: "newest" }),
        getProductReviewStats(product.id),
        getProductComments(product.id, {
          page: 1,
          limit: 20,
          sortBy: "newest",
        }),
        getProductCommentCount(product.id),
      ]);

    return {
      success: true,
      data: {
        ...product,
        reviews: reviewsResult.success ? reviewsResult.data.reviews : [],
        reviewStats: statsResult.success
          ? statsResult.data
          : {
              averageRating: product.rating || 0,
              totalReviews: product.reviewCount || 0,
              ratingDistribution: [],
              verifiedPurchaseCount: 0,
            },
        comments: commentsResult.success ? commentsResult.data.comments : [],
        commentCount: commentCountResult.success
          ? commentCountResult.count || 0
          : 0,
      },
    };
  } catch (error) {
    console.error("getProductWithReviews error:", error);
    return { success: false, message: "Failed to load product" };
  }
}
