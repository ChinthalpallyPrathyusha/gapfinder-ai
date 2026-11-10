import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { computeGapReport } from "@/lib/algorithms/gap-analysis";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let report = await repo.getLatestGapReport(session.userId);

  if (!report) {
    // If no report saved, compute one on the fly from current user attempts
    const topics = await repo.getTopicsByUser(session.userId);
    const answers = await repo.getAllAnswersByUser(session.userId);

    const questionAttempts = answers.map((a) => ({
      questionId: a.questionId,
      topicId: a.topicId || "topic_1",
      topicTitle: topics.find((t) => t.id === a.topicId)?.title || "General",
      isCorrect: a.isCorrect,
      scoreAwarded: a.scoreAwarded,
      misconception: a.misconception,
    }));

    const computed = computeGapReport(topics, questionAttempts);

    report = await repo.saveGapReport({
      id: `gap_${Date.now()}`,
      userId: session.userId,
      attemptId: null,
      readinessScore: computed.overallReadiness,
      topicSummaries: computed.topicSummaries,
      top3Priorities: computed.top3Priorities,
    });
  }

  return NextResponse.json({ report });
}
