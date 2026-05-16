"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Briefcase, Loader2, GitMerge, Sparkles, Building2 } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";

export default function RecruiterOnboarding() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create user record in backend
      await usersApi.createUser({
        id: user.id,
        email: user.email,
        name: name.trim(),
        role: "ALUMNI",
      });

      toast.success("Recruiter profile created! Let's find your candidates 🎯");
      window.location.href = "/dashboard/recruiter";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create profile";
      // If user already exists (409), just navigate
      if (msg.includes("409") || msg.includes("already")) {
        window.location.href = "/dashboard/recruiter";
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center animated-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <Briefcase className="h-8 w-8 text-violet-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <GitMerge className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold gradient-text">The Bridge</span>
          </div>
          <h1 className="text-2xl font-black mb-1">Set up your recruiter profile</h1>
          <p className="text-sm text-muted-foreground">
            Post a JD and let AI surface the top 5 UIET candidates in seconds.
          </p>
        </div>

        <div className="glass border-border p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Nair"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Company / Organization
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Zomato, Google, Startup Inc…"
                  className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-violet-500/60 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
              </div>
            </div>

            {/* What you get */}
            <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-4 space-y-2">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> How it works
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Paste your Job Description — no form filling</li>
                <li>• AI semantically matches against student skill matrices</li>
                <li>• See top 5 candidates with personalized AI pitches</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !company.trim()}
              className="w-full bg-violet-500 hover:bg-violet-500/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
              Start Finding Candidates
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
