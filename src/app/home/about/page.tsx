import AboutContent from "@/components/layout/home/About/AboutContent";
import AboutHero from "@/components/layout/home/About/AboutHero";
import AboutStatsCard from "@/components/layout/home/About/AboutStatsCard";
import React from "react";

function page() {
  return (
    <div className="my-15">
      <AboutHero />
      <AboutContent />
      <AboutStatsCard />
    </div>
  );
}

export default page;
