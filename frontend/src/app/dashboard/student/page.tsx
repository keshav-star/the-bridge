/**
 * Student Dashboard — Match Strength, AI Pitch, Application Timeline
 * Uses mock data when API is unavailable
 */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileUp,
  GitMerge,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useProcessResume, useProfile, useApplications } from "@/hooks/useApi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: React.ElementType; label: string; bgColor: string }
> = {
  PENDING: {
    color: "text-amber-400",
    icon: Clock,
    label: "Under Review",
    bgColor: "bg-amber-500/10",
  },
  SHORTLISTED: {
    color: "text-indigo-400",
    icon: Star,
    label: "Shortlisted",
    bgColor: "bg-indigo-500/10",
  },
  INTERVIEW: {
    color: "text-violet-400",
    icon: CheckCircle2,
    label: "Interview Stage",
    bgColor: "bg-violet-500/10",
  },
  OFFER: {
    color: "text-emerald-400",
    icon: Trophy,
    label: "Offer Received",
    bgColor: "bg-emerald-500/10",
  },
  REJECTED: {
    color: "text-red-400",
    icon: XCircle,
    label: "Not Selected",
    bgColor: "bg-red-500/10",
  },
};

// ── Mock Data (for fallback) ───────────────────────────────────────────────────

const MOCK_STUDENT = {
  id: "fd5d1eae-dc30-49f7-a91d-729052afc54e", // Seeded Student ID
  name: "Arjun Sharma",
  email: "arjun.sharma@uiet.edu.in",
  role: "STUDENT",
  graduation_year: 2025,
  trust_score: 87,
};

type Application = {
  id: string;
  job_title: string;
  company: string;
  match_score: number | null;
  status: string;
  ai_pitch: string | null;
  applied_at: string;
};

// ── Match Gauge ───────────────────────────────────────────────────────────────

