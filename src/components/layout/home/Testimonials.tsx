import { testimonials } from "@/lib/Testimonials";
import { getStars } from "@/utils/rating";
import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {
  rating: number;
};

function Testimonials({ rating }: Props) {
  return (
    <div className="relative my-10 py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="rounded-full border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] py-2 px-4 my-3">
            <span>Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-4xl text-center py-3">
            What Our Customers Say
          </h2>

          <p className="text-lg sm:text-xl text-black/60 leading-relaxed max-w-2xl text-center px-2">
            Real stories from real people who transformed their beauty routine
            with Herbal Khana.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {testimonials.map((items) => {
            rating = items.rating;
            const stars = getStars(rating);

            return (
              <div
                key={items.Id}
                className="
              border border-transparent rounded-xl bg-white
              shadow-[0_6px_14px_0_rgba(221,162,0,0.6)]
              hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]
              transform hover:-translate-y-4 duration-300
              w-full
            "
              >
                <div className="w-full overflow-hidden relative rounded-xl">
                  <div className="flex flex-col py-5 px-6">
                    <div className="flex gap-1 py-2">
                      {stars.map((star, i) => {
                        if (star === "full") {
                          return (
                            <Star
                              key={i}
                              className="text-yellow-500 w-5 h-5 fill-yellow-500"
                            />
                          );
                        } else if (star === "half") {
                          return (
                            <div key={i} className="relative w-5 h-5">
                              <Star
                                className="text-yellow-500 fill-yellow-500 absolute inset-0 w-5 h-5"
                                style={{ clipPath: "inset(0 50% 0 0)" }}
                              />
                              <Star
                                className="text-gray-400 absolute inset-0 w-5 h-5"
                                style={{ clipPath: "inset(0 0 0 50%)" }}
                              />
                            </div>
                          );
                        } else {
                          return (
                            <Star key={i} className="text-gray-400 w-5 h-5" />
                          );
                        }
                      })}
                    </div>

                    <p className="text-black/60 italic text-left text-sm sm:text-base">
                      {items.content}
                    </p>

                    <div className="flex gap-4 py-5 items-center">
                      <div className="relative w-14 h-14">
                        <Image
                          src={items.image}
                          alt={items.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-black/80 font-bold text-lg tracking-wider">
                          {items.name}
                        </span>
                        <span className="text-black/50 font-mono text-sm">
                          {items.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] w-auto py-2 px-4">
                      <div className="rounded-full w-3 h-3 bg-[#DDA200]" />
                      <span className="text-[#DDA200]/80 font-semibold text-sm">
                        {items.product}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
