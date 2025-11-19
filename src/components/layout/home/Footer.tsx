import Image from "next/image";
import React from "react";
import logo from "../../../../public/sample-logo1.jpeg";
import Link from "next/link";
import { socialLinks } from "@/lib/socialLinks";
import { navlinks, supportlinks } from "@/lib/navlinks";
import NewsletterBanner from "@/components/ui/NewsletterBanner";
function Footer() {
  return (
    <>
      <NewsletterBanner />
      <div className="relative py-10 overflow-hidden w-full bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-8">
            {/* Column 1 - Brand */}
            <div className="flex flex-col space-y-4">
              <Link
                href="/home"
                className="flex items-center gap-3 font-bold text-white"
              >
                <Image
                  src={logo}
                  alt="Herbal Khana - Logo"
                  width={80}
                  height={80}
                />
                <div className="font-[Inter]">
                  Herbal Khana <br />
                  <span className="text-sm text-[#DDA200]">Pure Organic</span>
                </div>
              </Link>

              <p className="text-white/90 text-sm sm:text-base">
                Pure herbs for pure beauty. Natural skincare and haircare
                products made with love.
              </p>

              <div className="flex gap-3">
                {socialLinks.map(({ id, link, name, icon: Icon }) => (
                  <Link
                    key={id}
                    href={link}
                    title={name}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center 
                        hover:bg-[#DDA200] text-white duration-300"
                  >
                    <Icon size={20} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2 – Quick Links */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-[#DDA200] text-xl sm:text-2xl">
                Quick Links
              </h2>
              {navlinks.map((item, i) => (
                <Link
                  key={i}
                  href={item.link}
                  className="text-white/90 hover:text-[#DDA200] duration-200 text-sm sm:text-base"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Column 3 – Support */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-[#DDA200] text-xl sm:text-2xl">Support</h2>
              {supportlinks.map((item, i) => (
                <Link
                  key={i}
                  href={item.link}
                  className="text-white/90 hover:text-[#DDA200] duration-200 text-sm sm:text-base"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Column 4 – Contact */}
            <div className="flex flex-col space-y-2">
              <h2 className="text-[#DDA200] text-xl sm:text-2xl">
                Get In Touch
              </h2>

              <p className="text-white/90 text-sm sm:text-base">
                <strong>Address:</strong> Shop #12, Main Market, Lahore,
                Pakistan
              </p>

              <p className="text-white/90 text-sm sm:text-base">
                <strong>Email:</strong> support@store.com
              </p>

              <p className="text-white/90 text-sm sm:text-base">
                <strong>Open:</strong> Mon - Sat, 10am - 8pm
              </p>

              <p className="text-white/90 text-sm sm:text-base">
                <strong>Phone:</strong> +92 300 1234567
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
