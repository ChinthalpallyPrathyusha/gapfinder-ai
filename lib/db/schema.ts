/**
 * Drizzle ORM Database Schema for Postgres (Neon / Supabase)
 */

import { pgTable, text, timestamp, integer, boolean, jsonb, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "teacher"] }).notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  docType: text("doc_type", { enum: ["syllabus", "notes", "past_paper"] }).notNull(),
  rawContent: text("raw_content").notNull(),
  pageCount: integer("page_count").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentChunks = pgTable("document_chunks", {
  id: text("id").primaryKey(),
  documentId: text("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  docType: text("doc_type", { enum: ["syllabus", "notes", "past_paper"] }).notNull(),
  chapter: text("chapter").notNull(),
  section: text("section").notNull(),
  page: integer("page").notNull().default(1),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count").default(0).notNull(),
  topicId: text("topic_id"),
  citation: text("citation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  parentId: text("parent_id"), // for tree structure (subtopics)
  orderIndex: integer("order_index").default(0).notNull(),
  examFrequency: integer("exam_frequency").default(1).notNull(), // Past paper appearances
  examImportance: integer("exam_importance").default(5).notNull(), // Weightage 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  topicIds: jsonb("topic_ids").notNull(), // string[]
  status: text("status", { enum: ["draft", "completed"] }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
  topicId: text("topic_id").notNull(),
  questionType: text("question_type", { enum: ["mcq", "short_answer"] }).notNull(),
  prompt: text("prompt").notNull(),
  options: jsonb("options"), // string[] for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  misconception: text("misconception"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium").notNull(),
  sourceChunkId: text("source_chunk_id"),
  sourceCitation: text("source_citation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  score: real("score").notNull(),
  maxScore: real("max_score").notNull(),
  percentage: real("percentage").notNull(),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const quizAnswers = pgTable("quiz_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").references(() => quizAttempts.id, { onDelete: "cascade" }).notNull(),
  questionId: text("question_id").references(() => quizQuestions.id, { onDelete: "cascade" }).notNull(),
  studentAnswer: text("student_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  scoreAwarded: real("score_awarded").notNull(), // 0 to 1
  explanation: text("explanation").notNull(),
  misconception: text("misconception"),
  sourceCitation: text("source_citation").notNull(),
  evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
});

export const gapReports = pgTable("gap_reports", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  attemptId: text("attempt_id").references(() => quizAttempts.id, { onDelete: "cascade" }),
  readinessScore: integer("readiness_score").notNull(),
  topicSummaries: jsonb("topic_summaries").notNull(), // TopicGapSummary[]
  top3Priorities: jsonb("top_3_priorities").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisionPlans = pgTable("revision_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  availableDays: integer("available_days").notNull().default(5),
  hoursPerDay: real("hours_per_day").notNull().default(2),
  examDate: text("exam_date"),
  planData: jsonb("plan_data").notNull(), // GeneratedRevisionPlan
  previousPriorities: jsonb("previous_priorities"), // Record<string, number>
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations"), // string[]
  retrievedChunkIds: jsonb("retrieved_chunk_ids"), // string[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
