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
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  HelpCircle,
  GraduationCap,
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
          content: `Hi **${session?.user?.name || "Student"}**! 

I'm your **AI Career Advisor**. I am here to help you:
* Plan and evaluate technical skill goals.
* Learn details about salaries, demand, and growth in tech.
* Review interview preparation tips and coding challenges.

What path are you interested in exploring today?`,
          createdAt: new Date(),
        },
      ]);
    }
  }, [messages.length, session, setMessages]);

  // Scroll to bottom on message updates
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickPrompts = [
    "What are the core skills for a DevOps Engineer?",
    "Suggest a learning plan for UI/UX Design.",
    "Which is better: AI Engineering or Data Science?",
    "Give me interview prep tips for web development.",
  ];

  const handleSend = async (text: string) => {
    if (!text || text.trim().length === 0 || loading) return;

    // 1. Add user message
    addMessage({ role: "user", content: text });
    setInputVal("");
    setLoading(true);

    try {
      // Create session history format
      const formattedHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 2. Fetch AI Answer
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

  const handleQuickPromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in text-slate-100 max-w-4xl mx-auto flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/10 dark:border-slate-800/60 pb-4">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              AI Career Advisor Chat
              <MessageSquareCode className="h-5 w-5 text-indigo-400" />
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Ask about job duties, preparation strategies, frameworks, and portfolios.
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
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed text-left ${
                      isUser
                        ? "bg-indigo-600 text-white font-semibold rounded-br-none"
                        : "bg-slate-900/60 border border-slate-200/5 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {/* Render Markdown list bullets and bold text simply */}
                    <div className="space-y-1">
                      {m.content.split("\n").map((line, lIdx) => {
                        let content: React.ReactNode = line;
                        // Replace simple bold markers **text**
                        if (line.includes("**")) {
                          const parts = line.split("**");
                          content = parts.map((part, pIdx) =>
                            pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-extrabold">{part}</strong> : part
                          );
                        }
                        // Handle bullet lists * text
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
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-200/5 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">Advisor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </CardContent>

          {/* Quick suggestions pills */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-slate-200/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-left">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-2 text-left">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleQuickPromptClick(p)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200/10 bg-slate-900/50 hover:bg-slate-900 text-xs text-slate-300 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

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
