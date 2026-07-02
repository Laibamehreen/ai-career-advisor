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
import { generateAndSaveCoverLetter, getCoverLetters, deleteCoverLetter } from "@/actions/coverletter";
import { FileText, Wand2, Trash2, Printer, Loader2, History } from "lucide-react";

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [savedLetters, setSavedLetters] = React.useState<any[]>([]);

  // Form inputs
  const [jobTitle, setJobTitle] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");

  // Editor states
  const [letterContent, setLetterContent] = React.useState("");

  const userId = session?.user ? (session.user as any).id : null;

  const loadData = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getCoverLetters(userId);
      if (res.success && res.letters) {
        setSavedLetters(res.letters);
        if (res.letters.length > 0 && !letterContent) {
          setLetterContent(res.letters[0].content);
          setJobTitle(res.letters[0].jobTitle);
          setCompanyName(res.letters[0].companyName);
          setJobDescription(res.letters[0].jobDescription);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, letterContent]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    if (!jobTitle || !companyName) {
      toast({ description: "Please enter a Job Title and Company Name.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const res = await generateAndSaveCoverLetter(userId, jobTitle, companyName, jobDescription);
      if (res.success && res.coverLetter) {
        setLetterContent(res.coverLetter.content);
        toast({
          title: "Cover Letter Ready",
          description: `Customized letter for ${companyName} has been built!`,
          variant: "success",
        });
        loadData();
      } else {
        toast({ description: res.error || "Failed to generate cover letter.", variant: "destructive" });
      }
    } catch (err) {
      toast({ description: "Error connecting to AI advisor services.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;
    try {
      const res = await deleteCoverLetter(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Successfully removed cover letter history.", variant: "success" });
        loadData();
      }
    } catch (err) {
      toast({ description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading cover letter studio...</p>
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
            AI Cover Letter Generator
            <FileText className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Generate tailored cover letters matching specific job description keywords.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Panel: Generation Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader className="text-left">
                <CardTitle className="text-base font-bold text-white font-sans">Job Specifications</CardTitle>
                <CardDescription className="text-xs text-slate-400">Input application metrics for tailoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Junior Front-End Developer" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. TechCorp Innovations" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobDesc">Job Description (optional)</Label>
                  <Textarea id="jobDesc" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste responsibilities, key frameworks, and skills required..." className="h-32 text-xs" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerate} className="w-full font-bold" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Drafting Letter...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4.5 w-4.5" /> Tailor with AI
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* History Card */}
            {savedLetters.length > 0 && (
              <Card className="glass-card text-left">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                    <History className="h-4.5 w-4.5 text-indigo-400" /> Previous Drafts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedLetters.map((letter) => (
                    <div key={letter.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-200/5 hover:border-slate-800 transition-colors">
                      <button
                        onClick={() => {
                          setLetterContent(letter.content);
                          setJobTitle(letter.jobTitle);
                          setCompanyName(letter.companyName);
                          setJobDescription(letter.jobDescription);
                        }}
                        className="text-left overflow-hidden flex-1 cursor-pointer hover:underline"
                      >
                        <p className="text-xs font-bold text-white truncate">{letter.jobTitle}</p>
                        <p className="text-[10px] text-slate-500 truncate">{letter.companyName}</p>
                      </button>
                      <button onClick={() => handleDelete(letter.id)} className="text-slate-500 hover:text-red-400 p-1 bg-transparent border-none cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel: Letter Editor & Preview */}
          <div className="lg:col-span-3">
            <Card className="glass-card text-left">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <CardTitle className="text-base font-bold text-white">Editor & Cover Letter Document</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Tweak drafted copy and export</CardDescription>
                </div>
                {letterContent && (
                  <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs font-bold">
                    <Printer className="h-4 w-4 mr-1.5 text-indigo-400" /> Print Letter
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {letterContent ? (
                  <Textarea
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="h-[460px] text-sm font-sans leading-relaxed text-slate-200 p-4 border border-slate-800 focus:border-indigo-500"
                  />
                ) : (
                  <div className="py-32 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                    <FileText className="h-10 w-10 text-slate-700 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-slate-400">No Draft Created</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                        Populate target job specs on the left and click Tailor to draft your cover letter.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY COVER LETTER OUTPUT */}
      {letterContent && (
        <div className="print-area print-only hidden p-10 bg-white text-slate-900 font-sans text-left leading-relaxed text-xs">
          <div className="whitespace-pre-wrap">{letterContent}</div>
        </div>
      )}
    </DashboardShell>
  );
}
