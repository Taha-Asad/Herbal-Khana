import Image from "next/image";
import React from "react";
import img from "../../../../../public/heroback.jpg";
function AboutContent() {
  return (
    <div className="overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-white via-[#FFF8E1] to-white relative">
      <div className="opacity-20 absolute inset-0">
        <div className="w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full absolute top-1/4 left-0 blur-3xl" />
        <div className="w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full absolute bottom-1/4 right-0 blur-3xl" />
      </div>
      <div className="grid place-items-center my-10">
        <div className="flex-shrink-0 max-w-5xl h-full border-[5px] border-[#DDA200] rounded-md">
          <Image
            src={img}
            alt="About -image"
            className="w-full h-full object-cover max-h-[70vh] rounded-sm"
            priority
          />
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-left">
          <h2 className="py-3 text-3xl sm:text-4xl">Our Story </h2>

          <div className="space-y-4">
            <p className="max-w-full text-base sm:text-xl text-black/60 leading-relaxed">
              Founded in the heart of Pakistan, Herbal Khana emerged from a
              passion for natural beauty and wellness. Our founder, inspired by
              family recipes and traditional herbalism, set out to create
              products that honor our heritage while meeting modern skincare
              needs.
            </p>
            <p className="max-w-full text-base sm:text-xl text-black/60 leading-relaxed">
              What started as a small kitchen experiment has grown into a
              trusted brand serving thousands of customers across Pakistan. But
              our mission remains unchanged: to provide pure, effective, and
              accessible herbal beauty solutions.
            </p>
            <p className="max-w-full text-base sm:text-xl text-black/60 leading-relaxed">
              Every bottle, jar, and package that leaves our facility carries
              with it our commitment to quality, authenticity, and your natural
              beauty journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutContent;
