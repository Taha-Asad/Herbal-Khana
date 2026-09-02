// app/blog/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/dummyData/blog";
import BlogDetailClient from "./BlogDetailClient";

// =============================================================================
// TYPES
// =============================================================================
interface PageProps {
  params: Promise<{ id: string }>;
}

// =============================================================================
// METADATA GENERATION
// =============================================================================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = blogPosts.find((p) => p.Id === id);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.Id,
  }));
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = id;
  const post = blogPosts.find((p) => p.Id === postId);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.Id !== post.Id)
    .slice(0, 3);

  const currentIndex = blogPosts.findIndex((p) => p.Id === post.Id);
  const previousPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <BlogDetailClient
      post={post}
      relatedPosts={relatedPosts}
      previousPost={previousPost}
      nextPost={nextPost}
    />
  );
}
