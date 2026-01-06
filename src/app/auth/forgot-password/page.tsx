"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import logo from "../../../../public/sample-logo2.jpeg";
import toast from "react-hot-toast";
import { forgotPassword } from "@/app/action/user.action";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await forgotPassword(email);
    if (res.success) {
      setIsSent(true);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-[#DDA200] mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>

            <div className="mb-8">
              <div className="w-16 h-16 bg-[#DDA200]/10 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-[#DDA200]" />
              </div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">
                Forgot Password?
              </h2>
              <p className="text-stone-600">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>
            </div>

            {isSent ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Check your inbox
                </h3>
                <p className="text-green-700 mb-4">
                  We&apos;ve sent a password reset link to{" "}
                  <strong>{email}</strong>
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="text-[#DDA200] font-semibold hover:underline"
                >
                  Try another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Branding - Exactly as requested */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#DDA200] via-[#c89200] to-[#b38600] text-white p-16 items-center">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <Image
              src={logo}
              alt="logo"
              width={60}
              height={60}
              className="rounded-xl bg-white p-1"
            />
            <span className="text-3xl font-bold">Herbal Khana</span>
          </Link>
          <h1 className="text-5xl font-bold leading-tight">
            Secure Your
            <br />
            Experience
          </h1>
          <p className="text-xl max-w-md">
            Don&apos;t worry, it happens to the best of us. Let&apos;s get you
            back into your account safely.
          </p>
          <div className="space-y-4 bg-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Shield /> Encrypted Recovery
            </div>
            <div className="flex items-center gap-3">
              <Sparkles /> Fast Reset Process
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 /> Trusted Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
