"use server";

import { db } from "@/lib/db";
import { assessmentSchema } from "@/lib/zod-schemas";
import { analyzeAssessmentResponses, generateCareerRoadmap } from "@/lib/ai";
import { awardBadge } from "./auth";

// 1. Submit & Analyze Career Assessment
export async function submitAssessment(userId: string, formData: any) {
  try {
    const validated = assessmentSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const answers = validated.data;

    // Call AI engine to evaluate interests & recommend paths
    const aiResult = await analyzeAssessmentResponses(answers);

    // Save assessment to database
    const response = await db.assessmentResponse.create({
      data: {
        userId,
        answers: JSON.stringify(answers),
        result: JSON.stringify(aiResult),
      },
    });

    // Automatically award first badge
    await awardBadge(userId, "First Assessment");

    return { success: true, result: aiResult, responseId: response.id };
  } catch (err: any) {
    console.error("Assessment submission error:", err);
    return { success: false, error: err.message || "Something went wrong during analysis." };
  }
}

// 2. Fetch Latest Assessment Response
export async function getLatestAssessment(userId: string) {
  try {
    const response = await db.assessmentResponse.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!response) {
      return { success: true, response: null };
    }

    return {
      success: true,
      response: {
        ...response,
        answers: JSON.parse(response.answers),
        result: JSON.parse(response.result),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. Toggle Saved Career
export async function toggleSavedCareer(userId: string, careerId: string) {
  try {
    const existing = await db.savedCareer.findUnique({
      where: {
        userId_careerId: { userId, careerId },
      },
    });

    if (existing) {
      await db.savedCareer.delete({
        where: { id: existing.id },
      });
      return { success: true, saved: false };
    } else {
      await db.savedCareer.create({
        data: { userId, careerId },
      });
      return { success: true, saved: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Get Saved Careers
export async function getSavedCareers(userId: string) {
  try {
    const saved = await db.savedCareer.findMany({
      where: { userId },
      include: {
        career: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
    return { success: true, saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Generate or Retrieve Roadmap for a Career
export async function getOrCreateRoadmap(userId: string, careerId: string) {
  try {
    const career = await db.career.findUnique({
      where: { id: careerId },
    });

    if (!career) return { success: false, error: "Career path not found" };

    // Check if roadmap exists in DB
    const existing = await db.roadmap.findFirst({
      where: { userId, careerId },
    });

    if (existing) {
      return { success: true, roadmap: { ...existing, stages: JSON.parse(existing.stages) } };
    }

    // Otherwise, generate a new one via AI
    const profile = await db.profile.findUnique({ where: { userId } });
    const userBg = profile
      ? `Education: ${profile.education}. Major: ${profile.academicBackground}. Current Skills: ${profile.skills}. Goals: ${profile.goals}`
      : "Student with basic computer background.";

    const aiRoadmap = await generateCareerRoadmap(career.title, userBg);

    const created = await db.roadmap.create({
      data: {
        userId,
        careerId,
        stages: JSON.stringify(aiRoadmap.stages),
      },
    });

    // Award badge for generating roadmap
    await awardBadge(userId, "Roadmap Follower");

    return { success: true, roadmap: { ...created, stages: aiRoadmap.stages } };
  } catch (err: any) {
    console.error("Roadmap fetching error:", err);
    return { success: false, error: err.message };
  }
}

// 6. Toggle Learning Resource Completion
export async function toggleLearningResource(userId: string, resourceId: string) {
  try {
    const existing = await db.userProgress.findUnique({
      where: {
        userId_resourceId: { userId, resourceId },
      },
    });

    let completed = false;

    if (existing) {
      const updated = await db.userProgress.update({
        where: { id: existing.id },
        data: { completed: !existing.completed },
      });
      completed = updated.completed;
    } else {
      const created = await db.userProgress.create({
        data: {
          userId,
          resourceId,
          completed: true,
        },
      });
      completed = created.completed;
    }

    // Award Skill Pioneer badge on first resource completed
    if (completed) {
      await awardBadge(userId, "Skill Pioneer");
    }

    return { success: true, completed };
  } catch (err: any) {
    console.error("Error toggling learning progress:", err);
    return { success: false, error: err.message };
  }
}

// 7. Fetch Learning Progress Stats
export async function getUserProgressStats(userId: string) {
  try {
    const progressList = await db.userProgress.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            skill: true,
          },
        },
      },
    });

    const completedCount = progressList.filter((p) => p.completed).length;

    return {
      success: true,
      progressList,
      completedCount,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. Get All Careers with Skills and Resources
export async function getAllCareersWithSkills() {
  try {
    const careers = await db.career.findMany({
      include: {
        skills: {
          include: {
            skill: {
              include: {
                learningResources: true,
              },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    });
    return { success: true, careers };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 9. Predict suitability and career success probability
export async function getCareerSuccessPrediction(userId: string, careerTitle: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return { success: false, error: "Please complete your career profile questionnaire first." };
    }

    const latestAssessment = await db.assessmentResponse.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const answers = latestAssessment ? JSON.parse(latestAssessment.answers) : {};

    const { predictCareerSuccessSuitability } = await import("@/lib/ai");
    const prediction = await predictCareerSuccessSuitability(profile, answers, careerTitle);

    return { success: true, prediction };
  } catch (err: any) {
    console.error("Success prediction error:", err);
    return { success: false, error: err.message };
  }
}


