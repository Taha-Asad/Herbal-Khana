"use client";
import React, { useEffect } from "react";
import HeroImg1 from "../../../public/homehero.png";
import HeroImg2 from "../../../public/homehero.png";
import HeroImg3 from "../../../public/homehero.png";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
function Slider() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const images = [HeroImg1, HeroImg2, HeroImg3];

  useEffect(() => {
    if (!embla) return;
    const interval = setInterval(() => {
      embla.scrollNext();
    }, 2500);

    return () => clearInterval(interval);
  }, [embla]);

  const scrollPrev = () => embla && embla.scrollPrev();
  const scrollNext = () => embla && embla.scrollNext();
  return (
    <div className="relative py-10 px-2 flex justify-center items-center">
      <div
        className="overflow-hidden w-full h-auto max-h-[70vh] border-[#FEFCDF] border-8 rounded-2xl"
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((img, idx) => (
            <div key={idx} className="flex-shrink-0 w-full h-full">
              <Image
                src={img}
                alt={`Hero Image ${idx + 1}`}
                className="w-full h-full object-cover max-h-[70vh]"
                priority
              />
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        <ArrowLeft />
      </button>

      {/* Right Arrow */}
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        <ArrowRight />
      </button>
    </div>
  );
}

export default Slider;
