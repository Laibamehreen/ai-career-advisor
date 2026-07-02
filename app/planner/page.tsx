"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { generateOrGetPlan, toggleTaskCompletion, addCustomTask } from "@/actions/planner";
import { getAllCareersWithSkills } from "@/actions/assessment";
import {
  ListTodo,
  Calendar,
  PlusCircle,
  CheckCircle,
  Clock,
  Loader2,
  Wand2,
  Bookmark,
  TrendingUp,
} from "lucide-react";

export default function PlannerPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [careersList, setCareersList] = React.useState<any[]>([]);

  // Selection
  const [selectedCareerId, setSelectedCareerId] = React.useState("");
  const [duration, setDuration] = React.useState("Weekly"); // Weekly or Monthly

  // Active Plan
  const [activePlan, setActivePlan] = React.useState<any>(null);

  // Custom Task Dialog
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [customTitle, setCustomTitle] = React.useState("");
  const [customDesc, setCustomDesc] = React.useState("");
  const [customDeadline, setCustomDeadline] = React.useState("7");
  const [addingTask, setAddingTask] = React.useState(false);

  const userId = session?.user ? (session.user as any).id : null;

  const loadCareers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCareersWithSkills();
      if (res.success && res.careers && res.careers.length > 0) {
        setCareersList(res.careers);
        setSelectedCareerId(res.careers[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  // Load existing plan if any on selector change
  const handleLoadPlan = async () => {
    if (!userId || !selectedCareerId) return;
    setGenerating(true);
    try {
      const res = await generateOrGetPlan(userId, selectedCareerId, duration);
      if (res.success && res.plan) {
        setActivePlan(res.plan);
        toast({ title: "Plan Synchronized", description: "Learning schedule loaded successfully.", variant: "success" });
      } else {
        toast({ description: res.error || "Failed to load plan.", variant: "destructive" });
      }
    } catch (e) {
      toast({ description: "Error fetching learning plan.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!activePlan || !userId) return;
    try {
      const res = await toggleTaskCompletion(activePlan.id, taskId, userId);
      if (res.success) {
        setActivePlan(res.plan);
      }
    } catch (err) {
      toast({ description: "Failed to update task state.", variant: "destructive" });
    }
  };

  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle) {
      toast({ description: "Please enter a task title.", variant: "destructive" });
      return;
    }

    setAddingTask(true);
    try {
      const res = await addCustomTask(activePlan.id, customTitle, customDesc, parseInt(customDeadline));
      if (res.success && res.plan) {
        setActivePlan(res.plan);
        setIsDialogOpen(false);
        setCustomTitle("");
        setCustomDesc("");
        toast({ title: "Task Added", description: "Custom learning task appended.", variant: "success" });
      }
    } catch (err) {
      toast({ description: "Failed to add custom task.", variant: "destructive" });
    } finally {
      setAddingTask(false);
    }
  };

  const completedCount = activePlan?.tasks?.filter((t: any) => t.completed).length || 0;
  const totalCount = activePlan?.tasks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading planner module...</p>
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
            AI Skills Planner
            <ListTodo className="h-6 w-6 text-indigo-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Map out step-by-step weekly or monthly learning plans to bridge your career skill gaps.
          </p>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Configuration Card */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-indigo-400" /> Setup Study Schedule
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Configure target metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Career Goal</Label>
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
                  <Label>Plan Duration</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Weekly", "Monthly"].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          duration === dur
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                            : "border-slate-800 hover:bg-slate-900 text-slate-400"
                        }`}
                      >
                        {dur} Target Plan
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleLoadPlan} className="w-full font-bold" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Schedule...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4.5 w-4.5" /> Initialize Plan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Overall Progress Tracker widget */}
            {activePlan && (
              <Card className="glass-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <TrendingUp className="h-4.5 w-4.5 text-emerald-400" /> Progress Tracker
                    </span>
                    <span className="text-indigo-400">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} />
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    You completed {completedCount} out of {totalCount} total tasks. Finish all scheduled tasks to earn new achievement badges!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active Planner Tasks List */}
          <div className="lg:col-span-3 text-left">
            {activePlan ? (
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                      <Bookmark className="h-4.5 w-4.5 text-indigo-400" /> Active Schedule Tasks
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {activePlan.careerTitle} • {activePlan.duration} Plan
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm" className="text-xs font-bold">
                    <PlusCircle className="h-4 w-4 mr-1.5 text-indigo-400" /> Custom Task
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {activePlan.tasks?.map((task: any) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                        task.completed
                          ? "bg-slate-900/30 border-slate-200/5 opacity-60"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-800"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${
                          task.completed
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "border-slate-500 hover:border-indigo-400"
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3.5 w-3.5 fill-emerald-500/10" />}
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <h4 className={`text-sm font-bold ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{task.content}</p>
                        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="py-28 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3">
                <ListTodo className="h-10 w-10 text-slate-700" />
                <div>
                  <p className="text-sm font-bold text-slate-400">No Active Study Plan</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Select a target career role and plan duration on the left, then click Initialize to generate your learning track.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOG FOR ADDING CUSTOM TASK */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add Custom Planner Task"
        description="Append a personal milestone or coursework to your active schedule."
      >
        <form onSubmit={handleAddCustomTask} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="custTitle">Task Title</Label>
            <Input
              id="custTitle"
              placeholder="e.g. Read Clean Code Chapter 2"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label htmlFor="custDesc">Description / Objectives</Label>
            <Input
              id="custDesc"
              placeholder="Summarize object naming rules and functions..."
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label htmlFor="custDays">Deadline (Days from now)</Label>
            <select
              id="custDays"
              value={customDeadline}
              onChange={(e) => setCustomDeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="3">3 Days</option>
              <option value="7">7 Days (1 Week)</option>
              <option value="14">14 Days (2 Weeks)</option>
              <option value="30">30 Days (1 Month)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addingTask} className="font-bold">
              {addingTask ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </Dialog>
    </DashboardShell>
  );
}
