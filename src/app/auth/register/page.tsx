"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Leaf,
  Shield,
  ChevronLeft,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

import logo from "../../../../public/sample-logo2.jpeg";
import { CreateUser } from "@/app/action/home/user.action";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  // Password requirements
  const passwordRequirements = [
    {
      id: "length",
      label: "At least 8 characters",
      test: (p: string) => p.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      test: (p: string) => /[A-Z]/.test(p),
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      test: (p: string) => /[a-z]/.test(p),
    },
    { id: "number", label: "One number", test: (p: string) => /\d/.test(p) },
    {
      id: "special",
      label: "One special character",
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];

  const getPasswordStrength = (password: string): PasswordStrength => {
    const passed = passwordRequirements.filter((req) =>
      req.test(password)
    ).length;
    if (passed === 0) return { score: 0, label: "", color: "" };
    if (passed <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (passed <= 3) return { score: 2, label: "Fair", color: "bg-orange-500" };
    if (passed <= 4) return { score: 3, label: "Good", color: "bg-yellow-500" };
    return { score: 4, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 3) {
      newErrors.password = "Please choose a stronger password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);

    const res = await CreateUser(
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
      formData.confirmPassword
    );
    if (!res?.success) {
      setIsLoading(false);
      toast.error(res?.message || "Error in Registering User");
      return;
    }

    toast.success("Registered User successfully");
    setIsLoading(false);
  };

  return (
    <div className="m-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
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
              href="/"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-[#DDA200] transition-colors mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${
                      step >= 1
                        ? "bg-[#DDA200] text-white"
                        : "bg-stone-200 text-stone-500"
                    }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= 1 ? "text-stone-800" : "text-stone-400"
                  }`}
                >
                  Your Info
                </span>
              </div>
              <div
                className={`flex-1 h-1 rounded ${
                  step > 1 ? "bg-[#DDA200]" : "bg-stone-200"
                }`}
              />
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${
                      step >= 2
                        ? "bg-[#DDA200] text-white"
                        : "bg-stone-200 text-stone-500"
                    }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= 2 ? "text-stone-800" : "text-stone-400"
                  }`}
                >
                  Security
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-stone-800 mb-2">
                {step === 1 ? "Create Account" : "Set Your Password"}
              </h2>
              <p className="text-stone-600">
                {step === 1 ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-[#DDA200] font-semibold hover:text-[#b38600] transition-colors"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  "Choose a strong password to protect your account"
                )}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  {/* Name Fields */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-stone-700 mb-2"
                    >
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        placeholder="John"
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                            ${
                              errors.name
                                ? "border-red-300 focus:border-red-500"
                                : "border-stone-200 focus:border-[#DDA200]"
                            }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

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
                        placeholder="john@example.com"
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                          ${
                            errors.email
                              ? "border-red-300 focus:border-red-500"
                              : "border-stone-200 focus:border-[#DDA200]"
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-stone-700 mb-2"
                    >
                      Phone Number{" "}
                      <span className="text-stone-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+92 300 1234567"
                        className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                          ${
                            errors.phone
                              ? "border-red-300 focus:border-red-500"
                              : "border-stone-200 focus:border-[#DDA200]"
                          }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#DDA200]/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <>
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
                        placeholder="Create a strong password"
                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
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

                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{
                                width: `${(passwordStrength.score / 4) * 100}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              passwordStrength.score <= 1
                                ? "text-red-500"
                                : passwordStrength.score <= 2
                                ? "text-orange-500"
                                : passwordStrength.score <= 3
                                ? "text-yellow-600"
                                : "text-green-500"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        {/* Requirements List */}
                        <div className="grid grid-cols-2 gap-1">
                          {passwordRequirements.map((req) => (
                            <div
                              key={req.id}
                              className={`flex items-center gap-1.5 text-xs ${
                                req.test(formData.password)
                                  ? "text-green-600"
                                  : "text-stone-400"
                              }`}
                            >
                              {req.test(formData.password) ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              {req.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-stone-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm your password"
                        className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-stone-800 placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20
                          ${
                            errors.confirmPassword
                              ? "border-red-300 focus:border-red-500"
                              : "border-stone-200 focus:border-[#DDA200]"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Passwords match
                        </p>
                      )}
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    {/* Terms */}
                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => {
                          console.log("Checkbox changed:", e.target.checked);
                          setFormData({
                            ...formData,
                            agreeToTerms: e.target.checked,
                          });
                        }}
                        className="hidden"
                      />
                      <div
                        className={`relative flex items-center justify-center w-5 h-5 border-2 rounded-md transition-all duration-200 mt-0.5 flex-shrink-0
      ${
        formData.agreeToTerms
          ? "bg-[#DDA200] border-[#DDA200]"
          : errors.agreeToTerms
          ? "border-red-300"
          : "border-stone-300 group-hover:border-[#DDA200]"
      }`}
                        role="checkbox"
                        aria-checked={formData.agreeToTerms}
                        tabIndex={0}
                      >
                        <Check
                          className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${
                            formData.agreeToTerms ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </div>
                      <span className="text-sm text-stone-600 leading-relaxed select-none">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-[#DDA200] hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering checkbox when clicking links
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-[#DDA200] hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering checkbox when clicking links
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {/* Newsletter */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.subscribeNewsletter}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subscribeNewsletter: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-stone-300 rounded-md peer-checked:bg-[#DDA200] peer-checked:border-[#DDA200] group-hover:border-[#DDA200] transition-all duration-200" />
                        <Check className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                      </div>
                      <span className="text-sm text-stone-600">
                        Subscribe to our newsletter for exclusive offers and
                        skincare tips
                      </span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 border-2 border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#DDA200]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#DDA200] via-[#c89200] to-[#b38600]">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          {/* Floating elements */}
          <div className="absolute top-32 left-32 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div className="absolute bottom-40 right-32 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float-delayed">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute top-1/2 left-20 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-float">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-3 mb-12">
            <div className="w-auto h-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Image src={logo} alt="logo" width={100} height={100} />
            </div>
            <span className="text-3xl font-bold">Herbal Khana</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Start Your
            <br />
            Glow Journey
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            Join thousands of customers who trust NaturalGlow for their natural
            beauty needs.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { value: "50K+", label: "Happy Customers" },
              { value: "100+", label: "Natural Products" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              "Exclusive member discounts up to 30%",
              "Early access to new products",
              "Free shipping on all orders",
              "Personalized skincare recommendations",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
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
