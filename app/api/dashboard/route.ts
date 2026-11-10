import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const attempts = await repo.getAttemptsByUser(userId);
  const report = await repo.getLatestGapReport(userId);
  const planRecord = await repo.getRevisionPlan(userId);
  const documents = await repo.getDocumentsByUser(userId);
  const topics = await repo.getTopicsByUser(userId);

  // 1. Attempts Progression Timeline for Recharts
  // Ascending chronological order
  const chronologicalAttempts = [...attempts].reverse();
  const timelineData = chronologicalAttempts.map((att, index) => ({
    name: `Attempt ${index + 1}`,
    score: Math.round(att.percentage),
    completedAt: att.completedAt,
  }));

  // 2. Plan Completion %
  let totalTasks = 0;
  let completedTasks = 0;
  if (planRecord?.planData?.dailySchedules) {
    for (const schedule of planRecord.planData.dailySchedules) {
      for (const task of schedule.tasks) {
        totalTasks++;
        if (task.completed) completedTasks++;
      }
    }
  }
  const planCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Weak -> Strong Transitions
  const strongTopicsCount = report?.topicSummaries
    ? report.topicSummaries.filter((t: any) => t.status === "strong").length
    : 0;
  const weakTopicsCount = report?.topicSummaries
    ? report.topicSummaries.filter((t: any) => t.status === "weak").length
    : 0;

  // 4. Guided Onboarding Checklist
  const onboarding = {
    hasMaterials: documents.length > 0,
    hasTopicMap: topics.length > 0,
    hasQuizAttempt: attempts.length > 0,
    hasGapReport: Boolean(report),
    hasRevisionPlan: Boolean(planRecord),
  };

  return NextResponse.json({
    readinessScore: report?.readinessScore ?? (timelineData[timelineData.length - 1]?.score || 0),
    totalAttempts: attempts.length,
    streakDays: attempts.length > 0 ? Math.min(7, attempts.length + 1) : 0,
    strongTopicsCount,
    weakTopicsCount,
    planCompletionPct,
    timelineData,
    attempts: attempts.slice(0, 5),
    onboarding,
    topPriorities: report?.top3Priorities || [],
    recentReport: report,
  });
}
