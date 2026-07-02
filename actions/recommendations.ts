"use server";

import { db } from "@/lib/db";

// -- Recommendations Lookup --

export async function getCertificationRecommendations(careerPath?: string, difficulty?: string) {
  try {
    const where: any = {};
    if (careerPath && careerPath !== "All") where.careerPath = careerPath;
    if (difficulty && difficulty !== "All") where.difficulty = difficulty;

    const certs = await db.certification.findMany({ where });

    // Fallbacks if empty
    if (certs.length === 0) {
      return {
        success: true,
        certs: [
          { id: "fallback-c1", name: "AWS Certified Solutions Architect", provider: "Amazon Web Services", cost: "Paid", difficulty: "Intermediate", url: "https://aws.amazon.com/certification", careerPath: careerPath || "Cloud Computing" },
          { id: "fallback-c2", name: "Google Data Analytics Certificate", provider: "Google Coursera", cost: "Free/Subscription", difficulty: "Beginner", url: "https://coursera.org", careerPath: careerPath || "Data Science" },
          { id: "fallback-c3", name: "CompTIA Security+", provider: "CompTIA", cost: "Paid", difficulty: "Beginner", url: "https://comptia.org", careerPath: careerPath || "Cybersecurity" }
        ].filter(c => !careerPath || careerPath === "All" || c.careerPath === careerPath)
      };
    }

    return { success: true, certs };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getScholarshipRecommendations(careerPath?: string) {
  try {
    const where: any = {};
    if (careerPath && careerPath !== "All") where.careerPath = careerPath;

    const scholarships = await db.scholarship.findMany({ where });

    if (scholarships.length === 0) {
      return {
        success: true,
        scholarships: [
          { id: "fallback-s1", name: "Women in Tech Scholarship", provider: "Google", description: "Supports underrepresented groups in software studies.", eligibility: "Undergraduate Computer Science major", amount: "$10,000", url: "https://buildyourfuture.withgoogle.com", careerPath: careerPath || "Software Engineering" },
          { id: "fallback-s2", name: "AWS Academy Grants", provider: "Amazon", description: "Grants access to free AWS certification training vouchers.", eligibility: "Students at registered universities", amount: "100% discount", url: "https://aws.amazon.com", careerPath: careerPath || "Cloud Computing" }
        ].filter(s => !careerPath || careerPath === "All" || s.careerPath === careerPath)
      };
    }

    return { success: true, scholarships };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProjectRecommendations(careerPath?: string, difficulty?: string) {
  try {
    const where: any = {};
    if (careerPath && careerPath !== "All") where.careerPath = careerPath;
    if (difficulty && difficulty !== "All") where.difficulty = difficulty;

    const projects = await db.projectRecommendation.findMany({ where });

    if (projects.length === 0) {
      return {
        success: true,
        projects: [
          { id: "fallback-p1", title: "Personal Portfolio site", careerPath: careerPath || "Software Engineering", difficulty: "Beginner", techStack: "HTML, CSS, JavaScript", description: "Create a responsive portfolio website showcasing developer credentials.", learningOutcomes: "Learn basic document structure, vanilla CSS layouts, and GitHub pages static deployment.", estHours: 15 },
          { id: "fallback-p2", title: "Predictive Analytics Model", careerPath: careerPath || "Data Science", difficulty: "Intermediate", techStack: "Python, Scikit-Learn, Pandas", description: "Build a model evaluating house prices or stock trends based on data patterns.", learningOutcomes: "Master pandas dataframes cleanups, regression modeling, and statistical test sets.", estHours: 30 },
          { id: "fallback-p3", title: "Encrypted API Gateway", careerPath: careerPath || "Cybersecurity", difficulty: "Advanced", techStack: "Node.js, Express, Crypto, Redis", description: "Design a secure microservice authentication gate parsing JWT and rate limiting.", learningOutcomes: "Learn cryptographic salting, redis key limits, JWT signing, and auth middlewares.", estHours: 45 }
        ].filter(p => !careerPath || careerPath === "All" || p.careerPath === careerPath)
      };
    }

    return { success: true, projects };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -- Admin CRUD Actions --

export async function upsertCertification(id: string | null, data: any) {
  try {
    let cert;
    if (id) {
      cert = await db.certification.update({
        where: { id },
        data,
      });
    } else {
      cert = await db.certification.create({
        data,
      });
    }
    return { success: true, cert };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCertification(id: string) {
  try {
    await db.certification.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function upsertScholarship(id: string | null, data: any) {
  try {
    let scholarship;
    if (id) {
      scholarship = await db.scholarship.update({
        where: { id },
        data: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
      });
    } else {
      scholarship = await db.scholarship.create({
        data: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
      });
    }
    return { success: true, scholarship };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteScholarship(id: string) {
  try {
    await db.scholarship.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function upsertProjectRecommendation(id: string | null, data: any) {
  try {
    let project;
    if (id) {
      project = await db.projectRecommendation.update({
        where: { id },
        data: {
          ...data,
          estHours: parseInt(data.estHours) || 10,
        },
      });
    } else {
      project = await db.projectRecommendation.create({
        data: {
          ...data,
          estHours: parseInt(data.estHours) || 10,
        },
      });
    }
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProjectRecommendation(id: string) {
  try {
    await db.projectRecommendation.delete({ where: { id } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
