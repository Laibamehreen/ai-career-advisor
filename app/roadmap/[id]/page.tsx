"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrCreateRoadmap } from "@/actions/assessment";
import {
  Map,
  ArrowLeft,
  Calendar,
  Award,
  Terminal,
  MessageSquareCheck,
  Printer,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoadmapPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Unwrap parameters using React.use()
  const { id: careerId } = React.use(params);

  const [loading, setLoading] = React.useState(true);
  const [roadmap, setRoadmap] = React.useState<any>(null);

  const userId = session?.user ? (session.user as any).id : null;

  React.useEffect(() => {
    if (!userId || !careerId) return;

    const loadRoadmap = async () => {
      setLoading(true);
      try {
        const res = await getOrCreateRoadmap(userId, careerId);
        if (res.success) {
          setRoadmap(res.roadmap);
        } else {
          toast({
            title: "Roadmap Generation Failed",
            description: res.error || "Could not analyze career stages.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Connection Error",
          description: "Failed to connect to the advisor engine.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [userId, careerId, toast]);

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="p-4 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl animate-spin shadow-lg shadow-indigo-500/20">
            <Loader2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Assembling Step-by-Step AI Roadmap...</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Evaluating staging difficulty, mapping project challenges, and selecting best certifications.
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!roadmap) {
    return (
      <DashboardShell>
        <div className="py-16 text-center space-y-4">
          <p className="text-slate-400 text-sm">Failed to generate or load career roadmap.</p>
          <Link href="/careers">
            <Button variant="outline" size="sm">
              Back to Careers
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const { stages } = roadmap;

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 print:text-black print:bg-white print:p-0">
        {/* Navigation / Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/10 dark:border-slate-800/60 pb-6 print:hidden">
          <Link
            href="/careers"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Careers
          </Link>

          <Button onClick={handleExportPDF} className="font-bold flex items-center gap-2">
            <Printer className="h-4.5 w-4.5" />
            Export as PDF / Print
          </Button>
        </div>

        {/* Roadmap Title Card */}
        <Card className="glass-card border-indigo-500/10 print:border-none print:shadow-none print:bg-transparent">
          <CardContent className="p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl text-white shadow-md shadow-indigo-500/20">
                <Map className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  {roadmap.career?.category || "Technology Path"}
                </span>
                <CardTitle className="text-2xl font-extrabold text-white print:text-black mt-1 leading-none">
                  {roadmap.career?.title || "Career Roadmap"}
                </CardTitle>
                <p className="text-slate-400 print:text-slate-600 text-xs mt-2 leading-relaxed max-w-xl">
                  {roadmap.career?.description ||
                    "Structured developmental guide loaded with project instructions and certification timelines."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Simulator Dashboard (Print Hidden) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left print:hidden">
          {/* Journey Metrics Card */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-indigo-400" /> Journey Estimates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-5 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Estimated Duration</span>
                <p className="text-sm font-extrabold text-white">12 Months (Beginner to Job-Ready)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Average Difficulty</span>
                <p className="text-sm font-extrabold text-indigo-400">Intermediate to Advanced</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Market Demand Index</span>
                <p className="text-sm font-extrabold text-emerald-450">{roadmap.career?.jobDemand || "High"} Demand</p>
              </div>
            </CardContent>
          </Card>

          {/* Salary Progression Recharts Card */}
          <Card className="glass-card col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" /> Career Salary Progression ($k / Year)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-32 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { level: "Entry", salary: 75 },
                  { level: "Mid-tier", salary: 110 },
                  { level: "Senior", salary: 145 },
                  { level: "Lead", salary: 180 }
                ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="level" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="salary" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Flow Layout */}
        <div className="grid grid-cols-1 gap-8 relative mt-10 print:mt-4">
          {/* Vertical Connecting Line (visual only) */}
          <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-pink-500 opacity-25 hidden sm:block print:hidden" />

          {/* STAGE 1: BEGINNER */}
          {stages.beginner && (
            <div className="flex flex-col sm:flex-row gap-6 items-start text-left relative">
              <div className="h-16 w-16 bg-slate-900 border-2 border-indigo-500 text-indigo-400 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0 z-10 print:h-8 print:w-8 print:text-sm">
                01
              </div>
              <Card className="glass-card flex-1 p-6 border-indigo-500/10 print:border-none print:shadow-none print:bg-transparent">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white print:text-black leading-none">
                      {stages.beginner.title || "Beginner Stage"}
                    </h3>
                    <span className="text-[10px] text-indigo-400 font-bold block mt-1">Foundation Level</span>
                  </div>
                  <Badge className="font-bold flex items-center gap-1 bg-indigo-500/10 text-indigo-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {stages.beginner.timeline || "1-3 Months"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed mb-4">
                  {stages.beginner.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/5">
                  {/* Projects */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-indigo-400" />
                      Build Project Challenge
                    </h4>
                    {stages.beginner.projects?.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-200/5 print:bg-slate-100">
                        <p className="text-xs font-bold text-white print:text-black">{proj.name}</p>
                        <p className="text-[11px] text-slate-400 print:text-slate-500 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-indigo-400" />
                      Target Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stages.beginner.certifications?.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-1 bg-slate-900/60 print:bg-slate-100">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STAGE 2: INTERMEDIATE */}
          {stages.intermediate && (
            <div className="flex flex-col sm:flex-row gap-6 items-start text-left relative">
              <div className="h-16 w-16 bg-slate-900 border-2 border-violet-500 text-violet-400 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0 z-10 print:h-8 print:w-8 print:text-sm">
                02
              </div>
              <Card className="glass-card flex-1 p-6 border-violet-500/10 print:border-none print:shadow-none print:bg-transparent">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white print:text-black leading-none">
                      {stages.intermediate.title || "Intermediate Stage"}
                    </h3>
                    <span className="text-[10px] text-violet-400 font-bold block mt-1">Skill Application</span>
                  </div>
                  <Badge className="font-bold flex items-center gap-1 bg-violet-500/10 text-violet-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {stages.intermediate.timeline || "3-6 Months"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed mb-4">
                  {stages.intermediate.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/5">
                  {/* Projects */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-violet-400" />
                      Build Project Challenge
                    </h4>
                    {stages.intermediate.projects?.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-200/5 print:bg-slate-100">
                        <p className="text-xs font-bold text-white print:text-black">{proj.name}</p>
                        <p className="text-[11px] text-slate-400 print:text-slate-500 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-violet-400" />
                      Target Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stages.intermediate.certifications?.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-1 bg-slate-900/60 print:bg-slate-100">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STAGE 3: ADVANCED */}
          {stages.advanced && (
            <div className="flex flex-col sm:flex-row gap-6 items-start text-left relative">
              <div className="h-16 w-16 bg-slate-900 border-2 border-pink-500 text-pink-400 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0 z-10 print:h-8 print:w-8 print:text-sm">
                03
              </div>
              <Card className="glass-card flex-1 p-6 border-pink-500/10 print:border-none print:shadow-none print:bg-transparent">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white print:text-black leading-none">
                      {stages.advanced.title || "Advanced Stage"}
                    </h3>
                    <span className="text-[10px] text-pink-400 font-bold block mt-1">Specialization & Interview Prep</span>
                  </div>
                  <Badge className="font-bold flex items-center gap-1 bg-pink-500/10 text-pink-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {stages.advanced.timeline || "6-12 Months"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed mb-4">
                  {stages.advanced.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/5 mb-4">
                  {/* Projects */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-pink-400" />
                      Build Project Challenge
                    </h4>
                    {stages.advanced.projects?.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-200/5 print:bg-slate-100">
                        <p className="text-xs font-bold text-white print:text-black">{proj.name}</p>
                        <p className="text-[11px] text-slate-400 print:text-slate-500 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-pink-400" />
                      Target Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stages.advanced.certifications?.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-1 bg-slate-900/60 print:bg-slate-100">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Interview Prep */}
                {stages.advanced.interviewPrep && (
                  <div className="pt-4 border-t border-slate-200/5 space-y-3">
                    <h4 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquareCheck className="h-4.5 w-4.5 text-pink-400" />
                      Interview Preparation Guidance
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 print:text-slate-600 leading-relaxed">
                      {stages.advanced.interviewPrep.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
