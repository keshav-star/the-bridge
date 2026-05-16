/**
 * Recruiter Dashboard — Post JDs, View AI-Vetted Top-5 Candidates
 */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  Briefcase,
  ChevronRight,
  GitMerge,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { useCreateJob, useMatchCandidates } from "@/hooks/useApi";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_RECRUITER = {
  id: "d1a3ebc5-3468-4d35-bdfc-984d56e01281", // Seeded Recruiter ID
  name: "Priya Nair",
  company: "Zomato",
  role: "ALUMNI",
};

// Types for Candidate to avoid inline repetition
type Candidate = {
  user_id: string;
  name: string;
  email: string;
  match_score: number;
  skill_matrix: {
    languages?: string[];
    frameworks?: string[];
    experience_summary?: string[];
  };
  ai_pitch: string;
  reasons_for_fit: string[];
};

// ── Candidate Card ────────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  rank,
  selected,
  onClick,
}: {
  candidate: Candidate;
  rank: number;
  selected: boolean;
  onClick: () => void;
}) {
  const pct = Math.round(candidate.match_score * 100);
  const rankColors = ["text-amber-400", "text-slate-300", "text-orange-400", "text-muted-foreground", "text-muted-foreground"];

  return (
    <motion.button
      id={`candidate-card-${candidate.user_id}`}
      layout
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <span className={`text-xs font-black ${rankColors[rank - 1]}`}>
            #{rank}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-semibold">{candidate.name}</p>
            <span className="ml-2 shrink-0 text-sm font-black text-primary">{pct}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{candidate.email}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.skill_matrix?.languages?.slice(0, 3).map((lang: string) => (
              <span
                key={lang}
                className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
              >
                {lang}
              </span>
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
  const router = useRouter();
  const { mutateAsync: createJob } = useCreateJob();
  const { mutateAsync: matchCandidates, isPending: isMatching } = useMatchCandidates();

  const [jobDescription, setJobDescription] = useState("");
  const [hasResults, setHasResults] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleMatch = async () => {
    if (!jobDescription.trim()) return;
    setHasResults(false);
    
    try {
      // 1. Create the job listing
      const job = await createJob({
        payload: {
          title: "Software Engineer",
          company: MOCK_RECRUITER.company,
          description: jobDescription,
          requirements: []
        },
        posterId: MOCK_RECRUITER.id
      });

      // 2. Run vector match
      const response = await matchCandidates({ jobId: job.id, limit: 5 });
      
      const results = response.top_candidates || [];
      setCandidates(results);
      if (results.length > 0) {
        setSelectedCandidate(results[0]);
        setHasResults(true);
        toast.success("Semantic matching complete!");
      } else {
        toast.info("No candidates found for this JD.");
      }
    } catch (error) {
      console.error("Match failed:", error);
      toast.error("AI Matcher failed. Please check your JD and try again.");
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const chartData = candidates.map((c) => ({
    name: c.name.split(" ")[0],
    score: Math.round(c.match_score * 100),
  }));

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
            <button 
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-primary transition-all mr-2"
            >
              Logout
            </button>
            <Badge variant="outline" className="text-xs">
              {MOCK_RECRUITER.company} · Alumni
            </Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              PN
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
            Recruiter Hub,{" "}
            <span className="gradient-text">{MOCK_RECRUITER.name.split(" ")[0]}</span>{" "}
            🎯
          </h1>
          <p className="mt-1 text-muted-foreground">
            Post a Job Description and let AI surface the best UIET candidates instantly.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Profiles in DB", value: "142" },
            { icon: Briefcase, label: "Active Jobs", value: "8" },
            { icon: Star, label: "Avg Match Score", value: "84%" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass border-border">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
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
          {/* Left: JD Form + Chart */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* JD Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Matcher
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
                      placeholder="Paste your Job Description here…

e.g. We are looking for a Full-Stack Engineer proficient in React, Node.js, and PostgreSQL who can build scalable APIs..."
                      rows={8}
                      className="w-full resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    id="find-matches-btn"
                    onClick={handleMatch}
                    disabled={isMatching || !jobDescription.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isMatching ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
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

            {/* Bar Chart */}
            {hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Match Score Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 265)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "oklch(0.58 0.02 265)" }}
                        />
                        <YAxis
                          domain={[60, 100]}
                          tick={{ fontSize: 11, fill: "oklch(0.58 0.02 265)" }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "oklch(0.12 0.01 265)",
                            border: "1px solid oklch(0.25 0.015 265)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(v: any) => [`${v}%`, "Match"]}
                        />
                        <Bar dataKey="score" fill="oklch(0.65 0.22 285)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: Candidate List + Detail */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {hasResults && selectedCandidate ? (
              <>
                {/* Candidate List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="glass border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Top 5 AI-Vetted Candidates
                        </span>
                        <Badge className="bg-primary/20 text-primary">
                          pgvector match
                        </Badge>
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

                {/* Selected Candidate Detail */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCandidate.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="glass-strong glow-indigo border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{selectedCandidate.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {selectedCandidate.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black gradient-text">
                              {Math.round(selectedCandidate.match_score * 100)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Cosine Match</p>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator className="mb-4" />
                      <CardContent className="space-y-4">
                        {/* Reasons for Fit */}
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">
                            REASONS FOR FIT
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedCandidate.reasons_for_fit || []).map((r, i) => (
                              <span
                                key={i}
                                className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Experience Summary */}
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">
                            PROFILE SUMMARY
                          </p>
                          <p className="text-sm text-foreground/80">
                            {selectedCandidate.skill_matrix?.experience_summary || "No summary available."}
                          </p>
                        </div>

                        {/* AI Pitch */}
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                            <span className="text-xs font-semibold text-violet-400">
                              AI-GENERATED PITCH
                            </span>
                          </div>
                          <div className="space-y-2">
                            {(selectedCandidate.ai_pitch || "")
                              .split("\n")
                              .filter((l) => l.trim())
                              .map((line, i) => (
                                <div key={i} className="flex gap-2 text-sm">
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                                  <span>{line.replace("• ", "")}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            id={`shortlist-btn-${selectedCandidate.user_id}`}
                            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                          >
                            ✓ Shortlist
                          </button>
                          <button
                            id={`reject-btn-${selectedCandidate.user_id}`}
                            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          >
                            Pass
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-16 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <p className="font-semibold">Paste a JD on the left</p>
                  <p className="text-sm text-muted-foreground">
                    Our vector matcher will find the best candidates in milliseconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
