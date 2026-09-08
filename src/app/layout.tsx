import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXA AI — The Secure Multimodal AI Operating System",
  description:
    "Your AI. Your Memory. Your Tools. Your Control. NEXA is a secure multimodal AI operating system that understands, reasons, plans, uses tools, verifies results, and maintains long-term memory under strict human oversight.",
  keywords: ["AI Operating System", "Zero Trust AI", "Autonomous Agents", "Human-in-the-Loop", "Multi-Tier Memory", "RAG"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07090E] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
