import About from "@/components/layout/home/About";
import Blogs from "@/components/layout/home/Blogs";
import Contact from "@/components/layout/home/Contact";
import FeaturedProducts from "@/components/layout/home/FeaturedProducts";
import Hero from "@/components/layout/home/Hero";
import Testimonials from "@/components/layout/home/Testimonials";
import Transformations from "@/components/layout/home/Transformations";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <About />
      <Transformations />
      <FeaturedProducts />
      <Blogs />
      <Testimonials />
      <Contact />
    </div>
  );
}
