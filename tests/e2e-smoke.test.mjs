/**
 * End-to-End Smoke Test Suite
 * Tests full simulation of User Flow:
 * Login Seed -> Document Chunker -> Topic Map -> Quiz Attempt -> Gap Report -> Revision Plan -> Teacher Analytics
 */

import test from "node:test";
import assert from "node:assert/strict";

import { seedDemoAccounts } from "../lib/seed-service.ts";
import { repo } from "../lib/db/repo.ts";

test("End-to-End Core User Simulation Flow", async (t) => {
  let studentId = "";

  await t.test("1. Seed Demo Accounts & Sample Materials", async () => {
    const res = await seedDemoAccounts();
    assert.ok(res.studentId, "Student ID must be returned");
    studentId = res.studentId;

    const studentUser = await repo.findUserByEmail("demo@gapfinder.ai");
    assert.ok(studentUser, "Student user must exist in repository");
    assert.equal(studentUser.role, "student");

    const teacherUser = await repo.findUserByEmail("teacher@gapfinder.ai");
    assert.ok(teacherUser, "Teacher user must exist in repository");
    assert.equal(teacherUser.role, "teacher");
  });

  await t.test("2. Verify Uploaded Materials & Structural Chunks", async () => {
    const docs = await repo.getDocumentsByUser(studentId);
    assert.equal(docs.length, 3, "Must have Syllabus, Notes, and Past Papers");

    const chunks = await repo.getChunksByUser(studentId);
    assert.ok(chunks.length >= 5, "Must have extracted multiple semantic chunks");

    // Verify every chunk has a human-readable citation label
    for (const chunk of chunks) {
      assert.ok(chunk.citation, `Chunk ${chunk.id} must have a citation`);
      assert.ok(chunk.chapter, `Chunk ${chunk.id} must have a chapter heading`);
    }
  });

  await t.test("3. Verify Curriculum Topic Map", async () => {
    const topics = await repo.getTopicsByUser(studentId);
    assert.ok(topics.length >= 4, "Must have generated at least 4 core topics");

    const photoTopic = topics.find((t) => t.id === "topic_photo");
    assert.ok(photoTopic, "Photosynthesis topic must exist");
    assert.equal(photoTopic.examImportance, 9);
    assert.equal(photoTopic.examFrequency, 8);
  });

  await t.test("4. Verify 3 Historical Diagnostic Attempts (Progression)", async () => {
    const attempts = await repo.getAttemptsByUser(studentId);
    assert.equal(attempts.length, 3, "Must have recorded 3 historical attempts");

    // Verify progression: Attempt 1 (40%) -> Attempt 2 (60%) -> Attempt 3 (80%)
    const sorted = [...attempts].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    assert.equal(sorted[0].percentage, 40);
    assert.equal(sorted[1].percentage, 60);
    assert.equal(sorted[2].percentage, 80);
  });

  await t.test("5. Verify Hero Gap Report Output", async () => {
    const report = await repo.getLatestGapReport(studentId);
    assert.ok(report, "Gap report must be generated and saved");
    assert.ok(report.readinessScore > 0, "Readiness score must be calculated");

    const summaries = report.topicSummaries;
    assert.ok(summaries.length > 0, "Must have topic breakdown summaries");

    // Verify transparent classification status values
    for (const summary of summaries) {
      assert.ok(
        ["weak", "medium", "strong", "no_data"].includes(summary.status),
        `Status ${summary.status} must be valid traffic light status`
      );
      assert.ok(summary.humanReason, "Must provide human reason grounded in real data");
    }

    assert.ok(report.top3Priorities.length > 0, "Must have top 3 priorities list");
  });

  await t.test("6. Verify Adaptive Revision Plan", async () => {
    const planRecord = await repo.getRevisionPlan(studentId);
    assert.ok(planRecord, "Revision plan must exist");
    assert.ok(planRecord.planData, "Plan data must be structured");

    const schedules = planRecord.planData.dailySchedules;
    assert.equal(schedules.length, 5, "Must have 5 daily schedules");

    for (const day of schedules) {
      assert.ok(day.tasks.length > 0, `Day ${day.dayNumber} must have assigned tasks`);
      for (const task of day.tasks) {
        assert.ok(task.citation, `Task ${task.title} must have a citation`);
        assert.ok(task.durationMinutes > 0, "Task must have allocated duration");
      }
    }
  });

  await t.test("7. Verify Teacher View Class Analytics", async () => {
    const classData = await repo.getClassAnalytics();
    assert.ok(classData.length >= 8, "Teacher view must have at least 8 students");

    const firstStudent = classData[0];
    assert.ok(firstStudent.name);
    assert.ok(firstStudent.readinessScore >= 0);
  });
});
