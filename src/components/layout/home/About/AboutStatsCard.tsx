import StatsCard from "@/components/ui/StatsCard";
import { Award, Heart, Leaf, Users } from "lucide-react";
import React from "react";
const values = [
  {
    id: 1,
    icon: Leaf,
    title: "Natural Purity",
    content:
      "We source only the finest natural and organic ingredients from trusted suppliers.",
  },
  {
    id: 2,
    icon: Heart,
    title: "Made with Love",
    content:
      "Every product is handcrafted in small batches with care and attention to detail.",
  },
  {
    id: 3,
    icon: Users,
    title: "Customer First",
    content:
      "Your satisfaction and wellbeing are at the heart of everything we do.",
  },
  {
    id: 4,
    icon: Award,
    title: "Quality Assured",
    content:
      "Rigorous testing ensures our products meet the highest standards of excellence.",
  },
];
function AboutStatsCard() {
  return (
    <div className="px-6 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <h2 className="py-3 text-3xl sm:text-4xl text-center">Our Values </h2>

          <p className="max-w-2xl text-base sm:text-xl text-black/60 leading-relaxed text-center px-2">
            These principles guide everything we do at Herbal Khana.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-2 max-w-7xl mx-auto py-5">
        {values.map((item) => {
          const Icon = item.icon;
          return (
            <StatsCard
              key={item.id}
              id={item.id}
              title={item.title}
              content={item.content}
              Icon={Icon}
              position="center"
            />
          );
        })}
      </div>
    </div>
  );
}

export default AboutStatsCard;
