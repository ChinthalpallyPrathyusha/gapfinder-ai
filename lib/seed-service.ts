/**
 * Seed Service
 * Populates complete demo environment:
 * - Documents (Syllabus, Notes, Past Papers)
 * - Chunks with structure & citations
 * - Topic Map with weightages
 * - 3 Progressive Attempts with Question Answers
 * - Hero Gap Report with honest numbers & human diagnosis
 * - Adaptive Revision Plan with day-by-day tasks & checkboxes
 */

import { repo } from "./db/repo";
import { hashPassword } from "./auth/jwt";
import { chunkDocument } from "./retrieval/chunking";
import { computeGapReport } from "./algorithms/gap-analysis";
import { generateRevisionPlan } from "./algorithms/revision-plan";
import {
  SAMPLE_SYLLABUS,
  SAMPLE_NOTES,
  SAMPLE_PAST_PAPERS,
  SAMPLE_TOPICS,
  DEMO_CLASS_STUDENTS,
} from "./seed-data";

export async function seedDemoAccounts() {
  const studentPassword = await hashPassword("Demo@12345");
  const teacherPassword = await hashPassword("Teach@12345");

  // Create or verify student
  const student = await repo.createUser({
    id: "demo_student_user",
    email: "demo@gapfinder.ai",
    passwordHash: studentPassword,
    name: "Alex Rivera (Demo Student)",
    role: "student",
  });

  // Create or verify teacher
  await repo.createUser({
    id: "demo_teacher_user",
    email: "teacher@gapfinder.ai",
    passwordHash: teacherPassword,
    name: "Dr. Evelyn Vance (Demo Teacher)",
    role: "teacher",
  });

  // Seed sample materials and attempts for demo student
  await seedSampleMaterialForUser(student.id);

  // Create base quiz for class analytics
  await repo.createQuiz(
    {
      id: "quiz_demo_1",
      userId: student.id,
      title: "Class 10 Biology Diagnostic Baseline",
      topicIds: SAMPLE_TOPICS.map((t) => t.id),
      status: "completed",
    },
    []
  );

  // Seed 8 demo class students for teacher analytics
  for (const stu of DEMO_CLASS_STUDENTS) {
    const pwd = await hashPassword("Student@12345");
    await repo.createUser({
      id: stu.id,
      email: stu.email,
      passwordHash: pwd,
      name: stu.name,
      role: "student",
    });

    // Seed basic attempts for each student so teacher heatmap works
    const attId = `att_${stu.id}`;
    await repo.saveAttempt(
      {
        id: attId,
        quizId: "quiz_demo_1",
        userId: stu.id,
        score: Math.round((stu.readinessScore / 100) * 10),
        maxScore: 10,
        percentage: stu.readinessScore,
        durationSeconds: 480,
      },
      []
    );

    await repo.saveGapReport({
      id: `gap_${stu.id}`,
      userId: stu.id,
      attemptId: attId,
      readinessScore: stu.readinessScore,
      topicSummaries: SAMPLE_TOPICS.map((t) => ({
        topicId: t.id,
        topicTitle: t.title,
        status: t.title === stu.weakTopic ? "weak" : stu.readinessScore > 80 ? "strong" : "medium",
        percentageScore: t.title === stu.weakTopic ? 38 : Math.min(95, stu.readinessScore + 5),
        totalQuestions: 4,
        correctQuestions: t.title === stu.weakTopic ? 1 : 3,
        examImportance: t.examImportance,
        examFrequency: t.examFrequency,
        priorityScore: t.title === stu.weakTopic ? 85 : 30,
        humanReason: t.title === stu.weakTopic 
          ? `Struggling with core mechanisms: 3 of 4 questions incorrect.`
          : `Demonstrates consistent mastery.`,
        commonMisconceptions: [],
      })),
      top3Priorities: [],
    });
  }

  return { studentId: student.id };
}

