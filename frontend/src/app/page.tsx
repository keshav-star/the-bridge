/**
 * The Bridge — Landing Page
 * Premium dark-mode design with Framer Motion animations
 */
"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, GitMerge, Shield, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "AI Skill Parsing",
    description:
      "Upload your resume once. Our LLM extracts a rich Skill Matrix — no manual form filling ever again.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: GitMerge,
    title: "Semantic Matching",
    description:
      "We find a student who knows \"Tailwind\" when a recruiter asks for \"CSS frameworks\". Vector embeddings bridge the language gap.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Shield,
    title: "Trust Score System",
    description:
      "Quality over quantity. Alumni rate applicants, and low-quality mass-applies decrease your trust score — keeping the network signal-rich.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Pitch Generator",
    description:
      "Every application auto-generates a 3-point personalized pitch from your GitHub projects, tailored to the exact JD.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Zap,
    title: "One-Click Apply",
    description:
      "Our Playwright agent maps your JSON profile to external job forms and fills them automatically. 30 seconds, not 30 minutes.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

const stats = [
  { value: "1,000+", label: "UIET Community Members" },
  { value: "< 5s", label: "Average Resume Parse Time" },
  { value: "95%", label: "Relevance in Top-5 Matches" },
  { value: "0", label: "Spam Applications" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden animated-bg">
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 285 / 12%) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.57 0.26 308 / 8%) 0%, transparent 70%)",
        }}
      />

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
              <GitMerge className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">
              The Bridge
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Link
              href="/dashboard/student"
              id="nav-student-link"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Student
            </Link>
            <Link
              href="/dashboard/recruiter"
              id="nav-recruiter-link"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Recruiter
            </Link>
            <Link
              href="/dashboard/student"
              id="nav-cta-btn"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started →
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="mb-6 border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            ✦ Exclusive to UIET Community
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
        >
          Your resume.{" "}
          <span className="gradient-text">AI-powered.</span>
          <br />
          The right job,{" "}
          <span className="gradient-text">instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground"
        >
          The Bridge eliminates the signal-to-noise problem in college recruitment.
          Students upload once. Alumni get laser-targeted, AI-vetted matches — not
          a flood of irrelevant applications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/dashboard/student"
            id="hero-student-cta"
            className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            I&apos;m a Student
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard/recruiter"
            id="hero-recruiter-cta"
            className="group flex items-center gap-2 rounded-xl border border-border bg-secondary px-8 py-3.5 text-base font-semibold transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            I&apos;m a Recruiter
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-8"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything you need to recruit{" "}
            <span className="gradient-text">smarter</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for UIET. Powered by AI. Trusted by the community.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`glass rounded-2xl border p-6 transition-shadow hover:shadow-xl ${feature.border}`}
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Footer ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-strong glow-indigo rounded-3xl p-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-black">
            Ready to find your{" "}
            <span className="gradient-text">perfect match?</span>
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join the UIET community on The Bridge. It takes 30 seconds to set up.
          </p>
          <Link
            href="/dashboard/student"
            id="footer-cta-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" />
            Start For Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © 2026 The Bridge · Built for UIET · Powered by AI
      </footer>
    </div>
  );
}
