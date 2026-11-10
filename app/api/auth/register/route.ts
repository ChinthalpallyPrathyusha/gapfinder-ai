import { NextResponse } from "next/server";
import { repo } from "@/lib/db/repo";
import { hashPassword, signJWT, getSessionCookieOptions } from "@/lib/auth/jwt";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "teacher"]).optional().default("student"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid registration data. Password must be >= 6 characters." }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    const existing = await repo.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const user = await repo.createUser({
      id: userId,
      email,
      name,
      passwordHash,
      role: role as "student" | "teacher",
    });

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "student" | "teacher",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}
