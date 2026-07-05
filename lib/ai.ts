import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Unified AI client wrapper
export async function getAIService() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return {
      type: "gemini",
      async call(prompt: string, isJson = false) {
        try {
          const ai = new GoogleGenerativeAI(geminiKey);
          const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: isJson ? { responseMimeType: "application/json" } : undefined,
          });
          const result = await model.generateContent(prompt);
          return result.response.text();
        } catch (err) {
          console.error("Gemini API Error:", err);
          throw err;
        }
      },
    };
  }

  if (openaiKey) {
    const openai = new OpenAI({ apiKey: openaiKey });
    return {
      type: "openai",
      async call(prompt: string, isJson = false) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: isJson ? { type: "json_object" } : undefined,
          });
          return response.choices[0].message.content || "";
        } catch (err) {
          console.error("OpenAI API Error:", err);
          throw err;
        }
      },
    };
  }

  // Fallback / Mock service when no keys are set
  return {
    type: "mock",
    async call(prompt: string, isJson = false) {
      console.warn("No GEMINI_API_KEY or OPENAI_API_KEY found. Using high-fidelity mockup generator.");
      return "";
    },
  };
}

// 1. Analyze assessment responses and recommend top careers
export async function analyzeAssessmentResponses(answers: any) {
  const ai = await getAIService();
  
  const prompt = `
    You are an expert AI Career Advisor. Analyze the following student career assessment answers:
    - Interests: ${JSON.stringify(answers.interests)}
    - Strengths: ${JSON.stringify(answers.strengths)}
    - Preferred Work Style: ${answers.workStyle}
    - Academic Background: ${answers.academic}
    - Future Goals: ${answers.goals}

    Recommend 3 suitable career paths from the following list of categories:
    Data Science, Artificial Intelligence, Software Engineering, Cybersecurity, Cloud Computing, UI/UX Design, Product Management, Digital Marketing, DevOps, Mobile Development, Game Development, Business Analytics.

    You MUST respond with a JSON object in this exact structure:
    {
      "recommendations": [
        {
          "title": "Exact Career Title matching a seeded category (e.g. Data Scientist, AI Engineer, Full Stack Developer, Cybersecurity Analyst, Cloud Architect, UI/UX Designer, Product Manager, Growth Marketer, DevOps Engineer, Mobile App Developer, Game Developer, Business Analyst)",
          "category": "The matching Category from the list above",
          "matchScore": 95, // Integer between 0 and 100
          "reason": "Detailed explanation of why this career matches their interests, strengths, and goals.",
          "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
          "salary": "$90,000 - $140,000",
          "demand": "High",
          "growth": "Strong growth in AI and analytics sector."
        }
      ]
    }
  `;

  if (ai.type === "mock") {
    // Generate intelligent mockup based on interest tags
    const interests = answers.interests || [];
    const lowerInterests = interests.map((i: string) => i.toLowerCase());
    
    let careers = [
      { title: "Full Stack Developer", category: "Software Engineering", score: 85, desc: "Building responsive frontend apps and robust backends." },
      { title: "AI Engineer", category: "Artificial Intelligence", score: 80, desc: "Building neural networks and implementing Gemini/OpenAI endpoints." },
      { title: "UI/UX Designer", category: "UI/UX Design", score: 75, desc: "Designing user interfaces and wireframes." }
    ];

    if (lowerInterests.includes("data") || lowerInterests.includes("analysis")) {
      careers = [
        { title: "Data Scientist", category: "Data Science", score: 92, desc: "Analysing structured business datasets." },
        { title: "Business Analyst", category: "Business Analytics", score: 88, desc: "Aligning company metrics and visualizing Tableau insights." },
        { title: "AI Engineer", category: "Artificial Intelligence", score: 80, desc: "Deploying model algorithms." }
      ];
    } else if (lowerInterests.includes("design") || lowerInterests.includes("creative")) {
      careers = [
        { title: "UI/UX Designer", category: "UI/UX Design", score: 94, desc: "Figma wireframing, UX studies, and design tokens." },
        { title: "Full Stack Developer", category: "Software Engineering", score: 82, desc: "Writing user interfaces in React." },
        { title: "Game Developer", category: "Game Development", score: 78, desc: "Developing games in Unity engine." }
      ];
    } else if (lowerInterests.includes("hacking") || lowerInterests.includes("security")) {
      careers = [
        { title: "Cybersecurity Analyst", category: "Cybersecurity", score: 95, desc: "Monitoring and defending infrastructure security." },
        { title: "Cloud Architect", category: "Cloud Computing", score: 84, desc: "Securing IAM rules and EC2 instances." },
        { title: "DevOps Engineer", category: "DevOps", score: 80, desc: "Setting up secure container pipelines." }
      ];
    }

    return {
      recommendations: careers.map(c => ({
        title: c.title,
        category: c.category,
        matchScore: c.score,
        reason: `Based on your interest in ${interests.join(", ")} and your academic background in ${answers.academic || "Computer Science"}, you demonstrate strong potential for the ${c.title} path. ${c.desc}`,
        requiredSkills: c.category === "Software Engineering" ? ["React & Next.js", "Node.js & Express", "SQL & Databases"] :
                        c.category === "Artificial Intelligence" ? ["Python Programming", "Machine Learning", "Deep Learning & Neural Networks"] :
                        c.category === "UI/UX Design" ? ["Figma & UI Design", "User Research & Testing"] :
                        c.category === "Cybersecurity" ? ["Cybersecurity Basics", "Penetration Testing"] : ["SQL & Databases", "Business Analytics & Tableau"],
        salary: c.category === "Artificial Intelligence" ? "$110,000 - $180,000" : "$80,000 - $130,000",
        demand: "High",
        growth: "Strong market demand with high average growth rates."
      }))
    };
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI recommendation parsing failed. Returning mock.", err);
    return { recommendations: [] };
  }
}