export async function seedSampleMaterialForUser(userId: string) {
  // 1. Documents
  const syllabusDoc = await repo.createDocument({
    id: `doc_syl_${userId}`,
    userId,
    title: "Class 10 Life Sciences Syllabus.pdf",
    docType: "syllabus",
    rawContent: SAMPLE_SYLLABUS,
    pageCount: 2,
  });

  const notesDoc = await repo.createDocument({
    id: `doc_not_${userId}`,
    userId,
    title: "Comprehensive Biology Revision Notes.pdf",
    docType: "notes",
    rawContent: SAMPLE_NOTES,
    pageCount: 5,
  });

  const pastPapersDoc = await repo.createDocument({
    id: `doc_pp_${userId}`,
    userId,
    title: "CBSE Board Past Exam Papers 2021-2024.pdf",
    docType: "past_paper",
    rawContent: SAMPLE_PAST_PAPERS,
    pageCount: 3,
  });

  // 2. Chunks
  const chunks = [
    ...chunkDocument(syllabusDoc.id, syllabusDoc.title, "syllabus", SAMPLE_SYLLABUS),
    ...chunkDocument(notesDoc.id, notesDoc.title, "notes", SAMPLE_NOTES),
    ...chunkDocument(pastPapersDoc.id, pastPapersDoc.title, "past_paper", SAMPLE_PAST_PAPERS),
  ].map((c) => ({
    ...c,
    userId,
    docType: c.metadata.docType,
    chapter: c.metadata.chapter,
    section: c.metadata.section,
    page: c.metadata.page,
    chunkIndex: c.metadata.chunkIndex,
    citation: c.metadata.citation,
    topicId: c.metadata.chapter.includes("Photo") ? "topic_photo" :
             c.metadata.chapter.includes("Circ") ? "topic_circ" :
             c.metadata.chapter.includes("Resp") ? "topic_resp" :
             c.metadata.chapter.includes("Gene") ? "topic_gene" : "topic_excr",
  }));

  await repo.insertChunks(chunks);

  // 3. Topics
  const topicsToSave = SAMPLE_TOPICS.map((t) => ({
    ...t,
    userId,
    orderIndex: t.orderIndex,
  }));
  await repo.saveTopics(topicsToSave);

  // 4. Sample Diagnostic Quiz
  const quizId = `quiz_diag_${userId}`;
  const questions = [
    {
      id: `q_1_${userId}`,
      quizId,
      topicId: "topic_photo",
      questionType: "mcq",
      prompt: "Where do the light-dependent reactions of photosynthesis take place inside the chloroplast?",
      options: ["Thylakoid membranes", "Stroma matrix", "Outer membrane", "Inner mitochondrial cristae"],
      correctAnswer: "Thylakoid membranes",
      explanation: "Light-dependent reactions occur in thylakoid membranes where chlorophyll traps light photons to split water molecules.",
      misconception: "Confusing thylakoids (light stage) with the stroma (dark reaction/Calvin cycle).",
      difficulty: "easy",
      sourceCitation: "Life Sciences Notes, Chapter 1, Section 1.1, p.4",
    },
    {
      id: `q_2_${userId}`,
      quizId,
      topicId: "topic_photo",
      questionType: "short_answer",
      prompt: "Explain why carbon dioxide concentration eventually reaches a plateau in accelerating photosynthesis rate.",
      options: [],
      correctAnswer: "Light intensity, temperature, or enzyme saturation (RuBisCO) becomes the rate-limiting factor.",
      explanation: "According to Blackman's principle of limiting factors, once CO2 is saturated, other factors like light or enzymes limit the speed.",
      misconception: "Believing increasing one substrate continuously accelerates reactions indefinitely.",
      difficulty: "hard",
      sourceCitation: "Life Sciences Notes, Chapter 1, Section 1.2, p.5",
    },
    {
      id: `q_3_${userId}`,
      quizId,
      topicId: "topic_circ",
      questionType: "mcq",
      prompt: "Why does the human left ventricle possess significantly thicker muscular walls than the right ventricle?",
      options: [
        "It pumps blood against systemic resistance to the entire body",
        "It stores deoxygenated blood from superior vena cava",
        "It pumps only across the short pulmonary circuit to the lungs",
        "It operates with pocket valves under negative pressure",
      ],
      correctAnswer: "It pumps blood against systemic resistance to the entire body",
      explanation: "The left ventricle pumps oxygenated blood through the aorta across systemic circulation, requiring high hydrostatic pressure.",
      misconception: "Assuming both ventricles experience identical vascular resistance.",
      difficulty: "medium",
      sourceCitation: "Life Sciences Notes, Chapter 2, Section 2.1, p.12",
    },
    {
      id: `q_4_${userId}`,
      quizId,
      topicId: "topic_gene",
      questionType: "mcq",
      prompt: "In a monohybrid cross of heterozygous tall pea plants (Tt x Tt), what phenotypic ratio is observed?",
      options: ["3 Tall : 1 Dwarf", "1 TT : 2 Tt : 1 tt", "9 Tall : 3 Dwarf", "All Tall"],
      correctAnswer: "3 Tall : 1 Dwarf",
      explanation: "Both TT and Tt express the tall phenotype due to dominance, yielding 75% tall and 25% dwarf.",
      misconception: "Confusing the 1:2:1 genotype ratio with the 3:1 phenotype ratio.",
      difficulty: "easy",
      sourceCitation: "Life Sciences Notes, Chapter 4, Section 4.1, p.26",
    },
    {
      id: `q_5_${userId}`,
      quizId,
      topicId: "topic_excr",
      questionType: "mcq",
      prompt: "Which microscopic structure in the nephron carries out ultrafiltration under high hydrostatic pressure?",
      options: ["Glomerulus & Bowman's capsule", "Loop of Henle", "Collecting duct", "Renal pelvis"],
      correctAnswer: "Glomerulus & Bowman's capsule",
      explanation: "Glomerular capillaries filter water, glucose, and urea into Bowman's capsule due to differential arterial diameter.",
      misconception: "Confusing ultrafiltration in the glomerulus with selective reabsorption in the tubules.",
      difficulty: "medium",
      sourceCitation: "Life Sciences Notes, Chapter 5, Section 5.1, p.33",
    },
  ];

  await repo.createQuiz(
    {
      id: quizId,
      userId,
      title: "Comprehensive Life Sciences Diagnostic Quiz",
      topicIds: SAMPLE_TOPICS.map((t) => t.id),
      status: "completed",
    },
    questions
  );

  // 5. Create 3 Historical Attempts showing clear progression
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Attempt 1: 3 days ago - 40% (Photosynthesis weak, Circulatory medium, Genetics medium)
  const att1Id = `att_1_${userId}`;
  const att1 = {
    id: att1Id,
    quizId,
    userId,
    score: 2.0,
    maxScore: 5.0,
    percentage: 40.0,
    durationSeconds: 320,
    completedAt: new Date(now - 3 * dayMs),
  };
  const ans1 = [
    { id: `ans_1_1`, attemptId: att1Id, questionId: questions[0].id, studentAnswer: "Stroma matrix", isCorrect: false, scoreAwarded: 0, explanation: "Incorrect. Calvin cycle is in stroma; light reactions are in thylakoid membranes.", misconception: "Confused dark reaction site with light reaction site.", sourceCitation: questions[0].sourceCitation },
    { id: `ans_1_2`, attemptId: att1Id, questionId: questions[1].id, studentAnswer: "It keeps speeding up forever.", isCorrect: false, scoreAwarded: 0, explanation: "Incorrect. Rate is limited by other factors.", misconception: "Ignored principle of limiting factors.", sourceCitation: questions[1].sourceCitation },
    { id: `ans_1_3`, attemptId: att1Id, questionId: questions[2].id, studentAnswer: "It pumps blood against systemic resistance to the entire body", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[2].sourceCitation },
    { id: `ans_1_4`, attemptId: att1Id, questionId: questions[3].id, studentAnswer: "3 Tall : 1 Dwarf", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[3].sourceCitation },
    { id: `ans_1_5`, attemptId: att1Id, questionId: questions[4].id, studentAnswer: "Loop of Henle", isCorrect: false, scoreAwarded: 0, explanation: "Incorrect. Loop of Henle is for reabsorption, not ultrafiltration.", misconception: "Confused filtration site with concentration site.", sourceCitation: questions[4].sourceCitation },
  ];
  await repo.saveAttempt(att1, ans1);

  // Attempt 2: 2 days ago - 60%
  const att2Id = `att_2_${userId}`;
  const att2 = {
    id: att2Id,
    quizId,
    userId,
    score: 3.0,
    maxScore: 5.0,
    percentage: 60.0,
    durationSeconds: 290,
    completedAt: new Date(now - 2 * dayMs),
  };
  const ans2 = [
    { id: `ans_2_1`, attemptId: att2Id, questionId: questions[0].id, studentAnswer: "Thylakoid membranes", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[0].sourceCitation },
    { id: `ans_2_2`, attemptId: att2Id, questionId: questions[1].id, studentAnswer: "Light and temperature limit it.", isCorrect: true, scoreAwarded: 1, explanation: "Correct concept stated.", sourceCitation: questions[1].sourceCitation },
    { id: `ans_2_3`, attemptId: att2Id, questionId: questions[2].id, studentAnswer: "It stores deoxygenated blood", isCorrect: false, scoreAwarded: 0, explanation: "Incorrect.", misconception: "Confused ventricle function with atrium.", sourceCitation: questions[2].sourceCitation },
    { id: `ans_2_4`, attemptId: att2Id, questionId: questions[3].id, studentAnswer: "3 Tall : 1 Dwarf", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[3].sourceCitation },
    { id: `ans_2_5`, attemptId: att2Id, questionId: questions[4].id, studentAnswer: "Loop of Henle", isCorrect: false, scoreAwarded: 0, explanation: "Incorrect.", misconception: "Still confusing filtration and reabsorption.", sourceCitation: questions[4].sourceCitation },
  ];
  await repo.saveAttempt(att2, ans2);

  // Attempt 3: Yesterday - 80%
  const att3Id = `att_3_${userId}`;
  const att3 = {
    id: att3Id,
    quizId,
    userId,
    score: 4.0,
    maxScore: 5.0,
    percentage: 80.0,
    durationSeconds: 240,
    completedAt: new Date(now - 1 * dayMs),
  };
  const ans3 = [
    { id: `ans_3_1`, attemptId: att3Id, questionId: questions[0].id, studentAnswer: "Thylakoid membranes", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[0].sourceCitation },
    { id: `ans_3_2`, attemptId: att3Id, questionId: questions[1].id, studentAnswer: "RuBisCO enzyme saturation and light intensity limit further speed.", isCorrect: true, scoreAwarded: 1, explanation: "Exceptional explanation citing limiting enzymes.", sourceCitation: questions[1].sourceCitation },
    { id: `ans_3_3`, attemptId: att3Id, questionId: questions[2].id, studentAnswer: "It pumps blood against systemic resistance to the entire body", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[2].sourceCitation },
    { id: `ans_3_4`, attemptId: att3Id, questionId: questions[3].id, studentAnswer: "3 Tall : 1 Dwarf", isCorrect: true, scoreAwarded: 1, explanation: "Correct!", sourceCitation: questions[3].sourceCitation },
    { id: `ans_3_5`, attemptId: att3Id, questionId: questions[4].id, studentAnswer: "Glomerulus & Bowman's capsule", isCorrect: true, scoreAwarded: 1, explanation: "Correct ultrafiltration identification!", sourceCitation: questions[4].sourceCitation },
  ];
  await repo.saveAttempt(att3, ans3);

  // 6. Generate Hero Gap Report based on Attempt 3 data
  const questionAttempts = ans3.map((a: any, i) => ({
    questionId: questions[i].id,
    topicId: questions[i].topicId,
    topicTitle: SAMPLE_TOPICS.find((t) => t.id === questions[i].topicId)?.title || "General",
    isCorrect: a.isCorrect,
    scoreAwarded: a.scoreAwarded,
    misconception: a.misconception || undefined,
  }));

  // Add dummy attempt for cellular respiration & excretion to show rich distribution
  questionAttempts.push({
    questionId: "q_extra_1",
    topicId: "topic_excr",
    topicTitle: "Excretion & Nephron Physiology",
    isCorrect: false,
    scoreAwarded: 0,
    misconception: "Confusing ultrafiltration with tubular secretion",
  });
  questionAttempts.push({
    questionId: "q_extra_2",
    topicId: "topic_resp",
    topicTitle: "Cellular Respiration & Energy",
    isCorrect: true,
    scoreAwarded: 1,
    misconception: undefined,
  });
  questionAttempts.push({
    questionId: "q_extra_3",
    topicId: "topic_resp",
    topicTitle: "Cellular Respiration & Energy",
    isCorrect: false,
    scoreAwarded: 0.5,
    misconception: "ATP yield discrepancy between aerobic and anaerobic",
  });

  const gapResult = computeGapReport(SAMPLE_TOPICS, questionAttempts);

  await repo.saveGapReport({
    id: `gap_rep_${userId}`,
    userId,
    attemptId: att3Id,
    readinessScore: gapResult.overallReadiness || 78,
    topicSummaries: gapResult.topicSummaries,
    top3Priorities: gapResult.top3Priorities,
  });

  // 7. Generate Personalized Revision Plan
  const topicCitations = new Map<string, string>();
  SAMPLE_TOPICS.forEach((t) => topicCitations.set(t.id, t.citation));

  const plan = generateRevisionPlan(gapResult.topicSummaries, {
    availableDays: 5,
    hoursPerDay: 2,
    topicCitations,
  });

  await repo.saveRevisionPlan({
    id: `plan_${userId}`,
    userId,
    availableDays: 5,
    hoursPerDay: 2,
    planData: plan,
  });

  return { success: true };
}
