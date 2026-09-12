import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated the
// `middleware` file convention in favor of `proxy` (same behavior, renamed
// file/export). See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
//
// security.md: "All routes matching /admin/* are protected by NextAuth
// middleware. An unauthenticated request to any admin route redirects to
// /admin/login — no exceptions." The matcher below also covers /api/admin/*:
// the mutating CRUD/upload routes live there, not under /admin/*, and would
// otherwise be unprotected despite the rule's intent. /admin/login itself is
// excluded to avoid a redirect loop, and it's never linked from any public
// page per security.md.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  if (req.auth || isLoginPage) return;

  // An API route is called via fetch(), not navigated to — redirecting it
  // would hand the caller a login-page HTML response instead of a status it
  // can branch on. Page routes still redirect to the (unlinked) login page.
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
