import ProductCard from "@/components/ui/ProductCard";
import allProducts from "@/lib/products";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function FeaturedProducts() {
  return (
    <div className="relative my-10 py-20 overflow-hidden">
      {/* Background halos */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] py-2 px-4 my-3">
            <span className="text-sm sm:text-base">Best Seller</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold py-3">
            Featured Products
          </h2>

          <p className="text-lg sm:text-xl text-black/60 leading-relaxed max-w-2xl">
            Discover our bestselling herbal products, handcrafted with care for
            your beauty needs.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {allProducts.map((item) => (
            <ProductCard
              key={item.Id}
              Id={item.Id}
              imageSrc={item.image}
              subtitle={item.category}
              title={item.name}
              content={item.description}
              price={item.price}
            />
          ))}
        </div>

        {/* View all button */}
        <div className="flex justify-center my-10">
          <Link
            href="/home/shop/products"
            className="
              flex items-center gap-2
              py-3 px-10 text-lg font-semibold
              bg-[#DDA200] text-[#FEFCDF]
              border-2 border-transparent
              rounded-[13px]
              duration-300
              hover:bg-white hover:text-[#DDA200]
              hover:border-black
              group
            "
          >
            View All Products
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeaturedProducts;
