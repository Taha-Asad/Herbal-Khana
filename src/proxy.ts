import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/home/cart"];

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  if (!protectedRoutes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico).*)"],
};