// 2. Generate step-by-step career roadmap stages
export async function generateCareerRoadmap(careerTitle: string, userBackground: string) {
  const ai = await getAIService();
  const prompt = `
    You are an expert technical advisor. Create an actionable, highly detailed 3-stage career roadmap (Beginner, Intermediate, Advanced) for someone aiming to become a: ${careerTitle}.
    User Background: ${userBackground}

    Format your response in this exact JSON structure:
    {
      "stages": {
        "beginner": {
          "title": "Foundation Level",
          "timeline": "1-3 Months",
          "description": "Learn the basic fundamentals.",
          "milestones": ["Milestone 1", "Milestone 2"],
          "projects": [
            {
              "name": "Project 1",
              "description": "Simple introductory project details."
            }
          ],
          "certifications": ["Cert 1"]
        },
        "intermediate": {
          "title": "Skill Application",
          "timeline": "3-6 Months",
          "description": "Build real projects and dive deeper.",
          "milestones": ["Milestone 3", "Milestone 4"],
          "projects": [
            {
              "name": "Project 2",
              "description": "Mid-tier project details."
            }
          ],
          "certifications": ["Cert 2"]
        },
        "advanced": {
          "title": "Specialization & Readiness",
          "timeline": "6-12 Months",
          "description": "Prepare for interviews and production systems.",
          "milestones": ["Milestone 5", "Milestone 6"],
          "projects": [
            {
              "name": "Project 3",
              "description": "Complex production-ready project."
            }
          ],
          "certifications": ["Cert 3"],
          "interviewPrep": ["Tip 1", "Tip 2"]
        }
      }
    }
  `;

  if (ai.type === "mock") {
    return {
      stages: {
        beginner: {
          title: "Foundation Level",
          timeline: "1-3 Months",
          description: "Establish core knowledge base and syntax basics.",
          milestones: ["Understand basic definitions", "Write simple scripts or designs"],
          projects: [{ name: "Calculator Application", description: "Build a tool that computes basic mathematics." }],
          certifications: ["Introductory Free Course Certificate"]
        },
        intermediate: {
          title: "Skill Application",
          timeline: "3-6 Months",
          description: "Dive into framework structures and APIs.",
          milestones: ["Integrate APIs and databases", "Collaborate on basic repos"],
          projects: [{ name: "Inventory Management App", description: "Create an app that tracks items using storage endpoints." }],
          certifications: ["Solutions Associate Practitioner"]
        },
        advanced: {
          title: "Specialization & Readiness",
          timeline: "6-12 Months",
          description: "Finalise complex architecture and prepare for career applications.",
          milestones: ["Build CI/CD automation", "Mock interview tests"],
          projects: [{ name: "Collaborative Realtime Platform", description: "Produce a high-performance system supporting multiple active users." }],
          certifications: ["Expert Solutions Developer"],
          interviewPrep: ["Study algorithmic complexity", "Mock whiteboard architecture design sessions"]
        }
      }
    };
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Roadmap parsing failed. Returning mock.", err);
    return { stages: {} };
  }
}

