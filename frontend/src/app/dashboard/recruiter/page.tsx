/**
 * Recruiter / Alumni Dashboard — Post JDs, View AI-Vetted Top-5 Candidates
 */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Brain, Briefcase, Building2, ChevronRight, GitMerge, LogOut, Search, Sparkles, Star, Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useCreateJob, useMatchCandidates } from "@/hooks/useApi";
import { usersApi } from "@/lib/api";

type Candidate = {
  user_id: string;
  name: string;
  email: string;
  match_score: number;
  skill_matrix: { languages?: string[]; frameworks?: string[]; experience_summary?: string };
  ai_pitch: string;
  reasons_for_fit: string[];
};

type BackendUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// ── Candidate Card ────────────────────────────────────────────────────────────

function CandidateCard({ candidate, rank, selected, onClick }: {
  candidate: Candidate; rank: number; selected: boolean; onClick: () => void;
}) {
  const pct = Math.round(candidate.match_score * 100);
  const rankColors = ["text-amber-400", "text-slate-300", "text-orange-400", "text-muted-foreground", "text-muted-foreground"];
  return (
    <motion.button id={`candidate-${candidate.user_id}`} layout onClick={onClick} whileHover={{ x: 4 }}
      className={`w-full rounded-xl border p-4 text-left transition-all ${selected ? "border-violet-500/50 bg-violet-500/5" : "border-border hover:border-violet-500/30 hover:bg-violet-500/5"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <span className={`text-xs font-black ${rankColors[rank - 1]}`}>#{rank}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-semibold">{candidate.name}</p>
            <span className="ml-2 shrink-0 text-sm font-black text-violet-400">{pct}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{candidate.email}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.skill_matrix?.languages?.slice(0, 3).map((lang) => (
              <span key={lang} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">{lang}</span>
            ))}
          </div>
          <Progress value={pct} className="mt-2 h-1" />
        </div>
      </div>
    </motion.button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const { mutateAsync: createJob } = useCreateJob();
  const { mutateAsync: matchCandidates, isPending: isMatching } = useMatchCandidates();

  // 1. Resolve auth and fetch/create backend user
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      try {
        const backendUser = await usersApi.getUser(user.id);
        setCurrentUser(backendUser);
      } catch (err: unknown) {
        const is404 = (err as any)?.response?.status === 404;
        if (is404) {
          try {
            const created = await usersApi.createUser({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Recruiter",
              role: "ALUMNI",
            });
            setCurrentUser(created);
          } catch {
            try {
              const backendUser = await usersApi.getUser(user.id);
              setCurrentUser(backendUser);
            } catch {
              toast.error("Could not load profile. Please refresh.");
            }
          }
        }
      } finally {
        setAuthLoading(false);
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMatch = async () => {
    if (!jobDescription.trim() || !currentUser?.id) return;
    setHasResults(false);
    try {
      const job = await createJob({
        payload: { title: "Open Role", company: "UIET Alumni", description: jobDescription, requirements: null },
        posterId: currentUser.id,
      });
      const response = await matchCandidates({ jobId: job.id, limit: 5 });
      const results = response.top_candidates || [];
      setCandidates(results);
      if (results.length > 0) {
        setSelectedCandidate(results[0]);
        setHasResults(true);
        toast.success(`Found ${results.length} matched candidates!`);
      } else {
        toast.info("No candidates found yet. Ask students to upload resumes.");
      }
    } catch {
      toast.error("AI Matcher failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const chartData = candidates.map((c) => ({ name: c.name.split(" ")[0], score: Math.round(c.match_score * 100) }));
  const initials = currentUser?.name ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Sparkles className="h-10 w-10 text-violet-400" />
          </motion.div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading recruiter hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            <span className="font-bold gradient-text">The Bridge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400 hidden sm:flex">
              <Briefcase className="h-3 w-3 mr-1" />
              Recruiter / Alumni
            </Badge>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-all">
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400 border border-violet-500/30">
              {initials}
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black">
            Recruiter Hub, <span className="gradient-text">{currentUser?.name?.split(" ")[0] || "there"}</span> 🎯
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {currentUser?.email} · Paste a JD to surface AI-matched candidates instantly.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Profiles in DB", value: "–" },
            { icon: Briefcase, label: "Active Jobs", value: "–" },
            { icon: Star, label: "Avg Match Score", value: "–" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass border-border">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <stat.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* JD Input + Results */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-violet-400" />
                    AI Candidate Matcher
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="jd-input" className="mb-2 block text-xs font-medium text-muted-foreground">
                      JOB DESCRIPTION
                    </label>
                    <textarea
                      id="jd-input"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={"Paste your Job Description here…\n\ne.g. We are looking for a Full-Stack Engineer proficient in React, Node.js, and PostgreSQL…"}
                      rows={8}
                      className="w-full resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    />
                  </div>
                  <button
                    id="find-matches-btn"
                    onClick={handleMatch}
                    disabled={isMatching || !jobDescription.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isMatching ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Running Vector Match…
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Find Top 5 Candidates
                      </>
                    )}
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {hasResults && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Match Score Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 265)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.58 0.02 265)" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "oklch(0.58 0.02 265)" }} />
                        <Tooltip
                          contentStyle={{ background: "oklch(0.12 0.01 265)", border: "1px solid oklch(0.25 0.015 265)", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(v: unknown) => [`${v}%`, "Match"]}
                        />
                        <Bar dataKey="score" fill="oklch(0.57 0.26 308)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {hasResults && selectedCandidate ? (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <Card className="glass border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-violet-400" />
                          Top {candidates.length} AI-Vetted Candidates
                        </span>
                        <Badge className="bg-violet-500/20 text-violet-400">pgvector match</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {candidates.map((c, i) => (
                        <CandidateCard
                          key={c.user_id}
                          candidate={c}
                          rank={i + 1}
                          selected={selectedCandidate.user_id === c.user_id}
                          onClick={() => setSelectedCandidate(c)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCandidate.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="glass-strong border-violet-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{selectedCandidate.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{selectedCandidate.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black gradient-text">{Math.round(selectedCandidate.match_score * 100)}%</p>
                            <p className="text-xs text-muted-foreground">Cosine Match</p>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator className="mb-4" />
                      <CardContent className="space-y-4">
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">REASONS FOR FIT</p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedCandidate.reasons_for_fit || []).map((r, i) => (
                              <span key={i} className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-400">{r}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">PROFILE SUMMARY</p>
                          <p className="text-sm text-foreground/80">
                            {selectedCandidate.skill_matrix?.experience_summary || "No summary available."}
                          </p>
                        </div>

                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                            <span className="text-xs font-semibold text-violet-400">AI-GENERATED PITCH</span>
                          </div>
                          <div className="space-y-2">
                            {(selectedCandidate.ai_pitch || "").split("\n").filter((l) => l.trim()).map((line, i) => (
                              <div key={i} className="flex gap-2 text-sm">
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                                <span>{line.replace("• ", "")}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button id={`shortlist-${selectedCandidate.user_id}`} className="flex-1 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500/90">
                            ✓ Shortlist
                          </button>
                          <button id={`reject-${selectedCandidate.user_id}`} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                            Pass
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-16 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="font-semibold">Paste a JD on the left</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our vector matcher will find the best candidates in milliseconds.
                  </p>
                </div>
                {!currentUser && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
                    <Building2 className="h-3.5 w-3.5" />
                    Loading your profile…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
