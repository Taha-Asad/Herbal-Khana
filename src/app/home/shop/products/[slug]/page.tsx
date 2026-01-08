// src/app/products/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/app/action/product.action";
import ProductDetails from "@/components/layout/home/Product/ProductDetails";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found",
    };
  }

  const product = result.data;

  return {
    title: product.metaTitle || `${product.name} | Your Store`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || "",
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [productResult, relatedResult] = await Promise.all([
    getProductBySlug(slug),
    getRelatedProducts(slug, 4),
  ]);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  const product = productResult.data;
  const relatedProducts = relatedResult.success
    ? relatedResult.data?.products || []
    : [];

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}
