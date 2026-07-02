const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Users (Hashed Passwords)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const studentPassword = await bcrypt.hash("student123", salt);

  const admin = await prisma.user.upsert({
    where: { email: "admin@careeradvisor.com" },
    update: {},
    create: {
      email: "admin@careeradvisor.com",
      name: "Admin Advisor",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@careeradvisor.com" },
    update: {},
    create: {
      email: "student@careeradvisor.com",
      name: "Alex Mercer",
      password: studentPassword,
      role: "USER",
    },
  });

  console.log(`Created users: Admin (${admin.email}), Student (${student.email})`);

  // 2. Create Badges
  const badgesData = [
    { name: "First Assessment", description: "Completed your first career assessment questionnaire", icon: "ClipboardCheck" },
    { name: "Resume Scanned", description: "Uploaded and scanned a resume for job readiness analysis", icon: "FileText" },
    { name: "Roadmap Follower", description: "Saved a career path and generated an AI roadmap", icon: "Map" },
    { name: "Skill Pioneer", description: "Marked your first recommended learning resource as complete", icon: "Award" },
    { name: "AI Explorer", description: "Initiated a guidance chat with the AI Advisor", icon: "MessageSquareCode" },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
  }
  console.log("Created achievement badges.");

  // 3. Create Skills
  const skillsData = [
    { name: "Python Programming", category: "Programming", description: "General purpose programming language widely used in AI, Data Science, and Web development." },
    { name: "SQL & Databases", category: "Data", description: "Structured Query Language used for managing and manipulating relational databases." },
    { name: "Machine Learning", category: "AI & Data Science", description: "Algorithms and models that enable computers to learn from and make decisions based on data." },
    { name: "Deep Learning & Neural Networks", category: "AI & Data Science", description: "Subfield of ML based on artificial neural networks, key to AI and computer vision." },
    { name: "React & Next.js", category: "Frontend Development", description: "Popular Javascript libraries for building responsive, high-performance user interfaces." },
    { name: "Node.js & Express", category: "Backend Development", description: "Server-side Javascript environment for creating scalable API backends." },
    { name: "Cybersecurity Basics", category: "Security", description: "Fundamentals of protecting networks, devices, programs, and data from attacks." },
    { name: "Penetration Testing", category: "Security", description: "Authorized simulated cyberattack on computer systems to evaluate security." },
    { name: "AWS Cloud Infrastructure", category: "Cloud & DevOps", description: "Amazon Web Services components including EC2, S3, RDS, and serverless compute." },
    { name: "Docker & Containerization", category: "DevOps", description: "Tool for running applications in isolated software packages called containers." },
    { name: "CI/CD Pipelines", category: "DevOps", description: "Continuous Integration and Continuous Deployment practices for automated application testing and delivery." },
    { name: "Figma & UI Design", category: "Design", description: "Collaborative design tool for building modern interfaces, wireframes, and prototypes." },
    { name: "User Research & Testing", category: "Design", description: "Methods for understanding user behavior, needs, and motivations through feedback and testing." },
    { name: "Agile & Scrum Methodologies", category: "Product Management", description: "Iterative project management frameworks for building software rapidly and collaboratively." },
    { name: "SEO & Digital Strategy", category: "Marketing", description: "Search Engine Optimization and online marketing channels to drive organic and paid traffic." },
    { name: "Google Analytics & AdWords", category: "Marketing", description: "Tools for measuring campaign performance, traffic sources, and conversion rates." },
    { name: "Swift & iOS Development", category: "Mobile Development", description: "Apple programming language and frameworks for iOS application development." },
    { name: "Kotlin & Android Studio", category: "Mobile Development", description: "Modern language and IDE for building native Android phone and tablet applications." },
    { name: "Unity & C# Scripting", category: "Game Development", description: "Leading multiplatform game engine and language for creating 2D/3D video games." },
    { name: "Business Analytics & Tableau", category: "Data", description: "Analyzing business trends and building interactive data visualizations for corporate decision making." },
  ];

  const skillMap = {};
  for (const s of skillsData) {
    const createdSkill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skillMap[s.name] = createdSkill;
  }
  console.log(`Created ${Object.keys(skillMap).length} core skills.`);

  // 4. Create Careers
  const careersData = [
    {
      title: "Data Scientist",
      category: "Data Science",
      description: "Extracts insights from structured and unstructured data using statistics, coding, and visualization. Solves complex business problems.",
      salaryRange: "$95,000 - $145,000",
      growthOpportunities: "High (35% growth expected in next decade). Paths to Lead Scientist, Director of Analytics.",
      jobDemand: "High",
      overallScore: 9.2,
      skills: [
        { skillName: "Python Programming", importance: "Core" },
        { skillName: "SQL & Databases", importance: "Core" },
        { skillName: "Machine Learning", importance: "Core" },
        { skillName: "Business Analytics & Tableau", importance: "Secondary" },
      ]
    },
    {
      title: "AI Engineer",
      category: "Artificial Intelligence",
      description: "Designs, develops, and deploys intelligent algorithms, machine learning pipelines, and deep neural network models.",
      salaryRange: "$110,000 - $180,000",
      growthOpportunities: "Very High (Exponential growth driven by Generative AI). Paths to AI Architect, Principal AI Researcher.",
      jobDemand: "High",
      overallScore: 9.8,
      skills: [
        { skillName: "Python Programming", importance: "Core" },
        { skillName: "Machine Learning", importance: "Core" },
        { skillName: "Deep Learning & Neural Networks", importance: "Core" },
      ]
    },
    {
      title: "Full Stack Developer",
      category: "Software Engineering",
      description: "Builds both the front-end user experience and backend database logic of websites and modern web applications.",
      salaryRange: "$80,000 - $130,000",
      growthOpportunities: "High (Steady demand for versatile developers). Paths to Tech Lead, Software Architect.",
      jobDemand: "High",
      overallScore: 9.0,
      skills: [
        { skillName: "React & Next.js", importance: "Core" },
        { skillName: "Node.js & Express", importance: "Core" },
        { skillName: "SQL & Databases", importance: "Core" },
        { skillName: "AWS Cloud Infrastructure", importance: "Secondary" },
      ]
    },
    {
      title: "Cybersecurity Analyst",
      category: "Cybersecurity",
      description: "Monitors, detects, and prevents unauthorized access to networks, server frameworks, and private user databases.",
      salaryRange: "$75,000 - $115,000",
      growthOpportunities: "High (Critical corporate priority). Paths to Security Engineer, CISO (Chief Information Security Officer).",
      jobDemand: "High",
      overallScore: 8.8,
      skills: [
        { skillName: "Cybersecurity Basics", importance: "Core" },
        { skillName: "Penetration Testing", importance: "Core" },
        { skillName: "SQL & Databases", importance: "Secondary" },
      ]
    },
    {
      title: "Cloud Architect",
      category: "Cloud Computing",
      description: "Designs and plans secure, redundant, and highly-scalable network architectures on AWS, Azure, or Google Cloud Platform.",
      salaryRange: "$115,000 - $170,000",
      growthOpportunities: "High (Enterprise migration to cloud is ongoing). Paths to Enterprise Architect, VP of Infrastructure.",
      jobDemand: "High",
      overallScore: 9.1,
      skills: [
        { skillName: "AWS Cloud Infrastructure", importance: "Core" },
        { skillName: "Docker & Containerization", importance: "Core" },
        { skillName: "CI/CD Pipelines", importance: "Secondary" },
      ]
    },
    {
      title: "UI/UX Designer",
      category: "UI/UX Design",
      description: "Researches user habits and translates business requirements into beautiful, interactive, and user-friendly digital designs.",
      salaryRange: "$70,000 - $115,000",
      growthOpportunities: "Medium to High (Crucial for user-focused consumer apps). Paths to UX Lead, Creative Director.",
      jobDemand: "Medium",
      overallScore: 8.5,
      skills: [
        { skillName: "Figma & UI Design", importance: "Core" },
        { skillName: "User Research & Testing", importance: "Core" },
        { skillName: "React & Next.js", importance: "Secondary" },
      ]
    },
    {
      title: "Product Manager",
      category: "Product Management",
      description: "Coordinates engineering, design, and marketing resources to own the vision, launch, and roadmap of a digital product.",
      salaryRange: "$95,000 - $150,000",
      growthOpportunities: "High (Central business leadership role). Paths to VP of Product, Chief Product Officer.",
      jobDemand: "High",
      overallScore: 9.3,
      skills: [
        { skillName: "Agile & Scrum Methodologies", importance: "Core" },
        { skillName: "Business Analytics & Tableau", importance: "Core" },
        { skillName: "User Research & Testing", importance: "Secondary" },
      ]
    },
    {
      title: "DevOps Engineer",
      category: "DevOps",
      description: "Bridges the gap between developers and system operations, automating build, test, deployment, and infrastructure configurations.",
      salaryRange: "$100,000 - $150,000",
      growthOpportunities: "High (Essential for rapid agile deployment). Paths to Lead DevOps, Platform Engineer.",
      jobDemand: "High",
      overallScore: 9.4,
      skills: [
        { skillName: "Docker & Containerization", importance: "Core" },
        { skillName: "CI/CD Pipelines", importance: "Core" },
        { skillName: "AWS Cloud Infrastructure", importance: "Core" },
      ]
    },
    {
      title: "Digital Marketing Specialist",
      category: "Digital Marketing",
      description: "Manages social media ads, search optimization, email newsletters, and content strategies to attract and retain digital customers.",
      salaryRange: "$55,000 - $90,000",
      growthOpportunities: "Medium (Highly competitive field). Paths to Marketing Director, Chief Marketing Officer.",
      jobDemand: "Medium",
      overallScore: 8.0,
      skills: [
        { skillName: "SEO & Digital Strategy", importance: "Core" },
        { skillName: "Google Analytics & AdWords", importance: "Core" },
        { skillName: "Business Analytics & Tableau", importance: "Secondary" },
      ]
    },
    {
      title: "Mobile App Developer",
      category: "Mobile Development",
      description: "Creates responsive, native applications for iOS and Android devices, focusing on memory efficiency and offline reliability.",
      salaryRange: "$85,000 - $135,000",
      growthOpportunities: "High (Mobile-first trends continue). Paths to Mobile Lead, Lead Architect.",
      jobDemand: "High",
      overallScore: 8.9,
      skills: [
        { skillName: "Swift & iOS Development", importance: "Core" },
        { skillName: "Kotlin & Android Studio", importance: "Core" },
        { skillName: "React & Next.js", importance: "Secondary" },
      ]
    },
    {
      title: "Game Developer",
      category: "Game Development",
      description: "Combines creative design, audio, physics, and gameplay mechanics in 2D/3D environments using game engines.",
      salaryRange: "$65,000 - $110,000",
      growthOpportunities: "Medium (Indie scene is growing; AAA studios are highly structured). Paths to Game Director, Lead Developer.",
      jobDemand: "Medium",
      overallScore: 8.2,
      skills: [
        { skillName: "Unity & C# Scripting", importance: "Core" },
        { skillName: "Figma & UI Design", importance: "Secondary" },
      ]
    },
    {
      title: "Business Analyst",
      category: "Business Analytics",
      description: "Reviews commercial data, operating models, and reports, helping leadership make smart, structured strategic decisions.",
      salaryRange: "$70,000 - $110,000",
      growthOpportunities: "Medium to High (High demand in finance and consulting). Paths to Lead Business Analyst, Management Consultant.",
      jobDemand: "High",
      overallScore: 8.6,
      skills: [
        { skillName: "Business Analytics & Tableau", importance: "Core" },
        { skillName: "SQL & Databases", importance: "Core" },
        { skillName: "Agile & Scrum Methodologies", importance: "Secondary" },
      ]
    }
  ];

  for (const c of careersData) {
    const createdCareer = await prisma.career.create({
      data: {
        title: c.title,
        category: c.category,
        description: c.description,
        salaryRange: c.salaryRange,
        growthOpportunities: c.growthOpportunities,
        jobDemand: c.jobDemand,
        overallScore: c.overallScore,
      }
    });

    for (const skillReq of c.skills) {
      const dbSkill = skillMap[skillReq.skillName];
      if (dbSkill) {
        await prisma.careerSkill.create({
          data: {
            careerId: createdCareer.id,
            skillId: dbSkill.id,
            importance: skillReq.importance,
          }
        });
      }
    }
  }
  console.log("Created 12 custom careers and mapped their skills.");

  // 5. Create Learning Resources
  const resourcesData = [
    { title: "Python for Data Science & AI", type: "Course", url: "https://www.coursera.org/specializations/python-3-programming", skillName: "Python Programming", difficulty: "Beginner", description: "Comprehensive introduction to programming with Python, focusing on analysis tools." },
    { title: "Automate the Boring Stuff with Python", type: "Book", url: "https://automatetheboringstuff.com/", skillName: "Python Programming", difficulty: "Beginner", description: "Practical programming for total beginners, focusing on automating simple scripts." },
    { title: "SQL for Data Analysis Mastery", type: "Course", url: "https://www.udemy.com/course/sql-for-data-analysis/", skillName: "SQL & Databases", difficulty: "Beginner", description: "Learn how to filter, join, and aggregate complex tables in PostgreSQL." },
    { title: "Intro to Machine Learning by Andrew Ng", type: "Course", url: "https://www.coursera.org/specializations/machine-learning-introduction", skillName: "Machine Learning", difficulty: "Intermediate", description: "The gold-standard introduction to algorithms, regression, and classification." },
    { title: "Deep Learning Specialization", type: "Certification", url: "https://www.deeplearning.ai/program/deep-learning-specialization/", skillName: "Deep Learning & Neural Networks", difficulty: "Advanced", description: "Master neural networks, backpropagation, CNNs, and RNNs." },
    { title: "Next.js 15 Full Course", type: "Tutorial", url: "https://nextjs.org/learn", skillName: "React & Next.js", difficulty: "Beginner", description: "Official Next.js documentation walkthrough for Server Actions and App Router." },
    { title: "Node.js & Express - Complete Developer Guide", type: "Course", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", skillName: "Node.js & Express", difficulty: "Intermediate", description: "Build, secure, and deploy robust JSON API web servers." },
    { title: "CompTIA Security+ Certification Guide", type: "Book", url: "https://www.comptia.org/certifications/security", skillName: "Cybersecurity Basics", difficulty: "Beginner", description: "Fundamental guide to threat management, crypto, and enterprise networks." },
    { title: "Hands-on Penetration Testing Labs", type: "Tutorial", url: "https://tryhackme.com/", skillName: "Penetration Testing", difficulty: "Intermediate", description: "Gamified rooms teaching buffer overflows, Nmap scanning, and privilege escalation." },
    { title: "AWS Certified Solutions Architect Associate", type: "Certification", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", skillName: "AWS Cloud Infrastructure", difficulty: "Intermediate", description: "Learn deployment architectures, serverless, and IAM policies." },
    { title: "Docker Deep Dive", type: "Book", url: "https://rnelson0.github.io/docker-deep-dive/", skillName: "Docker & Containerization", difficulty: "Intermediate", description: "Outstanding deep dive into docker networking, compose files, and storage volumes." },
    { title: "DevOps CI/CD Pipelines with GitHub Actions", type: "Course", url: "https://github.com/features/actions", skillName: "CI/CD Pipelines", difficulty: "Intermediate", description: "Configure custom workflows, automate tests, and deploy to AWS instantly." },
    { title: "Figma UI/UX Design Essentials", type: "Course", url: "https://www.udemy.com/course/figma-uxui-design-essentials/", skillName: "Figma & UI Design", difficulty: "Beginner", description: "Build wireframes, high-fidelity prototypes, and interactive micro-animations." },
    { title: "Don't Make Me Think", type: "Book", url: "https://sensible.com/dont-make-me-think/", skillName: "User Research & Testing", difficulty: "Beginner", description: "The legendary usability handbook for understanding human UX habits." },
    { title: "Agile Project Management Certificate", type: "Certification", url: "https://www.coursera.org/professional-certificates/google-project-management", skillName: "Agile & Scrum Methodologies", difficulty: "Beginner", description: "Google-certified training in scrum board tracking, sprints, and product backlogs." },
    { title: "Google SEO Starter Guide", type: "Tutorial", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", skillName: "SEO & Digital Strategy", difficulty: "Beginner", description: "Understand page indexing, rich snippets, site speed, and domain keywords." },
    { title: "Google Analytics Academy Certificate", type: "Certification", url: "https://analytics.google.com/analytics/academy/", skillName: "Google Analytics & AdWords", difficulty: "Beginner", description: "Measure campaign ROI, target custom audiences, and set up conversions." },
    { title: "iOS & Swift - The Complete Bootcamp", type: "Course", url: "https://www.udemy.com/course/ios-13-app-development-bootcamp/", skillName: "Swift & iOS Development", difficulty: "Beginner", description: "Learn Swift, SwiftUI, local data structures, and MapKit app tools." },
    { title: "Android App Development with Kotlin", type: "Course", url: "https://developer.android.com/courses/kotlin-android-basics/overview", skillName: "Kotlin & Android Studio", difficulty: "Beginner", description: "Official Google training course for Android Studio structures." },
    { title: "Unity Game Development Bootcamp", type: "Course", url: "https://www.udemy.com/course/unity-game-development-academy-make-2d-3d-games/", skillName: "Unity & C# Scripting", difficulty: "Beginner", description: "Learn 3D rendering, physics, sprite sheets, and compilation." },
    { title: "Tableau for Business Intelligence", type: "Course", url: "https://www.udemy.com/course/tableau-for-business-intelligence/", skillName: "Business Analytics & Tableau", difficulty: "Beginner", description: "Connect databases, build stories, and create dynamic graphs." },
  ];

  for (const r of resourcesData) {
    const s = skillMap[r.skillName];
    if (s) {
      await prisma.learningResource.create({
        data: {
          title: r.title,
          type: r.type,
          url: r.url,
          skillId: s.id,
          difficulty: r.difficulty,
          description: r.description,
        }
      });
    }
  }
  console.log("Created learning resources mapped to skills.");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
