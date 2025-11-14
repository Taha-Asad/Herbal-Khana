"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroImg1 from "../../../../public/homehero.png";
import HeroImg2 from "../../../../public/homehero.png";
import HeroImg3 from "../../../../public/homehero.png";
import useEmblaCarousel from "embla-carousel-react";

const Hero = () => {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const images = [HeroImg1, HeroImg2, HeroImg3];
  useEffect(() => {
    if (!embla) return;
    const interval = setInterval(() => {
      embla.scrollNext();
    }, 2500); // 2000ms = 2 seconds
    return () => clearInterval(interval);
  }, [embla]);

  const scrollPrev = () => embla && embla.scrollPrev();
  const scrollNext = () => embla && embla.scrollNext();
  return (
    <div className="relative w-full h-[90vh] overflow-hidden py-5">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-[8px] brightness-80"
        style={{ backgroundImage: "url('/heroback.jpg')" }}
      />

      {/* Left gradient overlay only, subtle to not affect slider */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 grid grid-cols-2 h-full px-5 py-5 gap-4">
        {/* Left Content */}
        <div className="flex flex-col justify-center items-start px-8 py-10">
          <span className="text-xl text-white">Serve the Power of Herbs</span>
          <h1 className="text-5xl py-2 text-[#DDA200] font-[notoUrdu]">
            ہربل خانہ - Pure Organic
          </h1>
          <p className="py-3 text-xl text-white/80 leading-relaxed max-w-lg">
            Discover the ancient power of nature with our handcrafted herbal
            skincare and haircare products. Made with{" "}
            <span className="text-[#DDA200] font-bold">100% pure organic</span>{" "}
            ingredients, trusted by thousands across Pakistan.
          </p>

          <div className="flex space-x-3 mt-5">
            <div className="border-2 border-transparent py-3 px-10 text-lg font-bold text-[#FEFCDF] bg-[#DDA200] rounded-[13px] group hover:bg-[#FEFCDF] hover:border-[#FEFCDF] duration-300 hover:text-[#DDA200]">
              <Link href="/store" className="flex items-center">
                Shop Now{" "}
                <ArrowRight className="transition-transform duration-300 ease-in-out group-hover:translate-x-4" />
              </Link>
            </div>
            <div className="border-2 hover:border-transparent py-3 px-10 text-lg font-bold hover:text-[#FEFCDF] hover:bg-[#DDA200] rounded-[13px] group bg-[#FEFCDF] border-[#FEFCDF] duration-300 text-[#DDA200]">
              <Link href="/about">Our Story</Link>
            </div>
          </div>
        </div>
        <div className="relative py-5 px-2">
          {/* Right Content - Slider */}
          <div
            className="overflow-hidden w-150 h-full border border-[#FEFCDF] border-8 rounded-2xl"
            ref={emblaRef}
          >
            <div className="flex">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-full h-120 overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Hero Image ${idx + 1}`}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left Arrow */}
          <button
            onClick={scrollPrev}
            className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            <ArrowLeft />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollNext}
            className="absolute right-15 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FEFCDF] to-transparent z-5" />
    </div>
  );
};

export default Hero;
