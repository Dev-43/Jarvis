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
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        {/* Navigation Bar */}
        <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
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
                <span className="font-bold text-xl tracking-tight text-white">
                  Warden
                </span>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                  Nemotron Tiered
                </span>
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/compare"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Live Compare</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </Link>
              <Link
                href="/metrics"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Metrics & Evals
              </Link>
              <div className="hidden sm:block text-xs text-slate-500 border-l border-slate-800 pl-4">
                Nebius Token Factory
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p>
              Built for the Nebius x NVIDIA Global AI Hackathon. Track: Best Apps & Agents.
            </p>
            <p className="font-mono text-slate-600">
              MIT License • NVIDIA Nemotron 3 (Nano / Super / Ultra)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
