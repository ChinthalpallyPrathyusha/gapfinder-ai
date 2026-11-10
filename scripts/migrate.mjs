import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  console.log("Connecting to Neon Postgres...");
  const sql = neon(dbUrl);

  console.log("Creating database schema and tables if they do not exist...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      page_count INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doc_type TEXT NOT NULL,
      chapter TEXT NOT NULL,
      section TEXT NOT NULL,
      page INTEGER NOT NULL DEFAULT 1,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL DEFAULT 0,
      topic_id TEXT,
      citation TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      parent_id TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      exam_frequency INTEGER NOT NULL DEFAULT 1,
      exam_importance INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      topic_ids JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      question_type TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options JSONB,
      correct_answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      misconception TEXT,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      source_chunk_id TEXT,
      source_citation TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      percentage REAL NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      completed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      student_answer TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      score_awarded REAL NOT NULL,
      explanation TEXT NOT NULL,
      misconception TEXT,
      source_citation TEXT NOT NULL,
      evaluated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gap_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attempt_id TEXT REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      readiness_score INTEGER NOT NULL,
      topic_summaries JSONB NOT NULL,
      top_3_priorities JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS revision_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      available_days INTEGER NOT NULL DEFAULT 5,
      hours_per_day REAL NOT NULL DEFAULT 2,
      exam_date TEXT,
      plan_data JSONB NOT NULL,
      previous_priorities JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      citations JSONB,
      retrieved_chunk_ids JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("All tables successfully verified and migrated to Neon!");
}

runMigrations().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
