import StatsCard from "@/components/ui/StatsCard";
import { aboutCards } from "@/lib/statsCards";
import React from "react";

const About = () => {
  return (
    <div className="relative my-10 py-10">
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <div className="rounded-full border-1 border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] w-auto py-2 px-4 my-3">
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl text-center py-3">Our Herbal Promises</h2>
          <p className="text-xl text-black/60 leading-relaxed max-w-2xl text-center">
            At Herbal Khana, we believe in the power of nature. Every product is
            a testament to our commitment to purity, quality, and your
            wellbeing.
          </p>{" "}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-10">
          {aboutCards.map((items) => {
            const Icon = items.icon;
            return (
              <StatsCard
                key={items.id}
                id={items.id}
                Icon={Icon}
                title={items.title}
                content={items.content}
                position="left"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default About;
