// components/account/AccountSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

interface AccountSidebarProps {
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
];

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden sticky top-24">
      {/* User Info */}
      <div className="p-6 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-2 border-white/40">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xl font-bold">
                {getInitials(user.name || "U")}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user.name}</h2>
            <p className="text-sm text-white/80 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-[#DDA200] text-white shadow-md"
                      : "text-stone-600 hover:bg-[#DDA200]/10"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-stone-400 group-hover:text-[#DDA200]"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform ${
                      isActive
                        ? "text-white"
                        : "text-stone-300 group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-stone-200" />

        {/* Help & Logout */}
        <ul className="space-y-1">
          <li>
            <Link
              href="/home/account/support"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-100 transition-all duration-200 group"
            >
              <HelpCircle className="w-5 h-5 text-stone-400 group-hover:text-[#DDA200]" />
              <span className="font-medium">Help & Support</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut({ callbackUrl: "/home" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
