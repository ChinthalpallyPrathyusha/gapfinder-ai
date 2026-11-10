import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { seedSampleMaterialForUser } from "@/lib/seed-service";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seedSampleMaterialForUser(session.userId);
    return NextResponse.json({ success: true, message: "Sample curriculum and diagnostic attempts successfully loaded" });
  } catch (err: any) {
    console.error("Failed to seed sample:", err);
    return NextResponse.json({ error: err.message || "Failed to load sample data" }, { status: 500 });
  }
}
