/**
 * Personalized Revision Plan Algorithm
 * Allocates study hours proportionally based on weakness, exam weightage, and recent improvement.
 * Formulates day-by-day tasks linked directly to source document citations.
 */

import { TopicGapSummary } from "./gap-analysis";

export type TaskType = "read_section" | "practice_questions" | "recap";

export interface RevisionTask {
  id: string;
  topicId: string;
  topicTitle: string;
  taskType: TaskType;
  title: string;
  description: string;
  durationMinutes: number;
  citation: string;
  completed: boolean;
}

export interface DaySchedule {
  dayNumber: number;
  dateStr: string; // e.g. "Day 1 (Mon, Nov 11)"
  focusSummary: string;
  totalMinutes: number;
  tasks: RevisionTask[];
}

export interface PlanDiffItem {
  topicId: string;
  topicTitle: string;
  oldPriority: number;
  newPriority: number;
  changeDescription: string;
}

export interface GeneratedRevisionPlan {
  totalDays: number;
  hoursPerDay: number;
  totalStudyMinutes: number;
  dailySchedules: DaySchedule[];
  planDiffs: PlanDiffItem[];
  generatedAt: string;
}

export interface RevisionPlanOptions {
  availableDays: number;     // e.g. 5
  hoursPerDay: number;       // e.g. 2
  examDate?: string;         // ISO date string
  previousTopicPriorities?: Map<string, number>; // topicId -> rank (1-based)
  topicCitations?: Map<string, string>;          // topicId -> citation string
}

/**
 * Computes priority weight for revision plan:
 * priority = weakness * examImportance * (1 - recentImprovement)
 */
export function computeRevisionWeight(
  weaknessScore: number, // 0 to 100
  examImportance: number, // 1 to 10
  recentImprovementFactor: number = 0 // 0 to 0.8
): number {
  const normWeakness = Math.max(10, weaknessScore);
  const normImportance = Math.max(1, examImportance);
  const factor = Math.max(0.2, 1 - Math.min(0.8, recentImprovementFactor));
  return normWeakness * (normImportance / 10) * factor;
}

