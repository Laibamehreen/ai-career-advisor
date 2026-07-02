"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getAllCareersWithSkills,
  toggleSavedCareer,
  getSavedCareers,
  toggleLearningResource,
  getUserProgressStats,
} from "@/actions/assessment";
import { getProfile } from "@/actions/auth";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Scale,
  Map,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
  Award,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend } from "recharts";

export default function CareersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  
  // Database data
  const [careers, setCareers] = React.useState<any[]>([]);
  const [savedCareerIds, setSavedCareerIds] = React.useState<string[]>([]);
  const [completedResourceIds, setCompletedResourceIds] = React.useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  // Comparison State
  const [compareA, setCompareA] = React.useState("");
  const [compareB, setCompareB] = React.useState("");

  // Skills Gap Analyzer state
  const [profile, setProfile] = React.useState<any>(null);
  const [selectedGapCareerId, setSelectedGapCareerId] = React.useState("");

  const userId = session?.user ? (session.user as any).id : null;

  const categories = [
    "All",
    "Data Science",
    "Artificial Intelligence",
    "Software Engineering",
    "Cybersecurity",
    "Cloud Computing",
    "UI/UX Design",
    "Product Management",
    "Digital Marketing",
    "DevOps",
    "Mobile Development",
    "Game Development",
    "Business Analytics",
  ];

  const loadData = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [careersRes, savedRes, progressRes, profileRes] = await Promise.all([
        getAllCareersWithSkills(),
        getSavedCareers(userId),
        getUserProgressStats(userId),
        getProfile(userId),
      ]);

      if (careersRes.success) {
        setCareers(careersRes.careers || []);
        if (careersRes.careers && careersRes.careers.length > 0) {
          setSelectedGapCareerId(careersRes.careers[0].id);
        }
      }
      if (savedRes.success) {
        setSavedCareerIds(savedRes.saved?.map((sc: any) => sc.careerId) || []);
      }
      if (progressRes.success) {
        setCompletedResourceIds(
          progressRes.progressList?.filter((p: any) => p.completed).map((p: any) => p.resourceId) || []
        );
      }
      if (profileRes.success) {
        setProfile(profileRes.profile);
      }
    } catch (err) {
      toast({
        title: "Load Error",
        description: "Failed to query careers database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSave = async (careerId: string, careerTitle: string) => {
    try {
      const res = await toggleSavedCareer(userId, careerId);
      if (res.success) {
        if (res.saved) {
          setSavedCareerIds((prev) => [...prev, careerId]);
          toast({
            title: "Path Saved",
            description: `Successfully bookmarked ${careerTitle} to your workspace.`,
            variant: "success",
          });
        } else {
          setSavedCareerIds((prev) => prev.filter((id) => id !== careerId));
          toast({ description: `Removed ${careerTitle} from bookmarks.` });
        }
      }
    } catch (err) {
      toast({ description: "Could not toggle bookmark. Try again." });
    }
  };

  const handleToggleResource = async (resourceId: string, resourceTitle: string) => {
    try {
      const res = await toggleLearningResource(userId, resourceId);
      if (res.success) {
        if (res.completed) {
          setCompletedResourceIds((prev) => [...prev, resourceId]);
          toast({
            title: "Task Complete!",
            description: `Marked "${resourceTitle}" as complete.`,
            variant: "success",
          });
        } else {
          setCompletedResourceIds((prev) => prev.filter((id) => id !== resourceId));
          toast({ description: `Marked "${resourceTitle}" as active.` });
        }
      }
    } catch (err) {
      toast({ description: "Could not update task status." });
    }
  };

  // Filter Careers
  const filteredCareers = careers.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get compared objects
  const careerA = careers.find((c) => c.id === compareA);
  const careerB = careers.find((c) => c.id === compareB);

  // Skills Gap computations
  const gapCareer = careers.find((c) => c.id === selectedGapCareerId);
  const userSkillsList: string[] = [];
  try {
    if (profile?.skills) {
      const parsed = JSON.parse(profile.skills);
      if (Array.isArray(parsed)) {
        userSkillsList.push(...parsed);
      }
    }
  } catch (e) {}

  const requiredSkills = gapCareer?.skills?.map((cs: any) => cs.skill.name) || [];
  const matchingSkills = requiredSkills.filter((s: string) =>
    userSkillsList.some((us: string) => us.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s: string) => !userSkillsList.some((us: string) => us.toLowerCase() === s.toLowerCase())
  );

  const gapChartData = (gapCareer?.skills || []).map((cs: any) => {
    const hasSkill = userSkillsList.some((us: string) => us.toLowerCase() === cs.skill.name.toLowerCase());
    return {
      name: cs.skill.name,
      Status: hasSkill ? 100 : 10,
    };
  });

  // Extract all distinct learning resources from filtered careers for direct catalog viewing
  const skillLearningMap: Record<string, { skillName: string; resources: any[] }> = {};
  careers.forEach((c) => {
    c.skills.forEach((cs: any) => {
      const skillName = cs.skill.name;
      if (!skillLearningMap[skillName]) {
        skillLearningMap[skillName] = {
          skillName,
          resources: cs.skill.learningResources || [],
        };
      }
    });
  });

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            Explore Tech Careers
            <TrendingUp className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Search categories, compare salary distributions, explore skill maps, and mark off certification coursework.
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="explore">Explore Library</TabsTrigger>
            <TabsTrigger value="compare">Career Comparison</TabsTrigger>
            <TabsTrigger value="gap">Skills Gap Analyzer</TabsTrigger>
            <TabsTrigger value="learning">Learning Catalog</TabsTrigger>
          </TabsList>

          {/* TAB 1: EXPLORE LIBRARY */}
          <TabsContent value="explore" className="space-y-6">
            {/* Search & Category Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                <Input
                  placeholder="Search careers, descriptions, or requirements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="md:w-64">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-slate-400">Loading careers database...</p>
              </div>
            ) : filteredCareers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCareers.map((c) => {
                  const isSaved = savedCareerIds.includes(c.id);
                  return (
                    <Card key={c.id} className="glass-card hover:-translate-y-1 duration-300 flex flex-col justify-between h-full">
                      <CardHeader className="text-left pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                            {c.category}
                          </span>
                          <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold text-indigo-300">
                            Rating: {c.overallScore}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold text-white mt-2">{c.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 text-left">
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>

                        <div className="border-t border-slate-200/5 pt-3 space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Salary Range:</span>
                            <span className="text-emerald-400">{c.salaryRange}</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Market Demand:</span>
                            <span className="text-amber-400">{c.jobDemand}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider mb-1.5">
                            Required Tech Stack:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {c.skills?.map((cs: any) => (
                              <Badge
                                key={cs.id}
                                variant={cs.importance === "Core" ? "default" : "secondary"}
                                className="text-[9px] px-2 py-0"
                              >
                                {cs.skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 gap-2 border-t border-slate-200/5 mt-4">
                        <Button
                          variant={isSaved ? "secondary" : "outline"}
                          size="sm"
                          className="flex-1 font-bold text-xs"
                          onClick={() => handleToggleSave(c.id, c.title)}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 mr-1 text-indigo-400" />
                              Bookmarked
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4 mr-1" />
                              Bookmark
                            </>
                          )}
                        </Button>
                        <Link href={`/roadmap/${c.id}`} className="flex-1">
                          <Button size="sm" className="w-full text-xs font-bold">
                            <Map className="h-4 w-4 mr-1.5" />
                            Roadmap
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">
                No matching tech careers found. Try adjusting your search keywords.
              </div>
            )}
          </TabsContent>

          {/* TAB 2: CAREER COMPARISON */}
          <TabsContent value="compare" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <Scale className="h-5 w-5 text-indigo-400" />
                  Side-by-Side Comparison
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select two career paths from the picker dropdowns to compare required skills, salaries, and growth metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Path A</label>
                    <Select value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                      <option value="">Select Path A...</option>
                      {careers.map((c) => (
                        <option key={c.id} value={c.id} disabled={c.id === compareB}>
                          {c.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Path B</label>
                    <Select value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                      <option value="">Select Path B...</option>
                      {careers.map((c) => (
                        <option key={c.id} value={c.id} disabled={c.id === compareA}>
                          {c.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Comparison Grid */}
                {careerA && careerB ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200/10 pt-6 text-left">
                    {/* Career A Detail */}
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {careerA.category}
                        </span>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full">
                          Score: {careerA.overallScore}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white">{careerA.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{careerA.description}</p>
                      
                      <div className="space-y-2 border-t border-slate-200/5 pt-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Salary Expectations:</span>
                          <span className="text-emerald-400">{careerA.salaryRange}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Job Demand:</span>
                          <span className="text-amber-400">{careerA.jobDemand}</span>
                        </div>
                        <div className="flex flex-col text-xs gap-1 mt-2">
                          <span className="text-slate-500 font-bold">Growth Opportunities:</span>
                          <span className="text-slate-300 leading-relaxed">{careerA.growthOpportunities}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-200/5 pt-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Skills Mapped:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {careerA.skills?.map((cs: any) => (
                            <Badge key={cs.id} className="text-[9px]">
                              {cs.skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Career B Detail */}
                    <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                          {careerB.category}
                        </span>
                        <span className="text-xs font-bold bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded-full">
                          Score: {careerB.overallScore}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white">{careerB.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{careerB.description}</p>
                      
                      <div className="space-y-2 border-t border-slate-200/5 pt-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Salary Expectations:</span>
                          <span className="text-emerald-400">{careerB.salaryRange}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Job Demand:</span>
                          <span className="text-amber-400">{careerB.jobDemand}</span>
                        </div>
                        <div className="flex flex-col text-xs gap-1 mt-2">
                          <span className="text-slate-500 font-bold">Growth Opportunities:</span>
                          <span className="text-slate-300 leading-relaxed">{careerB.growthOpportunities}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-200/5 pt-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Skills Mapped:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {careerB.skills?.map((cs: any) => (
                            <Badge key={cs.id} className="text-[9px]">
                              {cs.skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Select two career paths above to generate a side-by-side comparison summary.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: SKILLS GAP ANALYZER */}
          <TabsContent value="gap" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <AlertCircle className="h-5 w-5 text-indigo-400" />
                  Skills Gap Analyzer
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select a career path to analyze missing competencies, view a checklist breakdown, and see customized coursework suggestions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector */}
                <div className="max-w-xs text-left space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Career Path</label>
                  <select
                    value={selectedGapCareerId}
                    onChange={(e) => setSelectedGapCareerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {gapCareer ? (
                  <div className="space-y-8 border-t border-slate-800/80 pt-6 text-left animate-fade-in">
                    {/* Overall Match Score Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Skills Match Score</span>
                        <h3 className="text-4xl font-extrabold text-indigo-455 mt-2">
                          {requiredSkills.length > 0 ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : 0}%
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">
                          You have {matchingSkills.length} of {requiredSkills.length} required skills
                        </p>
                      </div>

                      {/* Bar chart representing skills match status */}
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 md:col-span-2 h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={gapChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={8} tickLine={false} />
                            <ChartTooltip />
                            <Bar dataKey="Status" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Skill Lists (Matching & Missing categorized) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Matching Skills */}
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-450" /> Mapped Competencies ({matchingSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingSkills.length > 0 ? (
                            matchingSkills.map((s: string, idx: number) => (
                              <Badge key={idx} variant="success" className="text-[10px] bg-emerald-500/10 text-emerald-400">
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No matching skills found in your profile.</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills by Category */}
                      <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="h-4.5 w-4.5 text-rose-400" /> Missing Competencies ({missingSkills.length})
                        </h4>
                        
                        {missingSkills.length > 0 ? (
                          <div className="space-y-3">
                            {/* Beginner Missing */}
                            {missingSkills.filter((s: string) => {
                              const sl = s.toLowerCase();
                              return sl.includes("html") || sl.includes("css") || sl.includes("git") || sl.includes("javascript") || sl.includes("python") || sl.includes("sql") || sl.includes("design");
                            }).length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Beginner Level:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {missingSkills.filter((s: string) => {
                                    const sl = s.toLowerCase();
                                    return sl.includes("html") || sl.includes("css") || sl.includes("git") || sl.includes("javascript") || sl.includes("python") || sl.includes("sql") || sl.includes("design");
                                  }).map((s: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[9px] bg-slate-900 text-rose-350 border-rose-900/40">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Advanced Missing */}
                            {missingSkills.filter((s: string) => {
                              const sl = s.toLowerCase();
                              return sl.includes("machine") || sl.includes("neural") || sl.includes("k8s") || sl.includes("kubernetes") || sl.includes("cloud") || sl.includes("security") || sl.includes("crypto") || sl.includes("system") || sl.includes("architecture");
                            }).length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Advanced Level:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {missingSkills.filter((s: string) => {
                                    const sl = s.toLowerCase();
                                    return sl.includes("machine") || sl.includes("neural") || sl.includes("k8s") || sl.includes("kubernetes") || sl.includes("cloud") || sl.includes("security") || sl.includes("crypto") || sl.includes("system") || sl.includes("architecture");
                                  }).map((s: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[9px] bg-slate-900 text-rose-350 border-rose-900/40">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Intermediate Missing (the rest) */}
                            {missingSkills.filter((s: string) => {
                              const sl = s.toLowerCase();
                              const isBeginner = sl.includes("html") || sl.includes("css") || sl.includes("git") || sl.includes("javascript") || sl.includes("python") || sl.includes("sql") || sl.includes("design");
                              const isAdvanced = sl.includes("machine") || sl.includes("neural") || sl.includes("k8s") || sl.includes("kubernetes") || sl.includes("cloud") || sl.includes("security") || sl.includes("crypto") || sl.includes("system") || sl.includes("architecture");
                              return !isBeginner && !isAdvanced;
                            }).length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Intermediate Level:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {missingSkills.filter((s: string) => {
                                    const sl = s.toLowerCase();
                                    const isBeginner = sl.includes("html") || sl.includes("css") || sl.includes("git") || sl.includes("javascript") || sl.includes("python") || sl.includes("sql") || sl.includes("design");
                                    const isAdvanced = sl.includes("machine") || sl.includes("neural") || sl.includes("k8s") || sl.includes("kubernetes") || sl.includes("cloud") || sl.includes("security") || sl.includes("crypto") || sl.includes("system") || sl.includes("architecture");
                                    return !isBeginner && !isAdvanced;
                                  }).map((s: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[9px] bg-slate-900 text-rose-350 border-rose-900/40">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-450 block font-bold">Excellent! You satisfy all verified competency mappings.</span>
                        )}
                      </div>
                    </div>

                    {/* Learning Recommendations */}
                    {missingSkills.length > 0 && (
                      <div className="space-y-4 border-t border-slate-800/80 pt-6">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4.5 w-4.5 text-indigo-400" /> AI Personalized Learning Recommendations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {gapCareer.skills
                            .filter((cs: any) => missingSkills.includes(cs.skill.name))
                            .flatMap((cs: any) => cs.skill.learningResources || [])
                            .slice(0, 4)
                            .map((res: any) => {
                              const isCompleted = completedResourceIds.includes(res.id);
                              return (
                                <div key={res.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 flex items-start justify-between gap-4">
                                  <div className="space-y-2 overflow-hidden flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge className="text-[8px] font-bold py-0">{res.type}</Badge>
                                      <span className="text-[10px] text-slate-500 font-semibold">Difficulty: {res.difficulty}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{res.description}</p>
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-400 font-bold inline-flex items-center hover:underline pt-1">
                                      Platform Link <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                  <button
                                    onClick={() => handleToggleResource(res.id, res.title)}
                                    className={`flex-shrink-0 p-2 rounded-xl border transition-colors cursor-pointer ${
                                      isCompleted
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-450"
                                        : "bg-slate-900 border-slate-855 text-slate-500"
                                    }`}
                                  >
                                    <CheckCircle className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LEARNING CATALOG */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {Object.values(skillLearningMap).map((skillGroup: any) => {
                if (skillGroup.resources?.length === 0) return null;
                return (
                  <Card key={skillGroup.skillName} className="glass-card">
                    <CardHeader className="text-left pb-2">
                      <CardTitle className="text-base font-bold text-white">
                        Skill: {skillGroup.skillName}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Recommended educational references for this competence category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skillGroup.resources.map((res: any) => {
                          const isCompleted = completedResourceIds.includes(res.id);
                          return (
                            <div
                              key={res.id}
                              className="p-4 rounded-xl bg-slate-900/60 border border-slate-200/5 hover:border-slate-800 flex items-start justify-between gap-4 text-left"
                            >
                              <div className="space-y-2 overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <Badge className="text-[8px] font-bold py-0">{res.type}</Badge>
                                  <span className="text-[10px] text-slate-500 font-semibold">
                                    Difficulty: {res.difficulty}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white leading-snug truncate">
                                  {res.title}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                  {res.description}
                                </p>
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-400 font-bold inline-flex items-center hover:underline pt-1"
                                >
                                  Go to Platform
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                              <button
                                onClick={() => handleToggleResource(res.id, res.title)}
                                className={`flex-shrink-0 p-2 rounded-xl border transition-colors cursor-pointer ${
                                  isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-slate-950 border-slate-200/10 hover:border-slate-800 text-slate-500 hover:text-slate-300"
                                }`}
                                title={isCompleted ? "Mark Incomplete" : "Mark Completed"}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
