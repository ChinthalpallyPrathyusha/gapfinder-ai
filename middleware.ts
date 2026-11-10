import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.AUTH_SECRET || "gapfinder-production-jwt-super-secret-key-32-chars-min";
const secretKey = new TextEncoder().encode(JWT_SECRET);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/materials",
  "/topic-map",
  "/quiz",
  "/gap-report",
  "/revision-plan",
  "/assistant",
  "/teacher",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("gapfinder_session")?.value;

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    // Teacher route check
    if (pathname.startsWith("/teacher") && payload.role !== "teacher") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete("gapfinder_session");
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/materials/:path*",
    "/topic-map/:path*",
    "/quiz/:path*",
    "/gap-report/:path*",
    "/revision-plan/:path*",
    "/assistant/:path*",
    "/teacher/:path*",
  ],
};
