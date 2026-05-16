import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "The Bridge — AI-Augmented Recruitment for UIET",
  description:
    "Connect students with alumni through intelligent, AI-powered job matching. No spam. No noise. Just the right opportunity.",
  keywords: ["recruitment", "AI", "UIET", "college jobs", "alumni network"],
  openGraph: {
    title: "The Bridge",
    description: "High-trust AI recruitment for the UIET community",
    type: "website",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
