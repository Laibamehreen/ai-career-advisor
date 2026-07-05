"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOpportunities(userId?: string | null) {
  try {
    const opportunities = await db.opportunity.findMany({
      orderBy: { deadline: "asc" },
      include: {
        savedBy: true,
        applications: true,
      },
    });

    let userSkills: string[] = [];
    let userMajor = "";
    let userGoal = "";

    if (userId) {
      const profile = await db.profile.findUnique({
        where: { userId },
      });
      if (profile) {
        try {
          userSkills = profile.skills ? JSON.parse(profile.skills) : [];
        } catch (e) {
          userSkills = [];
        }
        userMajor = profile.academicBackground || "";
        userGoal = profile.goals || "";
      }
    }

    // Map opportunities and compute matching parameters
    const mapped = opportunities.map((opp) => {
      let required: string[] = [];
      try {
        required = opp.requiredSkills ? JSON.parse(opp.requiredSkills) : [];
      } catch (e) {
        required = [];
      }

      const isSaved = userId
        ? opp.savedBy.some((s) => s.userId === userId)
        : false;

      const activeApplication = userId
        ? opp.applications.find((a) => a.userId === userId)
        : null;

      // Matching Score Calculations
      let matchPercentage = 100;
      let missingRequirements: string[] = [];
      if (required.length > 0) {
        const matches = required.filter((s) =>
          userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
        );
        matchPercentage = Math.round((matches.length / required.length) * 100);
        missingRequirements = required.filter(
          (s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
        );
      }

      // Eligibility Check
      const majorMatch =
        !userMajor ||
        !opp.careerPath ||
        opp.careerPath.toLowerCase() === "general" ||
        userMajor.toLowerCase().includes(opp.careerPath.toLowerCase()) ||
        opp.careerPath.toLowerCase().includes(userMajor.toLowerCase());

      const eligibilityAnalysis = majorMatch
        ? "Excellent alignment. You satisfy the core major qualifications for this pathway."
        : `Your academic profile focuses on ${userMajor || "General studies"}, whereas this target focuses on ${opp.careerPath}.`;

      // Recommended next steps
      const nextSteps: string[] = [];
      if (missingRequirements.length > 0) {
        nextSteps.push(`Acquire skills in: ${missingRequirements.slice(0, 2).join(", ")}`);
      }
      nextSteps.push(`Prepare cover letter and align resume with ${opp.companyProvider}`);

      return {
        ...opp,
        isSaved,
        application: activeApplication,
        matchPercentage,
        missingRequirements,
        eligibilityAnalysis,
        recommendedNextSteps: nextSteps,
      };
    });

    return { success: true, opportunities: mapped };
  } catch (err: any) {
    console.error("Fetch opportunities error:", err);
    return { success: false, error: err.message, opportunities: [] };
  }
}

export async function toggleSaveOpportunity(userId: string, opportunityId: string) {
  try {
    const existing = await db.userSavedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId,
        },
      },
    });

    if (existing) {
      await db.userSavedOpportunity.delete({
        where: { id: existing.id },
      });
      revalidatePath("/opportunities");
      return { success: true, saved: false };
    } else {
      await db.userSavedOpportunity.create({
        data: {
          userId,
          opportunityId,
        },
      });
      revalidatePath("/opportunities");
      return { success: true, saved: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function applyForOpportunity(
  userId: string,
  opportunityId: string,
  status: string = "Applied",
  notes: string = ""
) {
  try {
    const app = await db.opportunityApplication.upsert({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId,
        },
      },
      update: {
        status,
        notes,
      },
      create: {
        userId,
        opportunityId,
        status,
        notes,
      },
    });
    revalidatePath("/opportunities");
    return { success: true, application: app };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateApplicationStatus(id: string, status: string, notes: string = "") {
  try {
    const app = await db.opportunityApplication.update({
      where: { id },
      data: { status, notes },
    });
    revalidatePath("/opportunities");
    return { success: true, application: app };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteApplication(id: string) {
  try {
    await db.opportunityApplication.delete({
      where: { id },
    });
    revalidatePath("/opportunities");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Generate current month items inside Action Center
export async function getActionCenterData(userId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
    });

    let studentMajor = "Software Engineering";
    let studentSkills: string[] = [];
    if (profile) {
      studentMajor = profile.academicBackground || "Software Engineering";
      try {
        studentSkills = profile.skills ? JSON.parse(profile.skills) : [];
      } catch (e) {
        studentSkills = [];
      }
    }

    // Recommended Actions for the Month based on major
    const isDataSci = studentMajor.toLowerCase().includes("data") || studentMajor.toLowerCase().includes("ai");
    const isCyber = studentMajor.toLowerCase().includes("cyber") || studentMajor.toLowerCase().includes("security");

    const response = {
      scholarships: [
        {
          name: "HEC Indigenous Scholarship Phase II",
          provider: "Higher Education Commission Pakistan",
          deadline: "End of this month",
          details: "Fully funded tuition + monthly living stipend",
        },
        {
          name: "PEEF Master's Level Scholarship",
          provider: "Punjab Education Endowment Fund",
          deadline: "In 15 days",
          details: "Covers 100% tuition fee and boarding fees",
        },
      ],
      internships: isDataSci
        ? [
            { name: "AI/ML Engineering Intern", company: "Systems Limited (Lahore)", type: "Hybrid" },
            { name: "Junior Data Analyst Intern", company: "Contour Software", type: "Remote" },
          ]
        : isCyber
        ? [
            { name: "Cybersecurity Analyst Trainee", company: "Trillium Information Security Systems", type: "On-site" },
            { name: "Security Operations Intern", company: "Netsol Technologies", type: "Hybrid" },
          ]
        : [
            { name: "React Frontend Trainee", company: "Systems Limited (Karachi)", type: "Remote" },
            { name: "Software Engineer Intern", company: "Netsol Technologies", type: "On-site" },
          ],
      jobs: [
        { title: "Graduate Trainee Software Engineer", company: "Afiniti Pakistan", location: "Islamabad" },
        { title: "Junior Web Developer (Freelance)", company: "Upwork Global Contracts", location: "Remote" },
      ],
      skillsToLearn: isDataSci
        ? ["Data Wrangling with Pandas", "Supervised Learning Models"]
        : isCyber
        ? ["Network Traffic Analysis (Wireshark)", "Linux Privilege Escalation"]
        : ["TypeScript Configuration", "Next.js 15 Server Actions"],
      certifications: isDataSci
        ? ["Google Professional Data Analyst", "Microsoft Azure AI Fundamentals"]
        : isCyber
        ? ["CompTIA Security+", "EC-Council Certified Ethical Hacker (CEH)"]
        : ["AWS Certified Cloud Practitioner", "FreeCodeCamp Responsive Web Design"],
    };

    return { success: true, actions: response };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
