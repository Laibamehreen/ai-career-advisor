"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Loader2 } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl animate-bounce shadow-lg shadow-indigo-500/20">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          Loading Workspace...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 lg:pl-64 min-h-screen flex flex-col w-full overflow-x-hidden">
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full mt-10 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
