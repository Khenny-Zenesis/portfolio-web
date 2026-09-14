import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Protect admin pages and admin API routes with the shared NextAuth session.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (req.auth || isLoginPage) return;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, message: "Authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/admin/login", req.url));
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};