function getMockResumeAnalysis(targetCareers: string[]) {
  const readiness: Record<string, number> = {};
  targetCareers.forEach(c => {
    readiness[c] = Math.floor(Math.random() * 30) + 50; // 50-80%
  });

  return {
    analysis: {
      strengths: [
        "Strong programming foundation in Python and Javascript.",
        "Clear experience building academic team projects.",
        "Clear description of technical stack capabilities."
      ],
      weaknesses: [
        "Lacks professional production experience or internships.",
        "Does not list cloud deployment or containerization tools.",
        "No professional certifications or cloud badges."
      ],
      improvements: [
        "Add direct links to deployed GitHub projects or web apps.",
        "Include a dedicated 'Certifications' section listing relevant cloud/security courses.",
        "Quantify achievements (e.g. 'Improved efficiency by 20%') instead of just listing duties."
      ],
      matchedSkills: ["Python Programming", "React & Next.js", "SQL & Databases"],
      missingSkills: ["AWS Cloud Infrastructure", "Docker & Containerization", "CI/CD Pipelines"]
    },
    readiness
  };
}

// 3. Analyze resume PDF text and match against careers
export async function analyzeResumeText(resumeText: string, targetCareers: string[]) {
  const ai = await getAIService();
  if (ai.type === "mock") {
    return getMockResumeAnalysis(targetCareers);
  }

  const prompt = `
    You are a professional HR recruiter and CV analyst. Review the resume content:
    ${resumeText}

    Analyze this resume against the following targeted career options: ${targetCareers.join(", ")}.

    Format your response in this exact JSON structure:
    {
      "analysis": {
        "strengths": ["Highlight 1", "Highlight 2"],
        "weaknesses": ["Gap 1", "Gap 2"],
        "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
        "matchedSkills": ["Skill A", "Skill B"],
        "missingSkills": ["Skill C", "Skill D"]
      },
      "readiness": {
        "${targetCareers[0] || "Target Career"}": 65 // Readiness percentage as integer (0-100)
      }
    }
  `;

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Resume analysis failed. Returning mock.", err);
    return getMockResumeAnalysis(targetCareers);
  }
}

