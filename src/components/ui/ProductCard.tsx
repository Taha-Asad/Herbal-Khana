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
    <div className="border border-transparent transform hover:-translate-y-4 duration-300 my-5 relative max-w-100 rounded-xl bg-[#ffff] shadow-[0_6px_14px_0_rgba(221,162,0,0.6)]">
      <div className="w-full max-h-70 aspect-square overflow-hidden relative rounded-xl">
        <Image src={imageSrc} alt={title} fill style={{ objectFit: "cover" }} />
      </div>
      <div className="flex flex-col h-90 px-2 py-5">
        <div className="rounded-full border-1 border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] py-2 px-5 my-3 text-center w-fit">
          <span>{subtitle}</span>
        </div>
        <div className="py-3 px-2">
          <h3 className="text-xl py-1">{title}</h3>
          <p className="text-black/70 py-1">{content}</p>
        </div>
        <div className="mt-auto">
          <hr className="py-2 px-3 text-black/30" />
          <div className="flex justify-between mx-2 mb-2">
            <span className="font-semibold text-black/80">{price}</span>

            <Link
              href={`/home/products/${Id}/`}
              className="flex items-center text-lg duration-300 hover:text-[#DDA200] hover:underline group font-[Inter]"
            >
              Show Details{" "}
              <ArrowRight className="transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
