// components/navbar/UserProfileDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  User,
  Settings,
  Package,
  Heart,
  LogOut,
  ChevronDown,
  MapPin,
  HelpCircle,
  CreditCard,
} from "lucide-react";

interface UserProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const menuItems = [
  { icon: User, label: "My Profile", href: "/home/account/profile" },
  { icon: Package, label: "My Orders", href: "/home/account/orders" },
  { icon: Heart, label: "Wishlist", href: "/home/account/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/home/account/addresses" },
  { icon: CreditCard, label: "Payments", href: "/home/account/payments" },
  { icon: Settings, label: "Settings", href: "/home/account/settings" },
  { icon: HelpCircle, label: "Help", href: "/home/account/support" },
];

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/home" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full 
                   bg-[#FFFBEB] border-2 border-[#DDA200]/40 hover:border-[#DDA200]
                   shadow-sm hover:shadow-[0_4px_12px_rgba(221,162,0,0.25)] 
                   transition-all duration-300"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div
          className="w-8 h-8 rounded-full overflow-hidden 
                     bg-gradient-to-br from-[#DDA200] to-[#B77900] 
                     flex items-center justify-center
                     text-white font-semibold text-sm"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            getInitials(user.name || "U")
          )}
        </div>
        <span className="hidden xl:block text-sm font-medium text-[#1A1A1A] max-w-[80px] truncate">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#666] transition-transform duration-300
                     ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 
                     bg-gradient-to-b from-[#FFFDF5] to-[#FFF9E6]
                     rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] 
                     border border-[#DDA200]/20
                     overflow-hidden z-50 
                     animate-[fadeIn_0.2s_ease-out]"
        >
          {/* User Info Header */}
          <div
            className="p-4 bg-gradient-to-r from-[#DDA200] via-[#E5B000] to-[#DDA200] 
                       relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

            <div className="flex items-center gap-3 relative z-10">
              <div
                className="w-14 h-14 rounded-full overflow-hidden 
                           bg-white/20 backdrop-blur-sm
                           flex items-center justify-center
                           text-white font-bold text-lg
                           border-2 border-white/40 shadow-lg"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  getInitials(user.name || "U")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate text-lg">
                  {user.name}
                </p>
                <p className="text-sm text-white/80 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items with custom scrollbar */}
          <div
            className="py-2 max-h-[280px] overflow-y-auto
                       [&::-webkit-scrollbar]:w-2
                       [&::-webkit-scrollbar-track]:bg-[#FFF9E6]
                       [&::-webkit-scrollbar-thumb]:bg-[#DDA200]/40
                       [&::-webkit-scrollbar-thumb]:rounded-full
                       [&::-webkit-scrollbar-thumb]:hover:bg-[#DDA200]/60"
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mx-2 my-0.5
                           rounded-xl hover:bg-[#DDA200]/10 
                           transition-all duration-200 group"
              >
                <div
                  className="p-2 rounded-xl bg-[#DDA200]/10 
                             group-hover:bg-[#DDA200] group-hover:shadow-md
                             transition-all duration-200"
                >
                  <item.icon
                    className="w-4 h-4 text-[#DDA200] 
                               group-hover:text-white transition-colors"
                  />
                </div>
                <span
                  className="text-sm text-[#1A1A1A] font-medium
                             group-hover:text-[#B77900] transition-colors"
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-[#DDA200]/15 bg-[#FFF9E6]/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 
                         rounded-xl text-[#DC2626] 
                         hover:bg-[#FEE2E2] transition-all duration-200 group"
            >
              <div
                className="p-2 rounded-xl bg-[#FEE2E2] 
                           group-hover:bg-[#DC2626] transition-all duration-200"
              >
                <LogOut className="w-4 h-4 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
