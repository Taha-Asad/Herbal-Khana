import { ExternalLink, Mail, Package, RotateCcw, Truck } from "lucide-react";
import Link from "next/link";
import React from "react";

function QuickLinks() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Helpful Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Shipping & Returns",
              href: "/home/shipping-and-returns",
              icon: Truck,
            },
            {
              name: "Refund Policy",
              href: "/home/refund-policy",
              icon: RotateCcw,
            },
            {
              name: "Order Tracking",
              href: "/home/order-tracking",
              icon: Package,
            },
            { name: "Contact Us", href: "/home/contact", icon: Mail },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e5d9b6] 
                  hover:border-[#DDA200] hover:shadow-md transition-all duration-300 group"
            >
              <div className="p-2 bg-[#DDA200]/10 rounded-lg group-hover:bg-[#DDA200] transition-colors">
                <link.icon className="w-5 h-5 text-[#DDA200] group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-800 group-hover:text-[#DDA200] transition-colors">
                {link.name}
              </span>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuickLinks;
