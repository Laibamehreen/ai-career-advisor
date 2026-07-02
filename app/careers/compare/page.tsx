"use client";

import * as React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllCareersWithSkills } from "@/actions/assessment";
import { Columns, Briefcase, Plus, X, BarChart3, HelpCircle, Loader2 } from "lucide-react";

export default function ComparePage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [careersList, setCareersList] = React.useState<any[]>([]);
  const [comparedCareers, setComparedCareers] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadCareers = async () => {
      setLoading(true);
      try {
        const res = await getAllCareersWithSkills();
        if (res.success) {
          setCareersList(res.careers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCareers();
  }, []);

  const handleAddCareer = (career: any) => {
    if (comparedCareers.length >= 3) {
      toast({ description: "You can compare up to 3 careers side-by-side.", variant: "warning" });
      return;
    }
    if (comparedCareers.find((c) => c.id === career.id)) {
      toast({ description: "Career already added to comparison.", variant: "info" });
      return;
    }
    setComparedCareers([...comparedCareers, career]);
  };

  const handleRemoveCareer = (id: string) => {
    setComparedCareers(comparedCareers.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading comparison matrices...</p>
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
            Career Comparison Matrix
            <Columns className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Add up to 3 career paths side-by-side to evaluate salary expectations, growth ratings, demand indices, and required competencies.
          </p>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Career Registry Options List */}
          <div className="lg:col-span-2 text-left space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-400" /> Select Careers
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Click to add to comparative dashboard</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[440px] overflow-y-auto space-y-1.5 pr-1">
                {careersList.map((c) => {
                  const added = comparedCareers.some((item) => item.id === c.id);
                  return (
                    <div
                      key={c.id}
                      className={`flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border ${
                        added ? "border-indigo-500/20 text-indigo-350" : "border-slate-200/5 text-slate-300"
                      }`}
                    >
                      <div className="overflow-hidden flex-1 pr-4">
                        <p className="text-xs font-bold text-white truncate">{c.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.category}</p>
                      </div>
                      <Button
                        onClick={() => handleAddCareer(c)}
                        disabled={added}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        {added ? "Added" : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Side by Side Comparison Grid */}
          <div className="lg:col-span-3 text-left">
            {comparedCareers.length > 0 ? (
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid border-collapse divide-x divide-slate-800" style={{ gridTemplateColumns: `repeat(${comparedCareers.length}, minmax(0, 1fr))` }}>
                    {comparedCareers.map((c) => (
                      <div key={c.id} className="p-5 space-y-6 relative">
                        {/* Remove header button */}
                        <button
                          onClick={() => handleRemoveCareer(c.id)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 bg-transparent border-none cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Title block */}
                        <div>
                          <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                          <h4 className="text-base font-extrabold text-white mt-2 leading-tight">{c.title}</h4>
                        </div>

                        {/* Comparative Row: Score */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Overall score</span>
                          <div className="flex items-center gap-1.5">
                            <BarChart3 className="h-4 w-4 text-indigo-450" />
                            <span className="text-sm font-extrabold text-white">{c.overallScore} / 10</span>
                          </div>
                        </div>

                        {/* Comparative Row: Salary */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Salary Expectation</span>
                          <p className="text-sm font-bold text-emerald-400">{c.salaryRange}</p>
                        </div>

                        {/* Comparative Row: Demand */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Job Demand</span>
                          <p className="text-xs font-semibold text-slate-200">{c.jobDemand} Demand</p>
                        </div>

                        {/* Comparative Row: Growth */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Growth Opportunities</span>
                          <p className="text-xs text-slate-400 leading-relaxed">{c.growthOpportunities}</p>
                        </div>

                        {/* Comparative Row: Required Skills */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Required Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {c.skills?.map((sk: any) => (
                              <Badge key={sk.id} variant={sk.importance === "Core" ? "success" : "secondary"} className="text-[9px]">
                                {sk.skill?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Work Life Indicator (Mock) */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Work-Life Balance</span>
                          <p className="text-xs text-slate-350">{c.title.includes("Developer") || c.title.includes("Engineer") ? "Moderate (flexible hours)" : "Good (structured timelines)"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="py-32 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3">
                <Columns className="h-10 w-10 text-slate-700 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-slate-400">Comparison Table is Empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Select target career options from the catalog registry on the left to compare salary models and growth opportunities.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
