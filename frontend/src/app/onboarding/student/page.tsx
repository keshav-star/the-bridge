"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, GitMerge, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";

const GRADUATION_YEARS = Array.from({ length: 8 }, (_, i) => 2024 + i);

export default function StudentOnboarding() {
  const [name, setName] = useState("");
  const [graduationYear, setGraduationYear] = useState(2025);
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
        role: "STUDENT",
        graduation_year: graduationYear,
      });

      toast.success("Profile created! Welcome to The Bridge 🎉");
      window.location.href = "/dashboard/student";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create profile";
      // If user already exists (409), just navigate
      if (msg.includes("409") || msg.includes("already")) {
        window.location.href = "/dashboard/student";
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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <GitMerge className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold gradient-text">The Bridge</span>
          </div>
          <h1 className="text-2xl font-black mb-1">Set up your student profile</h1>
          <p className="text-sm text-muted-foreground">
            This takes 30 seconds — then you can upload your resume and get matched instantly.
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
                placeholder="Arjun Sharma"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Graduation Year */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Expected Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 text-sm focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
              >
                {GRADUATION_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                    {year === new Date().getFullYear() ? " (This year)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* What you get */}
            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4 space-y-2">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> What happens next
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Upload your PDF resume — AI extracts your skill matrix</li>
                <li>• Get semantically matched to alumni-posted jobs</li>
                <li>• See your AI-generated pitch for each application</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-indigo-500 hover:bg-indigo-500/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              Enter The Bridge
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
