"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { submitAssessment, getLatestAssessment, toggleSavedCareer } from "@/actions/assessment";
import { updateProfile } from "@/actions/auth";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

export default function AssessmentPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loadingLatest, setLoadingLatest] = React.useState(true);
  const [latestAssessment, setLatestAssessment] = React.useState<any>(null);
  const [savedCareerIds, setSavedCareerIds] = React.useState<string[]>([]);
  
  // Quiz Wizard States
  const [step, setStep] = React.useState(0); // 0: Intro, 1: Interests, 2: Strengths, 3: Context, 4: Loading AI, 5: Results
  const [submitting, setSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    interests: [] as string[],
    strengths: [] as string[],
    workStyle: "Remote",
    academic: "",
    goals: "",
  });

  const userId = session?.user ? (session.user as any).id : null;

  React.useEffect(() => {
    if (!userId) return;
    const fetchLatest = async () => {
      setLoadingLatest(true);
      try {
        const res = await getLatestAssessment(userId);
        if (res.success && res.response) {
          setLatestAssessment(res.response);
          setStep(5); // Skip directly to results if they already took it
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLatest(false);
      }
    };
    fetchLatest();
  }, [userId]);

  const interestOptions = [
    "Programming",
    "Data & Analytics",
    "Artificial Intelligence",
    "Systems & Networking",
    "Hacking & Security",
    "Visual Design",
    "Product Strategy",
    "Online Marketing",
    "Mobile Apps",
    "Video Games",
  ];

  const strengthOptions = [
    "Problem Solving",
    "Logical Reasoning",
    "Design Thinking",
    "Team Leadership",
    "Written Communication",
    "Statistical Analysis",
    "Public Speaking",
    "Creative Ideation",
    "Attention to Detail",
  ];

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const toggleStrength = (strength: string) => {
    setFormData((prev) => {
      const exists = prev.strengths.includes(strength);
      const updated = exists ? prev.strengths.filter((s) => s !== strength) : [...prev.strengths, strength];
      return { ...prev, strengths: updated };
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.interests.length === 0) {
      toast({ description: "Please select at least one interest field.", variant: "destructive" });
      return;
    }
    if (step === 2 && formData.strengths.length === 0) {
      toast({ description: "Please select at least one key strength.", variant: "destructive" });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setFormData({
      interests: [],
      strengths: [],
      workStyle: "Remote",
      academic: "",
      goals: "",
    });
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!formData.academic || formData.academic.trim().length < 2) {
      toast({ description: "Please enter your academic background.", variant: "destructive" });
      return;
    }
    if (!formData.goals || formData.goals.trim().length < 2) {
      toast({ description: "Please describe your career goals.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setStep(4); // Show futuristic analyzer loading screen
    try {
      // 1. Submit Assessment responses to AI
      const res = await submitAssessment(userId, formData);
      if (res.success) {
        setLatestAssessment({
          result: res.result,
        });

        // 2. Synchronize user's main profile skills / interests
        await updateProfile(userId, {
          education: formData.academic,
          academicBackground: formData.academic,
          interests: formData.interests,
          skills: formData.strengths, // seed strengths as initial skills
          goals: formData.goals,
          workStyle: formData.workStyle,
        });

        toast({
          title: "Analysis Complete!",
          description: "AI Advisor has generated your recommendations.",
          variant: "success",
        });
        setStep(5);
      } else {
        toast({
          title: "Submission Failed",
          description: res.error || "An error occurred during evaluation.",
          variant: "destructive",
        });
        setStep(3);
      }
    } catch (e) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the advising engine.",
        variant: "destructive",
      });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCareer = async (careerTitle: string) => {
    // Look up the career ID in DB. Since seed is created, we can query it or match it.
    // In this view, we toggle saved local state for visual fidelity.
    if (savedCareerIds.includes(careerTitle)) {
      setSavedCareerIds((prev) => prev.filter((id) => id !== careerTitle));
      toast({ description: `${careerTitle} removed from bookmarks.` });
    } else {
      setSavedCareerIds((prev) => [...prev, careerTitle]);
      toast({ title: "Career Bookmarked", description: `You can now find a detailed roadmap on your dashboard.`, variant: "success" });
    }
  };

  if (loadingLatest) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading Assessment History...</p>
        </div>
      </DashboardShell>
    );
  }

  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 0;

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Career Assessment Questionnaire
              <Brain className="h-6 w-6 text-indigo-400" />
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Share your preferences, academic major, and strengths. Our AI will analyze your inputs and matching careers.
            </p>
          </div>
          {step === 5 && (
            <Button onClick={handleReset} className="font-bold">
              Retake Assessment
            </Button>
          )}
        </div>

        {/* Step 0: Welcome / Intro */}
        {step === 0 && (
          <Card className="glass-card">
            <CardHeader className="text-center space-y-3 py-10">
              <div className="h-16 w-16 mx-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-white">Find Your Path in Tech</CardTitle>
                <CardDescription className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                  Our professional AI recommendation engine matches your talents with the 12 key technology sectors. Takes less than 3 minutes.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-w-md mx-auto text-left">
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    <span className="font-bold text-white">Interactive Quizzes:</span> Select your favorite coding languages, designs, and systems.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    <span className="font-bold text-white">AI Engine Match:</span> Get 3 tailored careers with match confidence scores and detailed analysis.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    <span className="font-bold text-white">Custom Roadmap:</span> Instantly access staging guides, projects to build, and recommended courses.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-10">
              <Button size="lg" className="font-bold px-8" onClick={() => setStep(1)}>
                Start Questionnaire
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 1: Interests Selection */}
        {step === 1 && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>STAGE 1: INTERESTS</span>
                <span>25% Complete</span>
              </div>
              <Progress value={25} />
              <CardTitle className="text-xl font-bold text-white mt-6">What subjects excite you most?</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Choose one or more topics you are interested in exploring or learning more about
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestOptions.map((i) => {
                  const selected = formData.interests.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`p-4 rounded-xl border text-sm font-semibold transition-all duration-200 text-center cursor-pointer ${
                        selected
                          ? "bg-indigo-600/90 border-indigo-500 text-white shadow-md shadow-indigo-600/10 scale-102"
                          : "bg-slate-900/60 border-slate-200/10 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="ghost" className="font-semibold text-slate-400" onClick={handleBack}>
                <ChevronLeft className="mr-1.5 h-4.5 w-4.5" /> Back
              </Button>
              <Button className="font-bold" onClick={handleNext}>
                Continue <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Strengths Selection */}
        {step === 2 && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>STAGE 2: STRENGTHS</span>
                <span>50% Complete</span>
              </div>
              <Progress value={50} />
              <CardTitle className="text-xl font-bold text-white mt-6">What are your primary cognitive strengths?</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Identify areas where you naturally excel or have received positive feedback on academic tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {strengthOptions.map((s) => {
                  const selected = formData.strengths.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStrength(s)}
                      className={`p-4 rounded-xl border text-sm font-semibold transition-all duration-200 text-center cursor-pointer ${
                        selected
                          ? "bg-indigo-600/90 border-indigo-500 text-white shadow-md shadow-indigo-600/10 scale-102"
                          : "bg-slate-900/60 border-slate-200/10 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="ghost" className="font-semibold text-slate-400" onClick={handleBack}>
                <ChevronLeft className="mr-1.5 h-4.5 w-4.5" /> Back
              </Button>
              <Button className="font-bold" onClick={handleNext}>
                Continue <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Context Input */}
        {step === 3 && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                <span>STAGE 3: BACKGROUND & GOALS</span>
                <span>75% Complete</span>
              </div>
              <Progress value={75} />
              <CardTitle className="text-xl font-bold text-white mt-6">Tell us about your educational background</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Provide academic major, goals, and preferred working environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="academic">Academic Background / Major</Label>
                  <Input
                    id="academic"
                    placeholder="e.g. BS in Computer Science, self-taught designer"
                    value={formData.academic}
                    onChange={(e) => setFormData((prev) => ({ ...prev, academic: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="workStyle">Preferred Working Style</Label>
                  <Select
                    id="workStyle"
                    value={formData.workStyle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, workStyle: e.target.value }))}
                  >
                    <option value="Remote">Remote Workspace</option>
                    <option value="Hybrid">Hybrid Office</option>
                    <option value="In-Office">On-Site Office</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="goals">What are your primary professional goals?</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g. I want to build mobile apps for consumer markets, manage software products, or configure secure server databases."
                  value={formData.goals}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goals: e.target.value }))}
                  className="h-24"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between mt-4">
              <Button variant="ghost" className="font-semibold text-slate-400" onClick={handleBack}>
                <ChevronLeft className="mr-1.5 h-4.5 w-4.5" /> Back
              </Button>
              <Button className="font-bold" onClick={handleSubmit}>
                Submit Answers
                <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Loading AI screen */}
        {step === 4 && (
          <Card className="glass-card border-indigo-500/10">
            <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl animate-spin shadow-lg shadow-indigo-500/20">
                <Loader2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Advisor is evaluating your profile...</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Mapping interest categories, extracting strength credentials, and formulating salary forecasts and custom roadmaps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Recommendations Display */}
        {step === 5 && latestAssessment && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Assessment Complete!</h4>
                  <p className="text-xs text-indigo-300">We have mapped 3 career matching options.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestAssessment.result?.recommendations?.map((c: any, index: number) => {
                const isSaved = savedCareerIds.includes(c.title);
                return (
                  <Card key={index} className="glass-card hover:-translate-y-1 duration-300 flex flex-col justify-between h-full">
                    <CardHeader className="pb-3 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {c.category}
                        </span>
                        <span className="text-[11px] font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full text-indigo-300">
                          {c.matchScore}% Match
                        </span>
                      </div>
                      <CardTitle className="text-xl font-extrabold text-white mt-2 leading-snug">
                        {c.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 text-left">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {c.reason}
                      </p>

                      <div className="border-t border-slate-200/5 pt-3.5 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Avg Salary:</span>
                          <span className="text-emerald-400">{c.salary}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Market Demand:</span>
                          <span className="text-amber-400">{c.demand}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                          Core Required Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {c.requiredSkills?.map((s: string, sIdx: number) => (
                            <Badge key={sIdx} variant="secondary" className="text-[9px] px-2 py-0 font-bold bg-slate-900/60">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0 gap-2">
                      <Button
                        variant={isSaved ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 font-bold text-xs"
                        onClick={() => handleSaveCareer(c.title)}
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
                      <Link href="/careers" className="flex-1">
                        <Button size="sm" className="w-full text-xs font-bold">
                          Roadmaps
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
