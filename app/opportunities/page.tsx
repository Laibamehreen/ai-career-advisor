"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  getOpportunities,
  toggleSaveOpportunity,
  applyForOpportunity,
  updateApplicationStatus,
  deleteApplication,
  getActionCenterData,
} from "@/actions/opportunities";
import {
  Sparkles,
  Search,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Trophy,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Plus,
  Loader2,
  Trash2,
  BookmarkCheck,
  AlertCircle,
} from "lucide-react";

export default function OpportunitiesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = React.useState<any[]>([]);
  const [actionData, setActionData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState<string | null>(null);

  // Filters state
  const [searchVal, setSearchVal] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [locationFilter, setLocationFilter] = React.useState("ALL");
  const [expandedOppId, setExpandedOppId] = React.useState<string | null>(null);

  const userId = session?.user ? (session.user as any).id : null;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const oppRes = await getOpportunities(userId);
      if (oppRes.success) {
        setOpportunities(oppRes.opportunities);
      }
      if (userId) {
        const actionRes = await getActionCenterData(userId);
        if (actionRes.success) {
          setActionData(actionRes.actions);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSave = async (oppId: string) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save opportunities.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(oppId);
    try {
      const res = await toggleSaveOpportunity(userId, oppId);
      if (res.success) {
        toast({
          description: res.saved ? "Opportunity bookmarked!" : "Bookmark removed.",
        });
        loadData();
      }
    } catch (e) {
      toast({
        description: "Action failed.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleStartTracking = async (oppId: string) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track applications.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(oppId);
    try {
      const res = await applyForOpportunity(userId, oppId, "Applied", "Added from opportunity feed");
      if (res.success) {
        toast({
          description: "Added to your Application Tracker Kanban!",
        });
        loadData();
      }
    } catch (e) {
      toast({
        description: "Action failed.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleStatusChange = async (appId: string, status: string, notes: string = "") => {
    try {
      const res = await updateApplicationStatus(appId, status, notes);
      if (res.success) {
        toast({
          description: `Status updated to ${status}`,
        });
        loadData();
      }
    } catch (e) {
      toast({
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApp = async (appId: string) => {
    try {
      const res = await deleteApplication(appId);
      if (res.success) {
        toast({
          description: "Application tracking removed.",
        });
        loadData();
      }
    } catch (e) {
      toast({
        description: "Failed to delete tracking.",
        variant: "destructive",
      });
    }
  };

  // Filter items
  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchVal.toLowerCase()) ||
      opp.companyProvider.toLowerCase().includes(searchVal.toLowerCase()) ||
      opp.eligibility.toLowerCase().includes(searchVal.toLowerCase());

    const matchesType = typeFilter === "ALL" || opp.type === typeFilter;
    const matchesLoc =
      locationFilter === "ALL" ||
      (locationFilter === "Remote" && opp.location.toLowerCase().includes("remote")) ||
      (locationFilter === "Pakistan" && !opp.location.toLowerCase().includes("international")) ||
      (locationFilter === "International" && opp.location.toLowerCase().includes("international"));

    return matchesSearch && matchesType && matchesLoc;
  });

  // Kanban setup
  const kanbanColumns = ["Applied", "Interviewing", "Offered", "Rejected"];
  const trackedApps = opportunities.filter((opp) => opp.application);

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/10 pb-6 text-left gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Opportunities Discovery Hub
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              AI-driven Scholarship, Internship, and Job discovery engines with matching scores and Kanban tracking.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">Assembling matching opportunities feed...</p>
          </div>
        ) : (
          <>
            {/* AI Action Center Card */}
            {actionData && (
              <Card className="glass-card border-indigo-500/20 shadow-lg shadow-indigo-500/5 text-left">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    AI Career Action Center
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your personalized AI-recommended list of tasks, programs, and certifications to clear this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scholarships & Internships */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" /> Recommended Scholarships
                      </h3>
                      <div className="space-y-2">
                        {actionData.scholarships.map((s: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-200/5">
                            <p className="text-xs font-bold text-white leading-tight">{s.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{s.provider}</p>
                            <div className="flex items-center justify-between text-[9px] text-indigo-300 font-bold mt-2">
                              <span>{s.details}</span>
                              <span className="text-red-400">Deadline: {s.deadline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Internships & Jobs */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" /> Internships & Jobs
                      </h3>
                      <div className="space-y-2">
                        {[...actionData.internships, ...actionData.jobs.slice(0, 1)].map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-200/5">
                            <p className="text-xs font-bold text-white leading-tight">{item.name || item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{item.company}</p>
                            <div className="flex items-center justify-between text-[9px] text-indigo-300 font-bold mt-2">
                              <span>{item.type || item.location}</span>
                              <span className="text-emerald-400">Apply this month</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills & Certifications */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="h-4 w-4" /> Upskilling Checklist
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-200/5 space-y-2">
                          <p className="text-[11px] font-bold text-slate-350">Monthly Learning Checkpoints:</p>
                          <ul className="space-y-1.5">
                            {actionData.skillsToLearn.map((skill: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-200/5 space-y-2">
                          <p className="text-[11px] font-bold text-slate-350">Target Certifications:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {actionData.certifications.map((cert: string, idx: number) => (
                              <Badge key={idx} className="text-[9px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20 py-0.5">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs Workspace */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 bg-slate-900/60 p-1 border border-slate-200/5 rounded-xl">
                <TabsTrigger value="feed" className="font-bold py-2 rounded-lg cursor-pointer">Opportunities Feed</TabsTrigger>
                <TabsTrigger value="tracker" className="font-bold py-2 rounded-lg cursor-pointer">
                  Application Tracker
                  {trackedApps.length > 0 && (
                    <Badge className="ml-2 bg-indigo-500 text-white border-none py-0 px-1.5 text-[10px]">{trackedApps.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: OPPORTUNITIES FEED */}
              <TabsContent value="feed" className="space-y-6">
                {/* Search & Filters */}
                <Card className="glass-card p-4 border-slate-200/5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                      <Input
                        placeholder="Search by title, criteria, provider..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="pl-10 text-sm py-4 bg-slate-950/40"
                      />
                    </div>
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-slate-950/40 text-sm"
                    >
                      <option value="ALL" className="bg-slate-950 text-white">All Categories</option>
                      <option value="Scholarship" className="bg-slate-950 text-white">Scholarships</option>
                      <option value="Internship" className="bg-slate-950 text-white">Internships</option>
                      <option value="Job" className="bg-slate-950 text-white">Entry Jobs</option>
                      <option value="TechEvent" className="bg-slate-950 text-white">Tech Events & Contests</option>
                    </Select>
                    <Select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="bg-slate-950/40 text-sm"
                    >
                      <option value="ALL" className="bg-slate-950 text-white">All Locations</option>
                      <option value="Remote" className="bg-slate-950 text-white">Remote Only</option>
                      <option value="Pakistan" className="bg-slate-950 text-white">Pakistan Only</option>
                      <option value="International" className="bg-slate-950 text-white">International</option>
                    </Select>
                  </div>
                </Card>

                {/* Grid List */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredOpps.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-200/5">
                      <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-400">No matching opportunities found matching those parameters.</p>
                    </div>
                  ) : (
                    filteredOpps.map((opp) => {
                      const isExpanded = expandedOppId === opp.id;
                      return (
                        <Card key={opp.id} className="glass-card hover:border-indigo-500/20 transition-all text-left">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className="font-bold text-[9px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                                    {opp.type}
                                  </Badge>
                                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {opp.location}
                                  </span>
                                </div>
                                <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                                <p className="text-xs text-slate-400">{opp.companyProvider}</p>
                              </div>

                              {/* AI Matching Score Display */}
                              <div className="w-full sm:w-auto text-right flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-400">AI Opportunity Match:</span>
                                  <span className={`text-sm font-extrabold ${opp.matchPercentage > 75 ? "text-emerald-400" : opp.matchPercentage > 40 ? "text-indigo-400" : "text-amber-400"}`}>
                                    {opp.matchPercentage}%
                                  </span>
                                </div>
                                <Progress value={opp.matchPercentage} className="h-1.5 w-32 bg-slate-800" />
                              </div>
                            </div>

                            {/* Summary description line */}
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {opp.details}
                            </p>

                            {/* Expandable Section */}
                            {isExpanded && (
                              <div className="pt-4 border-t border-slate-200/5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
                                <div className="space-y-3">
                                  <div>
                                    <p className="font-bold text-indigo-400">Eligibility Analysis:</p>
                                    <p className="text-slate-350 mt-1 leading-relaxed">{opp.eligibilityAnalysis}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-indigo-400">Required Competencies:</p>
                                    <p className="text-slate-350 mt-1 leading-relaxed">{opp.eligibility}</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="font-bold text-indigo-400">Missing Requirements:</p>
                                    {opp.missingRequirements.length === 0 ? (
                                      <p className="text-emerald-400 font-bold mt-1">✓ None! You possess all required skills.</p>
                                    ) : (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {opp.missingRequirements.map((s: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="text-[10px] border-red-500/20 text-red-300 bg-red-500/5">
                                            {s}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-indigo-400">Recommended Next Steps:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-350 mt-1">
                                      {opp.recommendedNextSteps.map((step: string, idx: number) => (
                                        <li key={idx}>{step}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200/5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedOppId(isExpanded ? null : opp.id)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>Less details <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                  <>Analysis & requirements <ChevronDown className="h-4 w-4" /></>
                                )}
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={submitting === opp.id}
                                  onClick={() => handleToggleSave(opp.id)}
                                  className="h-8.5 text-slate-300 border-slate-200/10 cursor-pointer"
                                >
                                  {opp.isSaved ? (
                                    <BookmarkCheck className="h-4 w-4 text-pink-500" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </Button>
                                {opp.application ? (
                                  <Badge className="bg-emerald-500/15 border-emerald-500/20 text-emerald-300 py-1.5 px-3">
                                    Tracking Status: {opp.application.status}
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={submitting === opp.id}
                                    onClick={() => handleStartTracking(opp.id)}
                                    className="h-8.5 text-xs cursor-pointer"
                                  >
                                    Track App
                                  </Button>
                                )}
                                <a
                                  href={opp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 border border-slate-200/10 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                                >
                                  <ExternalLink className="h-4.5 w-4.5" />
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: APPLICATION TRACKER KANBAN */}
              <TabsContent value="tracker" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {kanbanColumns.map((colName) => {
                    const appsInCol = trackedApps.filter(
                      (opp) => opp.application && opp.application.status === colName
                    );

                    return (
                      <div key={colName} className="space-y-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/10 pb-2 text-left">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            {colName}
                          </h4>
                          <Badge className="bg-slate-900 text-slate-400 border border-slate-200/5">
                            {appsInCol.length}
                          </Badge>
                        </div>

                        {/* Column Body Cards */}
                        <div className="space-y-3 min-h-[300px] bg-slate-900/30 rounded-xl p-3 border border-slate-200/5">
                          {appsInCol.length === 0 ? (
                            <p className="text-[10px] text-slate-500 font-bold py-10 text-center">Empty</p>
                          ) : (
                            appsInCol.map((opp) => (
                              <Card key={opp.id} className="bg-slate-950 border-slate-200/5 p-3.5 space-y-3 shadow-md hover:border-slate-800 text-left">
                                <div>
                                  <p className="text-[10px] text-indigo-300 font-bold">{opp.type}</p>
                                  <h5 className="text-xs font-extrabold text-white mt-0.5">{opp.title}</h5>
                                  <p className="text-[9px] text-slate-400">{opp.companyProvider}</p>
                                </div>

                                {/* Custom notes box */}
                                <div className="space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Notes:</span>
                                  <textarea
                                    className="w-full text-[10px] bg-slate-900 text-slate-300 p-1.5 rounded-lg border border-slate-200/5 focus:outline-none"
                                    rows={2}
                                    placeholder="Write application log notes..."
                                    defaultValue={opp.application.notes || ""}
                                    onBlur={(e) =>
                                      handleStatusChange(opp.application.id, colName, e.target.value)
                                    }
                                  />
                                </div>

                                {/* Kanban Controls */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/5 gap-2">
                                  <Select
                                    value={colName}
                                    onChange={(e) =>
                                      handleStatusChange(opp.application.id, e.target.value, opp.application.notes)
                                    }
                                    className="h-7 text-[9px] py-0 px-2 bg-slate-900 border-none shrink-0 w-24"
                                  >
                                    {kanbanColumns.map((c) => (
                                      <option key={c} value={c} className="bg-slate-900 text-white text-[10px]">
                                        {c}
                                      </option>
                                    ))}
                                  </Select>

                                  <button
                                    onClick={() => handleDeleteApp(opp.application.id)}
                                    className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
