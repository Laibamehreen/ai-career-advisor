"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/app/providers";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardCheck,
  Compass,
  FileSearch,
  MessageSquareCode,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  UserCheck,
  ListTodo,
  Award,
  Briefcase,
  Users,
  Globe,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Career Assessment", href: "/assessment", icon: ClipboardCheck },
    { name: "Explore Careers", href: "/careers", icon: Compass },
    { name: "AI Resume Hub", href: "/resume", icon: FileSearch },
    { name: "AI Cover Letter", href: "/cover-letter", icon: Sparkles },
    { name: "Interview Coach", href: "/interview", icon: UserCheck },
    { name: "Learning Planner", href: "/planner", icon: ListTodo },
    { name: "Opportunities Hub", href: "/opportunities", icon: Globe },
    { name: "Credentials & Aid", href: "/credentials", icon: Award },
    { name: "Portfolio Projects", href: "/projects", icon: Briefcase },
    { name: "Community Forum", href: "/community", icon: Users },
    { name: "AI Advisor Chat", href: "/chat", icon: MessageSquareCode },
  ];

  if (isAdmin) {
    navigation.push({ name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  const toggleMobile = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleMobile}
          className="p-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/60 border border-slate-200/10 backdrop-blur-md text-slate-200 hover:text-white cursor-pointer"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-30 w-64 bg-slate-950/70 dark:bg-slate-900/40 border-r border-slate-200/10 dark:border-slate-800/80 backdrop-blur-xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          }
        )}
      >
        <div className="flex flex-col gap-8">
          {/* Logo Title */}
          <div className="flex items-center gap-2.5 pl-2 mt-4 lg:mt-0">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent leading-none">
                Aura Advisor
              </h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                AI Career Advisor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[65vh] pr-1 scrollbar-thin">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                    {
                      "bg-indigo-600/90 hover:bg-indigo-650 text-white shadow-sm shadow-indigo-600/10":
                        isActive,
                      "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50": !isActive,
                    }
                  )}
                >
                  <item.icon className={cn("h-5 w-5", { "text-white": isActive, "text-slate-400": !isActive })} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col gap-4 border-t border-slate-200/10 dark:border-slate-800/60 pt-4">
          {/* User info display */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/35">
              <span className="text-sm font-bold text-indigo-400">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-200">
                {session?.user?.name || "Student User"}
              </p>
              <p className="text-xs truncate text-slate-500">
                {session?.user?.email}
              </p>
            </div>
          </div>

          {/* Theme & Log Out */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200/10 hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl border border-red-500/10 hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Layout Wrapper */}
      <div
        className={cn("lg:pl-64 transition-all duration-300 min-h-screen flex flex-col", {
          "blur-sm lg:blur-none pointer-events-none lg:pointer-events-auto": isOpen,
        })}
      >
        {/* Children will render in the page container */}
      </div>
    </>
  );
}
