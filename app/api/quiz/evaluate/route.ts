import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { evaluateStudentAnswer } from "@/lib/ai/groq";
import { computeGapReport } from "@/lib/algorithms/gap-analysis";
import { generateRevisionPlan } from "@/lib/algorithms/revision-plan";
import { z } from "zod";

const SubmitQuizSchema = z.object({
  quizId: z.string(),
  durationSeconds: z.number().min(0).default(0),
  answers: z.array(
    z.object({
      questionId: z.string(),
      studentAnswer: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SubmitQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quiz submission data" }, { status: 400 });
    }

    const { quizId, answers, durationSeconds } = parsed.data;

    const quiz = await repo.getQuiz(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questionsMap = new Map<string, any>();
    quiz.questions.forEach((q: any) => questionsMap.set(q.id, q));

    let totalScoreAwarded = 0;
    const evaluatedAnswers: any[] = [];
    const questionAttemptResults: any[] = [];

    // Evaluate each submitted answer
    for (const ans of answers) {
      const q = questionsMap.get(ans.questionId);
      if (!q) continue;

      const evalResult = await evaluateStudentAnswer(
        q.prompt,
        q.correctAnswer,
        ans.studentAnswer,
        q.sourceCitation,
        q.questionType === "mcq"
      );

      totalScoreAwarded += evalResult.scoreAwarded;

      const answerRecord = {
        id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        attemptId: "", // filled below
        questionId: q.id,
        studentAnswer: ans.studentAnswer,
        isCorrect: evalResult.isCorrect,
        scoreAwarded: evalResult.scoreAwarded,
        explanation: evalResult.explanation,
        misconception: evalResult.misconception || null,
        sourceCitation: evalResult.sourceCitation || q.sourceCitation,
      };

      evaluatedAnswers.push(answerRecord);

      questionAttemptResults.push({
        questionId: q.id,
        topicId: q.topicId,
        topicTitle: q.topicTitle || "Concept",
        isCorrect: evalResult.isCorrect,
        scoreAwarded: evalResult.scoreAwarded,
        misconception: evalResult.misconception,
      });
    }

    const maxScore = quiz.questions.length;
    const percentage = maxScore > 0 ? (totalScoreAwarded / maxScore) * 100 : 0;
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    evaluatedAnswers.forEach((a) => (a.attemptId = attemptId));

    // Save Attempt
    const attemptRecord = await repo.saveAttempt(
      {
        id: attemptId,
        quizId,
        userId: session.userId,
        score: Number(totalScoreAwarded.toFixed(2)),
        maxScore,
        percentage: Number(percentage.toFixed(1)),
        durationSeconds,
      },
      evaluatedAnswers
    );

    // Re-compute Hero Gap Report with all historical attempts
    const allAnswers = await repo.getAllAnswersByUser(session.userId);
    const topics = await repo.getTopicsByUser(session.userId);

    const fullHistoryAttempts = allAnswers.map((a) => {
      const q = questionsMap.get(a.questionId);
      return {
        questionId: a.questionId,
        topicId: q?.topicId || "topic_1",
        topicTitle: topics.find((t) => t.id === q?.topicId)?.title || "Topic",
        isCorrect: a.isCorrect,
        scoreAwarded: a.scoreAwarded,
        misconception: a.misconception,
      };
    });

    // Also include currently evaluated answers
    const combinedAttempts = [...fullHistoryAttempts, ...questionAttemptResults];
    const gapResult = computeGapReport(topics, combinedAttempts);

    // Save updated Gap Report
    const gapReportRecord = await repo.saveGapReport({
      id: `gap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: session.userId,
      attemptId,
      readinessScore: gapResult.overallReadiness,
      topicSummaries: gapResult.topicSummaries,
      top3Priorities: gapResult.top3Priorities,
    });

    // Automatically update Revision Plan with diffs!
    const existingPlan = await repo.getRevisionPlan(session.userId);
    const oldPriorities = new Map<string, number>();

    if (existingPlan?.planData?.topicSummaries) {
      existingPlan.planData.topicSummaries.forEach((t: any, idx: number) => {
        oldPriorities.set(t.topicId, idx + 1);
      });
    }

    const topicCitations = new Map<string, string>();
    topics.forEach((t) => {
      if (t.citation) topicCitations.set(t.id, t.citation);
    });

    const updatedPlan = generateRevisionPlan(gapResult.topicSummaries, {
      availableDays: existingPlan?.availableDays || 5,
      hoursPerDay: existingPlan?.hoursPerDay || 2,
      previousTopicPriorities: oldPriorities,
      topicCitations,
    });

    await repo.saveRevisionPlan({
      id: existingPlan?.id || `plan_${Date.now()}`,
      userId: session.userId,
      availableDays: existingPlan?.availableDays || 5,
      hoursPerDay: existingPlan?.hoursPerDay || 2,
      planData: updatedPlan,
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: attemptRecord.id,
        score: attemptRecord.score,
        maxScore: attemptRecord.maxScore,
        percentage: attemptRecord.percentage,
      },
      evaluation: evaluatedAnswers,
      gapReport: gapReportRecord,
      planDiffs: updatedPlan.planDiffs,
    });
  } catch (err: any) {
    console.error("Quiz evaluation error:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate answers" }, { status: 500 });
  }
}
