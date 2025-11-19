import Contact from "@/components/layout/home/Contact";
import Cards from "@/components/layout/home/Contact/Cards";
import ContactHero from "@/components/layout/home/Contact/ContactHero";
import React from "react";

async function page() {
  return (
    <div className="my-15">
      <ContactHero />
      <Cards />
      <Contact />
    </div>
  );
}

export default page;
