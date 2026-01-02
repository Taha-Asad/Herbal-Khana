import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      // Redirect admin to /admin from non-admin routes
      if (isLoggedIn && role === "ADMIN" && !isAdminRoute) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // Redirect non-admin away from admin routes
      if (isAdminRoute && (!isLoggedIn || role !== "ADMIN")) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "";
      }
      return session;
    },
  },
  providers: [],
};
