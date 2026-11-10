import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { repo } from "@/lib/db/repo";
import { DEMO_CLASS_STUDENTS, SAMPLE_TOPICS } from "@/lib/seed-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calculate topic-wise class performance
  const topicStats = SAMPLE_TOPICS.map((topic) => {
    // Determine class average across seeded students
    const scores = DEMO_CLASS_STUDENTS.map((stu) => {
      if (stu.weakTopic === topic.title) return 42;
      return Math.min(95, stu.readinessScore + (topic.orderIndex % 2 === 0 ? 4 : -3));
    });

    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const weakStudents = DEMO_CLASS_STUDENTS.filter((s) => s.weakTopic === topic.title).length;

    return {
      topicId: topic.id,
      title: topic.title,
      averageScore: average,
      weakStudentsCount: weakStudents,
      status: average < 60 ? "critical" : average < 75 ? "attention" : "mastered",
      examImportance: topic.examImportance,
      examFrequency: topic.examFrequency,
    };
  });

  // Calculate overall class readiness
  const totalReadiness = DEMO_CLASS_STUDENTS.reduce((sum, s) => sum + s.readinessScore, 0);
  const classAverageReadiness = Math.round(totalReadiness / DEMO_CLASS_STUDENTS.length);

  // Heatmap matrix: Students vs Topics
  const heatmap = DEMO_CLASS_STUDENTS.map((student) => ({
    studentId: student.id,
    name: student.name,
    overallScore: student.readinessScore,
    topicScores: SAMPLE_TOPICS.map((t) => ({
      topicId: t.id,
      topicTitle: t.title,
      score: student.weakTopic === t.title ? 38 : Math.min(98, student.readinessScore + ((t.orderIndex * 5) % 12)),
    })),
  }));

  return NextResponse.json({
    classAverageReadiness,
    totalStudents: DEMO_CLASS_STUDENTS.length,
    students: DEMO_CLASS_STUDENTS,
    topicStats,
    heatmap,
  });
}
