import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUser } from "./lib/auth/verifyUser";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        rememberMe: { type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await verifyUser(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          rememberMe: credentials.rememberMe === "true",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // default: 1 day
  },

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rememberMe = user.rememberMe ?? false;

        // Extend session if "remember me" checked
        if (user.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      session.rememberMe = token.rememberMe as boolean;
      return session;
    },
  },
} satisfies NextAuthConfig;
