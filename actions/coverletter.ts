"use server";

import { db } from "@/lib/db";
import { generateAICoverLetter } from "@/lib/ai";
import { getProfile } from "./auth";

export async function generateAndSaveCoverLetter(
  userId: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string
) {
  try {
    const profileRes = await getProfile(userId);
    const profile = profileRes.success ? profileRes.profile : null;

    const content = await generateAICoverLetter(jobTitle, companyName, jobDescription, {
      name: profile?.user?.name || "Applicant",
      education: profile?.education || "",
      skills: profile?.skills || "[]",
    });

    const coverLetter = await db.coverLetter.create({
      data: {
        userId,
        jobTitle,
        companyName,
        jobDescription,
        content,
      },
    });

    return { success: true, coverLetter };
  } catch (err: any) {
    console.error("Cover letter generation action error:", err);
    return { success: false, error: err.message };
  }
}

export async function getCoverLetters(userId: string) {
  try {
    const letters = await db.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, letters };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCoverLetter(id: string) {
  try {
    await db.coverLetter.delete({
      where: { id },
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