// 4. Interactive guidance chatbot
export async function generateChatResponse(
  chatHistory: Array<{ role: string; content: string }>,
  newMessage: string,
  context?: string
) {
  const ai = await getAIService();

  const formattedHistory = chatHistory
    .map(h => `${h.role === "user" ? "User" : "Advisor"}: ${h.content}`)
    .join("\n");

  const prompt = `
    You are the Master AI Career strategist orchestrating a team of specialized sub-agents:
    1. Career Expert Agent: Handles recommendations, transitions, salary progression, comparison.
    2. Learning Expert Agent: Handles study plans, weekly milestones, courseware mapping.
    3. Resume Expert Agent: Handles CV optimization, ATS keywords, bullet points.
    4. Interview Expert Agent: Handles mock interview guidance, answer structure, preparation.
    5. Skills Expert Agent: Handles competency gap analysis, beginner/advanced cataloging.

    Here is the student's profile context:
    ${context || "No profile context loaded."}
    
    Here is the previous conversation history:
    ${formattedHistory}

    User's new message: ${newMessage}

    You must analyze the user message and route the request to the most appropriate sub-agent. Formulate a rich, helpful, markdown-styled response as that agent. Include 2-3 suggested follow-up questions the user might ask.
    
    You MUST respond with a JSON object in this exact structure:
    {
      "agent": "Name of the routed sub-agent (e.g. Career Expert Agent, Learning Expert Agent, Resume Expert Agent, Interview Expert Agent, Skills Expert Agent)",
      "reply": "Markdown content reply of the expert sub-agent. Keep it comprehensive but concise (max 200 words). Include lists and bolding.",
      "followUps": ["Suggested question 1", "Suggested question 2"]
    }
  `;

  const getMockResponseJSON = (msg: string) => {
    const text = msg.toLowerCase().trim();
    
    let studentMajor = "";
    let studentGoals = "";
    if (context) {
      const majorMatch = context.match(/Major:\s*([^.]+)/);
      if (majorMatch && majorMatch[1]) studentMajor = majorMatch[1].trim();
      const goalsMatch = context.match(/Goals:\s*([^.]+)/);
      if (goalsMatch && goalsMatch[1]) studentGoals = goalsMatch[1].trim();
    }

    if (text === "hi" || text === "hello" || text === "hey" || text === "greetings") {
      return {
        agent: "Career Expert Agent",
        reply: `Hello! I am your lead **AI Career Strategy Agent**. I orchestrate our specialist sub-agents (Career, Learning, Resume, Interview, and Skills Experts) to guide you. ${
          studentMajor 
            ? `I see you have an academic background in **${studentMajor}**.` 
            : "I am ready to help you plan your career."
        }\n\nWhat role or technology target are you interested in discussing today?`,
        followUps: ["Plan my next learning step", "Review my resume score", "Start a mock interview session"]
      };
    }

    if (text.includes("how are you") || text.includes("who are you")) {
      return {
        agent: "Career Expert Agent",
        reply: `I am the master coordinator agent for the Career Advisor Ecosystem! ${
          studentGoals 
            ? `I'm keeping track of your goal to **${studentGoals}**.` 
            : ""
        } I route technical questions to our Learning Expert, resume reviews to our Resume Expert, and interviews to our Coach. Ask me anything to begin!`,
        followUps: ["Compare Cybersecurity vs AI", "Recommend a project to build"]
      };
    }
    
    if (text.includes("devops") || text.includes("docker") || text.includes("kubernetes") || text.includes("pipeline") || text.includes("cicd")) {
      return {
        agent: "Learning Expert Agent",
        reply: `For a **DevOps Engineer** path, focus on these core study tracks:\n* **Containerization**: Master **Docker** basics and how to write a Dockerfile.\n* **CI/CD Automation**: Use **GitHub Actions** to compile and test code automatically.\n* **Infrastructure as Code**: Learn **Terraform** to provision cloud servers.\n* **Orchestration**: Dive into **Kubernetes** concepts (Pods, Deployments) to manage scale.`,
        followUps: ["What Docker project should I build?", "Recommend DevOps certifications"]
      };
    }

    if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("figma") || text.includes("wireframe")) {
      return {
        agent: "Skills Expert Agent",
        reply: `To excel as a **UI/UX Designer**, target these verified competencies:\n* **Figma Masterclass**: Focus on variants, components, auto-layout, and interactive prototypes.\n* **User Research**: Conduct heuristic evaluations and build user persona maps.\n* **Grid Systems**: Apply vertical rhythm and responsive columns.\n* **Design-to-Code**: Build atomic design tokens for clean front-end handoff.`,
        followUps: ["List free UI design courses", "Suggest a capstone design project"]
      };
    }

    if (text.includes("ai") || text.includes("machine") || text.includes("deep") || text.includes("python") || text.includes("data") || text.includes("model")) {
      return {
        agent: "Learning Expert Agent",
        reply: `For **Data Science & AI** tracks, I recommend these milestones:\n* **Python Scripting**: NumPy arrays, Pandas analytics, and clean code principles.\n* **Machine Learning**: Learn supervised/unsupervised learning via **scikit-learn**.\n* **Deep Learning**: Train neural networks using **PyTorch** or TensorFlow.\n* **Data Pipelines**: Write advanced **SQL** queries and configure databases.`,
        followUps: ["Suggest an ML model to build", "What math should I study first?"]
      };
    }

    if (text.includes("resume") || text.includes("cv") || text.includes("ats")) {
      return {
        agent: "Resume Expert Agent",
        reply: `Improving your **ATS-friendly Resume** involves these critical edits:\n* **Quantify Impact**: Instead of just listing duties, use metrics (e.g. "improved loading speed by 35%").\n* **Single Column Format**: Avoid multi-column text tables or graphic charts that break parser engines.\n* **Keyword Alignment**: Include specific tools and libraries mentioned in your target job descriptions.\n* **Strong Action Verbs**: Begin bullets with words like *designed*, *orchestrated*, or *optimized*.`,
        followUps: ["Score my resume", "Optimize experience bullet points"]
      };
    }

    if (text.includes("interview") || text.includes("question") || text.includes("behavior") || text.includes("prep")) {
      return {
        agent: "Interview Expert Agent",
        reply: `Preparing for **Technical & Behavioral Interviews** requires these core habits:\n* **Whiteboard Architecture**: Explain system choices (e.g. load balancers, caching, DB replication).\n* **STAR framework**: Structure answers by outlining **S**ituation, **T**ask, **A**ction, and **R**esult.\n* **Algorithm Practice**: Focus on arrays, hashing, and dynamic programming.`,
        followUps: ["Start mock technical interview", "How do I answer behavioral questions?"]
      };
    }

    if (text.includes("react") || text.includes("frontend") || text.includes("js") || text.includes("css") || text.includes("web")) {
      return {
        agent: "Learning Expert Agent",
        reply: `To become a professional **Front-End Developer**, I suggest focusing on:\n* **TypeScript**: Enforce strict compile types inside React parameters.\n* **Tailwind CSS**: Build responsive design systems with minimal stylesheet code.\n* **Zustand**: Manage application state flows dynamically.\n* **Next.js**: Leverage Server Components for fast SEO renders.`,
        followUps: ["Show Next.js learning resources", "Suggest a frontend project"]
      };
    }

    return {
      agent: "Career Expert Agent",
      reply: `As your AI Advisor, I see you are exploring career steps${
        studentMajor ? ` related to **${studentMajor}**` : ""
      }.\n\nTo bridge your skills gap effectively:\n* **Define a specific role** (like Full Stack Developer or AI Engineer).\n* **Build 2-3 portfolio projects** showing your competence.\n* **Earn industry credentials** (such as AWS Cloud Practitioner).`,
      followUps: ["Compare careers", "Generate a study roadmap"]
    };
  };

  if (ai.type === "mock") {
    return JSON.stringify(getMockResponseJSON(newMessage));
  }

  try {
    const res = await ai.call(prompt, true);
    if (!res || res.trim().length === 0) throw new Error("Empty response");
    // Verify it is parseable JSON, otherwise wrap it
    JSON.parse(res);
    return res;
  } catch (err) {
    console.error("AI Chat failed. Returning mock fallback:", err);
    return JSON.stringify(getMockResponseJSON(newMessage));
  }
}

// 5. Generate AI Cover Letter
export async function generateAICoverLetter(jobTitle: string, companyName: string, jobDescription: string, userProfile: any) {
  const ai = await getAIService();
  const prompt = `You are a professional cover letter writer. Generate a cover letter for the job "${jobTitle}" at "${companyName}".
  Job Description: ${jobDescription}
  User details: Name: ${userProfile?.name || "Applicant"}, Skills: ${userProfile?.skills || "[]"}, Education: ${userProfile?.education || "N/A"}.
  Make it look extremely polished, professional, and tailored. Return only the cover letter content in markdown format.`;

  const mockLetter = `Dear Hiring Manager at ${companyName || "the Company"},\n\nI am writing to express my enthusiastic interest in the ${jobTitle || "Software Engineer"} position. With a solid foundation in technical problem-solving and application design, I am confident in my ability to contribute meaningfully to your team.\n\nMy background includes building projects, refining skills, and designing robust systems. In reviewing your job description, I noticed a strong emphasis on keywords related to:\n${jobDescription ? `* ${jobDescription.substring(0, 150)}...` : "* Collaborative application design\n* Core technology architecture"}\n\nMy academic background and technical projects align perfectly with these requirements. I am highly motivated to bring my skills to ${companyName || "your team"} and would welcome the opportunity to discuss my qualifications further in an interview.\n\nThank you for your time and consideration.\n\nSincerely,\n${userProfile?.name || "Alex Mercer"}`;

  if (ai.type === "mock") {
    return mockLetter;
  }

  try {
    const res = await ai.call(prompt, false);
    if (!res || res.trim().length === 0) throw new Error("Empty letter");
    return res;
  } catch (err) {
    console.error("Cover letter AI generation failed. Returning mock fallback:", err);
    return mockLetter;
  }
}

// 6. Analyze Resume Builder data and calculate score + feedback
export async function analyzeResumeBuilderData(resumeData: any) {
  const ai = await getAIService();
  const prompt = `
    You are an expert HR Resume Analyst. Evaluate the following resume fields:
    - Personal: ${JSON.stringify(resumeData.personalInfo)}
    - Experience: ${JSON.stringify(resumeData.experience)}
    - Education: ${JSON.stringify(resumeData.education)}
    - Projects: ${JSON.stringify(resumeData.projects)}
    - Skills: ${JSON.stringify(resumeData.skills)}

    Grade the resume out of 100. Detect missing sections or weak content, and recommend specific suggestions.
    You MUST respond with a JSON object in this exact structure:
    {
      "score": 85, // Integer between 0 and 100
      "missingSections": ["Certifications", "Summary"], // Array of strings
      "weakContent": ["Experience description is too short", "Add quantitative results"], // Array of strings
      "suggestions": ["Include metrics like % improvement", "Add relevant keywords for engineering roles"] // Array of strings
    }
  `;

  if (ai.type === "mock") {
    const hasExperience = resumeData.experience && JSON.parse(resumeData.experience || "[]").length > 0;
    const hasProjects = resumeData.projects && JSON.parse(resumeData.projects || "[]").length > 0;
    const score = 50 + (hasExperience ? 25 : 0) + (hasProjects ? 15 : 0) + (resumeData.personalInfo ? 10 : 0);
    return {
      score: score > 100 ? 100 : score,
      missingSections: hasExperience ? [] : ["Work Experience"],
      weakContent: hasProjects ? [] : ["Projects section lacks detailed bullet points"],
      suggestions: [
        "Quantify your accomplishments (e.g., 'Optimized query loading times by 40%').",
        "Add links to your public GitHub or portfolio files.",
        "Include technical keywords matching your target job specs."
      ]
    };
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("Resume analysis parsing failed. Returning mock.", err);
    return {
      score: 75,
      missingSections: ["Professional Summary"],
      weakContent: ["Descriptions are generic"],
      suggestions: ["Quantify accomplishments", "List tools used in projects"]
    };
  }
}

// 7. Generate career-specific interview questions
export async function generateInterviewQuestionsForCareer(careerTitle: string, mode: string) {
  const ai = await getAIService();
  const prompt = `
    You are an expert technical interviewer. Generate 5 career-specific questions for a candidate seeking a job as a: ${careerTitle}.
    Interview Mode: ${mode} (technical or behavioral)

    You MUST respond with a JSON object in this exact structure:
    {
      "questions": [
        "Question 1 description",
        "Question 2 description",
        "Question 3 description",
        "Question 4 description",
        "Question 5 description"
      ]
    }
  `;

  if (ai.type === "mock") {
    if (mode === "technical") {
      return {
        questions: [
          `How would you describe the main differences between relational databases and NoSQL systems when designing for a ${careerTitle} application?`,
          `Can you explain how you handle exception tracking, error logging, and performance bottlenecks in your code?`,
          `Describe a complex technical challenge you faced in a recent project and how you went about solving it.`,
          `What tools, testing libraries, and version control workflows do you prefer to use on a daily basis?`,
          `Explain a foundational concept essential to ${careerTitle} (e.g. data pipelines, threat analysis, components lifecycle) and how you implement it.`
        ]
      };
    } else {
      return {
        questions: [
          `Why are you interested in pursuing a career as a ${careerTitle}, and what steps have you taken to prepare yourself?`,
          `Describe a time when you had to work with a difficult team member or client. How did you resolve the conflict?`,
          `Tell me about a project that failed or didn't meet expectations. What did you learn from that experience?`,
          `How do you prioritize tasks and manage deadlines when working on multiple projects simultaneously?`,
          `Explain a situation where you had to adapt quickly to a major shift in project requirements or priorities.`
        ]
      };
    }
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Interview question generation failed. Returning mock.", err);
    return {
      questions: [
        "Tell me about yourself and your background.",
        "What are your key strengths and technical skills?",
        "Describe a time you solved a difficult problem.",
        "How do you handle team disagreements?",
        "Why do you want to join our organization?"
      ]
    };
  }
}

