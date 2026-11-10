import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieOpts = getSessionCookieOptions();
  response.cookies.delete(cookieOpts.name);
  return response;
}
