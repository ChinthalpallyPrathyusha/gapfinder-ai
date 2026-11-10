/**
 * Universal Data Access Layer
 * Seamlessly abstracts between Serverless Postgres (via Drizzle ORM)
 * and in-memory storage for offline / testing / fallback execution.
 */

import { db, memoryStore, isDbConnected } from "./index";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "./schema";

export const repo = {
  // Users
  async findUserByEmail(email: string) {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
        return rows[0] || null;
      } catch (err) {
        console.error("DB error findUserByEmail, checking memory", err);
      }
    }
    for (const u of Array.from(memoryStore.users.values())) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  },

  async findUserById(id: string) {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
        return rows[0] || null;
      } catch (err) {
        console.error("DB error findUserById", err);
      }
    }
    return memoryStore.users.get(id) || null;
  },

  async createUser(user: { id: string; email: string; passwordHash: string; name: string; role: "student" | "teacher" }) {
    const record = { ...user, email: user.email.toLowerCase(), createdAt: new Date() };
    if (isDbConnected() && db) {
      try {
        await db.insert(schema.users).values(record).onConflictDoNothing();
      } catch (err) {
        console.error("DB error createUser", err);
      }
    }
    memoryStore.users.set(user.id, record);
    return record;
  },

  // Documents
  async createDocument(doc: { id: string; userId: string; title: string; docType: "syllabus" | "notes" | "past_paper"; rawContent: string; pageCount: number }) {
    const record = { ...doc, createdAt: new Date() };
    if (isDbConnected() && db) {
      try {
        await db.insert(schema.documents).values(record);
      } catch (err) {
        console.error("DB error createDocument", err);
      }
    }
    memoryStore.documents.set(doc.id, record);
    return record;
  },

  async getDocumentsByUser(userId: string) {
    if (isDbConnected() && db) {
      try {
        return await db.select().from(schema.documents).where(eq(schema.documents.userId, userId)).orderBy(desc(schema.documents.createdAt));
      } catch (err) {
        console.error("DB error getDocumentsByUser", err);
      }
    }
    return Array.from(memoryStore.documents.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async deleteDocument(id: string, userId: string) {
    if (isDbConnected() && db) {
      try {
        await db.delete(schema.documents).where(and(eq(schema.documents.id, id), eq(schema.documents.userId, userId)));
      } catch (err) {
        console.error("DB error deleteDocument", err);
      }
    }
    memoryStore.documents.delete(id);
    for (const [chunkId, chunk] of memoryStore.documentChunks.entries()) {
      if (chunk.documentId === id) memoryStore.documentChunks.delete(chunkId);
    }
    return true;
  },

  // Document Chunks
  async insertChunks(chunks: any[]) {
    if (isDbConnected() && db && chunks.length > 0) {
      try {
        await db.insert(schema.documentChunks).values(chunks);
      } catch (err) {
        console.error("DB error insertChunks", err);
      }
    }
    for (const c of chunks) {
      memoryStore.documentChunks.set(c.id, { ...c, createdAt: new Date() });
    }
  },

  async getChunksByUser(userId: string) {
    if (isDbConnected() && db) {
      try {
        return await db.select().from(schema.documentChunks).where(eq(schema.documentChunks.userId, userId));
      } catch (err) {
        console.error("DB error getChunksByUser", err);
      }
    }
    return Array.from(memoryStore.documentChunks.values()).filter(c => c.userId === userId);
  },

  // Topics
  async saveTopics(topicsList: any[]) {
    if (isDbConnected() && db && topicsList.length > 0) {
      try {
        await db.insert(schema.topics).values(topicsList).onConflictDoNothing();
      } catch (err) {
        console.error("DB error saveTopics", err);
      }
    }
    for (const t of topicsList) {
      memoryStore.topics.set(t.id, { ...t, createdAt: new Date() });
    }
  },

  async getTopicsByUser(userId: string) {
    if (isDbConnected() && db) {
      try {
        return await db.select().from(schema.topics).where(eq(schema.topics.userId, userId)).orderBy(schema.topics.orderIndex);
      } catch (err) {
        console.error("DB error getTopicsByUser", err);
      }
    }
    return Array.from(memoryStore.topics.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  },

  // Quizzes & Questions
  async createQuiz(quiz: { id: string; userId: string; title: string; topicIds: string[]; status: "draft" | "completed" }, questions: any[]) {
    const quizRecord = { ...quiz, createdAt: new Date() };
    if (isDbConnected() && db) {
      try {
        await db.insert(schema.quizzes).values(quizRecord);
        if (questions.length > 0) {
          await db.insert(schema.quizQuestions).values(questions);
        }
      } catch (err) {
        console.error("DB error createQuiz", err);
      }
    }
    memoryStore.quizzes.set(quiz.id, quizRecord);
    for (const q of questions) {
      memoryStore.quizQuestions.set(q.id, { ...q, createdAt: new Date() });
    }
    return quizRecord;
  },

  async getQuiz(quizId: string) {
    let quiz: any = null;
    let questions: any[] = [];
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, quizId)).limit(1);
        quiz = rows[0] || null;
        if (quiz) {
          questions = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, quizId));
        }
      } catch (err) {
        console.error("DB error getQuiz", err);
      }
    }
    if (!quiz) {
      quiz = memoryStore.quizzes.get(quizId) || null;
      if (quiz) {
        questions = Array.from(memoryStore.quizQuestions.values()).filter(q => q.quizId === quizId);
      }
    }
    return quiz ? { ...quiz, questions } : null;
  },

  // Attempts & Answers
  async saveAttempt(attempt: any, answers: any[]) {
    const attemptRecord = { ...attempt, completedAt: new Date() };
    if (isDbConnected() && db) {
      try {
        await db.insert(schema.quizAttempts).values(attemptRecord);
        if (answers.length > 0) {
          await db.insert(schema.quizAnswers).values(answers);
        }
      } catch (err) {
        console.error("DB error saveAttempt", err);
      }
    }
    memoryStore.quizAttempts.set(attempt.id, attemptRecord);
    for (const a of answers) {
      memoryStore.quizAnswers.set(a.id, { ...a, evaluatedAt: new Date() });
    }
    return attemptRecord;
  },

  async getAttemptsByUser(userId: string) {
    if (isDbConnected() && db) {
      try {
        return await db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, userId)).orderBy(desc(schema.quizAttempts.completedAt));
      } catch (err) {
        console.error("DB error getAttemptsByUser", err);
      }
    }
    return Array.from(memoryStore.quizAttempts.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  },

  async getAllAnswersByUser(userId: string) {
    const attempts = await this.getAttemptsByUser(userId);
    const attemptIds = new Set(attempts.map(a => a.id));

    if (isDbConnected() && db) {
      try {
        // Can fetch answers joined
      } catch (err) {
        console.error("DB error getAllAnswersByUser", err);
      }
    }
    return Array.from(memoryStore.quizAnswers.values()).filter(ans => attemptIds.has(ans.attemptId));
  },

  // Gap Reports
  async saveGapReport(report: any) {
    const record = { ...report, createdAt: new Date() };
    if (isDbConnected() && db) {
      try {
        await db.insert(schema.gapReports).values(record);
      } catch (err) {
        console.error("DB error saveGapReport", err);
      }
    }
    memoryStore.gapReports.set(report.id, record);
    return record;
  },

  async getLatestGapReport(userId: string) {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(schema.gapReports).where(eq(schema.gapReports.userId, userId)).orderBy(desc(schema.gapReports.createdAt)).limit(1);
        if (rows[0]) return rows[0];
      } catch (err) {
        console.error("DB error getLatestGapReport", err);
      }
    }
    const reports = Array.from(memoryStore.gapReports.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return reports[0] || null;
  },

  // Revision Plans
  async saveRevisionPlan(plan: any) {
    const existing = await this.getRevisionPlan(plan.userId);
    const record = {
      ...plan,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date()
    };
    if (isDbConnected() && db) {
      try {
        if (existing) {
          await db.update(schema.revisionPlans).set(record).where(eq(schema.revisionPlans.id, existing.id));
        } else {
          await db.insert(schema.revisionPlans).values(record);
        }
      } catch (err) {
        console.error("DB error saveRevisionPlan", err);
      }
    }
    memoryStore.revisionPlans.set(plan.userId, record);
    return record;
  },

  async getRevisionPlan(userId: string) {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(schema.revisionPlans).where(eq(schema.revisionPlans.userId, userId)).orderBy(desc(schema.revisionPlans.updatedAt)).limit(1);
        if (rows[0]) return rows[0];
      } catch (err) {
        console.error("DB error getRevisionPlan", err);
      }
    }
    return memoryStore.revisionPlans.get(userId) || null;
  },

  // Teacher View Data (Class Analytics across students)
  async getClassAnalytics() {
    const students = Array.from(memoryStore.users.values()).filter(u => u.role === "student");
    const classData = [];

    for (const student of students) {
      const attempts = await this.getAttemptsByUser(student.id);
      const report = await this.getLatestGapReport(student.id);
      classData.push({
        id: student.id,
        name: student.name,
        email: student.email,
        attemptsCount: attempts.length,
        readinessScore: report?.readinessScore ?? (attempts[0]?.percentage ? Math.round(attempts[0].percentage) : 0),
        weakTopicsCount: report?.topicSummaries ? report.topicSummaries.filter((t: any) => t.status === "weak").length : 0,
        lastActive: attempts[0]?.completedAt || student.createdAt,
      });
    }

    return classData;
  }
};
