/**
 * Unit Test Suite for GapFinder AI
 * Tests core algorithms: Chunking, BM25 Retrieval, Gap Classification,
 * Revision Plan Prioritization, and End-to-End Smoke Flows.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { tokenize, BM25Index } from "../lib/retrieval/bm25.ts";
import { chunkDocument, extractStructureFromText } from "../lib/retrieval/chunking.ts";
import { reciprocalRankFusion } from "../lib/retrieval/hybrid.ts";
import {
  classifyTopicStatus,
  computeGapReport,
  generateDeterministicReason,
  THRESHOLDS,
} from "../lib/algorithms/gap-analysis.ts";
import {
  computeRevisionWeight,
  generateRevisionPlan,
} from "../lib/algorithms/revision-plan.ts";

test("1. Structure-Aware Document Chunker", async (t) => {
  await t.test("detects chapter and section headings", () => {
    const raw = `
Chapter 3: Photosynthesis in Plants
Section 3.2: Light-Dependent Reactions
Chlorophyll traps photons in the thylakoid membrane to split water into oxygen and hydrogen ions.
ATP and NADPH are synthesized for subsequent use in the stroma.
`;
    const chunks = chunkDocument("doc_test_1", "Biology_Notes.pdf", "notes", raw, {
      maxChunkSize: 50,
      overlap: 10,
    });

    assert.ok(chunks.length > 0, "Should generate at least one chunk");
    const first = chunks[0];
    assert.match(first.metadata.chapter, /Chapter 3/);
    assert.match(first.metadata.section, /Section 3\.2/);
    assert.match(first.metadata.citation, /Biology_Notes\.pdf, Chapter 3.*Section 3\.2/);
    assert.ok(first.content.includes("Chlorophyll traps photons"));
  });

  await t.test("extractStructureFromText fallback logic", () => {
    const res = extractStructureFromText("# Introduction to Genetics\n## Monohybrid Cross");
    assert.equal(res.chapter, "Introduction to Genetics");
    assert.equal(res.section, "Monohybrid Cross");
  });
});

test("2. BM25 Retrieval Index & Tokenization", async (t) => {
  await t.test("tokenize filters stop words and normalizes punctuation", () => {
    const tokens = tokenize("The quick brown fox is running over the lazy dogs!");
    assert.ok(!tokens.includes("the"));
    assert.ok(!tokens.includes("is"));
    assert.ok(tokens.includes("quick"));
    assert.ok(tokens.includes("brown"));
  });

  await t.test("BM25 ranks matching documents by term relevance", () => {
    const bm25 = new BM25Index(1.5, 0.75);
    const docs = [
      { id: "doc_1", text: "Photosynthesis takes place in chloroplasts using light and chlorophyll." },
      { id: "doc_2", text: "The human heart pumps oxygenated blood through the systemic circulation." },
      { id: "doc_3", text: "Respiration occurs in mitochondria yielding net ATP for cellular work." },
    ];
    bm25.buildIndex(docs);

    const results = bm25.search("chloroplasts photosynthesis light", 2);
    assert.ok(results.length > 0);
    assert.equal(results[0].id, "doc_1", "doc_1 must be ranked highest for photosynthesis query");
    assert.ok(results[0].score > 0);
  });
});

test("3. Reciprocal Rank Fusion (RRF)", async (t) => {
  await t.test("combines rank orders with standard constant k=60", () => {
    const bm25Ranks = ["doc_A", "doc_B", "doc_C"];
    const vectorRanks = ["doc_B", "doc_A", "doc_D"];

    const rrfScores = reciprocalRankFusion(bm25Ranks, vectorRanks, 60);

    // doc_B is rank 2 in BM25 (1/62) and rank 1 in Vector (1/61)
    // doc_A is rank 1 in BM25 (1/61) and rank 2 in Vector (1/62)
    // Both doc_A and doc_B have higher combined score than doc_C
    assert.ok(rrfScores.get("doc_A") > rrfScores.get("doc_C"));
    assert.ok(rrfScores.get("doc_B") > rrfScores.get("doc_D"));
  });
});

test("4. Gap Analysis Deterministic Thresholds", async (t) => {
  await t.test("classifies correctly based on transparent criteria", () => {
    // Under minimum questions -> no_data
    assert.equal(classifyTopicStatus(100, 1), "no_data");
    assert.equal(classifyTopicStatus(0, 0), "no_data");

    // Weak: < 50%
    assert.equal(classifyTopicStatus(0, 3), "weak");
    assert.equal(classifyTopicStatus(49.9, 4), "weak");

    // Medium: 50% to 74.9%
    assert.equal(classifyTopicStatus(50, 4), "medium");
    assert.equal(classifyTopicStatus(74.9, 5), "medium");

    // Strong: >= 75%
    assert.equal(classifyTopicStatus(75, 4), "strong");
    assert.equal(classifyTopicStatus(100, 5), "strong");
  });

  await t.test("generates human reason without inventing numbers", () => {
    const reason = generateDeterministicReason("Photosynthesis", 4, 1, 25, "weak", ["Thylakoid confusion"]);
    assert.ok(reason.includes("3 of 4 questions on Photosynthesis incorrect"));
    assert.ok(reason.includes("25% score"));
    assert.ok(reason.includes("Thylakoid confusion"));
  });

  await t.test("computeGapReport aggregates readiness and top 3 priorities", () => {
    const topics = [
      { id: "t1", title: "Photosynthesis", examImportance: 9, examFrequency: 8 },
      { id: "t2", title: "Genetics", examImportance: 8, examFrequency: 6 },
      { id: "t3", title: "Circulation", examImportance: 6, examFrequency: 4 },
    ];

    const attempts = [
      // t1: 1 of 4 correct (25% -> weak)
      { questionId: "q1", topicId: "t1", topicTitle: "Photosynthesis", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q2", topicId: "t1", topicTitle: "Photosynthesis", isCorrect: false, scoreAwarded: 0 },
      { questionId: "q3", topicId: "t1", topicTitle: "Photosynthesis", isCorrect: false, scoreAwarded: 0 },
      { questionId: "q4", topicId: "t1", topicTitle: "Photosynthesis", isCorrect: false, scoreAwarded: 0 },
      // t2: 4 of 4 correct (100% -> strong)
      { questionId: "q5", topicId: "t2", topicTitle: "Genetics", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q6", topicId: "t2", topicTitle: "Genetics", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q7", topicId: "t2", topicTitle: "Genetics", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q8", topicId: "t2", topicTitle: "Genetics", isCorrect: true, scoreAwarded: 1 },
      // t3: 2 of 4 correct (50% -> medium)
      { questionId: "q9", topicId: "t3", topicTitle: "Circulation", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q10", topicId: "t3", topicTitle: "Circulation", isCorrect: true, scoreAwarded: 1 },
      { questionId: "q11", topicId: "t3", topicTitle: "Circulation", isCorrect: false, scoreAwarded: 0 },
      { questionId: "q12", topicId: "t3", topicTitle: "Circulation", isCorrect: false, scoreAwarded: 0 },
    ];

    const report = computeGapReport(topics, attempts);

    assert.equal(report.weakTopicsCount, 1);
    assert.equal(report.mediumTopicsCount, 1);
    assert.equal(report.strongTopicsCount, 1);
    assert.equal(report.top3Priorities[0].topicId, "t1", "Weak topic with high importance must be Priority #1");
    assert.ok(report.overallReadiness > 0 && report.overallReadiness < 100);
  });
});

test("5. Personalized Revision Plan Prioritization & Scheduling", async (t) => {
  await t.test("schedules day-by-day tasks and detects plan diffs on improvement", () => {
    const topicSummaries = [
      {
        topicId: "top_photo",
        topicTitle: "Photosynthesis",
        status: "weak",
        percentageScore: 30,
        totalQuestions: 4,
        correctQuestions: 1,
        examImportance: 9,
        examFrequency: 8,
        priorityScore: 95,
        humanReason: "Critical gap",
        commonMisconceptions: ["RuBisCO saturation"],
      },
      {
        topicId: "top_circ",
        topicTitle: "Circulation",
        status: "medium",
        percentageScore: 60,
        totalQuestions: 4,
        correctQuestions: 2,
        examImportance: 8,
        examFrequency: 5,
        priorityScore: 60,
        humanReason: "Moderate gap",
        commonMisconceptions: [],
      },
    ];

    const plan = generateRevisionPlan(topicSummaries, {
      availableDays: 4,
      hoursPerDay: 2,
    });

    assert.equal(plan.totalDays, 4);
    assert.equal(plan.dailySchedules.length, 4);

    // Day 1 must contain read_section and practice_questions tasks
    const day1 = plan.dailySchedules[0];
    const taskTypes = day1.tasks.map((t) => t.taskType);
    assert.ok(taskTypes.includes("read_section"));
    assert.ok(taskTypes.includes("practice_questions"));
    assert.ok(day1.totalMinutes > 0);

    // Test plan diffing
    const oldPriorities = new Map([
      ["top_photo", 2], // was priority 2
      ["top_circ", 1],
    ]);

    const planWithDiff = generateRevisionPlan(topicSummaries, {
      availableDays: 4,
      hoursPerDay: 2,
      previousTopicPriorities: oldPriorities,
    });

    assert.ok(planWithDiff.planDiffs.length > 0);
  });
});
