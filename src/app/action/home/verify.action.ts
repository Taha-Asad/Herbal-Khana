"use server";

import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function verifyEmailToken(token: string) {
  try {
    if (!token) {
      return { success: false, message: "Missing verification token." };
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token & expiry
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: hashedToken,
        emailVerifyExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Verification link is invalid or has expired.",
      };
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return {
      success: true,
      message: "Email verified successfully.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "Something went wrong during email verification.",
    };
  }
}
