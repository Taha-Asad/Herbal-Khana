// lib/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import type {
  UserProfile,
  UpdateProfileInput,
  ChangePasswordInput,
  ActionResponse,
} from "@/types/account";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email/email";

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  image: z.string().url().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<ActionResponse<UserProfile>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: user as UserProfile,
    };
  } catch (error) {
    console.error("Failed to get profile:", error);
    return { success: false, error: "Failed to load profile" };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResponse<UserProfile>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = updateProfileSchema.parse(input);

    // Check if phone is already used by another user
    if (validated.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: validated.phone,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return { success: false, error: "Phone number already in use" };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validated.name,
        phone: validated.phone,
        image: validated.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    revalidatePath("/account/profile");

    return {
      success: true,
      data: updatedUser as UserProfile,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Change password
 */
export async function changePassword(
  input: ChangePasswordInput
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = changePasswordSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        error: "Cannot change password for OAuth accounts",
      };
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      validated.currentPassword,
      user.password
    );
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Failed to change password:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Upload profile image
 */
export async function updateProfileImage(
  imageUrl: string
): Promise<ActionResponse<{ image: string }>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    revalidatePath("/account/profile");

    return {
      success: true,
      data: { image: imageUrl },
      message: "Profile image updated",
    };
  } catch (error) {
    console.error("Failed to update profile image:", error);
    return { success: false, error: "Failed to update profile image" };
  }
}

/**
 * Request email verification
 */
export async function requestEmailVerification(): Promise<
  ActionResponse<void>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, emailVerified: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.emailVerified) {
      return { success: false, error: "Email already verified" };
    }

    // Generate verification token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: token,
        emailVerifyExpires: expires,
      },
    });

    await sendVerificationEmail({
      email: user.email,
      name: user.name ?? "User",
      verifyUrl: token,
    });

    return {
      success: true,
      message: "Verification email sent",
    };
  } catch (error) {
    console.error("Failed to request email verification:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Delete account
 */
export async function deleteAccount(
  password: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (user?.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, error: "Incorrect password" };
      }
    }

    // Soft delete - mark as deleted
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        email: `deleted_${userId}@deleted.com`,
        phone: null,
      },
    });

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
