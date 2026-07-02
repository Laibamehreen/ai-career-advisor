"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { categories } from "@/lib/constants";
import {
  getAdminAnalytics,
  getAdminCareersList,
  upsertCareer,
  deleteCareer,
  getUsersList,
  getAuditLogs,
  logAuditAction,
} from "@/actions/admin";
import {
  getCertificationRecommendations,
  getScholarshipRecommendations,
  getProjectRecommendations,
  upsertCertification,
  deleteCertification,
  upsertScholarship,
  deleteScholarship,
  upsertProjectRecommendation,
  deleteProjectRecommendation,
} from "@/actions/recommendations";
import {
  Users,
  Briefcase,
  BookOpen,
  ClipboardCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  Edit2,
  PlusCircle,
  BarChart3,
  PieChart as PieIcon,
  LineChart,
  Award,
  GraduationCap,
  FolderGit,
  History,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

export default function AdminPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState("analytics");
  const [loading, setLoading] = React.useState(true);

  // Administrative telemetry datasets
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [careers, setCareers] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [certs, setCerts] = React.useState<any[]>([]);
  const [scholarships, setScholarships] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);

  // Dialog & Form configuration state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"career" | "cert" | "scholarship" | "project">("career");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Forms states
  const [careerForm, setCareerForm] = React.useState({
    title: "",
    category: "Data Science",
    description: "",
    salaryRange: "$80,000 - $120,000",
    growthOpportunities: "High opportunities.",
    jobDemand: "High",
    overallScore: "9.0",
  });

  const [certForm, setCertForm] = React.useState({
    name: "",
    provider: "",
    careerPath: "Data Science",
    difficulty: "Beginner",
    cost: "Paid",
    url: "",
  });

  const [scholarshipForm, setScholarshipForm] = React.useState({
    name: "",
    provider: "",
    description: "",
    eligibility: "",
    deadline: "",
    amount: "Varies",
    url: "",
    careerPath: "Data Science",
  });

  const [projectForm, setProjectForm] = React.useState({
    title: "",
    careerPath: "Data Science",
    difficulty: "Beginner",
    techStack: "",
    description: "",
    learningOutcomes: "",
    estHours: "20",
  });

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userId = session?.user ? (session.user as any).id : null;

  const loadAdminData = React.useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [
        analyticsRes,
        careersRes,
        usersRes,
        logsRes,
        certsRes,
        scholRes,
        projRes,
      ] = await Promise.all([
        getAdminAnalytics(),
        getAdminCareersList(),
        getUsersList(),
        getAuditLogs(),
        getCertificationRecommendations("All", "All"),
        getScholarshipRecommendations("All"),
        getProjectRecommendations("All", "All"),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (careersRes.success) setCareers(careersRes.careers || []);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
      if (certsRes.success) setCerts(certsRes.certs || []);
      if (scholRes.success) setScholarships(scholRes.scholarships || []);
      if (projRes.success) setProjects(projRes.projects || []);
    } catch (e) {
      toast({ description: "Failed to load administrative telemetry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, toast]);

  React.useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // -- CRUD Submissions handlers --

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerForm.title || !careerForm.description) return;
    setSubmitting(true);
    try {
      const res = await upsertCareer(editingId, careerForm);
      if (res.success) {
        await logAuditAction(userId, editingId ? "EDIT_CAREER" : "CREATE_CAREER", `Modified career name: ${careerForm.title}`);
        toast({ title: "Success", description: "Successfully updated career details.", variant: "success" });
        setIsModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name || !certForm.provider) return;
    setSubmitting(true);
    try {
      const res = await upsertCertification(editingId, certForm);
      if (res.success) {
        await logAuditAction(userId, editingId ? "EDIT_CERTIFICATION" : "CREATE_CERTIFICATION", `Modified certification: ${certForm.name}`);
        toast({ title: "Success", description: "Successfully updated certification details.", variant: "success" });
        setIsModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScholarshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarshipForm.name || !scholarshipForm.provider) return;
    setSubmitting(true);
    try {
      const res = await upsertScholarship(editingId, scholarshipForm);
      if (res.success) {
        await logAuditAction(userId, editingId ? "EDIT_SCHOLARSHIP" : "CREATE_SCHOLARSHIP", `Modified scholarship: ${scholarshipForm.name}`);
        toast({ title: "Success", description: "Successfully updated scholarship details.", variant: "success" });
        setIsModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;
    setSubmitting(true);
    try {
      const res = await upsertProjectRecommendation(editingId, projectForm);
      if (res.success) {
        await logAuditAction(userId, editingId ? "EDIT_PROJECT" : "CREATE_PROJECT", `Modified recommended project: ${projectForm.title}`);
        toast({ title: "Success", description: "Successfully updated project details.", variant: "success" });
        setIsModalOpen(false);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Delete Handlers --

  const handleDeleteCareer = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await deleteCareer(id);
      if (res.success) {
        await logAuditAction(userId, "DELETE_CAREER", `Deleted career: ${name}`);
        toast({ title: "Deleted", description: `Removed career path "${name}".`, variant: "success" });
        loadAdminData();
      }
    } catch (e) {}
  };

  const handleDeleteCert = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await deleteCertification(id);
      if (res.success) {
        await logAuditAction(userId, "DELETE_CERTIFICATION", `Deleted cert: ${name}`);
        toast({ title: "Deleted", description: `Removed certification "${name}".`, variant: "success" });
        loadAdminData();
      }
    } catch (e) {}
  };

  const handleDeleteScholarship = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await deleteScholarship(id);
      if (res.success) {
        await logAuditAction(userId, "DELETE_SCHOLARSHIP", `Deleted scholarship: ${name}`);
        toast({ title: "Deleted", description: `Removed scholarship "${name}".`, variant: "success" });
        loadAdminData();
      }
    } catch (e) {}
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await deleteProjectRecommendation(id);
      if (res.success) {
        await logAuditAction(userId, "DELETE_PROJECT", `Deleted recommended project: ${name}`);
        toast({ title: "Deleted", description: `Removed recommended project "${name}".`, variant: "success" });
        loadAdminData();
      }
    } catch (e) {}
  };

  if (!isAdmin) {
    return (
      <DashboardShell>
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
          <div className="h-14 w-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center shadow-lg">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Access Denied</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This panel is restricted to System Administrators.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="font-bold">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading admin operations console...</p>
        </div>
      </DashboardShell>
    );
  }

  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              System Admin & Analytics
              <ShieldAlert className="h-6 w-6 text-indigo-400" />
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Configure curriculum registries, review audit logs, and explore database telemetry stats.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-left">
          <TabsList className="flex flex-wrap h-auto bg-slate-900 border border-slate-200/10 p-1 rounded-xl mb-6 max-w-3xl gap-1">
            <TabsTrigger value="analytics" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Telemetry Charts
            </TabsTrigger>
            <TabsTrigger value="careers" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <Briefcase className="h-4 w-4 mr-1.5" /> Careers Registry
            </TabsTrigger>
            <TabsTrigger value="certs" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <Award className="h-4 w-4 mr-1.5" /> Certifications
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <GraduationCap className="h-4 w-4 mr-1.5" /> Scholarships
            </TabsTrigger>
            <TabsTrigger value="projects" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <FolderGit className="h-4 w-4 mr-1.5" /> Projects
            </TabsTrigger>
            <TabsTrigger value="users" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <Users className="h-4 w-4 mr-1.5" /> User Lookup
            </TabsTrigger>
            <TabsTrigger value="audit" className="font-bold text-xs py-2 rounded-lg shrink-0">
              <History className="h-4 w-4 mr-1.5" /> Security Logs
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TELEMETRY CHARTS */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            {/* Aggregated Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Users</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {users.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Active Careers</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {careers.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Course Materials</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {analytics?.stats?.totalResources || 21}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quiz Runs</span>
                    <h3 className="text-3xl font-extrabold text-white mt-1">
                      {analytics?.stats?.totalAssessments || 4}
                    </h3>
                  </div>
                  <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart 1: Popular Careers Bar Chart */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader className="text-left pb-2">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                    Popular Careers Map (Saved Counts)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.popularCareers || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="title" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "rgba(255,255,255,0.05)",
                          borderRadius: "10px",
                        }}
                      />
                      <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Popular Skills Pie Chart */}
              <Card className="glass-card">
                <CardHeader className="text-left pb-2">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <PieIcon className="h-4.5 w-4.5 text-indigo-400" />
                    Skill Frequency Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72 flex flex-col justify-between">
                  <div className="flex-1 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.popularSkills || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {(analytics?.popularSkills || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-200/5">
                    {(analytics?.popularSkills || []).map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[9px] text-slate-400 font-bold truncate max-w-[70px]">
                          {entry.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: CAREERS REGISTRY */}
          <TabsContent value="careers" className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setCareerForm({
                    title: "",
                    category: "Data Science",
                    description: "",
                    salaryRange: "$80,000 - $120,000",
                    growthOpportunities: "High",
                    jobDemand: "High",
                    overallScore: "9.0",
                  });
                  setModalType("career");
                  setIsModalOpen(true);
                }}
                className="font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Add Career
              </Button>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Salary Expectation</th>
                        <th className="p-4">Job Demand</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {careers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 font-bold text-white">{c.title}</td>
                          <td className="p-4 text-slate-350">{c.category}</td>
                          <td className="p-4 text-emerald-400 font-medium">{c.salaryRange}</td>
                          <td className="p-4 text-slate-350">{c.jobDemand}</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              onClick={() => {
                                setEditingId(c.id);
                                setCareerForm({
                                  title: c.title,
                                  category: c.category,
                                  description: c.description,
                                  salaryRange: c.salaryRange,
                                  growthOpportunities: c.growthOpportunities,
                                  jobDemand: c.jobDemand,
                                  overallScore: c.overallScore.toString(),
                                });
                                setModalType("career");
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer hover:bg-red-500/10" onClick={() => handleDeleteCareer(c.id, c.title)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: CERTIFICATIONS */}
          <TabsContent value="certs" className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setCertForm({
                    name: "",
                    provider: "",
                    careerPath: "Data Science",
                    difficulty: "Beginner",
                    cost: "Paid",
                    url: "",
                  });
                  setModalType("cert");
                  setIsModalOpen(true);
                }}
                className="font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Add Certification
              </Button>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Provider</th>
                        <th className="p-4">Career Track</th>
                        <th className="p-4">Cost Mode</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {certs.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 font-bold text-white">{c.name}</td>
                          <td className="p-4 text-slate-350">{c.provider}</td>
                          <td className="p-4 text-slate-350">{c.careerPath}</td>
                          <td className="p-4 text-indigo-400 font-medium">{c.cost}</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingId(c.id);
                                setCertForm({
                                  name: c.name,
                                  provider: c.provider,
                                  careerPath: c.careerPath,
                                  difficulty: c.difficulty,
                                  cost: c.cost,
                                  url: c.url,
                                });
                                setModalType("cert");
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-indigo-450" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/10" onClick={() => handleDeleteCert(c.id, c.name)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SCHOLARSHIPS */}
          <TabsContent value="scholarships" className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setScholarshipForm({
                    name: "",
                    provider: "",
                    description: "",
                    eligibility: "",
                    deadline: "",
                    amount: "Varies",
                    url: "",
                    careerPath: "Data Science",
                  });
                  setModalType("scholarship");
                  setIsModalOpen(true);
                }}
                className="font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Add Scholarship
              </Button>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Provider</th>
                        <th className="p-4">Target Track</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {scholarships.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 font-bold text-white">{s.name}</td>
                          <td className="p-4 text-slate-350">{s.provider}</td>
                          <td className="p-4 text-slate-350">{s.careerPath}</td>
                          <td className="p-4 text-emerald-400 font-semibold">{s.amount}</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingId(s.id);
                                setScholarshipForm({
                                  name: s.name,
                                  provider: s.provider,
                                  description: s.description,
                                  eligibility: s.eligibility,
                                  deadline: s.deadline ? s.deadline.substring(0, 10) : "",
                                  amount: s.amount,
                                  url: s.url,
                                  careerPath: s.careerPath,
                                });
                                setModalType("scholarship");
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/10" onClick={() => handleDeleteScholarship(s.id, s.name)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: PROJECTS */}
          <TabsContent value="projects" className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingId(null);
                  setProjectForm({
                    title: "",
                    careerPath: "Data Science",
                    difficulty: "Beginner",
                    techStack: "",
                    description: "",
                    learningOutcomes: "",
                    estHours: "20",
                  });
                  setModalType("project");
                  setIsModalOpen(true);
                }}
                className="font-bold flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Add Project
              </Button>
            </div>
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Title</th>
                        <th className="p-4">Target Role</th>
                        <th className="p-4">Level</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {projects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 font-bold text-white">{p.title}</td>
                          <td className="p-4 text-slate-350">{p.careerPath}</td>
                          <td className="p-4 text-slate-350">{p.difficulty}</td>
                          <td className="p-4 text-indigo-400 font-semibold">{p.estHours} Hrs</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingId(p.id);
                                setProjectForm({
                                  title: p.title,
                                  careerPath: p.careerPath,
                                  difficulty: p.difficulty,
                                  techStack: p.techStack,
                                  description: p.description,
                                  learningOutcomes: p.learningOutcomes,
                                  estHours: p.estHours.toString(),
                                });
                                setModalType("project");
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/10" onClick={() => handleDeleteProject(p.id, p.title)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: USERS */}
          <TabsContent value="users" className="animate-fade-in">
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">User Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4">Signup Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 font-bold text-white">{u.name || "Student"}</td>
                          <td className="p-4 text-slate-350">{u.email}</td>
                          <td className="p-4">
                            <Badge className={u.role === "ADMIN" ? "bg-indigo-500/10 text-indigo-300" : "bg-slate-900 text-slate-400"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: AUDIT LOGS */}
          <TabsContent value="audit" className="animate-fade-in">
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Timestamp</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/10">
                          <td className="p-4 pl-6 text-slate-500 font-medium">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {log.user?.name || "System/Anonymous"}
                          </td>
                          <td className="p-4 font-bold text-indigo-400">{log.action}</td>
                          <td className="p-4 text-slate-350">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* POPUP MODALS FOR ADDING / EDITING DEPENDENCIES */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingId
            ? `Modify ${modalType.toUpperCase()} Record`
            : `Add New ${modalType.toUpperCase()} Record`
        }
        description="Fill out specifications for database catalog synchronizations."
      >
        {/* CAREER FORM */}
        {modalType === "career" && (
          <form onSubmit={handleCareerSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <Label>Title</Label>
                <Input value={careerForm.title} onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Category</Label>
                <select
                  value={careerForm.category}
                  onChange={(e) => setCareerForm({ ...careerForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>Description</Label>
              <Textarea value={careerForm.description} onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })} className="h-20" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <Label>Salary Range</Label>
                <Input value={careerForm.salaryRange} onChange={(e) => setCareerForm({ ...careerForm, salaryRange: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Demand</Label>
                <Input value={careerForm.jobDemand} onChange={(e) => setCareerForm({ ...careerForm, jobDemand: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Score (0-10)</Label>
                <Input value={careerForm.overallScore} onChange={(e) => setCareerForm({ ...careerForm, overallScore: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>Growth Opportunities</Label>
              <Input value={careerForm.growthOpportunities} onChange={(e) => setCareerForm({ ...careerForm, growthOpportunities: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}

        {/* CERTIFICATION FORM */}
        {modalType === "cert" && (
          <form onSubmit={handleCertSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <Label>Name</Label>
                <Input value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Provider</Label>
                <Input value={certForm.provider} onChange={(e) => setCertForm({ ...certForm, provider: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <Label>Career Track</Label>
                <select
                  value={certForm.careerPath}
                  onChange={(e) => setCertForm({ ...certForm, careerPath: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <Label>Difficulty</Label>
                <select
                  value={certForm.difficulty}
                  onChange={(e) => setCertForm({ ...certForm, difficulty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1 text-left">
                <Label>Cost Mode</Label>
                <Input value={certForm.cost} onChange={(e) => setCertForm({ ...certForm, cost: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>External Link URL</Label>
              <Input value={certForm.url} onChange={(e) => setCertForm({ ...certForm, url: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}

        {/* SCHOLARSHIP FORM */}
        {modalType === "scholarship" && (
          <form onSubmit={handleScholarshipSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <Label>Name</Label>
                <Input value={scholarshipForm.name} onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Provider</Label>
                <Input value={scholarshipForm.provider} onChange={(e) => setScholarshipForm({ ...scholarshipForm, provider: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>Description</Label>
              <Textarea value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} className="h-16" />
            </div>
            <div className="space-y-1 text-left">
              <Label>Eligibility Criteria</Label>
              <Input value={scholarshipForm.eligibility} onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <Label>Career Track</Label>
                <select
                  value={scholarshipForm.careerPath}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, careerPath: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <Label>Deadline</Label>
                <Input type="date" value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Funding Amount</Label>
                <Input value={scholarshipForm.amount} onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>External Application URL</Label>
              <Input value={scholarshipForm.url} onChange={(e) => setScholarshipForm({ ...scholarshipForm, url: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}

        {/* RECOMMENDED PORTFOLIO PROJECT FORM */}
        {modalType === "project" && (
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <Label>Project Title</Label>
                <Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Target Career Track</Label>
                <select
                  value={projectForm.careerPath}
                  onChange={(e) => setProjectForm({ ...projectForm, careerPath: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <Label>Difficulty Level</Label>
                <select
                  value={projectForm.difficulty}
                  onChange={(e) => setProjectForm({ ...projectForm, difficulty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1 text-left">
                <Label>Est. Hours</Label>
                <Input type="number" value={projectForm.estHours} onChange={(e) => setProjectForm({ ...projectForm, estHours: e.target.value })} />
              </div>
              <div className="space-y-1 text-left">
                <Label>Tech Stack (comma split)</Label>
                <Input value={projectForm.techStack} onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })} placeholder="React, Node.js" />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label>Description</Label>
              <Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="h-16" />
            </div>
            <div className="space-y-1 text-left">
              <Label>Learning Outcomes Summary</Label>
              <Input value={projectForm.learningOutcomes} onChange={(e) => setProjectForm({ ...projectForm, learningOutcomes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </DashboardShell>
  );
}
