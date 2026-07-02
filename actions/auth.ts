"use server";

import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { registerSchema, profileSchema } from "@/lib/zod-schemas";

// 1. Sign up user
export async function registerUser(formData: any) {
  try {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { name, email, password } = validated.data;

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "A user with this email already exists." };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role
      },
    });

    // Create empty Profile for user
    await db.profile.create({
      data: {
        userId: user.id,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Registration error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// 2. Fetch User Profile
export async function getProfile(userId: string) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, profile };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. Update User Profile
export async function updateProfile(userId: string, profileData: any) {
  try {
    const validated = profileSchema.safeParse(profileData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const { education, academicBackground, interests, skills, goals, workStyle } = validated.data;

    const profile = await db.profile.upsert({
      where: { userId },
      update: {
        education,
        academicBackground,
        interests: JSON.stringify(interests),
        skills: JSON.stringify(skills),
        goals,
        workStyle,
      },
      create: {
        userId,
        education,
        academicBackground,
        interests: JSON.stringify(interests),
        skills: JSON.stringify(skills),
        goals,
        workStyle,
      },
    });

    return { success: true, profile };
  } catch (err: any) {
    console.error("Profile update error:", err);
    return { success: false, error: err.message };
  }
}

// 4. Fetch User Badges
export async function getUserBadges(userId: string) {
  try {
    const badges = await db.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
    });
    return { success: true, badges };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Award Badge helper
export async function awardBadge(userId: string, badgeName: string) {
  try {
    const badge = await db.badge.findUnique({
      where: { name: badgeName },
    });

    if (!badge) return { success: false, error: "Badge not found" };

    const existing = await db.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) return { success: true, alreadyEarned: true };

    const userBadge = await db.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
      include: {
        badge: true,
      },
    });

    return { success: true, userBadge };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
