"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/zod-schemas";
import { registerUser } from "@/actions/auth";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.success) {
        toast({
          title: "Account Created!",
          description: "You have signed up successfully. Please log in.",
          variant: "success",
        });
        router.push("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: res.error || "An error occurred during sign up.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to registration servers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md mt-10">
        <Card className="glass-card border-slate-200/10 dark:border-slate-800/80">
          <CardHeader className="space-y-3 flex flex-col items-center text-center">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold text-white">Create Account</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Sign up to discover tailored career recommendations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Mercer"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.name && <p className="text-xs text-red-500 font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex.mercer@student.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password}</p>}
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-200/10 dark:border-slate-800/40 pt-4">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 font-bold hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
