"use server";

import { db } from "@/lib/db";
import { generatePlannerSchedule } from "@/lib/ai";
import { getProfile, awardBadge } from "./auth";

export async function generateOrGetPlan(userId: string, careerId: string, duration: string) {
  try {
    const existing = await db.learningPlan.findFirst({
      where: { userId, careerId, duration },
    });

    if (existing) {
      return { success: true, plan: { ...existing, tasks: JSON.parse(existing.tasks) } };
    }

    const career = await db.career.findUnique({
      where: { id: careerId },
    });

    if (!career) {
      return { success: false, error: "Career path not found." };
    }

    const profileRes = await getProfile(userId);
    const profile = profileRes.success ? profileRes.profile : null;

    const aiTasks = await generatePlannerSchedule(
      career.title,
      duration,
      profile?.academicBackground || "Student"
    );

    // Format tasks to include ID, status, and deadline date
    const tasks = aiTasks.tasks.map((t: any, index: number) => {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (t.deadlineDays || 7));
      return {
        id: `task-${Date.now()}-${index}`,
        title: t.title,
        content: t.content,
        completed: false,
        deadline: deadlineDate.toISOString(),
      };
    });

    const plan = await db.learningPlan.create({
      data: {
        userId,
        careerId,
        careerTitle: career.title,
        duration,
        tasks: JSON.stringify(tasks),
      },
    });

    return { success: true, plan: { ...plan, tasks } };
  } catch (err: any) {
    console.error("Generate planner schedule error:", err);
    return { success: false, error: err.message };
  }
}

export async function toggleTaskCompletion(planId: string, taskId: string, userId: string) {
  try {
    const plan = await db.learningPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) return { success: false, error: "Learning plan not found." };

    let tasks = JSON.parse(plan.tasks || "[]");
    tasks = tasks.map((t: any) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const updated = await db.learningPlan.update({
      where: { id: planId },
      data: { tasks: JSON.stringify(tasks) },
    });

    // Award badge for skills progression
    await awardBadge(userId, "Skill Pioneer");

    return { success: true, plan: { ...updated, tasks } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addCustomTask(planId: string, title: string, content: string, deadlineDays: number) {
  try {
    const plan = await db.learningPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) return { success: false, error: "Learning plan not found." };

    const tasks = JSON.parse(plan.tasks || "[]");

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + (deadlineDays || 7));

    const newTask = {
      id: `task-custom-${Date.now()}`,
      title,
      content,
      completed: false,
      deadline: deadlineDate.toISOString(),
    };

    tasks.push(newTask);

    const updated = await db.learningPlan.update({
      where: { id: planId },
      data: { tasks: JSON.stringify(tasks) },
    });

    return { success: true, plan: { ...updated, tasks } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
