"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center animated-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-8">
          The authentication link you followed is invalid or has expired. This can happen if the link was already used or if it has timed out.
        </p>

        <div className="glass border-border p-6 rounded-2xl mb-8 text-left space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Possible reasons:</h3>
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>The link was already clicked or used</li>
            <li>The verification token has expired (typically 1 hour)</li>
            <li>Your email client might have pre-clicked the link</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Signing In Again
          </Link>
          <Link
            href="/"
            className="w-full border border-border bg-secondary/30 hover:bg-secondary/50 text-foreground font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
