import { ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  Id: number;
  imageSrc: string | StaticImageData;
  subtitle: string;
  title: string;
  content: string;
  price: string;
}
function ProductCard({
  Id,
  imageSrc,
  subtitle,
  title,
  content,
  price,
}: ProductCardProps) {
  return (
    <div
      className="
        w-full
        border border-transparent
        transform hover:-translate-y-4 duration-300
        my-5
        relative
        rounded-xl
        bg-white
        shadow-[0_6px_14px_0_rgba(221,162,0,0.6)]
        hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]
      "
    >
      <div className="w-full aspect-square overflow-hidden relative rounded-t-xl">
        <Image src={imageSrc} alt={title} fill className="object-cover" />
      </div>

      <div className="flex flex-col px-4 py-5">
        <div className="rounded-full border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] py-1.5 px-5 my-3 w-fit mx-auto sm:mx-0 text-center">
          <span className="text-sm sm:text-base">{subtitle}</span>
        </div>

        <div className="py-2">
          <h3 className="text-lg sm:text-xl font-semibold py-1">{title}</h3>
          <p className="text-black/70 text-sm sm:text-base leading-relaxed py-1">
            {content}
          </p>
        </div>

        <div className="mt-auto">
          <hr className="my-3 border-black/20" />

          <div className="flex justify-between items-center mx-1 mb-1">
            <span className="font-semibold text-black/80">{price}</span>

            <Link
              href={`/home/products/${Id}/`}
              className="
                flex items-center gap-1
                text-base sm:text-lg
                duration-300
                hover:text-[#DDA200]
                hover:underline
                group
                font-[Inter]
              "
            >
              Show Details
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
