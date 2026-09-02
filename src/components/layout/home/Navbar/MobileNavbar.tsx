"use client";

import React, { useState, useEffect } from "react";
import { navlinks } from "@/lib/dummyData/navlinks";
import {
  ShoppingBag,
  User,
  X,
  ChevronRight,
  Package,
  Heart,
  Settings,
  LogOut,
  MapPin,
  Menu,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import logo from "@/../public/sample-logo2.jpeg";
import { useCartStore } from "@/store/useCartStore";

const accountLinks = [
  { icon: User, label: "My Profile", href: "/home/account/profile" },
  { icon: Package, label: "My Orders", href: "/home/account/orders" },
  { icon: Heart, label: "Wishlist", href: "/home/account/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/home/account/addresses" },
  { icon: Settings, label: "Settings", href: "/home/account/settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/home/account/support" },
];

const MobileNavbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cartCount = useCartStore((state) => state.totalItems);

  // Menu open state
  const [rawOpen, setRawOpen] = useState(false);

  // Derive isOpen from rawOpen and pathname
  const isOpen = rawOpen && pathname; // if pathname changes, isOpen is effectively "false"

  const toggleOpen = () => setRawOpen((prev) => !prev);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setRawOpen(false);
    await signOut({ callbackUrl: "/home" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="lg:hidden flex items-center gap-3">
      {/* Cart */}
      <Link
        href="/home/cart"
        className="relative p-2 hover:text-[#DDA200] hover:bg-[#DDA200]/10 rounded-full transition-all duration-300"
      >
        <ShoppingBag className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#DDA200] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>

      {/* Menu Button */}
      <button
        onClick={() => toggleOpen()}
        className="p-2 hover:text-[#DDA200] hover:bg-[#DDA200]/10 rounded-lg transition-all duration-300"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
                   ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setRawOpen(false)}
      />

      {/* Sidebar - FULL HEIGHT */}
      <div
        className={`fixed top-0 right-0 w-[300px] max-w-[85vw] bg-gradient-to-b from-[#FFF8E7] to-[#FEFCDF] z-50 shadow-2xl transform transition-transform duration-300 ease-out h-screen
                   ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ height: "100vh", minHeight: "100vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#DDA200] to-[#C49100] shadow-md">
          <Link
            href="/home"
            className="flex items-center gap-3"
            onClick={() => setRawOpen(false)}
          >
            <Image
              src={logo}
              alt="Herbal Khana"
              width={45}
              height={45}
              className="rounded-lg shadow-md"
            />
            <div>
              <p className="font-bold text-white text-sm font-[Inter]">
                Herbal Khana
              </p>
              <p className="text-xs text-white/80">Pure Organic</p>
            </div>
          </Link>
          <button
            onClick={() => setRawOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - Scrollable with custom scrollbar */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            height: "calc(100vh - 77px)",
            scrollbarWidth: "thin",
            scrollbarColor: "#DDA200 #FFF8E7",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: #fff8e7;
            }
            div::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #dda200, #c49100);
              border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #c49100, #a67c00);
            }
          `}</style>

          {/* User Section (if logged in) */}
          {session?.user && (
            <div className="p-4 bg-[#DDA200]/10 border-b border-[#DDA200]/20">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#DDA200] flex items-center justify-center text-white font-bold text-lg ring-3 ring-[#DDA200]/30 shadow-lg">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    getInitials(session.user.name || "U")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate font-[Inter]">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 flex-1">
            <p className="text-xs font-bold text-[#DDA200] uppercase tracking-wider mb-3 px-3">
              Menu
            </p>
            <nav className="space-y-2">
              {navlinks.map((item, index) => {
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={index}
                    href={item.link}
                    onClick={() => setRawOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 font-[Inter]
                               ${
                                 isActive
                                   ? "bg-gradient-to-r from-[#DDA200] to-[#C49100] text-white shadow-lg"
                                   : "text-gray-700 hover:bg-[#DDA200]/10 hover:text-[#DDA200]"
                               }`}
                  >
                    <span className="font-medium">{item.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-[#DDA200]"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Account Links (if logged in) */}
            {session?.user && (
              <>
                <p className="text-xs font-bold text-[#DDA200] uppercase tracking-wider mt-6 mb-3 px-3">
                  My Account
                </p>
                <nav className="space-y-1">
                  {accountLinks.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setRawOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-[#DDA200]/10 hover:text-[#DDA200] transition-all duration-200 group"
                    >
                      <div className="p-2 rounded-xl bg-[#DDA200]/10 group-hover:bg-[#DDA200] transition-all">
                        <item.icon className="w-4 h-4 text-[#DDA200] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium font-[Inter]">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>

          {/* Bottom Actions - Always at bottom */}
          <div className="p-4 border-t border-[#DDA200]/20 bg-[#FFF8E7]/80 mt-auto">
            {session?.user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-3.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg font-[Inter]"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setRawOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#DDA200] to-[#C49100] hover:from-[#C49100] hover:to-[#A67C00] text-white py-3.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 font-[Inter]"
              >
                <User className="w-5 h-5" />
                <span>Sign Up / Login</span>
              </Link>
            )}
            <p className="text-center text-xs text-gray-500 mt-3">
              🌿 100% Organic Products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
