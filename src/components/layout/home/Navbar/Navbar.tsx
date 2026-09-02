// components/navbar/Navbar.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "@/../public/sample-logo2.jpeg";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

async function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] bg-[var(--background)] backdrop-blur-sm bg-opacity-60">
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
                <span className="hidden md:block text-text-primary">
                  Herbal Khana
                </span>{" "}
                <br />
                <span className="hidden md:block text-sm text-primary">
                  Pure Organic
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navbar */}
          <DesktopNavbar />

          {/* Mobile Navbar */}
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