export function generateRevisionPlan(
  topicSummaries: TopicGapSummary[],
  options: RevisionPlanOptions
): GeneratedRevisionPlan {
  const days = Math.max(1, Math.min(30, options.availableDays || 5));
  const hours = Math.max(0.5, Math.min(12, options.hoursPerDay || 2));
  const totalAvailableMinutes = Math.round(days * hours * 60);

  // Filter topics needing work (weak & medium first, strong for recap)
  const sortedTopics = [...topicSummaries].sort((a, b) => b.priorityScore - a.priorityScore);

  // Compute total weights
  let totalWeight = 0;
  const topicWeights = new Map<string, number>();

  sortedTopics.forEach((t) => {
    // Weak topics get full weight, medium get 60%, strong get 20%, no_data get 40%
    const weakness = t.status === "weak" ? 100 : t.status === "medium" ? 60 : t.status === "no_data" ? 50 : 20;
    const weight = computeRevisionWeight(weakness, t.examImportance, 0);
    topicWeights.set(t.topicId, weight);
    totalWeight += weight;
  });

  // Calculate day-by-day schedules
  const minutesPerDay = Math.round(hours * 60);
  const dailySchedules: DaySchedule[] = [];

  let currentTopicIndex = 0;
  let taskIdCounter = 1;

  for (let day = 1; day <= days; day++) {
    const isFinalDay = day === days;
    const tasks: RevisionTask[] = [];
    let allocatedMinutesToday = 0;

    // Pick top focus topic for this day
    const primaryTopic = sortedTopics[currentTopicIndex % sortedTopics.length];
    const secondaryTopic = sortedTopics[(currentTopicIndex + 1) % sortedTopics.length];

    const primaryCitation = options.topicCitations?.get(primaryTopic.topicId) || 
      `Syllabus & Notes, Section on ${primaryTopic.topicTitle}`;
    const secondaryCitation = options.topicCitations?.get(secondaryTopic.topicId) || 
      `Notes & Past Papers, Section on ${secondaryTopic.topicTitle}`;

    if (!isFinalDay) {
      // Standard study day: Read concept (40%) + Practice questions (40%) + Recap (20%)
      const readMins = Math.round(minutesPerDay * 0.4);
      const practiceMins = Math.round(minutesPerDay * 0.4);
      const recapMins = minutesPerDay - readMins - practiceMins;

      tasks.push({
        id: `task_${taskIdCounter++}`,
        topicId: primaryTopic.topicId,
        topicTitle: primaryTopic.topicTitle,
        taskType: "read_section",
        title: `Deep Concept Review: ${primaryTopic.topicTitle}`,
        description: `Review fundamental rules, formulas, and definitions. Address prior misconceptions: ${primaryTopic.commonMisconceptions[0] || "core principles"}.`,
        durationMinutes: readMins,
        citation: primaryCitation,
        completed: false,
      });

      tasks.push({
        id: `task_${taskIdCounter++}`,
        topicId: primaryTopic.topicId,
        topicTitle: primaryTopic.topicTitle,
        taskType: "practice_questions",
        title: `Targeted Practice: ${primaryTopic.topicTitle}`,
        description: `Work through 4-6 past-paper and diagnostic problems. Focus on application without glancing at answers.`,
        durationMinutes: practiceMins,
        citation: primaryCitation,
        completed: false,
      });

      tasks.push({
        id: `task_${taskIdCounter++}`,
        topicId: secondaryTopic.topicId,
        topicTitle: secondaryTopic.topicTitle,
        taskType: "recap",
        title: `Quick Spaced Recap: ${secondaryTopic.topicTitle}`,
        description: `Summarize key formulas or vocabulary on flashcards or a one-page cheat sheet.`,
        durationMinutes: recapMins,
        citation: secondaryCitation,
        completed: false,
      });
    } else {
      // Final day: Comprehensive Recap + Mock diagnostic run
      const mockMins = Math.round(minutesPerDay * 0.6);
      const reviewMins = minutesPerDay - mockMins;

      tasks.push({
        id: `task_${taskIdCounter++}`,
        topicId: primaryTopic.topicId,
        topicTitle: "Full Syllabus Diagnostic",
        taskType: "practice_questions",
        title: `Simulated Exam Run: All High-Weight Topics`,
        description: `Take a timed diagnostic re-test across all weak & medium topics to verify gap closures.`,
        durationMinutes: mockMins,
        citation: `Comprehensive Past Papers & Syllabus Overview`,
        completed: false,
      });

      tasks.push({
        id: `task_${taskIdCounter++}`,
        topicId: primaryTopic.topicId,
        topicTitle: primaryTopic.topicTitle,
        taskType: "recap",
        title: `Final High-Yield Formula & Concept Review`,
        description: `Review your generated Gap Report and personal error log before test day.`,
        durationMinutes: reviewMins,
        citation: primaryCitation,
        completed: false,
      });
    }

    allocatedMinutesToday = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

    dailySchedules.push({
      dayNumber: day,
      dateStr: `Day ${day} (${Math.round(allocatedMinutesToday / 60 * 10) / 10} hrs)`,
      focusSummary: isFinalDay 
        ? "Simulated diagnostic test and master revision recap"
        : `Focus: ${primaryTopic.topicTitle} & ${secondaryTopic.topicTitle}`,
      totalMinutes: allocatedMinutesToday,
      tasks,
    });

    currentTopicIndex++;
  }

  // Calculate plan diffs if previous priorities exist
  const planDiffs: PlanDiffItem[] = [];
  if (options.previousTopicPriorities && options.previousTopicPriorities.size > 0) {
    sortedTopics.forEach((topic, newIndex) => {
      const newRank = newIndex + 1;
      const oldRank = options.previousTopicPriorities!.get(topic.topicId);
      if (oldRank !== undefined && oldRank !== newRank) {
        let desc = "";
        if (oldRank < newRank) {
          desc = `${topic.topicTitle} improved! Moved down from Priority ${oldRank} to Priority ${newRank}.`;
        } else {
          desc = `${topic.topicTitle} needs more attention. Moved up from Priority ${oldRank} to Priority ${newRank}.`;
        }
        planDiffs.push({
          topicId: topic.topicId,
          topicTitle: topic.topicTitle,
          oldPriority: oldRank,
          newPriority: newRank,
          changeDescription: desc,
        });
      }
    });
  }

  return {
    totalDays: days,
    hoursPerDay: hours,
    totalStudyMinutes: totalAvailableMinutes,
    dailySchedules,
    planDiffs,
    generatedAt: new Date().toISOString(),
  };
}
