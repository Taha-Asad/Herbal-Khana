"use client";
import { navlinks } from "@/lib/navlinks";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import React from "react";

const DesktopNavbar = () => {
  return (
    <div className="hidden md:flex item-center space-x-12">
      {/* TODO:
<SearchInput/> 
<ModeToggle/>
*/}
      {navlinks.map((item, index) => (
        <Link
          key={index}
          href={item.link}
          className="text-lg duration-300 hover:text-[#DDA200] hover-underline font-[Inter]"
        >
          {item.title}
        </Link>
      ))}

      <Link
        href={"/shoppingCart"}
        className="hover:text-[#DDA200] duration-300"
      >
        <ShoppingBag />
      </Link>

      <button className="btn flex items-center gap-2 bg-[#DDA200] hover:bg-[#B77900] px-5 py-2.5 text-[#FEFCDF] rounded-[10px] shadow-md hover:shadow-xl transition-all duration-300">
        <User />
        Sign up
      </button>
    </div>
  );
};

export default DesktopNavbar;
