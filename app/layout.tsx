import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aura Advisor | Next-Gen AI Career Planning Platform",
  description:
    "Discover your ideal career path, analyze resume skills gaps, track progress, generate step-by-step career roadmaps, and chat with your personal AI Career Advisor.",
  keywords: [
    "AI Career Advisor",
    "Career Path Planning",
    "Skills Gap Analysis",
    "Resume Matcher",
    "AI Roadmap Generator",
    "Student Career Guidance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-slate-200 bg-slate-950 min-h-screen`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
