"use server";

import { db } from "@/lib/db";
import { analyzeResumeText } from "@/lib/ai";
import { awardBadge } from "./auth";

// 1. Submit and Analyze Resume text
export async function uploadAndAnalyzeResume(userId: string, resumeText: string, targetCareers: string[]) {
  try {
    if (!resumeText || resumeText.trim().length === 0) {
      return { success: false, error: "Resume text content is empty." };
    }

    if (!targetCareers || targetCareers.length === 0) {
      return { success: false, error: "Please select at least one target career to match against." };
    }

    // Call AI to parse strengths, weaknesses, tips, missing skills, and calculate job readiness scores
    const analysisResult = await analyzeResumeText(resumeText, targetCareers);

    // Save analysis to db
    const savedAnalysis = await db.resumeAnalysis.create({
      data: {
        userId,
        resumeText,
        analysis: JSON.stringify(analysisResult.analysis),
        jobReadiness: JSON.stringify(analysisResult.readiness),
      },
    });

    // Update profile skills if we matched any skills to show positive growth
    const profile = await db.profile.findUnique({ where: { userId } });
    if (profile && analysisResult.analysis.matchedSkills) {
      let currentSkills = [];
      try {
        currentSkills = JSON.parse(profile.skills);
      } catch (e) {
        currentSkills = [];
      }
      
      const updatedSkills = Array.from(new Set([...currentSkills, ...analysisResult.analysis.matchedSkills]));
      await db.profile.update({
        where: { userId },
        data: { skills: JSON.stringify(updatedSkills) },
      });
    }

    // Award badge
    await awardBadge(userId, "Resume Scanned");

    return {
      success: true,
      analysis: analysisResult.analysis,
      readiness: analysisResult.readiness,
      analysisId: savedAnalysis.id,
    };
  } catch (err: any) {
    console.error("Resume analysis server action error:", err);
    return { success: false, error: err.message || "CV analysis processing failed." };
  }
}

// 2. Fetch Latest Resume Analysis
export async function getLatestResumeAnalysis(userId: string) {
  try {
    const record = await db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!record) return { success: true, analysis: null };

    return {
      success: true,
      analysis: {
        id: record.id,
        createdAt: record.createdAt,
        resumeText: record.resumeText,
        analysis: JSON.parse(record.analysis),
        jobReadiness: JSON.parse(record.jobReadiness),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. Save or update user resume builder document
export async function saveUserResume(userId: string, resumeData: any) {
  try {
    const { id, title, template, personalInfo, experience, education, projects, skills } = resumeData;
    
    // Call AI helper to evaluate/score the builder structure
    const scoreData = await analyzeResumeBuilderData({
      personalInfo,
      experience,
      education,
      projects,
      skills,
    });

    let resume;
    if (id) {
      resume = await db.resume.update({
        where: { id },
        data: {
          title,
          template,
          personalInfo,
          experience,
          education,
          projects,
          skills,
          score: scoreData.score,
          feedback: JSON.stringify(scoreData),
        },
      });
    } else {
      resume = await db.resume.create({
        data: {
          userId,
          title,
          template,
          personalInfo,
          experience,
          education,
          projects,
          skills,
          score: scoreData.score,
          feedback: JSON.stringify(scoreData),
        },
      });
    }

    // Award badge for resume actions
    await awardBadge(userId, "Resume Scanned");

    return { success: true, resume };
  } catch (err: any) {
    console.error("Save resume error:", err);
    return { success: false, error: err.message };
  }
}

// 4. Retrieve all resumes for a user
export async function getUserResumes(userId: string) {
  try {
    const resumes = await db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      resumes: resumes.map((r) => ({
        ...r,
        feedback: JSON.parse(r.feedback || "{}"),
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Delete a resume builder document
export async function deleteResume(id: string) {
  try {
    await db.db.resume.delete({
      where: { id },
    });
    return { success: true };
  } catch (err: any) {
    // Retry with db object direct
    try {
      await db.resume.delete({
        where: { id },
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}

// 6. Generate Resume builder document automatically from profile data
export async function generateResumeFromProfileData(userId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      return { success: false, error: "Please complete your career profile questionnaire first." };
    }

    const personalInfo = JSON.stringify({
      name: profile.user.name || "",
      email: profile.user.email || "",
      phone: "",
      website: "",
      summary: profile.goals || "Eager student/graduate looking to apply technical skills in production.",
    });

    // Populate initial experience shell
    const experience = JSON.stringify([
      {
        role: "Technical Contributor",
        company: "Academic Cohort Labs",
        duration: "3 Months",
        description: `Refined competencies based on work styles: ${profile.workStyle || "Collaborative execution"}. Managed development tracks.`,
      },
    ]);

    // Populate capstone project details
    const projects = JSON.stringify([
      {
        name: "AI Capability Advisor Capstone",
        stack: "Next.js, TypeScript, Tailwind, Database",
        description: `Designed and built responsive application matching key goals: ${profile.goals || "Career progression"}`,
      },
    ]);

    // Extract education details
    const education = JSON.stringify([
      {
        degree: "Bachelor of Science in Technology",
        school: profile.academicBackground || "State Technical University",
        duration: profile.education || "4 Years",
      },
    ]);

    const skills = profile.skills || "[]";

    const scoreData = await analyzeResumeBuilderData({
      personalInfo,
      experience,
      education,
      projects,
      skills,
    });

    const resume = await db.resume.create({
      data: {
        userId,
        title: "AI Auto-Generated Profile CV",
        template: "professional",
        personalInfo,
        experience,
        education,
        projects,
        skills,
        score: scoreData.score,
        feedback: JSON.stringify(scoreData),
      },
    });

    return { success: true, resume };
  } catch (err: any) {
    console.error("Auto generate resume error:", err);
    return { success: false, error: err.message };
  }
}
