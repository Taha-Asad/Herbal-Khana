"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Leaf,
  Shield,
  ChevronLeft,
} from "lucide-react";
import logo from "../../../../public/sample-logo2.jpeg";
import { loginUser } from "@/app/action/user.action";
import toast from "react-hot-toast";
export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    const res = await loginUser(
      formData.email,
      formData.password,
      formData.rememberMe
    );
    if (!res?.success) {
      setIsLoading(false);
      toast.error(res?.message || "Invalid credentials");
      return;
    }

    toast.success("Logged in successfully");
    console.log("Sign in:", formData);
    setIsLoading(false);
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#DDA200] via-[#c89200] to-[#b38600] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

          {/* Floating elements */}
          <div className="absolute top-32 right-32 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-40 left-32 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float-delayed">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-1/2 right-20 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white py-10">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 mb-12">
            <div className="w-auto h-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Image src={logo} alt="logo" width={100} height={100} />
            </div>
            <span className="text-3xl font-bold">Herbal Khana</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome Back to
            <br />
            Herbal Khana
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            Sign in to access your personalized skincare journey and exclusive
            member benefits.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Track your orders in real-time",
              "Access exclusive member discounts",
              "Save your favorite products",
              "Get personalized recommendations",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-stone-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <Image src={logo} alt="logo" width={40} height={40} />
            </div>
            <span className="text-xl font-bold text-stone-800">
              Herbal Khana
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Back Link */}
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-[#DDA200] transition-colors mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-stone-800 mb-2">
                Sign In
              </h2>
              <p className="text-stone-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-[#DDA200] font-semibold hover:text-[#b38600] transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-stone-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                      ${
                        errors.email
                          ? "border-red-300 focus:border-red-500"
                          : "border-stone-200 focus:border-[#DDA200]"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-stone-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-stone-800
                      placeholder:text-stone-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                      ${
                        errors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-stone-200 focus:border-[#DDA200]"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-stone-300 rounded-md peer-checked:bg-[#DDA200] peer-checked:border-[#DDA200]group-hover:border-[#DDA200] transition-all duration-200" />
                    <CheckCircle2 className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                  </div>
                  <span className="text-sm text-stone-600">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#DDA200] font-semibold hover:text-[#b38600] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#DDA200]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            <p className="mt-6 text-center text-sm text-stone-500">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#DDA200] hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#DDA200] hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
