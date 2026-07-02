"use server";

import { db } from "@/lib/db";

export async function createPost(
  userId: string,
  title: string,
  content: string,
  category: string,
  careerPath: string | null
) {
  try {
    const post = await db.communityPost.create({
      data: {
        userId,
        title,
        content,
        category,
        careerPath,
      },
    });
    return { success: true, post };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPosts(category?: string, careerPath?: string) {
  try {
    const where: any = {};
    if (category && category !== "All") where.category = category;
    if (careerPath && careerPath !== "All") where.careerPath = careerPath;

    const posts = await db.communityPost.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        comments: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, posts };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addComment(postId: string, userId: string, content: string) {
  try {
    const comment = await db.communityComment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: { select: { name: true } },
      },
    });
    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function likePost(postId: string) {
  try {
    const post = await db.communityPost.update({
      where: { id: postId },
      data: {
        likes: { increment: 1 },
      },
    });
    return { success: true, likes: post.likes };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getLeaderboard() {
  try {
    // Generate a gamified leaderboard ranking users by earned badges, progress count, and goals
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        badges: { select: { id: true } },
        progress: { where: { completed: true }, select: { id: true } },
        resumes: { select: { score: true } },
      },
    });

    const leaderboard = users
      .map((u) => {
        const badgePoints = (u.badges?.length || 0) * 100;
        const progressPoints = (u.progress?.length || 0) * 50;
        const resumeBonus = u.resumes?.[0] ? u.resumes[0].score : 0;
        const totalPoints = badgePoints + progressPoints + resumeBonus;

        return {
          id: u.id,
          name: u.name || "Aura Scholar",
          email: u.email,
          badgeCount: u.badges?.length || 0,
          completedTasks: u.progress?.length || 0,
          points: totalPoints,
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    return { success: true, leaderboard };
  } catch (err: any) {
    console.error("Leaderboard retrieval error:", err);
    return { success: false, error: err.message };
  }
}
