import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warden — Runtime AI Safety Gateway for Autonomous Agents",
  description:
    "Runtime AI safety gateway powered by NVIDIA Nemotron on Nebius Token Factory. Deterministic hard limits, tiered overseer judgment, and a one-way permission ratchet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090c] text-zinc-100 min-h-screen flex flex-col antialiased">
        {/* Navigation Bar */}
        <header className="border-b border-zinc-800/90 bg-[#0c0d12]/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm group-hover:bg-rose-500 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-white font-sans">
                    Warden
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 font-semibold uppercase tracking-wider">
                    Oversight Layer
                  </span>
                </div>
              </Link>
            </div>

            <nav className="flex items-center space-x-5 text-xs">
              <Link
                href="/"
                className="font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Architecture
              </Link>
              <Link
                href="/compare"
                className="font-semibold text-rose-300 hover:text-white transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/70"
              >
                <span>Live Compare</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </Link>
              <Link
                href="/metrics"
                className="font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Telemetry & Evals
              </Link>
              <div className="hidden sm:flex items-center space-x-2 text-zinc-400 text-[11px] font-mono border-l border-zinc-800 pl-4">
                <span className="text-zinc-500">Nebius Token Factory</span>
                <span className="text-zinc-600">•</span>
                <span className="text-cyan-400 font-semibold">NVIDIA Nemotron</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/80 bg-[#08090c] py-6 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <p className="text-zinc-400 font-medium">
                Nebius x NVIDIA Global AI Hackathon • Track: Best Apps & Agents
              </p>
            </div>
            <p className="font-mono text-zinc-500 text-[11px]">
              NVIDIA Nemotron 3 (Nano 30B • Super 120B • Ultra 550B) • Hard Limits H1–H6
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
