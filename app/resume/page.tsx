"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  uploadAndAnalyzeResume,
  getLatestResumeAnalysis,
  saveUserResume,
  getUserResumes,
  deleteResume,
  generateResumeFromProfileData,
} from "@/actions/resume";
import { getAllCareersWithSkills } from "@/actions/assessment";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  ChevronLeft,
  Wand2,
} from "lucide-react";

export default function ResumePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState("builder");
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [loadingCareers, setLoadingCareers] = React.useState(true);
  const [submittingAnalyzer, setSubmittingAnalyzer] = React.useState(false);
  const [submittingBuilder, setSubmittingBuilder] = React.useState(false);

  // Data state
  const [careersList, setCareersList] = React.useState<any[]>([]);
  const [savedResumes, setSavedResumes] = React.useState<any[]>([]);
  const [selectedCareers, setSelectedCareers] = React.useState<string[]>([]);
  const [analyzerText, setAnalyzerText] = React.useState("");
  const [analyzerResult, setAnalyzerResult] = React.useState<any>(null);

  // Resume Builder Multi-Step State
  const [builderStep, setBuilderStep] = React.useState(1);
  const [resumeId, setResumeId] = React.useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = React.useState("My AI Career Resume");
  const [resumeTemplate, setResumeTemplate] = React.useState("professional");

  const [personalInfo, setPersonalInfo] = React.useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    summary: "",
  });

  const [experience, setExperience] = React.useState<any[]>([
    { role: "", company: "", duration: "", description: "" },
  ]);

  const [projects, setProjects] = React.useState<any[]>([
    { name: "", stack: "", description: "" },
  ]);

  const [education, setEducation] = React.useState<any[]>([
    { degree: "", school: "", duration: "" },
  ]);

  const [skillsText, setSkillsText] = React.useState("");
  const [builderScore, setBuilderScore] = React.useState(0);
  const [builderFeedback, setBuilderFeedback] = React.useState<any>(null);

  const userId = session?.user ? (session.user as any).id : null;

  // 1. Load Initial Data
  const loadInitialData = React.useCallback(async () => {
    if (!userId) return;
    setLoadingHistory(true);
    setLoadingCareers(true);
    try {
      const [careersRes, latestRes, resumesRes] = await Promise.all([
        getAllCareersWithSkills(),
        getLatestResumeAnalysis(userId),
        getUserResumes(userId),
      ]);

      if (careersRes.success) {
        setCareersList(careersRes.careers || []);
      }
      if (latestRes.success && latestRes.analysis) {
        setAnalyzerResult(latestRes.analysis);
        setAnalyzerText(latestRes.analysis.resumeText || "");
      }
      if (resumesRes.success && resumesRes.resumes && resumesRes.resumes.length > 0) {
        setSavedResumes(resumesRes.resumes);
        // Load the first saved resume into builder
        const latestResume = resumesRes.resumes[0];
        loadResumeIntoForm(latestResume);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
      setLoadingCareers(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadResumeIntoForm = (res: any) => {
    setResumeId(res.id);
    setResumeTitle(res.title);
    setResumeTemplate(res.template);
    try {
      setPersonalInfo(JSON.parse(res.personalInfo));
      setExperience(JSON.parse(res.experience));
      setProjects(JSON.parse(res.projects));
      setEducation(JSON.parse(res.education));
      const parsedSkills = JSON.parse(res.skills);
      setSkillsText(Array.isArray(parsedSkills) ? parsedSkills.join(", ") : "");
      setBuilderScore(res.score);
      setBuilderFeedback(res.feedback);
    } catch (e) {
      console.error("Parse saved resume error:", e);
    }
  };

  // Add/Remove dynamic inputs
  const addExperience = () => {
    setExperience([...experience, { role: "", company: "", duration: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  const addProject = () => {
    setProjects([...projects, { name: "", stack: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", school: "", duration: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  // Auto generate from Profile
  const handleAutogenFromProfile = async () => {
    if (!userId) return;
    setSubmittingBuilder(true);
    try {
      const res = await generateResumeFromProfileData(userId);
      if (res.success && res.resume) {
        loadResumeIntoForm(res.resume);
        toast({
          title: "AI Resume Pre-populated",
          description: "We filled the builder sections using your Career Profile details.",
          variant: "success",
        });
        loadInitialData();
      } else {
        toast({ description: res.error || "Could not generate resume.", variant: "destructive" });
      }
    } catch (err) {
      toast({ description: "Connection error generating resume.", variant: "destructive" });
    } finally {
      setSubmittingBuilder(false);
    }
  };

  // Save builder resume
  const handleSaveBuilderResume = async () => {
    if (!userId) return;
    if (!personalInfo.name || !personalInfo.email) {
      toast({ description: "Please enter your Name and Email in Step 1.", variant: "destructive" });
      return;
    }

    setSubmittingBuilder(true);
    try {
      const parsedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const resumeData = {
        id: resumeId,
        title: resumeTitle,
        template: resumeTemplate,
        personalInfo: JSON.stringify(personalInfo),
        experience: JSON.stringify(experience),
        projects: JSON.stringify(projects),
        education: JSON.stringify(education),
        skills: JSON.stringify(parsedSkills),
      };

      const res = await saveUserResume(userId, resumeData);
      if (res.success && res.resume) {
        setResumeId(res.resume.id);
        setBuilderScore(res.resume.score);
        setBuilderFeedback(JSON.parse(res.resume.feedback || "{}"));
        toast({
          title: "Resume Saved & Graded",
          description: `Score: ${res.resume.score}/100. Check suggestions in Step 5.`,
          variant: "success",
        });
        loadInitialData();
      } else {
        toast({ description: res.error || "Failed to save resume document.", variant: "destructive" });
      }
    } catch (err) {
      toast({ description: "Error processing resume save actions.", variant: "destructive" });
    } finally {
      setSubmittingBuilder(false);
    }
  };

  // Print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Analyzer Select Careers
  const handleSelectCareer = (careerTitle: string) => {
    setSelectedCareers((prev) => {
      if (prev.includes(careerTitle)) {
        return prev.filter((t) => t !== careerTitle);
      } else {
        return [...prev, careerTitle];
      }
    });
  };

  // Analyzer file upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setAnalyzerText(text);
      toast({
        title: "File Loaded",
        description: `Successfully loaded resume content from ${file.name}.`,
        variant: "success",
      });
    };
    reader.readAsText(file);
  };

  // Run AI Analyzer match
  const handleSubmitAnalysis = async () => {
    if (!analyzerText || analyzerText.trim().length === 0) {
      toast({ description: "Please paste your resume text or import a CV file.", variant: "destructive" });
      return;
    }
    if (selectedCareers.length === 0) {
      toast({ description: "Select at least one target career to run the skills match.", variant: "destructive" });
      return;
    }

    setSubmittingAnalyzer(true);
    try {
      const res = await uploadAndAnalyzeResume(userId, analyzerText, selectedCareers);
      if (res.success) {
        setAnalyzerResult({
          analysis: res.analysis,
          jobReadiness: res.readiness,
        });
        toast({
          title: "Analysis Complete",
          description: "Skills gaps and readiness indicators generated.",
          variant: "success",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: res.error || "Failed to parse resume.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ description: "Connection error running analyzer.", variant: "destructive" });
    } finally {
      setSubmittingAnalyzer(false);
    }
  };

  if (loadingHistory || loadingCareers) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading CV parser ecosystem...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto no-print">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            AI Resume Workspace
            <FileText className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Build ATS-friendly professional resumes or analyze your existing CV to discover target skills gap matches.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-slate-900 border border-slate-200/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="builder" className="w-1/2 rounded-lg font-bold text-xs py-2">
              AI Resume Builder
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="w-1/2 rounded-lg font-bold text-xs py-2">
              AI Resume Analyzer
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI RESUME BUILDER */}
          <TabsContent value="builder" className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Builder wizard form controls */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-white">Resume Creator Step {builderStep} of 5</CardTitle>
                      <CardDescription className="text-xs text-slate-400">Fill out sections to draft your resume</CardDescription>
                    </div>
                    <Button onClick={handleAutogenFromProfile} variant="outline" size="sm" className="text-xs font-semibold" disabled={submittingBuilder}>
                      <Wand2 className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                      Auto-Fill Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Step 1: Personal Details */}
                    {builderStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-indigo-400">Step 1: Contact Details & Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="resName">Full Name</Label>
                            <Input id="resName" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} placeholder="John Doe" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="resEmail">Email Address</Label>
                            <Input id="resEmail" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} placeholder="john@example.com" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="resPhone">Phone Number</Label>
                            <Input id="resPhone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="+1 (555) 019-2834" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="resWeb">Portfolio Website/GitHub</Label>
                            <Input id="resWeb" value={personalInfo.website} onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })} placeholder="github.com/johndoe" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="resSum">Professional Summary</Label>
                          <Textarea id="resSum" className="h-28" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} placeholder="Eager engineering graduate specialized in building robust frontend applications..." />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Experience */}
                    {builderStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-indigo-400">Step 2: Work History & Internships</h3>
                          <Button onClick={addExperience} variant="ghost" size="sm" className="text-xs">
                            <Plus className="h-4 w-4 mr-1" /> Add Entry
                          </Button>
                        </div>
                        {experience.map((exp, index) => (
                          <div key={index} className="p-4 rounded-lg bg-slate-950/60 border border-slate-200/5 space-y-3 relative">
                            {experience.length > 1 && (
                              <button onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label>Role Title</Label>
                                <Input value={exp.role} onChange={(e) => {
                                  const list = [...experience];
                                  list[index].role = e.target.value;
                                  setExperience(list);
                                }} placeholder="e.g. Intern Developer" />
                              </div>
                              <div className="space-y-1">
                                <Label>Company Name</Label>
                                <Input value={exp.company} onChange={(e) => {
                                  const list = [...experience];
                                  list[index].company = e.target.value;
                                  setExperience(list);
                                }} placeholder="e.g. Google" />
                              </div>
                              <div className="space-y-1">
                                <Label>Duration</Label>
                                <Input value={exp.duration} onChange={(e) => {
                                  const list = [...experience];
                                  list[index].duration = e.target.value;
                                  setExperience(list);
                                }} placeholder="e.g. June 2025 - Present" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>Role Description</Label>
                              <Textarea value={exp.description} onChange={(e) => {
                                const list = [...experience];
                                  list[index].description = e.target.value;
                                  setExperience(list);
                              }} placeholder="Managed database schemas, speeded up loading times by 20%..." />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 3: Projects */}
                    {builderStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-indigo-400">Step 3: Personal & Academic Projects</h3>
                          <Button onClick={addProject} variant="ghost" size="sm" className="text-xs">
                            <Plus className="h-4 w-4 mr-1" /> Add Project
                          </Button>
                        </div>
                        {projects.map((proj, index) => (
                          <div key={index} className="p-4 rounded-lg bg-slate-950/60 border border-slate-200/5 space-y-3 relative">
                            {projects.length > 1 && (
                              <button onClick={() => removeProject(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label>Project Name</Label>
                                <Input value={proj.name} onChange={(e) => {
                                  const list = [...projects];
                                  list[index].name = e.target.value;
                                  setProjects(list);
                                }} placeholder="e.g. Chatbot App" />
                              </div>
                              <div className="space-y-1">
                                <Label>Tech Stack Used</Label>
                                <Input value={proj.stack} onChange={(e) => {
                                  const list = [...projects];
                                  list[index].stack = e.target.value;
                                  setProjects(list);
                                }} placeholder="e.g. Next.js, Tailwind, OpenAI" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>Project Description</Label>
                              <Textarea value={proj.description} onChange={(e) => {
                                const list = [...projects];
                                list[index].description = e.target.value;
                                setProjects(list);
                              }} placeholder="Integrated API calls and cached response queries locally..." />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 4: Education & Skills */}
                    {builderStep === 4 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-indigo-400">Step 4: Education History</h3>
                          <Button onClick={addEducation} variant="ghost" size="sm" className="text-xs">
                            <Plus className="h-4 w-4 mr-1" /> Add School
                          </Button>
                        </div>
                        {education.map((edu, index) => (
                          <div key={index} className="p-4 rounded-lg bg-slate-950/60 border border-slate-200/5 space-y-3 relative">
                            {education.length > 1 && (
                              <button onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label>Degree/Diploma</Label>
                                <Input value={edu.degree} onChange={(e) => {
                                  const list = [...education];
                                  list[index].degree = e.target.value;
                                  setEducation(list);
                                }} placeholder="e.g. BS Computer Science" />
                              </div>
                              <div className="space-y-1">
                                <Label>School/University</Label>
                                <Input value={edu.school} onChange={(e) => {
                                  const list = [...education];
                                  list[index].school = e.target.value;
                                  setEducation(list);
                                }} placeholder="e.g. MIT" />
                              </div>
                              <div className="space-y-1">
                                <Label>Graduation Date</Label>
                                <Input value={edu.duration} onChange={(e) => {
                                  const list = [...education];
                                  list[index].duration = e.target.value;
                                  setEducation(list);
                                }} placeholder="e.g. 2022 - 2026" />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="space-y-1.5 border-t border-slate-800 pt-4">
                          <Label htmlFor="resSkills">Technical Skills (comma-separated)</Label>
                          <Input id="resSkills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, Node.js, Python, PostgreSQL, Git" />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Score & Template Selector */}
                    {builderStep === 5 && (
                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-indigo-400">Step 5: Select Template & Run Audit</h3>
                        <div className="space-y-2.5">
                          <Label>Select Resume Visual Style</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {["professional", "creative", "minimal"].map((t) => (
                              <button
                                key={t}
                                onClick={() => setResumeTemplate(t)}
                                className={`p-4 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                                  resumeTemplate === t
                                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                                    : "border-slate-800 hover:bg-slate-900 text-slate-400"
                                }`}
                              >
                                {t === "professional" ? "Professional Corporate" : t === "creative" ? "Modern Creative" : "Sleek Minimal"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {builderFeedback && (
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Quality Score</span>
                              <Badge className="text-xs font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300">{builderScore}/100</Badge>
                            </div>
                            <Progress value={builderScore} />
                            
                            {builderFeedback.missingSections?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-amber-400 font-bold uppercase">Missing Core Sections:</span>
                                <div className="flex flex-wrap gap-1">
                                  {builderFeedback.missingSections.map((sec: string, idx: number) => (
                                    <Badge key={idx} variant="destructive" className="text-[9px]">{sec}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {builderFeedback.suggestions?.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-emerald-400 font-bold uppercase">Suggestions for Improvement:</span>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                                  {builderFeedback.suggestions.map((s: string, idx: number) => (
                                    <li key={idx}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-slate-200/5 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setBuilderStep((prev) => Math.max(prev - 1, 1))}
                      disabled={builderStep === 1}
                    >
                      <ChevronLeft className="h-4.5 w-4.5 mr-1" /> Back
                    </Button>
                    
                    {builderStep < 5 ? (
                      <Button onClick={() => setBuilderStep((prev) => Math.min(prev + 1, 5))}>
                        Next <ChevronRight className="h-4.5 w-4.5 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={handleSaveBuilderResume} disabled={submittingBuilder} className="font-bold">
                        {submittingBuilder ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" /> Evaluating...
                          </>
                        ) : (
                          "Save & Grade Resume"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* Live Preview Panel & PDF Actions */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card">
                  <CardHeader className="text-left pb-2 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Resume Live Preview</span>
                      <Button onClick={handlePrintPdf} variant="ghost" size="sm" className="h-8 text-xs">
                        <Printer className="h-4 w-4 mr-1.5 text-indigo-400" /> Export PDF
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Live styled template preview */}
                    <div className={`p-6 rounded-lg bg-white text-slate-900 shadow-xl overflow-y-auto max-h-[500px] border border-slate-300 text-left font-sans ${resumeTemplate}`}>
                      {/* Personal block */}
                      <div className="text-center pb-4 border-b border-slate-200">
                        <h2 className="text-xl font-bold uppercase text-slate-800">{personalInfo.name || "YOUR NAME"}</h2>
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-semibold mt-1">
                          <span>{personalInfo.email || "email@example.com"}</span>
                          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                          {personalInfo.website && <span>• {personalInfo.website}</span>}
                        </div>
                        {personalInfo.summary && (
                          <p className="text-xs mt-3 leading-relaxed text-slate-600 font-medium italic">
                            {personalInfo.summary}
                          </p>
                        )}
                      </div>

                      {/* Experience block */}
                      <div className="mt-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5">Experience</h3>
                        {experience.map((exp, idx) => (
                          <div key={idx} className="space-y-1">
                            {exp.role && (
                              <div className="flex justify-between text-xs font-bold text-slate-850">
                                <span>{exp.role} at {exp.company}</span>
                                <span className="text-[10px] text-slate-500">{exp.duration}</span>
                              </div>
                            )}
                            <p className="text-[11px] leading-relaxed text-slate-650">{exp.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Projects block */}
                      <div className="mt-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5">Projects</h3>
                        {projects.map((proj, idx) => (
                          <div key={idx} className="space-y-1">
                            {proj.name && (
                              <div className="flex justify-between text-xs font-bold text-slate-850">
                                <span>{proj.name}</span>
                                <span className="text-[9px] font-semibold text-slate-500 uppercase">{proj.stack}</span>
                              </div>
                            )}
                            <p className="text-[11px] leading-relaxed text-slate-650">{proj.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Education & Skills */}
                      <div className="grid grid-cols-2 gap-4 mt-4 border-t border-slate-200 pt-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5 mb-1.5">Education</h3>
                          {education.map((edu, idx) => (
                            <div key={idx} className="text-[10px] text-slate-650">
                              <p className="font-bold text-slate-800">{edu.degree}</p>
                              <p>{edu.school} ({edu.duration})</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5 mb-1.5">Skills</h3>
                          <div className="flex flex-wrap gap-1">
                            {skillsText.split(",").map((s, idx) => {
                              const skillName = s.trim();
                              if (!skillName) return null;
                              return (
                                <span key={idx} className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                                  {skillName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: AI RESUME ANALYZER */}
          <TabsContent value="analyzer" className="space-y-6 text-left animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Analyzer upload forms */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-white">Upload & Inputs</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Scan existing CV documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File import */}
                    <div className="space-y-2">
                      <Label>Import Resume File</Label>
                      <div className="border-2 border-dashed border-slate-200/10 hover:border-indigo-500/35 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                        <input
                          type="file"
                          id="cv-file-analyzer"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".txt,.pdf"
                        />
                        <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-slate-400 block">Click to import plain text file</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Or copy-paste PDF text below</span>
                      </div>
                    </div>

                    {/* Resume text box */}
                    <div className="space-y-1.5">
                      <Label htmlFor="analyzerText">Paste Resume Text</Label>
                      <Textarea
                        id="analyzerText"
                        placeholder="PASTE RESUME CONTENT HERE..."
                        value={analyzerText}
                        onChange={(e) => setAnalyzerText(e.target.value)}
                        className="h-44 text-xs font-mono"
                        disabled={submittingAnalyzer}
                      />
                    </div>

                    {/* Career select */}
                    <div className="space-y-2">
                      <Label>Select Target Career Paths to Match</Label>
                      <div className="max-h-40 overflow-y-auto border border-slate-200/10 rounded-xl p-2.5 space-y-1 bg-slate-950">
                        {careersList.map((c) => {
                          const selected = selectedCareers.includes(c.title);
                          return (
                            <button
                              key={c.id}
                              onClick={() => handleSelectCareer(c.title)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                selected ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-slate-900 text-slate-400"
                              }`}
                            >
                              <span>{c.title}</span>
                              {selected && <CheckCircle className="h-4 w-4 text-indigo-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSubmitAnalysis} className="w-full font-bold" disabled={submittingAnalyzer}>
                      {submittingAnalyzer ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running AI Audit...
                        </>
                      ) : (
                        "Submit for AI Matching"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Analyzer response displays */}
              <div className="lg:col-span-3">
                {analyzerResult ? (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                        CV Match Report
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">Calculated job readiness percentages and competency metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Job Readiness Score</h3>
                        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-200/5">
                          {Object.entries(analyzerResult.jobReadiness || {}).map(([career, pct]: any) => (
                            <div key={career} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">{career}</span>
                                <span className="text-indigo-400 font-bold">{pct}%</span>
                              </div>
                              <Progress value={pct} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200/5 pt-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            Identified Strengths
                          </h4>
                          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                            {analyzerResult.analysis?.strengths?.map((str: string, idx: number) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            Competency Gaps
                          </h4>
                          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                            {analyzerResult.analysis?.weaknesses?.map((weak: string, idx: number) => (
                              <li key={idx}>{weak}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200/5 pt-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Matched Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {analyzerResult.analysis?.matchedSkills?.map((s: string, idx: number) => (
                              <Badge key={idx} variant="success" className="text-[9px]">{s}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Missing Core Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {analyzerResult.analysis?.missingSkills?.map((s: string, idx: number) => (
                              <Badge key={idx} variant="destructive" className="text-[9px]">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/5 pt-6 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="h-4.5 w-4.5 text-indigo-400" />
                          Action Plan & Improvements
                        </h4>
                        <ul className="list-decimal pl-5 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                          {analyzerResult.analysis?.improvements?.map((imp: string, idx: number) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3">
                    <FileText className="h-10 w-10 text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-400">No Active Analysis Report</p>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                        Once you submit your resume text and target career fields, AI matching diagnostics will display here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* PRINT-ONLY RESUME DRAFT TEMPLATE */}
      <div className={`print-area print-only hidden text-slate-900 bg-white p-8 w-full font-sans ${resumeTemplate}`}>
        <div className="text-center pb-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold uppercase">{personalInfo.name || "Applicant Name"}</h2>
          <div className="flex justify-center gap-4 text-xs mt-1 text-slate-600">
            <span>{personalInfo.email}</span>
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.website && <span>• {personalInfo.website}</span>}
          </div>
          {personalInfo.summary && <p className="text-xs mt-3 leading-relaxed italic text-slate-700">{personalInfo.summary}</p>}
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5">Experience</h3>
          {experience.map((exp, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              {exp.role && (
                <div className="flex justify-between font-bold">
                  <span>{exp.role} at {exp.company}</span>
                  <span className="text-slate-500">{exp.duration}</span>
                </div>
              )}
              <p className="text-slate-600">{exp.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5">Projects</h3>
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              {proj.name && (
                <div className="flex justify-between font-bold">
                  <span>{proj.name}</span>
                  <span className="text-slate-500 uppercase">{proj.stack}</span>
                </div>
              )}
              <p className="text-slate-600">{proj.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 border-t border-slate-200 pt-4 text-xs">
          <div>
            <h3 className="text-sm font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5 mb-2">Education</h3>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-bold text-slate-800">{edu.degree}</p>
                <p>{edu.school} ({edu.duration})</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-indigo-900 border-b border-indigo-200 pb-0.5 mb-2">Technical Skills</h3>
            <p className="text-slate-700 leading-relaxed font-semibold">{skillsText}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
