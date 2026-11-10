/**
 * Gap Analysis Algorithm (Hero Feature)
 * Deterministic topic classification, readiness calculation, and priority ranking.
 * Grounded in real attempt data with transparent threshold criteria.
 */

export type TopicStatus = "weak" | "medium" | "strong" | "no_data";

export interface QuestionAttemptResult {
  questionId: string;
  topicId: string;
  topicTitle: string;
  subtopicTitle?: string;
  isCorrect: boolean;
  scoreAwarded: number; // 0 to 1
  misconception?: string;
}

export interface TopicGapSummary {
  topicId: string;
  topicTitle: string;
  status: TopicStatus;
  percentageScore: number;
  totalQuestions: number;
  correctQuestions: number;
  examImportance: number;   // 1 to 10
  examFrequency: number;    // occurrence count in past papers
  priorityScore: number;    // higher = more urgent revision need
  humanReason: string;
  commonMisconceptions: string[];
}

export interface GapReportResult {
  overallReadiness: number; // 0 to 100
  totalQuestionsAnswered: number;
  weakTopicsCount: number;
  mediumTopicsCount: number;
  strongTopicsCount: number;
  noDataTopicsCount: number;
  topicSummaries: TopicGapSummary[];
  top3Priorities: TopicGapSummary[];
}

export const THRESHOLDS = {
  MIN_QUESTIONS_FOR_DIAGNOSIS: 2,
  WEAK_UPPER_BOUND: 49.99, // < 50%
  MEDIUM_UPPER_BOUND: 74.99, // 50% - 74.99%
  STRONG_LOWER_BOUND: 75.0,  // >= 75%
};

/**
 * Classifies topic status based on score percentage and question count
 */
export function classifyTopicStatus(percentage: number, questionCount: number): TopicStatus {
  if (questionCount < THRESHOLDS.MIN_QUESTIONS_FOR_DIAGNOSIS) {
    return "no_data";
  }
  if (percentage < 50) {
    return "weak";
  }
  if (percentage < 75) {
    return "medium";
  }
  return "strong";
}

/**
 * Generates an honest, deterministic human reason from actual attempt numbers
 */
export function generateDeterministicReason(
  topicTitle: string,
  total: number,
  correct: number,
  percentage: number,
  status: TopicStatus,
  misconceptions: string[]
): string {
  if (status === "no_data") {
    return `Only ${total} question${total === 1 ? "" : "s"} answered. Need at least ${THRESHOLDS.MIN_QUESTIONS_FOR_DIAGNOSIS} questions to diagnose accurately.`;
  }

  const wrong = total - correct;
  const misconceptionNote = misconceptions.length > 0 
    ? ` Missed key concepts: "${misconceptions.slice(0, 2).join('", "')}".`
    : "";

  if (status === "weak") {
    return `Critical Gap: You got ${wrong} of ${total} questions on ${topicTitle} incorrect (${percentage.toFixed(0)}% score).${misconceptionNote} High priority for immediate revision.`;
  }

  if (status === "medium") {
    return `Moderate Understanding: Scored ${percentage.toFixed(0)}% (${correct} of ${total} correct) on ${topicTitle}.${misconceptionNote} Practice with past paper problems recommended.`;
  }

  return `Mastered Topic: Solid ${percentage.toFixed(0)}% accuracy (${correct} of ${total} correct) across ${topicTitle}. Retain mastery with brief recap before exams.`;
}

/**
 * Computes gap analysis across all topics from quiz results
 */
export function computeGapReport(
  topics: Array<{
    id: string;
    title: string;
    examImportance?: number; // 1 to 10 (default 5)
    examFrequency?: number;  // past paper frequency (default 1)
  }>,
  attempts: QuestionAttemptResult[]
): GapReportResult {
  // Group attempts by topic
  const topicAttempts = new Map<string, QuestionAttemptResult[]>();
  for (const t of topics) {
    topicAttempts.set(t.id, []);
  }

  for (const att of attempts) {
    if (!topicAttempts.has(att.topicId)) {
      topicAttempts.set(att.topicId, []);
    }
    topicAttempts.get(att.topicId)!.push(att);
  }

  const topicSummaries: TopicGapSummary[] = [];
  let totalWeightedScore = 0;
  let totalWeights = 0;

  for (const topic of topics) {
    const list = topicAttempts.get(topic.id) || [];
    const total = list.length;
    const totalScoreAwarded = list.reduce((sum, item) => sum + item.scoreAwarded, 0);
    const correctCount = list.filter((item) => item.isCorrect || item.scoreAwarded >= 0.7).length;

    const percentage = total > 0 ? (totalScoreAwarded / total) * 100 : 0;
    const status = classifyTopicStatus(percentage, total);

    const misconceptions = Array.from(
      new Set(list.map((q) => q.misconception).filter(Boolean) as string[])
    );

    const examImportance = topic.examImportance ?? 5;
    const examFrequency = topic.examFrequency ?? 1;

    // Priority Score formula:
    // priority = (100 - score) * examImportance * (1 + 0.1 * examFrequency)
    // For no_data, treat weakness as 50% default uncertainty
    const weaknessFactor = status === "no_data" ? 50 : 100 - percentage;
    const priorityScore = Number(
      (weaknessFactor * (examImportance / 10) * (1 + 0.05 * examFrequency)).toFixed(1)
    );

    // Human readable reason grounded strictly in real numbers
    const humanReason = generateDeterministicReason(
      topic.title,
      total,
      correctCount,
      percentage,
      status,
      misconceptions
    );

    topicSummaries.push({
      topicId: topic.id,
      topicTitle: topic.title,
      status,
      percentageScore: Math.round(percentage),
      totalQuestions: total,
      correctQuestions: correctCount,
      examImportance,
      examFrequency,
      priorityScore,
      humanReason,
      commonMisconceptions: misconceptions,
    });

    // Weighted readiness calculation (only consider topics with data)
    if (status !== "no_data") {
      totalWeightedScore += percentage * examImportance;
      totalWeights += examImportance;
    }
  }

  // Sort summaries by priority (highest priority first)
  topicSummaries.sort((a, b) => b.priorityScore - a.priorityScore);

  const overallReadiness = totalWeights > 0 ? Math.round(totalWeightedScore / totalWeights) : 0;

  const weakTopicsCount = topicSummaries.filter((t) => t.status === "weak").length;
  const mediumTopicsCount = topicSummaries.filter((t) => t.status === "medium").length;
  const strongTopicsCount = topicSummaries.filter((t) => t.status === "strong").length;
  const noDataTopicsCount = topicSummaries.filter((t) => t.status === "no_data").length;

  const top3Priorities = topicSummaries
    .filter((t) => t.status === "weak" || t.status === "medium")
    .slice(0, 3);

  return {
    overallReadiness,
    totalQuestionsAnswered: attempts.length,
    weakTopicsCount,
    mediumTopicsCount,
    strongTopicsCount,
    noDataTopicsCount,
    topicSummaries,
    top3Priorities,
  };
}
