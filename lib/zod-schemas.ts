import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  education: z.string().min(2, "Please enter your education background."),
  academicBackground: z.string().min(2, "Please enter your academic field/major."),
  interests: z.array(z.string()).min(1, "Please select at least one interest."),
  skills: z.array(z.string()).min(1, "Please select at least one current skill."),
  goals: z.string().min(2, "Please enter your career goals."),
  workStyle: z.string().min(2, "Please select your preferred work style."),
});

export const assessmentSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest field."),
  strengths: z.array(z.string()).min(1, "Select at least one key strength."),
  workStyle: z.string().min(1, "Please select a preferred work style."),
  academic: z.string().min(2, "Please state your academic major or background."),
  goals: z.string().min(2, "Please state your primary professional goals."),
});

export const goalSchema = z.object({
  title: z.string().min(2, "Goal title must be at least 2 characters long."),
  targetDate: z.string().min(1, "Please select a target date."),
});
