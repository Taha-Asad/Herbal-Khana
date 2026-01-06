"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, Shield, Sparkles, Mail } from "lucide-react";

import logo from "../../../../public/sample-logo2.jpeg";
import { verifyEmailToken } from "@/app/action/verify.action";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing verification link.");
      return;
    }

    verifyEmailToken(token).then((res) => {
      if (res.success) {
        toast.success("Email verified successfully!");
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(res.message);
      }
      setLoading(false);
    });
  }, [token, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <Image src={logo} alt="logo" width={50} height={50} />
          <span className="text-2xl font-bold">Herbal Khana</span>
        </Link>

        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-[#DDA200]/10 rounded-2xl flex items-center justify-center text-[#DDA200]">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Mail className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-3xl font-bold mb-4">
            {loading
              ? "Verifying your email…"
              : success
              ? "Email Verified!"
              : "Verification Failed"}
          </h2>

          <p className="text-stone-600">
            {loading
              ? "Please wait while we verify your email."
              : success
              ? "Redirecting you to sign in…"
              : "The verification link is invalid or expired."}
          </p>

          {!loading && !success && (
            <Link
              href="/auth/register"
              className="inline-block mt-6 text-[#DDA200] font-semibold"
            >
              Back to Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Right Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#DDA200] via-[#c89200] to-[#b38600] text-white p-16 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Secure Your
            <br />
            Experience
          </h1>
          <p className="text-xl max-w-md">
            Verify your email to activate your account and enjoy a secure
            shopping experience.
          </p>

          <div className="space-y-4 bg-white/10 p-6 rounded-3xl">
            <div className="flex items-center gap-3">
              <Shield /> Account Protection
            </div>
            <div className="flex items-center gap-3">
              <Sparkles /> Instant Access
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
