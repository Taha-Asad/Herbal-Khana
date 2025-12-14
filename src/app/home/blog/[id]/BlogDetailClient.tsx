// app/blog/[id]/BlogDetailClient.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  BookOpen,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  BookmarkCheck,
  Check,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================
interface BlogPost {
  Id: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  author: string;
  authorImage?: string;
  authorBio?: string;
  date: string;
  readTime?: string;
  views?: number;
  featured?: boolean;
  tags?: string[];
}

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// =============================================================================
// SHARE BUTTONS COMPONENT
// =============================================================================
function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      color: "hover:bg-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      color: "hover:bg-blue-700",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#DDA200]/10 text-[#b38600] 
          rounded-xl hover:bg-[#DDA200]/20 transition-all duration-300"
      >
        <Share2 className="w-4 h-4" />
        <span className="font-medium">Share</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-[#f3e4b7] z-50 min-w-[200px]">
          <div className="flex gap-2 mb-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 bg-gray-100 rounded-lg text-gray-600 ${link.color} hover:text-white transition-all duration-300`}
                title={`Share on ${link.name}`}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 
              rounded-lg text-gray-600 hover:bg-[#DDA200] hover:text-white transition-all duration-300"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span className="text-sm">{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TABLE OF CONTENTS COMPONENT
// =============================================================================
function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[];
}) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block sticky top-24 ml-8 w-64">
      <div className="p-4 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2] rounded-xl border border-[#f3e4b7]">
        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
          <BookOpen className="w-4 h-4 text-[#DDA200]" />
          Table of Contents
        </h4>
        <nav className="space-y-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm transition-all duration-300 ${
                heading.level === 3 ? "pl-4" : ""
              } ${
                activeId === heading.id
                  ? "text-[#DDA200] font-semibold border-l-2 border-[#DDA200] pl-3"
                  : "text-gray-600 hover:text-[#b38600]"
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

// =============================================================================
// AUTHOR CARD COMPONENT
// =============================================================================
function AuthorCard({
  author,
  authorImage,
  authorBio,
}: {
  author: string;
  authorImage?: string;
  authorBio?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2] rounded-2xl border border-[#f3e4b7]">
      <div className="flex-shrink-0">
        <div className="w-20 h-20 rounded-full bg-[#DDA200]/20 flex items-center justify-center overflow-hidden border-4 border-[#DDA200]/30">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={author}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-[#DDA200]" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm text-[#b38600] font-medium">Written by</span>
        <h3 className="text-xl font-bold text-gray-800 mt-1">{author}</h3>
        <p className="text-gray-600 mt-2">
          {authorBio ||
            "A passionate writer sharing insights and knowledge with our community."}
        </p>
        <button className="mt-4 px-4 py-2 bg-[#DDA200] text-white font-medium rounded-lg hover:bg-[#b38600] transition-all duration-300">
          View Profile
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// RELATED POST CARD COMPONENT
// =============================================================================
function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.Id}`}>
      <div className="group bg-white rounded-xl overflow-hidden border border-[#f3e4b7] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#DDA200] text-white text-xs font-semibold rounded-lg">
            {post.category}
          </span>
        </div>
        <div className="p-4">
          <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-[#DDA200] transition-colors">
            {post.title}
          </h4>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// =============================================================================
// POST NAVIGATION COMPONENT
// =============================================================================
function PostNavigation({
  previousPost,
  nextPost,
}: {
  previousPost: BlogPost | null;
  nextPost: BlogPost | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
      {previousPost ? (
        <Link
          href={`/blog/${previousPost.Id}`}
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-[#f3e4b7] hover:border-[#DDA200] hover:shadow-lg transition-all duration-300"
        >
          <ChevronLeft className="w-8 h-8 text-[#DDA200] group-hover:-translate-x-1 transition-transform" />
          <div className="flex-1 text-left">
            <span className="text-sm text-gray-500">Previous Article</span>
            <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-[#DDA200] transition-colors">
              {previousPost.title}
            </h4>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          href={`/blog/${nextPost.Id}`}
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-[#f3e4b7] hover:border-[#DDA200] hover:shadow-lg transition-all duration-300"
        >
          <div className="flex-1 text-right">
            <span className="text-sm text-gray-500">Next Article</span>
            <h4 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-[#DDA200] transition-colors">
              {nextPost.title}
            </h4>
          </div>
          <ChevronRight className="w-8 h-8 text-[#DDA200] group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

// =============================================================================
// COMMENTS SECTION COMPONENT
// =============================================================================
function CommentsSection() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "John Doe",
      date: "2024-01-15",
      content: "Great article! Very informative and well-written.",
      likes: 5,
    },
    {
      id: 2,
      author: "Jane Smith",
      date: "2024-01-14",
      content:
        "Thanks for sharing this. It helped me understand the topic better.",
      likes: 3,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setComments([
      {
        id: Date.now(),
        author: "Guest User",
        date: new Date().toISOString().split("T")[0],
        content: comment,
        likes: 0,
      },
      ...comments,
    ]);
    setComment("");
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-[#DDA200]" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full p-4 border-2 border-[#e5d9b6] rounded-xl bg-white/80 
            focus:border-[#DDA200] focus:ring-4 focus:ring-[#DDA200]/20 
            transition-all duration-300 resize-none"
        />
        <button
          type="submit"
          className="mt-3 px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] 
            text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 
            transition-all duration-300"
        >
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white rounded-xl border border-[#f3e4b7] hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DDA200]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#DDA200]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{c.author}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(c.date)}
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{c.likes}</span>
              </button>
            </div>
            <p className="text-gray-600">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// SCROLL TO TOP BUTTON
// =============================================================================
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] 
        text-white rounded-full shadow-lg z-50 transition-all duration-300
        hover:scale-110 hover:shadow-xl
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }
      `}
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}

// =============================================================================
// MAIN BLOG DETAIL CLIENT COMPONENT
// =============================================================================
export default function BlogDetailClient({
  post,
  relatedPosts,
  previousPost,
  nextPost,
}: BlogDetailClientProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sample content - replace with actual post content
  const sampleContent =
    post.content ||
    `
    <h2 id="introduction">Introduction</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    
    <h2 id="main-points">Main Points</h2>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    
    <blockquote>
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."
    </blockquote>
    
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
    
    <h3 id="key-takeaways">Key Takeaways</h3>
    <ul>
      <li>First important point about this topic</li>
      <li>Second crucial insight to remember</li>
      <li>Third valuable lesson from this article</li>
      <li>Fourth actionable tip for readers</li>
    </ul>
    
    <h2 id="conclusion">Conclusion</h2>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
    
    <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
  `;

  // Extract headings for table of contents
  const headings = [
    { id: "introduction", text: "Introduction", level: 2 },
    { id: "main-points", text: "Main Points", level: 2 },
    { id: "key-takeaways", text: "Key Takeaways", level: 3 },
    { id: "conclusion", text: "Conclusion", level: 2 },
  ];

  const readTime = post.readTime || calculateReadTime(sampleContent);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setHasLiked(!hasLiked);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#FFF8E1] to-white">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>

      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Back Button */}
          <Link
            href="/blog"
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 
              bg-white/20 backdrop-blur-md text-white rounded-xl 
              hover:bg-white/30 transition-all duration-300 z-10"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Blog</span>
          </Link>

          {/* Category Badge */}
          <div className="absolute top-6 right-6 z-10">
            <span className="px-4 py-2 bg-[#DDA200] text-white font-semibold rounded-xl shadow-lg">
              {post.category}
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 md:-mt-40 bg-white rounded-2xl shadow-2xl p-6 md:p-10 mx-4 md:mx-auto max-w-4xl border border-[#f3e4b7]">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#DDA200]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#DDA200]" />
                </div>
                <span className="font-medium text-gray-700">{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#DDA200]" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#DDA200]" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-[#DDA200]" />
                <span>{post.views || 1234} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#f3e4b7]">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    hasLiked
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`}
                  />
                  <span className="font-medium">{likes}</span>
                </button>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isBookmarked
                      ? "bg-[#DDA200] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#DDA200]/10 hover:text-[#DDA200]"
                  }`}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {isBookmarked ? "Saved" : "Save"}
                  </span>
                </button>
              </div>

              <ShareButtons url={currentUrl} title={post.title} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <Tag className="w-4 h-4 text-[#DDA200]" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#DDA200]/10 text-[#b38600] text-sm rounded-full hover:bg-[#DDA200]/20 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN CONTENT SECTION */}
      {/* ================================================================= */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          {/* Main Content */}
          <article className="max-w-3xl w-full">
            {/* Article Content */}
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none
                prose-headings:text-gray-800 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-[#f3e4b7]
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#DDA200] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800
                prose-blockquote:border-l-4 prose-blockquote:border-[#DDA200] 
                prose-blockquote:bg-[#FFF9E6] prose-blockquote:py-4 prose-blockquote:px-6 
                prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-gray-700
                prose-ul:list-none prose-ul:pl-0
                prose-li:relative prose-li:pl-6 prose-li:mb-3
                before:prose-li:content-[''] before:prose-li:absolute before:prose-li:left-0 
                before:prose-li:top-2.5 before:prose-li:w-2 before:prose-li:h-2 
                before:prose-li:bg-[#DDA200] before:prose-li:rounded-full
                prose-img:rounded-xl prose-img:shadow-lg
              "
              dangerouslySetInnerHTML={{ __html: sampleContent }}
            />

            {/* Author Card */}
            <div className="mt-16">
              <AuthorCard
                author={post.author}
                authorImage={post.authorImage}
                authorBio={post.authorBio}
              />
            </div>

            {/* Post Navigation */}
            <PostNavigation previousPost={previousPost} nextPost={nextPost} />

            {/* Comments Section */}
            <CommentsSection />
          </article>

          {/* Table of Contents - Sidebar */}
          <TableOfContents headings={headings} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* RELATED POSTS SECTION */}
      {/* ================================================================= */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {relatedPosts.map((post) => (
                <RelatedPostCard key={post.Id} post={post} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-3 
                  bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white 
                  font-semibold rounded-xl shadow-lg hover:shadow-xl 
                  hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
