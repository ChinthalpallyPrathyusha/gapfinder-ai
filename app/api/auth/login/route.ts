import { NextResponse } from "next/server";
import { repo } from "@/lib/db/repo";
import { verifyPassword, signJWT, getSessionCookieOptions } from "@/lib/auth/jwt";
import { seedDemoAccounts } from "@/lib/seed-service";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Check if demo user needs auto-seeding
    if (email === "demo@gapfinder.ai" || email === "teacher@gapfinder.ai") {
      const existingUser = await repo.findUserByEmail(email);
      if (!existingUser) {
        await seedDemoAccounts();
      }
    }

    let user = await repo.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
    console.error("Login route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
