import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null; // ✅ Return null, don't throw
          }

          const email = String(credentials.email).toLowerCase().trim();
          const password = String(credentials.password);

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("User not found:", email);
            return null; // ✅ Return null, don't throw
          }

          if (!user.password) {
            console.log("User has no password (OAuth account?):", email);
            return null; // ✅ Return null, don't throw
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            console.log("Invalid password for:", email);
            return null; // ✅ Return null, don't throw
          }

          // Check if user is active
          if (!user.isActive || user.isBanned) {
            console.log("User is inactive or banned:", email);
            return null; // ✅ Return null, don't throw
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          console.log("Login successful for:", email);

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null; // ✅ Return null on any error
        }
      },
    }),
  ],
});
