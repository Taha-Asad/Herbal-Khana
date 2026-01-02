// auth.ts (uses Prisma - NOT for middleware)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing Credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            name: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const match = await bcrypt.compare(
          String(credentials.password),
          String(user.password)
        );

        if (!match) {
          throw new Error("Wrong password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