function MatchGauge({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 85 ? "#818cf8" : pct >= 70 ? "#a78bfa" : pct >= 55 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            data={[{ value: pct, fill: color }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: "oklch(0.25 0.015 265)" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black">{pct}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground truncate w-24 text-center">{label}</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { mutateAsync: processResume, isPending: isUploading } = useProcessResume();
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfile(MOCK_STUDENT.id);
  const { data: applications = [], isLoading: isAppsLoading } = useApplications(MOCK_STUDENT.id);
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await processResume({ userId: MOCK_STUDENT.id, file });
      toast.success("Resume processed successfully!");
      refetchProfile();
    } catch (error) {
      console.error("Resume upload failed:", error);
      toast.error("Failed to process resume. Please try again.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const skillMatrix = profile?.skill_matrix || {
    core_skills: [],
    languages: [],
    frameworks: [],
    experience_summary: "Upload your resume to generate an AI Skill Matrix."
  };

  const selectedApp = (applications as Application[]).find((a) => a.id === selectedAppId) || applications[0];

  if (isProfileLoading || isAppsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Sparkles className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="text-sm font-medium animate-pulse">Syncing Bridge Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      {/* Top Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            <span className="font-bold gradient-text">The Bridge</span>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-primary transition-all mr-2"
            >
              Logout
            </button>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              Trust Score: {MOCK_STUDENT.trust_score}/100
            </Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              AS
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black">
            Welcome back,{" "}
            <span className="gradient-text">{MOCK_STUDENT.name.split(" ")[0]}</span>{" "}
            👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {MOCK_STUDENT.email} · {MOCK_STUDENT.role} · Batch {MOCK_STUDENT.graduation_year}
          </p>
        </motion.div>
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* Resume Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileUp className="h-4 w-4 text-primary" />
                  Resume Parser
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {!profile ? (
                  <label
                    htmlFor="resume-upload"
                    className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${
                      isUploading
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      {isUploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Sparkles className="h-6 w-6 text-primary" />
                        </motion.div>
                      ) : (
                        <Upload className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">
                        {isUploading ? "Parsing with AI..." : "Drop your PDF here"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isUploading ? "Extracting Skill Matrix" : "or click to browse"}
                      </p>
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={isUploading}
                    />
                  </label>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    <p className="font-semibold text-emerald-400">Profile Updated!</p>
                    <p className="text-xs text-muted-foreground">
                      Skill Matrix extracted · Embedding generated
                    </p>
                    <button 
                      onClick={() => document.getElementById("resume-upload")?.click()}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Update Resume
                    </button>
                    <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
                  </motion.div>
                )}

                {/* Skill Chips */}
                <div className="w-full">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">DETECTED SKILLS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillMatrix.languages.length === 0 && skillMatrix.core_skills.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">No skills detected yet.</span>
                    )}
                    {[
                      ...(skillMatrix.languages || []),
                      ...(skillMatrix.core_skills || []),
                      ...(skillMatrix.frameworks || []).slice(0, 3),
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Match Score Gauges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Match Strength Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {(applications as Application[]).slice(0, 4).map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className="flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-primary/5"
                      >
                        <MatchGauge
                          score={app.match_score || 0}
                          label={app.job_title}
                        />
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_CONFIG[app.status]?.color} border-current/30 bg-current/5`}
                        >
                          {STATUS_CONFIG[app.status]?.label}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <Sparkles className="h-8 w-8 opacity-20" />
                    <p className="text-sm italic">No applications yet. Apply to jobs to see match strength.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row: Applications */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Application List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {applications.length > 0 ? (applications as Application[]).map((app) => {
                  const cfg = STATUS_CONFIG[app.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all hover:border-primary/40 ${
                        selectedApp?.id === app.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{app.job_title}</p>
                          <p className="text-xs text-muted-foreground">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                        </div>
                        <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 ${cfg.bgColor}`}>
                          <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                          <span className={`text-[10px] font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Match</span>
                          <span className="text-[10px] font-bold text-primary">
                            {Math.round((app.match_score || 0) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(app.match_score || 0) * 100}
                          className="h-1"
                        />
                      </div>
                    </button>
                  );
                }) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No applications found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Pitch + Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            {selectedApp ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {selectedApp.job_title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(selectedApp.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${STATUS_CONFIG[selectedApp.status].color} border-current/30`}
                        >
                          {STATUS_CONFIG[selectedApp.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="pitch">
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                          <TabsTrigger value="pitch">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            AI Pitch
                          </TabsTrigger>
                          <TabsTrigger value="timeline">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            Timeline
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pitch">
                          <div className="glass rounded-xl p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-violet-400" />
                              <span className="text-xs font-semibold text-violet-400">
                                AI-GENERATED PITCH
                              </span>
                            </div>
                            <div className="space-y-2">
                              {selectedApp.ai_pitch ? selectedApp.ai_pitch
                                .split("\n")
                                .filter((l: string) => l.trim())
                                .map((line: string, i: number) => (
                                  <div key={i} className="flex gap-2 text-sm">
                                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span className="text-foreground/90">
                                      {line.replace("• ", "")}
                                    </span>
                                  </div>
                                )) : (
                                  <p className="text-sm italic text-muted-foreground">AI Pitch not available for this application.</p>
                                )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="timeline">
                          <div className="space-y-3">
                            {[
                              { label: "Applied", done: true, date: new Date(selectedApp.applied_at).toLocaleDateString() },
                              { label: "Under Review", done: ["SHORTLISTED", "INTERVIEW", "OFFER", "REJECTED"].includes(selectedApp.status), date: "" },
                              { label: "Shortlisted", done: ["INTERVIEW", "OFFER", "SHORTLISTED"].includes(selectedApp.status), date: "" },
                              { label: "Interview", done: ["INTERVIEW", "OFFER"].includes(selectedApp.status), date: "" },
                              { label: "Offer", done: selectedApp.status === "OFFER", date: "" },
                            ].map((step, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                                    step.done
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border text-muted-foreground"
                                  }`}
                                >
                                  {step.done ? "✓" : i + 1}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                                    {step.label}
                                  </p>
                                  {step.date && (
                                    <p className="text-xs text-muted-foreground">{step.date}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 opacity-10" />
                <p className="text-sm">Select an application to view AI Pitch and status timeline.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
