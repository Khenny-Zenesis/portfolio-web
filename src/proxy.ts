import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Next.js discovers this proxy beside the src/app directory.
// It protects both page routes and mutating admin API routes.
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