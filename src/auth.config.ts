import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  providers: [], // Empty! Providers will be added in auth.ts

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // default: 1 day
  },

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rememberMe = user.rememberMe ?? false;

        if (user.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
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
