import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warden — Independent Oversight Layer for Autonomous AI Agents",
  description:
    "Runtime AI safety gateway powered by NVIDIA Nemotron on Nebius Token Factory. Deterministic hard limits, tiered overseer judgment, and a one-way ratchet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="cyber-bg text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-rose-900/60 selection:text-white">
        {/* Navigation Bar */}
        <header className="border-b border-rose-950/40 bg-obsidian-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson-600 to-rose-900 flex items-center justify-center shadow-crimson-glow group-hover:scale-105 transition-transform border border-crimson-400/30">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                    Warden
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-crimson-950/80 text-crimson-400 border border-crimson-800/50">
                    Oversight Layer
                  </span>
                </div>
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Architecture
              </Link>
              <Link
                href="/compare"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-crimson-600/40"
              >
                <span>Live Compare</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-600"></span>
                </span>
              </Link>
              <Link
                href="/metrics"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Telemetry & Evals
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-zinc-400 border-l border-zinc-800 pl-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-zinc-500">Nebius Token Factory</span>
                <span className="text-zinc-300">Nemotron 3</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-rose-950/30 bg-obsidian-950/90 py-6 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-crimson-500"></div>
              <p className="font-medium text-zinc-400">
                Nebius x NVIDIA Global AI Hackathon • Track: Best Apps & Agents
              </p>
            </div>
            <p className="font-mono text-zinc-500 text-[11px]">
              NVIDIA Nemotron (Nano 30B • Super 120B • Ultra 550B) • Hard Limits H1–H6 • SHA-256 Hash Chain
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