// 8. Evaluate mock interview answers
export async function evaluateInterviewSession(questionsAndAnswers: Array<{ question: string; answer: string }>) {
  const ai = await getAIService();
  const prompt = `
    You are a professional HR coach and technical interviewer. Review the following questions and answers from a mock interview:
    ${JSON.stringify(questionsAndAnswers)}

    Evaluate the candidate's answers. Provide feedback on clarity, technical accuracy, and confidence. Calculate an overall readiness score.
    You MUST respond with a JSON object in this exact structure:
    {
      "score": 78, // Overall score between 0 and 100
      "clarity": "Feedback on candidate's clarity of communication.",
      "technicalAccuracy": "Feedback on technical precision of answers.",
      "confidence": "Feedback on candidate's demonstrated confidence and presentation.",
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  `;

  if (ai.type === "mock") {
    // Generate intelligent feedback based on answer length
    const avgLength = questionsAndAnswers.reduce((sum, qa) => sum + (qa.answer || "").length, 0) / questionsAndAnswers.length;
    const baseScore = avgLength > 100 ? 82 : avgLength > 30 ? 70 : 55;

    return {
      score: baseScore,
      clarity: avgLength > 100 ? "Your communication is highly detailed and structured." : "Your answers are somewhat brief. Try expanding with additional context.",
      technicalAccuracy: "Good grasp of core terms. Incorporate more real-world technical tradeoffs to sound like an expert.",
      confidence: "Answers sound structured. Work on active examples to improve confidence levels.",
      recommendations: [
        "Utilize the STAR method (Situation, Task, Action, Result) for behavioral answers.",
        "Add more technical specifics or industry methodologies to reinforce technical accuracy."
      ]
    };
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Interview evaluation failed. Returning mock.", err);
    return {
      score: 72,
      clarity: "Communication is reasonable but could be more structured.",
      technicalAccuracy: "Basic understanding shown. Needs more technical depth.",
      confidence: "Demonstrated moderate confidence in explanations.",
      recommendations: ["Expand on your answers", "Mention frameworks and libraries by name"]
    };
  }
}

