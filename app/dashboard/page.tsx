"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  getLatestAssessment,
  getSavedCareers,
  getUserProgressStats,
  getCareerSuccessPrediction,
} from "@/actions/assessment";
import { getProfile, getUserBadges } from "@/actions/auth";
import { getUserResumes } from "@/actions/resume";
import { getInterviewHistory } from "@/actions/interview";
import {
  Brain,
  Award,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Bookmark,
  Sparkles,
  ArrowRight,
  Flame,
  Gauge,
  LineChart as LineIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<any>(null);
  const [assessment, setAssessment] = React.useState<any>(null);
  const [savedCareers, setSavedCareers] = React.useState<any[]>([]);
  const [badges, setBadges] = React.useState<any[]>([]);
  const [progressStats, setProgressStats] = React.useState<any>({ progressList: [], completedCount: 0 });

  // Additional stats for Readiness Score
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [interviews, setInterviews] = React.useState<any[]>([]);

  // Success Predictor State
  const [predictingCareer, setPredictingCareer] = React.useState("");
  const [predicting, setPredicting] = React.useState(false);
  const [predictionResult, setPredictionResult] = React.useState<any>(null);

  const userId = session?.user ? (session.user as any).id : null;

  React.useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [
          profileRes,
          assessmentRes,
          savedRes,
          badgesRes,
          progressRes,
          resumesRes,
          interviewsRes,
        ] = await Promise.all([
          getProfile(userId),
          getLatestAssessment(userId),
          getSavedCareers(userId),
          getUserBadges(userId),
          getUserProgressStats(userId),
          getUserResumes(userId),
          getInterviewHistory(userId),
        ]);

        if (profileRes.success) setProfile(profileRes.profile);
        if (assessmentRes.success) setAssessment(assessmentRes.response);
        if (savedRes.success) setSavedCareers(savedRes.saved || []);
        if (badgesRes.success) setBadges(badgesRes.badges || []);
        if (progressRes.success) setProgressStats(progressRes);
        if (resumesRes.success) setResumes(resumesRes.resumes || []);
        if (interviewsRes.success) setInterviews(interviewsRes.history || []);
      } catch (err) {
        toast({
          title: "Dashboard Error",
          description: "Failed to load academic data metrics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, toast]);

  // Calculate overall Job Readiness Score out of 100
  const assessmentPoints = assessment ? 20 : 0;
  const resumePoints = resumes.length > 0 ? Math.min(resumes[0].score || 80, 100) * 0.35 : 0; // max 35 pts
  const progressPoints = progressStats.progressList?.length > 0 ? Math.min(progressStats.completedCount * 10, 20) : 0; // max 20 pts
  const interviewPoints = interviews.length > 0 ? Math.min(interviews[0].score || 70, 100) * 0.25 : 0; // max 25 pts
  const rawReadiness = Math.round(assessmentPoints + resumePoints + progressPoints + interviewPoints);
  const jobReadinessScore = Math.min(rawReadiness, 100) || 45; // Default mockup baseline if empty

  // Run Career Success Predictor
  const handlePredict = async () => {
    if (!predictingCareer) {
      toast({ description: "Please select a career role first.", variant: "warning" });
      return;
    }
    setPredicting(true);
    setPredictionResult(null);
    try {
      const res = await getCareerSuccessPrediction(userId, predictingCareer);
      if (res.success && res.prediction) {
        setPredictionResult(res.prediction);
        toast({ title: "Prediction Compiled", description: "Suitability probability aggregated.", variant: "success" });
      } else {
        toast({ description: res.error || "Failed to predict career success.", variant: "destructive" });
      }
    } catch (e) {
      toast({ description: "Connection error predicting suitability.", variant: "destructive" });
    } finally {
      setPredicting(false);
    }
  };

  // Mock readiness trend data over time (weekly updates)
  const trendData = [
    { name: "Week 1", score: Math.max(jobReadinessScore - 15, 20) },
    { name: "Week 2", score: Math.max(jobReadinessScore - 8, 30) },
    { name: "Week 3", score: Math.max(jobReadinessScore - 3, 35) },
    { name: "Week 4", score: jobReadinessScore },
  ];

  // Retrieve user skill count
  let userSkills: string[] = [];
  try {
    if (profile?.skills) {
      userSkills = JSON.parse(profile.skills);
    }
  } catch (e) {}

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading student console...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100">
        {/* Welcome Section with Streak */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Welcome back, {session?.user?.name || "Student"}!
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse-slow" />
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Analyze your readiness score, predict suitability, and progress your tech competencies.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-extrabold">
              <Flame className="h-4.5 w-4.5 animate-pulse" />
              <span>5-Day Streak 🔥</span>
            </div>
            <Link href="/assessment">
              <Button size="sm" className="font-bold">
                <ClipboardCheck className="h-4.5 w-4.5 mr-2" />
                {assessment ? "Retake Quiz" : "Take Quiz"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Job Readiness & Trend Chart */}
          <div className="lg:col-span-2 space-y-8 text-left">
            {/* Job Readiness Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card md:col-span-1 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="h-4.5 w-4.5 text-indigo-400" /> Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-5">
                  <div className="text-center py-2">
                    <h3 className="text-5xl font-black text-white">{jobReadinessScore}%</h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Job Ready Index</span>
                  </div>
                  <Progress value={jobReadinessScore} />
                </CardContent>
              </Card>

              {/* Weekly Trends Chart */}
              <Card className="glass-card md:col-span-2">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LineIcon className="h-4.5 w-4.5 text-indigo-400" /> Readiness Trend Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "rgba(255,255,255,0.05)",
                          borderRadius: "8px",
                          fontSize: "10px",
                        }}
                      />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorReadiness)" />
                      <defs>
                        <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Career Recommendations & Saved Careers */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-400" /> Recommended Careers
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-450">Calculated by AI based on your preference parameters</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment && assessment.result?.recommendations?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {assessment.result.recommendations.slice(0, 3).map((c: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-200/5 hover:border-indigo-500/20 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider">{c.category}</span>
                            <span className="text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold text-indigo-300">
                              {c.matchScore}% Match
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white mt-2 leading-tight">{c.title}</h4>
                          <p className="text-[10px] text-slate-450 mt-1.5 line-clamp-3 leading-relaxed">{c.reason}</p>
                        </div>
                        <Link href="/careers" className="mt-4 block">
                          <Button variant="outline" size="sm" className="w-full text-[10px] h-7 font-bold">
                            Compare Skills <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Brain className="h-8 w-8 text-slate-700 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">No AI recommendations computed.</p>
                      <p className="text-[10px] text-slate-500 mt-1">Submit your initial quiz assessment to generate matches.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course track tracker */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" /> Roadmap Learning Progress
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-450">Track coursework completion states</CardDescription>
                </div>
                <span className="text-xs font-bold text-slate-450">
                  {progressStats.completedCount}/{progressStats.progressList?.length || 0} Done
                </span>
              </CardHeader>
              <CardContent>
                {progressStats.progressList?.length > 0 ? (
                  <div className="space-y-3">
                    {progressStats.progressList.slice(0, 3).map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-200/5">
                        <div className="overflow-hidden flex-1 pr-4">
                          <p className="text-xs font-bold text-white truncate">{p.resource.title}</p>
                          <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Skill: {p.resource.skill.name}</span>
                        </div>
                        <Badge className={`font-bold text-[9px] ${p.completed ? "bg-emerald-500/10 text-emerald-450" : "bg-slate-900 text-slate-500"}`}>
                          {p.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No active coursework tracked yet. Bookmark a career roadmap to view suggested items!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Success Predictor & Streaks */}
          <div className="space-y-8 text-left">
            {/* AI Career Success Predictor */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" /> AI Success Predictor
                </CardTitle>
                <CardDescription className="text-xs text-slate-455">
                  Select a career role to forecast compatibility percentage and receive advice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <select
                    value={predictingCareer}
                    onChange={(e) => setPredictingCareer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Target Career...</option>
                    {savedCareers.map((sc) => (
                      <option key={sc.career.id} value={sc.career.title}>
                        {sc.career.title}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handlePredict} disabled={predicting} className="w-full font-bold shadow-indigo-500/10 text-xs py-2 h-9">
                    {predicting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" /> Forecasting...
                      </>
                    ) : (
                      "Calculate Success Probability"
                    )}
                  </Button>
                </div>

                {predictionResult && (
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Suitability Score</span>
                      <Badge className="text-xs font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300">
                        {predictionResult.score}% ({predictionResult.suitability})
                      </Badge>
                    </div>
                    <Progress value={predictionResult.score} />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-2">
                      {predictionResult.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badges Earned */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" /> Milestone Achievement Badges
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">Unlock milestones to win credentials</CardDescription>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {badges.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/60 border border-slate-200/5"
                        title={`${b.badge.name}: ${b.badge.description}`}
                      >
                        <div className="h-9 w-9 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-1.5 shadow">
                          <Award className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-[8px] font-bold text-slate-300 truncate w-full text-center">
                          {b.badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No badges earned. Complete your initial quiz assessment to win your first!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Skills list */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-400" /> Verified Competencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {userSkills.map((s, idx) => (
                      <Badge key={idx} variant="outline" className="text-[9px] font-bold py-0.5 bg-slate-950 border-slate-800">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No documented skills. Complete a resume audit scan or write experience Bullet points!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
