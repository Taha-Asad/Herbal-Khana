// components/navbar/DesktopNavbar.tsx
"use client";

import { navlinks } from "@/lib/navlinks";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import UserProfileDropdown from "./UserProfileDropdown";
import { useCartStore } from "@/store/useCartStore";

const DesktopNavbar = () => {
  const { data: session, status } = useSession();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartCount = getTotalItems();

  return (
    <div className="hidden lg:flex items-center space-x-12">
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
        href="/home/cart"
        className="relative hover:text-[#DDA200] duration-300"
      >
        <ShoppingBag />
        {cartCount > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-[#DDA200] text-white 
                       text-xs font-bold rounded-full min-w-[20px] h-5 
                       flex items-center justify-center px-1"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {status === "loading" ? (
        <div className="w-28 h-10 bg-gray-200 rounded-[10px] animate-pulse" />
      ) : session?.user ? (
        <UserProfileDropdown user={session.user} />
      ) : (
        <Link
          href="/auth/login"
          className="btn flex items-center gap-2 bg-[#DDA200] hover:bg-[#B77900] px-5 py-2.5 text-[#FEFCDF] rounded-[10px] shadow-md hover:shadow-xl transition-all duration-300"
        >
          <User />
          Sign up
        </Link>
      )}
    </div>
  );
};

export default DesktopNavbar;
