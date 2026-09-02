"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

import logo from "../../../../public/sample-logo2.jpeg";
import { resetPassword } from "@/app/action/home/user.action";

export default function ResetPasswordClient({
  token,
}: {
  token: string | null;
}) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(token!, password);
      if (res.success) {
        toast.success("Password updated successfully!");
        router.push("/auth/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-[#DDA200]/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-[#DDA200]" />
              </div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">
                Reset Password
              </h2>
              <p className="text-stone-600">
                Please enter your new password below to regain access to your
                account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Update Password <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#DDA200] via-[#c89200] to-[#b38600] text-white p-16 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white rounded-2xl p-2">
              <Image src={logo} alt="logo" width={60} height={60} />
            </div>
            <span className="text-3xl font-bold">Herbal Khana</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight">Almost There.</h1>
          <p className="text-xl max-w-md">
            Resetting your password is the final step to getting back to your
            wellness journey.
          </p>
          <div className="space-y-4 bg-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Shield /> Enhanced Security
            </div>
            <div className="flex items-center gap-3">
              <Sparkles /> 100% Secure Link
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 /> Account Restored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
