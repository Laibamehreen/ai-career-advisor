"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { startInterviewSession, submitInterviewAnswers, getInterviewHistory } from "@/actions/interview";
import { getAllCareersWithSkills } from "@/actions/assessment";
import {
  Mic,
  Video,
  UserCheck,
  Award,
  Sparkles,
  TrendingUp,
  History,
  PlayCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export default function InterviewPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [starting, setStarting] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Lists
  const [careersList, setCareersList] = React.useState<any[]>([]);
  const [interviewHistory, setInterviewHistory] = React.useState<any[]>([]);

  // Setup state
  const [selectedCareerId, setSelectedCareerId] = React.useState("");
  const [interviewMode, setInterviewMode] = React.useState("technical"); // technical or behavioral

  // Active Session state
  const [activeSession, setActiveSession] = React.useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = React.useState("");

  // Result state
  const [evaluationResult, setEvaluationResult] = React.useState<any>(null);

  const userId = session?.user ? (session.user as any).id : null;

  const loadData = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [careersRes, historyRes] = await Promise.all([
        getAllCareersWithSkills(),
        getInterviewHistory(userId),
      ]);
      if (careersRes.success) {
        setCareersList(careersRes.careers || []);
        if (careersRes.careers && careersRes.careers.length > 0) {
          setSelectedCareerId(careersRes.careers[0].id);
        }
      }
      if (historyRes.success) {
        setInterviewHistory(historyRes.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartSession = async () => {
    if (!userId || !selectedCareerId) return;
    setStarting(true);
    try {
      const res = await startInterviewSession(userId, selectedCareerId, interviewMode);
      if (res.success && res.session) {
        setActiveSession(res.session);
        setCurrentQuestionIndex(0);
        setUserAnswers(new Array(res.session.questions.length).fill(""));
        setCurrentAnswer("");
        setEvaluationResult(null);
        toast({ title: "Interview Started", description: "First question generated. Good luck!", variant: "success" });
      } else {
        toast({ description: res.error || "Failed to start interview.", variant: "destructive" });
      }
    } catch (err) {
      toast({ description: "Connection error starting interview session.", variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const handleNextQuestion = () => {
    // Record current answer
    const answers = [...userAnswers];
    answers[currentQuestionIndex] = currentAnswer;
    setUserAnswers(answers);

    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer(answers[currentQuestionIndex + 1] || "");
    }
  };

  const handlePrevQuestion = () => {
    const answers = [...userAnswers];
    answers[currentQuestionIndex] = currentAnswer;
    setUserAnswers(answers);

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  const handleSubmitInterview = async () => {
    if (!userId || !activeSession) return;

    // Record last answer
    const finalAnswers = [...userAnswers];
    finalAnswers[currentQuestionIndex] = currentAnswer;

    // Check if any answers are completely empty
    const unanswered = finalAnswers.filter((a) => !a || a.trim().length === 0).length;
    if (unanswered > 0 && !confirm(`You have left ${unanswered} question(s) blank. Submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const questionsAndAnswers = activeSession.questions.map((q: any, idx: number) => ({
        question: q.question,
        answer: finalAnswers[idx] || "",
      }));

      const res = await submitInterviewAnswers(activeSession.id, userId, questionsAndAnswers);
      if (res.success && res.evaluation) {
        setEvaluationResult(res.evaluation);
        setActiveSession(null);
        toast({ title: "Interview Graded", description: `You scored ${res.evaluation.score}/100!`, variant: "success" });
        loadData();
      } else {
        toast({ description: res.error || "Grading failed.", variant: "destructive" });
      }
    } catch (err) {
      toast({ description: "Error submitting mock answers.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading interview coach simulation...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            AI Mock Interview Coach
            <UserCheck className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Practice technical and behavioral interview questions tailored to your career goals and receive real-time AI scoring assessments.
          </p>
        </div>

        {/* WORKSPACE AREA */}
        {!activeSession && !evaluationResult && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Configure Session */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-indigo-400" /> Setup Mock Interview
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Select target career and coaching parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Select Target Career Role</Label>
                    <select
                      value={selectedCareerId}
                      onChange={(e) => setSelectedCareerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {careersList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Select Mode</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {["technical", "behavioral"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setInterviewMode(mode)}
                          className={`p-3.5 rounded-xl border text-xs font-bold text-center capitalize cursor-pointer transition-all ${
                            interviewMode === mode
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-sm"
                              : "border-slate-800 hover:bg-slate-900 text-slate-400"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleStartSession} className="w-full font-bold shadow-indigo-500/20" disabled={starting}>
                    {starting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Formulating Questions...
                      </>
                    ) : (
                      "Start Practice Session"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* History Table */}
            <div className="lg:col-span-3 text-left">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                    <History className="h-5 w-5 text-indigo-400" /> Coaching History
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">View previous grading scorecards</CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-[360px] overflow-y-auto">
                  {interviewHistory.length > 0 ? (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-slate-450 font-bold">
                            <th className="p-3.5 pl-5">Date</th>
                            <th className="p-3.5">Career Role</th>
                            <th className="p-3.5">Mode</th>
                            <th className="p-3.5 text-center">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {interviewHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                              <td className="p-3.5 pl-5 text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3.5 font-bold text-white">{item.careerTitle}</td>
                              <td className="p-3.5 capitalize text-slate-450">{item.mode}</td>
                              <td className="p-3.5 text-center">
                                <Badge className="font-bold bg-indigo-500/10 text-indigo-300 border-none">
                                  {item.score}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="h-9 w-9 text-slate-700 animate-pulse" />
                      <p className="text-xs font-bold text-slate-400">No mock history found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ACTIVE SESSION WINDOW */}
        {activeSession && (
          <div className="max-w-3xl mx-auto text-left">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-indigo-300">
                    {activeSession.careerTitle} Interview ({activeSession.mode})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                  </CardDescription>
                </div>
                <Badge className="font-bold py-1 bg-indigo-500/20 border-none text-indigo-300">Active</Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex gap-3.5 items-start">
                  <div className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Question:</h4>
                    <p className="text-sm text-slate-200 mt-1 font-semibold leading-relaxed">
                      {activeSession.questions[currentQuestionIndex].question}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="currentAnswer">Type Your Response</Label>
                    <span className="text-[10px] text-slate-500 font-bold">Try to give a detailed answer</span>
                  </div>
                  <Textarea
                    id="currentAnswer"
                    placeholder="Enter your technical explanation or behavioral context here..."
                    className="h-32 text-xs focus:border-indigo-500"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                {currentQuestionIndex < activeSession.questions.length - 1 ? (
                  <Button size="sm" onClick={handleNextQuestion}>
                    Next Question <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmitInterview} disabled={submitting} className="font-bold bg-indigo-650 hover:bg-indigo-700">
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-1.5 h-4 w-4" /> Scoring Session...
                      </>
                    ) : (
                      "Submit Interview"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}

        {/* RESULTS CARD VIEW */}
        {evaluationResult && (
          <div className="max-w-2xl mx-auto text-left animate-fade-in">
            <Card className="glass-card">
              <CardHeader className="text-center pb-2">
                <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-white">AI Coach Performance Scorecard</CardTitle>
                <CardDescription className="text-xs text-slate-400">Breakdown of communication metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-center space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Overall Performance</span>
                  <h3 className="text-4xl font-extrabold text-indigo-400">{evaluationResult.score}%</h3>
                  <div className="w-full max-w-xs mx-auto">
                    <Progress value={evaluationResult.score} />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Clarity & Flow
                    </h4>
                    <p className="text-xs text-slate-450 leading-relaxed mt-1">{evaluationResult.clarity}</p>
                  </div>

                  <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Mic className="h-4 w-4" /> Confidence & Delivery
                    </h4>
                    <p className="text-xs text-slate-450 leading-relaxed mt-1">{evaluationResult.confidence}</p>
                  </div>

                  <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="h-4 w-4" /> Technical Accuracy
                    </h4>
                    <p className="text-xs text-slate-450 leading-relaxed mt-1">{evaluationResult.technicalAccuracy}</p>
                  </div>

                  <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-400" /> Recommendations
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400 leading-relaxed">
                      {evaluationResult.recommendations?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setEvaluationResult(null)} className="w-full font-bold">
                  Start Another Session <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
