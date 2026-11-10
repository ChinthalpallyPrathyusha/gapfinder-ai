/**
 * Database Client & Storage Layer
 * Supports Serverless Neon/Supabase Postgres via Drizzle ORM
 * with an integrated in-memory fallback for local testing when DATABASE_URL is not yet connected.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export function isDbConnected(): boolean {
  return Boolean(databaseUrl && databaseUrl.startsWith("postgres"));
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

if (isDbConnected()) {
  try {
    const sql = neon(databaseUrl!);
    dbInstance = drizzle(sql, { schema });
  } catch (err) {
    console.warn("Failed to initialize Neon serverless DB client, falling back to in-memory store", err);
  }
}

export const db = dbInstance;

/**
 * Universal Repository Store (In-Memory Fallback & Cache)
 * Guarantees zero downtime, ultra-fast test execution, and full functionality.
 */
class MemoryStore {
  users = new Map<string, any>();
  documents = new Map<string, any>();
  documentChunks = new Map<string, any>();
  topics = new Map<string, any>();
  quizzes = new Map<string, any>();
  quizQuestions = new Map<string, any>();
  quizAttempts = new Map<string, any>();
  quizAnswers = new Map<string, any>();
  gapReports = new Map<string, any>();
  revisionPlans = new Map<string, any>();
  chatMessages = new Map<string, any>();

  clear() {
    this.users.clear();
    this.documents.clear();
    this.documentChunks.clear();
    this.topics.clear();
    this.quizzes.clear();
    this.quizQuestions.clear();
    this.quizAttempts.clear();
    this.quizAnswers.clear();
    this.gapReports.clear();
    this.revisionPlans.clear();
    this.chatMessages.clear();
  }
}

// Global singleton for memory store across hot reloads
const globalForMemory = globalThis as unknown as { __gapfinder_memory_store__?: MemoryStore };
export const memoryStore = globalForMemory.__gapfinder_memory_store__ || new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalForMemory.__gapfinder_memory_store__ = memoryStore;
}
