"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { useChatStore } from "@/lib/store";
import { askCareerAdvisor } from "@/actions/chat";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  Brain,
  Award,
  BookOpen,
  ArrowRight,
  UserCheck,
  Zap,
} from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { messages, addMessage, setMessages, clearChat } = useChatStore();
  const [inputVal, setInputVal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement | null>(null);

  const userId = session?.user ? (session.user as any).id : null;

  // Pre-populate chat thread if empty
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: JSON.stringify({
            agent: "Career Expert Agent",
            reply: `Hi **${session?.user?.name || "Student"}**! 

I'm your **Master AI Career Strategy Agent**. I orchestrate a team of specialist sub-agents:
* **Career Expert Agent** 💼 (Path simulation and career strategies)
* **Learning Expert Agent** 🧠 (Roadmaps, coursework, and study tasks)
* **Resume Expert Agent** 📝 (ATS keyword formatting and critiques)
* **Interview Expert Agent** 🎤 (Mock question grading and communication prep)
* **Skills Expert Agent** 🏆 (Competency matrix gap tracking)

What role or skill challenge are you interested in exploring today?`,
            followUps: [
              "What are the core skills for a DevOps Engineer?",
              "Suggest a learning plan for UI/UX Design.",
              "Score my resume templates",
            ],
          }),
          createdAt: new Date(),
        },
      ]);
    }
  }, [messages.length, session, setMessages]);

  // Scroll to bottom on message updates
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text || text.trim().length === 0 || loading) return;

    // 1. Add user message
    addMessage({ role: "user", content: text });
    setInputVal("");
    setLoading(true);

    try {
      // Create session history format
      const formattedHistory = messages.map((m) => {
        let contentText = m.content;
        try {
          const parsed = JSON.parse(m.content);
          contentText = parsed.reply || m.content;
        } catch (e) {}
        return {
          role: m.role,
          content: contentText,
        };
      });

      // 2. Fetch AI Answer (JSON string payload)
      const res = await askCareerAdvisor(userId, formattedHistory, text);
      if (res.success && res.answer) {
        addMessage({ role: "assistant", content: res.answer });
      } else {
        toast({
          title: "Advisor Connection Error",
          description: res.error || "Failed to formulate career answers.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the advisor engine.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSend(actionText);
  };

  const quickActions = [
    { label: "Roadmap for Data Science", text: "I want to become a Data Scientist" },
    { label: "Cybersecurity vs AI", text: "Which career suits me better, Cybersecurity or AI?" },
    { label: "ATS Resume Tips", text: "Optimize my resume experience bullet points" },
    { label: "DevOps Next Skill", text: "I have learned Python. What DevOps skill should I do next?" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in text-slate-100 max-w-4xl mx-auto flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/10 dark:border-slate-800/60 pb-4 text-left">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              AI Career Mentor Agent
              <MessageSquareCode className="h-5 w-5 text-indigo-400" />
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Interactive multi-agent system routing questions to Careers, Learning, Resume, Interview, or Skills Expert sub-agents.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearChat();
              toast({ description: "Conversation cleared." });
            }}
            className="text-slate-400 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        </div>

        {/* Chat Interface Container */}
        <Card className="glass-card flex-1 flex flex-col justify-between overflow-hidden">
          {/* Messages Body */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh] lg:max-h-[55vh]">
            {messages.map((m) => {
              const isUser = m.role === "user";
              
              // Try parsing formatted agent payload
              let replyText = m.content;
              let agentBadgeName = "";
              let messageFollowUps: string[] = [];

              if (!isUser) {
                try {
                  const parsed = JSON.parse(m.content);
                  replyText = parsed.reply || m.content;
                  agentBadgeName = parsed.agent || "";
                  messageFollowUps = parsed.followUps || [];
                } catch (e) {}
              }

              return (
                <div key={m.id} className="space-y-2">
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className="max-w-[85%] space-y-1.5 text-left">
                      {/* Active Agent Badge */}
                      {!isUser && agentBadgeName && (
                        <div className="flex items-center gap-1.5 pl-1">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {agentBadgeName}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed ${
                          isUser
                            ? "bg-indigo-600 text-white font-semibold rounded-br-none"
                            : "bg-slate-900/60 border border-slate-200/5 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        {/* Render simple markdown styling */}
                        <div className="space-y-1">
                          {replyText.split("\n").map((line, lIdx) => {
                            let content: React.ReactNode = line;
                            if (line.includes("**")) {
                              const parts = line.split("**");
                              content = parts.map((part, pIdx) =>
                                pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-extrabold">{part}</strong> : part
                              );
                            }
                            if (line.trim().startsWith("*")) {
                              const clean = line.replace(/^\s*\*\s*/, "");
                              return (
                                <li key={lIdx} className="ml-4 list-disc">
                                  {clean.includes("**") ? (
                                    clean.split("**").map((part, pIdx) =>
                                      pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-extrabold">{part}</strong> : part
                                    )
                                  ) : (
                                    clean
                                  )}
                                </li>
                              );
                            }
                            return <p key={lIdx}>{content}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Render Follow-up tag pills for the latest message */}
                  {!isUser && messageFollowUps.length > 0 && messages[messages.length - 1].id === m.id && (
                    <div className="flex flex-wrap gap-2 justify-start pl-1">
                      {messageFollowUps.map((qText, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(qText)}
                          disabled={loading}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-indigo-350 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {qText} <ArrowRight className="h-3 w-3 inline ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-200/5 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">Orchestrating specialist sub-agent...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </CardContent>

          {/* Quick Actions Panel */}
          <div className="px-4 py-2 border-t border-slate-200/5 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-indigo-455" /> Smart Quick Actions:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((a, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(a.text)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200/10 bg-slate-900/40 hover:bg-slate-900 text-xs text-slate-350 hover:text-slate-200 cursor-pointer transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Sender footer */}
          <CardFooter className="p-3 border-t border-slate-200/5 bg-slate-950/20 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex w-full gap-2.5"
            >
              <Input
                placeholder="Ask about resume metrics, technical roadmaps, salaries, certifications..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={loading}
                className="flex-1 py-5 text-sm"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={loading}>
                <Send className="h-4.5 w-4.5 text-white" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
