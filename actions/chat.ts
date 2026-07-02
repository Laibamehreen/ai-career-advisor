"use server";

import { db } from "@/lib/db";
import { generateChatResponse } from "@/lib/ai";
import { awardBadge } from "./auth";

export async function askCareerAdvisor(
  userId: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string
) {
  try {
    if (!message || message.trim().length === 0) {
      return { success: false, error: "Empty message payload." };
    }

    // Query profile and assessment context
    let context = "";
    if (userId) {
      const profile = await db.profile.findUnique({
        where: { userId },
      });
      if (profile) {
        context += `Education: ${profile.education || "N/A"}. Major: ${profile.academicBackground || "N/A"}. Verified Skills: ${profile.skills || "N/A"}. Goals: ${profile.goals || "N/A"}. `;
      }

      const latestAssessment = await db.assessmentResponse.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (latestAssessment) {
        try {
          const res = JSON.parse(latestAssessment.result);
          if (res?.recommendations) {
            context += `Recommended Paths: ${res.recommendations.map((r: any) => r.title).join(", ")}. `;
          }
        } catch (e) {}
      }
    }

    // Call AI to get advice response with context
    const answer = await generateChatResponse(history, message, context);

    // Award AI Explorer badge for using the chat advisor
    if (userId) {
      await awardBadge(userId, "AI Explorer");
    }

    return {
      success: true,
      answer,
    };
  } catch (err: any) {
    console.error("AI career advisor chat error:", err);
    return {
      success: false,
      error: err.message || "Failed to generate AI response. Try again later.",
    };
  }
}
