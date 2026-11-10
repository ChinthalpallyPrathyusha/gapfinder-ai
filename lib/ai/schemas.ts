/**
 * AI Schema Definitions for Zod Validation
 * Strict contracts for all AI structured outputs.
 */

import { z } from "zod";

export const TopicTreeSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string(),
      title: z.string().describe("Concise name of the topic"),
      description: z.string().describe("Overview of concepts in this topic"),
      examImportance: z.number().min(1).max(10).describe("Estimated weightage in exam (1-10)"),
      examFrequency: z.number().min(1).max(20).describe("Estimated appearance count in past papers"),
      subtopics: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
        })
      ).optional().default([]),
    })
  ),
});

export const QuizQuestionItemSchema = z.object({
  topicId: z.string().describe("Target topic ID"),
  questionType: z.enum(["mcq", "short_answer"]),
  prompt: z.string().describe("Clear, unambiguous question text"),
  options: z.array(z.string()).optional().describe("4 distinct choices for MCQ, empty for short answer"),
  correctAnswer: z.string().describe("The exact verified correct answer"),
  explanation: z.string().describe("Detailed explanation citing the facts directly from source"),
  misconception: z.string().describe("The most likely conceptual mistake a student makes on this question"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  sourceChunkId: z.string().describe("The exact chunk ID from the retrieved context"),
  sourceCitation: z.string().describe("Readable citation label, e.g. 'Chapter 3, p.14'"),
});

export const QuizGenerationSchema = z.object({
  questions: z.array(QuizQuestionItemSchema),
});

export const AnswerEvaluationSchema = z.object({
  isCorrect: z.boolean().describe("Whether answer is considered essentially correct"),
  scoreAwarded: z.number().min(0).max(1).describe("Score between 0.0 (incorrect) to 1.0 (fully correct)"),
  verdict: z.enum(["correct", "partial", "incorrect"]),
  explanation: z.string().describe("Constructive explanation comparing student answer with source ground truth"),
  misconception: z.string().optional().describe("Specific detected misconception if any"),
  sourceCitation: z.string().describe("Source citation where fact is verified"),
});

export const GapReportReasoningSchema = z.object({
  topicId: z.string(),
  reason: z.string().describe("Direct diagnostic explanation referencing real attempt numbers and concepts"),
  recommendedAction: z.string().describe("Concrete next step for student"),
});

export const ExplainerResponseSchema = z.object({
  answer: z.string().describe("Grounding answer with inline citations [1], [2]"),
  citations: z.array(z.string()).describe("List of citation labels used"),
  coveredInContext: z.boolean().describe("True if answered from material, false if material is insufficient"),
});
