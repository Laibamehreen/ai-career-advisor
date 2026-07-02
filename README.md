# Aura Advisor - AI Career Advisor Web Application

A complete full-stack career advisor and roadmap planner built using **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma**, **NextAuth**, and **OpenAI/Gemini APIs**.

---

## Key Features
- **Secure Authentication**: Credentials login/signup with NextAuth. Role-based routes (Regular user and Admin panel support).
- **AI Recommendation Engine**: Takes career quiz assessments, evaluates interest categories, and recommends matching pathways.
- **Skills Gap Tracker**: Matches current user competencies with career requirements.
- **Dynamic Roadmaps**: Stages beginner, intermediate, and advanced tasks, projects, credentials, and guides with PDF prints.
- **CV Resume Analyzer**: Scan strengths and weaknesses of CVs, mapping job readiness percentages.
- **Personalized Chat Advisor**: 24/7 AI-guided career chat workspace with quick start question suggestions.
- **Admin Dashboard**: View analytics charts (popular careers, completions trends) using Recharts.

---

## Technology Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: Prisma ORM with SQLite (instant zero-setup) and switchable PostgreSQL support
- **Auth**: NextAuth.js
- **State Management**: Zustand
- **Validations**: Zod
- **Visuals**: Recharts and Lucide Icons

---

## Setup & Running Locally

Follow these quick commands inside this directory to get started:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Keys (Optional)
Open the `.env` file and insert your API keys for Gemini or OpenAI:
```env
GEMINI_API_KEY="your-gemini-api-key"
# OR
OPENAI_API_KEY="your-openai-api-key"
```
*Note: If no API key is specified, the application will automatically fall back to a high-fidelity visual mock simulator so you can test all features and routes without setup!*

### 3. Synchronize Database & Generate Clients
This command builds the local SQLite database file and sets up Prisma Client:
```bash
npx prisma db push
```

### 4. Seed Database
Seed the application with 12 tech categories, initial courses, badges, and demo users:
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials
- **Student User**: `student@careeradvisor.com` / Password: `student123`
- **Administrator**: `admin@careeradvisor.com` / Password: `admin123`