// 9. Generate personalized weekly/monthly planner schedule
export async function generatePlannerSchedule(careerTitle: string, duration: string, userBackground: string) {
  const ai = await getAIService();
  const prompt = `
    You are an expert technical program planner. Create a personalized learning plan to become a: ${careerTitle}.
    Plan Type: ${duration} (Weekly or Monthly)
    Candidate Background: ${userBackground}

    Generate exactly 4 tasks for this learning plan, each containing a title and a descriptive content.
    You MUST respond with a JSON object in this exact structure:
    {
      "tasks": [
        { "title": "Task 1 title", "content": "Task 1 description, target courses/books", "deadlineDays": 7 },
        { "title": "Task 2 title", "content": "Task 2 details and milestones", "deadlineDays": 14 },
        { "title": "Task 3 title", "content": "Task 3 details and recommended projects", "deadlineDays": 21 },
        { "title": "Task 4 title", "content": "Task 4 certification goals and final wraps", "deadlineDays": 28 }
      ]
    }
  `;

  const mockPlanner = () => {
    const multiplier = duration === "Weekly" ? 1 : 4;
    return {
      tasks: [
        {
          title: "Core Foundation Study",
          content: `Focus on programming fundamentals, core syntax, and tool installs matching the ${careerTitle} pathway.`,
          deadlineDays: 7 * multiplier
        },
        {
          title: "Practical Database & API Setup",
          content: "Learn to design database schemas, query indexes, and configure REST or GraphQL servers.",
          deadlineDays: 14 * multiplier
        },
        {
          title: "Intermediate Framework Project",
          content: "Build a web dashboard or utility tool integrating state manager libraries and responsive layouts.",
          deadlineDays: 21 * multiplier
        },
        {
          title: "Cloud Deployment & Final Review",
          content: "Deploy code on cloud serverless systems (e.g. Vercel, AWS EC2), configure tests, and test APIs.",
          deadlineDays: 28 * multiplier
        }
      ]
    };
  };

  if (ai.type === "mock") {
    return mockPlanner();
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Planner generation failed. Returning mock fallback:", err);
    return mockPlanner();
  }
}

