import BlogsCard from "@/components/ui/BlogsCard";
import { blogPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function Blogs() {
  return (
    <div className="relative my-5 bg-gradient-to-br from-white via-[#FFF8E1] to-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <div className="rounded-full border-1 border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] w-auto py-2 px-4 my-3">
            <span>Blogs</span>
          </div>
          <h2 className="text-4xl text-center py-3">Beauty & Wellness Tips</h2>
          <p className="text-xl text-black/60 leading-relaxed max-w-2xl text-center">
            Explore our blog for expert advice on natural beauty care, herbal
            remedies, and healthy living.
          </p>{" "}
        </div>
        <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {blogPosts.map((items) => {
            return (
              <BlogsCard
                Id={items.Id}
                key={items.Id}
                imageSrc={items.image}
                subtitle={items.category}
                title={items.title}
                content={items.excerpt}
                author={items.author}
                date={items.date}
              />
            );
          })}
        </div>
        <div className="container mx-auto my-8">
          <div className="flex flex-col items-center">
            <div className="border-2 border-transparent py-3 px-10 text-lg font-bold text-[#FEFCDF] bg-[#DDA200] rounded-[13px] group hover:bg-[#ffff] hover:border-[black] duration-300 hover:text-[#DDA200] z-20">
              <Link href="/home/products" className="flex items-center">
                View All Products{" "}
                <ArrowRight className="transition-transform duration-300 ease-in-out group-hover:translate-x-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blogs;
