import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { generateRevisionPlan } from "@/lib/algorithms/revision-plan";
import { computeGapReport } from "@/lib/algorithms/gap-analysis";
import { z } from "zod";

const UpdatePlanConfigSchema = z.object({
  availableDays: z.number().min(1).max(30),
  hoursPerDay: z.number().min(0.5).max(12),
  examDate: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan = await repo.getRevisionPlan(session.userId);

  if (!plan) {
    const report = await repo.getLatestGapReport(session.userId);
    const topics = await repo.getTopicsByUser(session.userId);

    const summaries = report?.topicSummaries || topics.map((t) => ({
      topicId: t.id,
      topicTitle: t.title,
      status: "no_data" as const,
      percentageScore: 0,
      totalQuestions: 0,
      correctQuestions: 0,
      examImportance: t.examImportance || 5,
      examFrequency: t.examFrequency || 1,
      priorityScore: 50,
      humanReason: "Awaiting diagnostic quiz completion.",
      commonMisconceptions: [],
    }));

    const topicCitations = new Map<string, string>();
    topics.forEach((t) => {
      if (t.citation) topicCitations.set(t.id, t.citation);
    });

    const generated = generateRevisionPlan(summaries, {
      availableDays: 5,
      hoursPerDay: 2,
      topicCitations,
    });

    plan = await repo.saveRevisionPlan({
      id: `plan_${Date.now()}`,
      userId: session.userId,
      availableDays: 5,
      hoursPerDay: 2,
      planData: generated,
    });
  }

  return NextResponse.json({ plan });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = UpdatePlanConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan settings" }, { status: 400 });
    }

    const { availableDays, hoursPerDay, examDate } = parsed.data;

    const report = await repo.getLatestGapReport(session.userId);
    const topics = await repo.getTopicsByUser(session.userId);

    const summaries = report?.topicSummaries || [];
    const topicCitations = new Map<string, string>();
    topics.forEach((t) => {
      if (t.citation) topicCitations.set(t.id, t.citation);
    });

    const generated = generateRevisionPlan(summaries, {
      availableDays,
      hoursPerDay,
      examDate,
      topicCitations,
    });

    const plan = await repo.saveRevisionPlan({
      id: `plan_${Date.now()}`,
      userId: session.userId,
      availableDays,
      hoursPerDay,
      examDate,
      planData: generated,
    });

    return NextResponse.json({ success: true, plan });
  } catch (err: any) {
    console.error("Plan update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update plan" }, { status: 500 });
  }
}
