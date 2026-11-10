# GapFinder AI — The Doctor for Studying 🩺📚

> **"Human First. AI Next."** — Developed for **AI Ready School** (K-12 EdTech).

GapFinder AI acts like a doctor for studying. Students upload their syllabus, textbook notes, and past exam papers. The platform **does not wait for passive questions**. Instead, it tests the student with diagnostic assessments synthesized strictly from their materials, discovers exact conceptual gaps, and prescribes an adaptive, prioritized revision plan that automatically heals their learning gaps as they improve.

The **Hero Output is a Clinical Diagnosis (the Gap Report)**, not generic chatbot chatter.

---

## 🚀 Live Demo & Repository

- **Live Production App:** [https://gapfinder-ai.vercel.app](https://gapfinder-ai.vercel.app) *(or your deployed Vercel domain)*
- **GitHub Repository:** [https://github.com/your-username/gapfinder-ai](https://github.com/your-username/gapfinder-ai)

### 🔑 Demo Credentials (Pre-Seeded)

The login screen includes **1-Click Instant Fill** buttons for demo accounts:

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `demo@gapfinder.ai` | `Demo@12345` | Sample Class 10 Life Sciences & Genetics syllabus, notes, past papers, 3 historical diagnostic attempts (40% → 60% → 80%), active Gap Report, and 5-day Revision Plan. |
| **Demo Teacher** | `teacher@gapfinder.ai` | `Teach@12345` | Class analytics command center, struggle topic rankings, weak-topic heatmap, and roster of 8 enrolled students with readiness scores. |

*Fresh student accounts also include a **"Load Sample Material"** button in the top navigation bar to populate the curriculum immediately.*

---

## 🔄 The 6-Step Core Loop

```
Upload Syllabus & Notes 
  └─► Hierarchical Topic Map 
        └─► Diagnostic Quiz (Strictly Grounded) 
              └─► Evaluator (Detects Misconceptions) 
                    └─► HERO GAP REPORT (Weak / Medium / Strong) 
                          └─► Personalized Revision Plan 
                                └─► Re-test ──► Plan Auto-Updates with Diffs!
```

---

## ✨ Features Checklist (10/10 Implemented)

- [x] **1. Material Upload:** Drag-and-drop file uploader for syllabus, notes, and past papers (PDF, TXT, Markdown) + direct text paste. Structure-aware chunking detects headings (`Chapter 3: ...`, `Section 2: ...`, `p.14`) generating verifiable human-readable citations. Automatic error detection for scanned/image-only PDFs.
- [x] **2. Topic Map:** Deconstructs curriculum into an expandable Table of Contents tree with past-paper exam frequencies and weightages. Includes Recharts comparative bar chart and instant *"Explain this topic"* actions.
- [x] **3. Diagnostic Quiz:** Generates questions **only** from retrieved chunks (never from hallucinated LLM memory). Varied difficulty, balanced topic coverage weighted toward exam frequency, mixed MCQ + short answer. Each question features a source citation label and an interactive *"View Source Passage"* modal.
- [x] **4. Answer Evaluation:** Deterministic grading for MCQs; LLM grading against source passage ground truth for short answers. Returns correctness, awarded score, explanatory rationale, specific detected misconception, and source citation.
- [x] **5. Gap Report (Hero Feature):** Classifies every topic using transparent thresholds:
  - 🔴 **Weak Gap:** `< 50%` accuracy
  - 🟡 **Moderate Gap:** `50% – 74.9%` accuracy
  - 🟢 **Mastered:** `≥ 75%` accuracy
  - ⚪ **Needs Data:** `< 2` questions answered
  Provides clinical diagnostic reasons computed from real attempt numbers without invented statistics, overall weighted readiness score, bar charts, sortable data table, and Top 3 Revision Priorities.
- [x] **6. Adaptive Revision Plan:** Inputs: available study days (1–30) and hours per day (0.5–12). Formulates schedule via formula:
  $$\text{Priority} = \text{Weakness} \times \text{Exam Importance} \times (1 - \text{Recent Improvement})$$
  Day-by-day timeline with task types (`read_section`, `practice_questions`, `recap`), duration minutes, and citations. Interactive checkboxes update adherence in real time. Automatically updates with diff alerts when re-testing (*"Photosynthesis moved down from Priority 1 to Priority 3"*).
- [x] **7. Explain-This-Topic Assistant:** 100% grounded streaming assistant answering solely from uploaded material with inline citations `[1][2]`. Out-of-syllabus queries are respectfully refused (*"This isn't covered in your uploaded material"*). Includes expandable *"Retrieved Grounding Context"* on every answer for transparency.
- [x] **8. Progress Dashboard:** Recharts progression line chart illustrating score trajectory across historical attempts, consecutive study streak, weak-to-strong topic transitions, plan completion %, and guided onboarding checklist.
- [x] **9. Authentication & Persistence:** Email + password auth with `bcryptjs` and signed JWTs stored in `httpOnly` cookies via `jose`. Serverless Postgres via Drizzle ORM ensures zero reliance on local disk or SQLite.
- [x] **10. Teacher View:** Class-level analytics command center displaying topic health averages, class-wide struggle rankings, interactive student-vs-topic heatmap matrix (8 demo students), and sortable student roster.

---

## 🏛️ AI Architecture: Strict Separation of Retrieval & Generation

```
┌─────────────────────────────────────────────────────────────┐
│                 1. RETRIEVAL (Pure Code)                    │
│  - Heading Detection Regexes (Chapters, Sections, Pages)   │
│  - Okapi BM25 Indexing (RSJ IDF, k1=1.5, b=0.75)            │
│  - Reciprocal Rank Fusion (RRF with k=60)                  │
│  - ZERO LLM hallucination / Zero probabilistic guessing     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Top-k Grounded Chunks
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. VERIFICATION BOUNDARY                    │
│  - Prompt Injection of Retrieved Passages Only              │
│  - Strict Directive: "Use ONLY context below; otherwise     │
│    reply 'This is not covered in your material'"            │
│  - Source chunkId validation against retrieved candidates   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Verified Passages
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 3. GENERATION (Groq LLM)                    │
│  - Models: llama-3.3-70b-versatile & llama-3.1-8b-instant   │
│  - Vercel AI SDK (generateObject) + Zod Schemas             │
│  - Question Generation, Ground-Truth Answer Evaluation,     │
│    Misconception Tagging, Grounded Inline Citations         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured Output
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            4. DETERMINISTIC DIAGNOSIS ENGINE                │
│  - Thresholds (<50% / 50-74% / ≥75%) in TypeScript          │
│  - Priority = Weakness × Importance × (1 - Improvement)    │
│  - Day-by-day study minute allocation                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Model (Drizzle Serverless Postgres)

- `users`: User identity, hashed passwords, roles (`student` | `teacher`).
- `documents`: Uploaded materials (`syllabus` | `notes` | `past_paper`), page count.
- `document_chunks`: Semantic chunks with chapter, section, page, token count, citation label.
- `topics`: Curriculum hierarchy, exam importance (1-10), past paper frequency.
- `quizzes`: Generated diagnostic tests with topic filters and status.
- `quiz_questions`: Question prompt, MCQ options / short answer, ground truth, explanation, misconception, citation.
- `quiz_attempts`: Score, percentage, duration, completion timestamp.
- `quiz_answers`: Student answer, correctness, awarded points, misconception, citation.
- `gap_reports`: Overall readiness score, topic status classifications, human diagnostic reasons, top 3 priorities.
- `revision_plans`: Available days, hours/day, day-by-day task schedules with completion status.
- `chat_messages`: Grounded assistant conversations with citation tags.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ or 20+
- pnpm or npm

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gapfinder-ai.git
   cd gapfinder-ai
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your keys:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   GROQ_API_KEY="gsk_..."
   AUTH_SECRET="your-32-char-random-jwt-secret-string"
   ```

4. **Run Unit & Smoke Tests:**
   ```bash
   pnpm test
   ```

5. **Start Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

GapFinder AI includes a zero-dependency automated test suite covering algorithms and end-to-end flows:

```bash
pnpm test
```

### Verified Test Cases:
1. **Structure-Aware Document Chunker:** Heading detection (`Chapter 3: ...`, `Section 3.2: ...`), markdown header parsing, citations generation, overlap preservation.
2. **Okapi BM25 Indexing:** Term frequency saturation ($k_1=1.5$), document length normalization ($b=0.75$), tokenization, stopword removal, ranked retrieval.
3. **Reciprocal Rank Fusion (RRF):** Mathematical rank fusion ($k=60$) combining keyword and vector retrieval ranks.
4. **Gap Analysis Thresholds:** Transparent boundary classification ($<50\%$ Weak, $50\%-74.9\%$ Medium, $\ge 75\%$ Strong, $<2$ questions Needs Data), grounded human diagnostic reasons without invented numbers.
5. **Revision Plan Prioritization:** Study time allocation, task types (`read_section`, `practice_questions`, `recap`), day-by-day scheduling, plan diff detection on priority change.
6. **E2E Smoke Simulation:** Seed accounts → chunk materials → parse topic map → simulate 3 attempts → compute gap report → generate revision plan → teacher analytics.

---

## 🚢 Deployment (Vercel + Serverless Postgres)

1. Push code to GitHub:
   ```bash
   git push origin main
   ```
2. Import repository in [Vercel](https://vercel.com).
3. Set Environment Variables in Project Settings:
   - `DATABASE_URL`: Connection string from Neon or Supabase Serverless Postgres.
   - `GROQ_API_KEY`: Free tier API key from [Groq Console](https://console.groq.com/keys).
   - `AUTH_SECRET`: Random 32+ character string.
4. Deploy! Vercel will automatically build Next.js 14 App Router.

---

## 🔮 Scope & Future Roadmap

- **LMS Integration:** LTI 1.3 / Canvas / Google Classroom synchronization for assignments.
- **Spaced Repetition Reminders:** Automated push/email notifications based on Ebbinghaus forgetting curves.
- **Parent Portal:** High-level diagnostic summary view for parents showing study streak and gap healing progress.
- **Multi-Subject Workspaces:** Seamless switching across Physics, Chemistry, Mathematics, and History curriculums.

---

## 📄 License

MIT © 2026 GapFinder AI — AI Ready School. "Human First. AI Next."
