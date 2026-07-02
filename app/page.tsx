import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Sparkles,
  Map,
  FileSearch,
  MessageSquareCode,
  ArrowRight,
  TrendingUp,
  Brain,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col justify-between">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Aura Advisor
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block leading-none">
              AI Career Planner
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white font-semibold">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" className="font-semibold shadow-indigo-500/20">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center py-16 lg:py-24 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Career Intelligence</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          Navigate Your Career Path With{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-500 bg-clip-text text-transparent">
            Absolute Clarity
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Tailored career recommendations, interactive roadmaps, skills gap assessments, resume matching tools, and 24/7 AI-guided career chat. Designed specifically for students and graduates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center w-full max-w-md">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full flex items-center justify-center gap-2 font-bold group">
              Start Free Assessment
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full font-bold">
              Explore Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-10">
          <Card className="glass-card flex flex-col justify-between h-64 hover:scale-[1.03] duration-300">
            <CardContent className="p-6 flex flex-col h-full justify-between items-start text-left">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">AI Recommendations</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Evaluate interest quizzes, preferred styles, and goals to match matching careers instantly.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card flex flex-col justify-between h-64 hover:scale-[1.03] duration-300">
            <CardContent className="p-6 flex flex-col h-full justify-between items-start text-left">
              <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
                <Map className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Interactive Roadmaps</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  View structured beginner, intermediate, and advanced learning stages with projects and credentials.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card flex flex-col justify-between h-64 hover:scale-[1.03] duration-300">
            <CardContent className="p-6 flex flex-col h-full justify-between items-start text-left">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <FileSearch className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Resume Skill Gap</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Upload resumes to analyze strength/weakness gaps, matching keywords, and readiness scores.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card flex flex-col justify-between h-64 hover:scale-[1.03] duration-300">
            <CardContent className="p-6 flex flex-col h-full justify-between items-start text-left">
              <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-400">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">AI Career Advisor</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Chat with an advisor trained to suggest tech interview prep tips, resources, and career updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Showcase */}
        <div className="mt-24 border-t border-slate-200/10 w-full pt-16 flex flex-wrap justify-around gap-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-white flex items-center">
              12 <Compass className="h-6 w-6 text-indigo-400 ml-1.5" />
            </span>
            <span className="text-sm text-slate-400 mt-2 font-semibold">Specialized Tech Categories</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-white flex items-center">
              98% <TrendingUp className="h-6 w-6 text-violet-400 ml-1.5" />
            </span>
            <span className="text-sm text-slate-400 mt-2 font-semibold">Satisfaction Score</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-white flex items-center">
              100K+ <Sparkles className="h-6 w-6 text-pink-400 ml-1.5" />
            </span>
            <span className="text-sm text-slate-400 mt-2 font-semibold">AI Generated Roadmaps</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/10 py-6 text-center text-xs text-slate-500 bg-slate-950/40 backdrop-blur-md z-10 mt-16">
        <p>© {new Date().getFullYear()} Aura Advisor App. Built on Next.js 15, Prisma, and Gemini AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
