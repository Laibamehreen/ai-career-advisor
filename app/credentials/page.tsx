"use client";

import * as React from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { categories } from "@/lib/constants";
import { getCertificationRecommendations, getScholarshipRecommendations } from "@/actions/recommendations";
import { Award, GraduationCap, DollarSign, Calendar, ExternalLink, Loader2 } from "lucide-react";

export default function CredentialsPage() {
  const [loading, setLoading] = React.useState(true);
  const [certs, setCerts] = React.useState<any[]>([]);
  const [scholarships, setScholarships] = React.useState<any[]>([]);

  // Filter
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [certsRes, scholRes] = await Promise.all([
          getCertificationRecommendations(selectedCategory, "All"),
          getScholarshipRecommendations(selectedCategory),
        ]);
        if (certsRes.success) setCerts(certsRes.certs || []);
        if (scholRes.success) setScholarships(scholRes.scholarships || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCategory]);

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            Credentials & Scholarships
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Discover matching industry certifications, financial aid programs, and free academy course discounts for your career path.
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-xs text-left space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Career Path</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="certifications" className="w-full text-left">
          <TabsList className="w-full max-w-md bg-slate-900 border border-slate-200/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="certifications" className="w-1/2 rounded-lg font-bold text-xs py-2">
              Industry Certifications ({certs.length})
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="w-1/2 rounded-lg font-bold text-xs py-2">
              Scholarships & Aid ({scholarships.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading catalog items...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CERTIFICATIONS */}
              <TabsContent value="certifications" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {certs.map((c) => (
                  <Card key={c.id} className="glass-card flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded">
                          {c.careerPath}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase bg-slate-900 border-slate-800 text-slate-400 font-bold">
                          {c.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
                        <Award className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-450 mt-1">
                        Offered by {c.provider}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-t border-slate-800 pt-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                          Cost Mode: {c.cost}
                        </span>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline cursor-pointer"
                        >
                          Official Details <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* TAB 2: SCHOLARSHIPS */}
              <TabsContent value="scholarships" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {scholarships.map((s) => (
                  <Card key={s.id} className="glass-card flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded">
                          {s.careerPath}
                        </span>
                        <Badge variant="secondary" className="text-[9px] uppercase font-bold text-indigo-300">
                          {s.amount} Funding
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
                        <GraduationCap className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                        {s.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {s.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 text-[10px] space-y-1.5">
                        <p className="text-slate-500 font-bold uppercase">Eligibility Guidelines</p>
                        <p className="text-slate-300 font-medium">{s.eligibility}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 border-t border-slate-800 pt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          Deadline: {s.deadline ? new Date(s.deadline).toLocaleDateString() : "Rolling"}
                        </span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline cursor-pointer"
                        >
                          Apply Now <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardShell>
  );
}