// 10. Predict Career Success suitability
export async function predictCareerSuccessSuitability(profileData: any, assessmentAnswers: any, careerTitle: string) {
  const ai = await getAIService();
  const prompt = `
    You are an expert AI Career Success Predictor. Evaluate the suitability and success probability for a candidate targeting the career: ${careerTitle}.
    Profile Details:
    - Interests: ${JSON.stringify(profileData?.interests)}
    - Current Skills: ${JSON.stringify(profileData?.skills)}
    - Education: ${profileData?.education}
    - Goals: ${profileData?.goals}
    - Assessment Results: ${JSON.stringify(assessmentAnswers)}

    Respond with a JSON object indicating the suitability score (percentage 0-100) and detailed explanation.
    You MUST respond with a JSON object in this exact structure:
    {
      "score": 88, // Suitability score percentage
      "suitability": "High / Medium / Low",
      "explanation": "Detailed professional breakdown of why this candidate is suited for this career path, including strengths and potential bottlenecks."
    }
  `;

  const mockPredict = () => {
    let score = 70;
    const skills = profileData?.skills ? JSON.parse(profileData.skills) : [];
    if (skills.length > 3) score += 15;
    if (profileData?.education) score += 10;
    if (score > 98) score = 98;

    return {
      score,
      suitability: score > 80 ? "High" : score > 60 ? "Medium" : "Low",
      explanation: `Your alignment with ${careerTitle} is very strong. Your skills in ${skills.join(", ") || "various domains"} show a great technical match. One potential bottleneck might be gaining enterprise project experience, but completing intermediate roadmap projects will bridge this gap.`
    };
  };

  if (ai.type === "mock") {
    return mockPredict();
  }

  try {
    const rawRes = await ai.call(prompt, true);
    return JSON.parse(rawRes);
  } catch (err) {
    console.error("AI Success predictor failed. Returning mock fallback:", err);
    return mockPredict();
  }
}

