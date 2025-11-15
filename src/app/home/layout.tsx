import Navbar from "@/components/layout/home/Navbar/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Herbal Khana — Pure Organic",
    template: "%s | YourBrand",
  },
  description:
    "Discover premium products that blend innovation, quality, and style — all in one place.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <header>
        <Navbar />
      </header>
      <main>{children}</main>
    </div>
  );
}
