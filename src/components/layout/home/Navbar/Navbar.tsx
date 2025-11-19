import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../../../../../public/sample-logo2.jpeg";
import DesktopNavbar from "./DesktopNavbar";

async function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-510 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] bg-[#FEFCDF] backdrop-blur-sm bg-opacity-60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-36">
          <div className="flex items-center">
            <Link
              href="/home"
              className="flex items-center text-xl hover:cursor-pointer font-bold text-primary font-mono tracking-wider"
            >
              <Image
                src={logo}
                alt="Herbal Khana - Logo"
                width={120}
                height={120}
                style={{ display: "inline" }}
              />
              <div className="font-[Inter]">
                Herbal Khana <br />
                <span className="text-sm text-[#DDA200]">Pure Organic</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navbar */}
          <DesktopNavbar />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
