"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Mail,
  Lock,
  User,
  Loader2,
  GitMerge,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Role = "student" | "recruiter";
type Mode = "signin" | "signup";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/40",
    activeBg: "bg-indigo-500/20",
    buttonClass: "bg-indigo-500 hover:bg-indigo-500/90 shadow-indigo-500/25",
    description: "Upload your resume, get AI-matched to alumni-posted jobs",
    redirectOnboarding: "/onboarding/student",
    redirectDashboard: "/dashboard/student",
  },
  recruiter: {
    label: "Recruiter / Alumni",
    icon: Briefcase,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/40",
    activeBg: "bg-violet-500/20",
    buttonClass: "bg-violet-500 hover:bg-violet-500/90 shadow-violet-500/25",
    description: "Post JDs and let AI surface the best UIET candidates",
    redirectOnboarding: "/onboarding/recruiter",
    redirectDashboard: "/dashboard/recruiter",
  },
};

export default function AuthPage() {
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const cfg = ROLE_CONFIG[role];
  const RoleIcon = cfg.icon;

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center animated-bg p-6">
        <div className="glass border-border p-8 rounded-2xl text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Configuration Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
            <code>.env</code> file.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role === "student" ? "STUDENT" : "ALUMNI",
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${cfg.redirectOnboarding}`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!", {
          description: "Click the link we sent you to complete sign-up.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        // Let middleware handle role-based redirect
        window.location.href = "/auth/resolve-role";
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center animated-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/40 group-hover:bg-primary/30 transition-all">
              <GitMerge className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-black gradient-text">The Bridge</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Exclusive to the UIET community
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl glass border-border">
          {(["student", "recruiter"] as Role[]).map((r) => {
            const c = ROLE_CONFIG[r];
            const Icon = c.icon;
            const isActive = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? `${c.activeBg} ${c.color} ${c.borderColor} border`
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Auth Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass border-border p-8 rounded-2xl shadow-xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bgColor}`}>
                  <RoleIcon className={`h-6 w-6 ${cfg.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {mode === "signup" ? `Join as ${cfg.label}` : `Welcome back`}
                  </h2>
                  <p className="text-xs text-muted-foreground">{cfg.description}</p>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {/* Name — only on sign-up */}
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={
                          role === "student" ? "Arjun Sharma" : "Priya Nair"
                        }
                        className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === "student"
                          ? "arjun@uiet.edu.in"
                          : "priya@company.com"
                      }
                      className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${cfg.buttonClass} text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2`}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RoleIcon className="h-4 w-4" />
                  )}
                  {mode === "signup" ? `Sign Up as ${cfg.label}` : "Sign In"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-sm text-muted-foreground hover:text-primary transition-all underline underline-offset-4"
                >
                  {mode === "signin"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
