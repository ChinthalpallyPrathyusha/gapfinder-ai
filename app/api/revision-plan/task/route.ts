import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { z } from "zod";

const ToggleTaskSchema = z.object({
  taskId: z.string(),
  completed: z.boolean(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ToggleTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid task toggle parameters" }, { status: 400 });
    }

    const { taskId, completed } = parsed.data;

    const planRecord = await repo.getRevisionPlan(session.userId);
    if (!planRecord || !planRecord.planData) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const planData = planRecord.planData;
    let found = false;

    if (planData.dailySchedules) {
      for (const schedule of planData.dailySchedules) {
        for (const task of schedule.tasks) {
          if (task.id === taskId) {
            task.completed = completed;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    if (found) {
      await repo.saveRevisionPlan({
        ...planRecord,
        planData,
      });
    }

    return NextResponse.json({ success: true, taskId, completed });
  } catch (err: any) {
    console.error("Task toggle error:", err);
    return NextResponse.json({ error: err.message || "Failed to update task" }, { status: 500 });
  }
}
