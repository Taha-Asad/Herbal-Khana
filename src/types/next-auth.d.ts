import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];

    rememberMe?: boolean;
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    rememberMe?: boolean;
  }
}
