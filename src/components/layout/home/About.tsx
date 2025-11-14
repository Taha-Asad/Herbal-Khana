import { Award, Heart, Leaf, Sparkles } from "lucide-react";
import React from "react";
const aboutCards = [
  {
    id: 1,
    icon: Leaf,
    title: "100% Natural",
    content:
      "Pure herbal ingredients sourced from nature, free from harmful  chemicals.",
  },
  {
    id: 2,
    icon: Heart,
    title: "Handmade with Love",
    content:
      "Carefully crafted in small batches to ensure quality and freshness.",
  },
  {
    id: 3,
    icon: Sparkles,
    title: "Proven Results",
    content:
      "Trusted by thousands for visible improvements in skin and hair health.",
  },
  {
    id: 4,
    icon: Award,
    title: "Quality Assured",
    content: "Tested and verified to meet the highest standards of purity.",
  },
];
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
              <div
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-black/5 group duration:800 relative overflow-hidden"
                key={items.id}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#DDA200]/5 to-transparent opacity-0 duration:300 group-hover:opacity-100 transition-opacity" />

                <div className="w-16 h-16 bg-gradient-to-br from-[#DDA200]/20 to-[#DDA200]/10 rounded-2xl flex items-center justify-center mb-6 duration:300 group-hover:from-[#DDA200] group-hover:to-[#c99000] hover:rotate-360 duration-600 transition-all shadow-md group-hover:shadow-xl relative z-10">
                  <Icon className="w-8 h-8 text-[#DDA200] duration:300 group-hover:text-white transition-colors" />
                </div>
                <div className="py-4">
                  <div className="font-bold text-xl mb-2">{items.title}</div>
                  <p className="text-gray-700 text-base">{items.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default About;
