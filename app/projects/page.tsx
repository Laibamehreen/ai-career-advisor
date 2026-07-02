"use client";

import * as React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/constants";
import { getProjectRecommendations } from "@/actions/recommendations";
import { Briefcase, FolderGit, Clock, Award, Loader2, Sparkles } from "lucide-react";

export default function ProjectsPage() {
  const [loading, setLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<any[]>([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("All");

  React.useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const res = await getProjectRecommendations(selectedCategory, selectedDifficulty);
        if (res.success) {
          setProjects(res.projects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [selectedCategory, selectedDifficulty]);

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            Recommended Portfolio Projects
            <FolderGit className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build resume-worthy practical projects tailored to your target roles. Learn by building with step-by-step outcomes.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Career Path Sector</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Projects List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-450">Filtering portfolio recommenders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <Card key={proj.id} className="glass-card flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded">
                        {proj.careerPath}
                      </span>
                      <Badge
                        variant={
                          proj.difficulty === "Beginner"
                            ? "success"
                            : proj.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[9px] uppercase font-bold"
                      >
                        {proj.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
                      <FolderGit className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                      {proj.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1 line-clamp-3">
                      {proj.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {/* Tech Stack */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Technology Stack</span>
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.split(",").map((tech: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[9px] bg-slate-900 border-slate-800">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-200/5">
                      <span className="text-[9px] text-indigo-300 font-bold uppercase flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Learning Outcomes
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                        {proj.learningOutcomes}
                      </p>
                    </div>
                  </CardContent>
                  <div className="p-5 pt-0 border-t border-slate-200/5 flex items-center justify-between text-[10px] font-bold text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-550" />
                      Est. Duration: {proj.estHours} Hours
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Award className="h-3.5 w-3.5" />
                      100xp reward
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-24 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3">
                <Briefcase className="h-10 w-10 text-slate-700" />
                <div>
                  <p className="text-sm font-bold text-slate-400">No project guidelines found.</p>
                  <p className="text-xs text-slate-500 mt-1">Adjust filters or check admin panels to seed recommendations.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
