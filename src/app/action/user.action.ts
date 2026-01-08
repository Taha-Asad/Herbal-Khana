"use server";

import { auth, signIn, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import ejs from "ejs";
import path from "path";
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.log("Error in Get All Users ");
    return {
      success: false,
      message: `Internal Server Error. ${error}`,
    };
  }
}

export async function CreateUser(
  name: string | undefined,
  email: string,
  phone: string | undefined,
  password: string | undefined,
  confirmPassword: string | undefined,
  image?: string
) {
  try {
    /* ------------------ VALIDATIONS ------------------ */

    if (!email) {
      return { success: false, message: "Email is required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Invalid email address." };
    }

    if (phone) {
      const pakistanPhoneRegex = /^\+923\d{9}$/;
      if (!pakistanPhoneRegex.test(phone)) {
        return {
          success: false,
          message: "Enter a valid Pakistan number like +923001234567.",
        };
      }
    }

    if (!password || !confirmPassword) {
      return {
        success: false,
        message: "Password and confirm password are required.",
      };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    /* ------------------ CHECK EXISTING USER ------------------ */

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists.",
      };
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return {
          success: false,
          message: "User with this phone number already exists.",
        };
      }
    }

    /* ------------------ PASSWORD HASH ------------------ */

    const hashedPassword = await hash(password, 10);

    /* ------------------ EMAIL VERIFICATION TOKEN ------------------ */

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    /* ------------------ CREATE USER ------------------ */

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        phone: phone || null,
        password: hashedPassword,
        image: image || null,
        role: "USER",
        emailVerified: false,
        emailVerifyToken: hashedToken,
        emailVerifyExpires: tokenExpiry,
        isActive: true,
      },
    });

    /* ------------------ SEND EMAIL ------------------ */

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${rawToken}`;

    await sendVerificationEmail({
      email: user.email,
      name: user.name ?? "User",
      verifyUrl,
    });

    return {
      success: true,
      message: "Account created. Please verify your email.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: "Something went wrong while creating the account.",
    };
  }
}

export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean
) {
  try {
    await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });

    return { success: true };
  } catch (error: Error | unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid credentials";
    return {
      success: false,
      message,
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admins only" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function UpdateUserAdmin(userId: string, formData: FormData) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admins only" };
    }
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as "ADMIN" | "USER";
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        image,
        email,
        phone,
        role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update user by admin error:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function logoutUser() {
  try {
    signOut();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Failed to logout" };
  }
}

export async function getUserById(userId: string) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admins only" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Get User by Id error:", error);
    return { success: false, error: "Failed to get user by Id" };
  }
}

export async function getAdmin() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Admins only" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

// 1. Action to request a reset link
export async function forgotPassword(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return {
        success: false,
        message: "If that email exists, a link has been sent.",
      };

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // Send Email (You can create a new EJS template for this)
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "reset-password.ejs"
    );
    const htmlContent = await ejs.renderFile(templatePath, {
      name: user.name || "User",
      resetLink: resetLink,
    });

    await sendMail(email, "Reset your Herbal Khana Password", htmlContent);

    return { success: true, message: "Check your email for a reset link." };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong." };
  }
}

// 2. Action to verify token and set new password
export async function resetPassword(token: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { success: false, message: "Token is invalid or has expired." };
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to reset password." };
  }
}
