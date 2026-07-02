"use server";

import { db } from "@/lib/db";
import { generateInterviewQuestionsForCareer, evaluateInterviewSession } from "@/lib/ai";
import { awardBadge } from "./auth";

export async function startInterviewSession(userId: string, careerId: string, mode: string) {
  try {
    const career = await db.career.findUnique({
      where: { id: careerId },
    });

    if (!career) {
      return { success: false, error: "Target career path not found." };
    }

    const { questions } = await generateInterviewQuestionsForCareer(career.title, mode);

    const questionsList = questions.map((q: string) => ({
      question: q,
      answer: "",
    }));

    const session = await db.mockInterview.create({
      data: {
        userId,
        careerId,
        careerTitle: career.title,
        mode,
        questions: JSON.stringify(questionsList),
        score: 0,
        feedback: "{}",
      },
    });

    return { success: true, session: { ...session, questions: questionsList } };
  } catch (err: any) {
    console.error("Start interview session error:", err);
    return { success: false, error: err.message };
  }
}

export async function submitInterviewAnswers(
  sessionId: string,
  userId: string,
  questionsAndAnswers: Array<{ question: string; answer: string }>
) {
  try {
    // Grade answers
    const evaluation = await evaluateInterviewSession(questionsAndAnswers);

    const updatedSession = await db.mockInterview.update({
      where: { id: sessionId },
      data: {
        questions: JSON.stringify(questionsAndAnswers),
        score: evaluation.score,
        feedback: JSON.stringify(evaluation),
      },
    });

    // Award badge
    await awardBadge(userId, "AI Explorer");

    return { success: true, evaluation, session: updatedSession };
  } catch (err: any) {
    console.error("Submit interview answers error:", err);
    return { success: false, error: err.message };
  }
}

export async function getInterviewHistory(userId: string) {
  try {
    const interviews = await db.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      history: interviews.map((item) => ({
        ...item,
        questions: JSON.parse(item.questions || "[]"),
        feedback: JSON.parse(item.feedback || "{}"),
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
