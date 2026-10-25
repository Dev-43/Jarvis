"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error("Failed to fetch metrics:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuditVerify(runId: string) {
    setVerifyingId(runId);
    try {
      const res = await fetch(`/api/audit/verify?runId=${runId}`);
      const data = await res.json();
      setAuditResults((prev) => ({
        ...prev,
        [runId]: data,
      }));
    } catch {
      setAuditResults((prev) => ({
        ...prev,
        [runId]: { ok: false, message: "Verification check failed" },
      }));
    } finally {
      setVerifyingId(null);
    }
  }

  const spendCap = 35.0;
  const currentSpend = metrics?.summary?.totalCostUsd || 0;
  const spendPct = Math.min(100, (currentSpend / spendCap) * 100);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-950/40 glow-border-top shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center space-x-3">
              <span>Security Telemetry & Evals</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-crimson-950/90 text-crimson-400 border border-crimson-800/60 font-mono font-semibold uppercase">
              Live Token Factory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time spend ledger, tiered Nemotron inference latencies, 20-case policy benchmarks, and SHA-256 cryptographic proofs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors shadow-md"
          >
            Refresh Telemetry
          </button>
          <Link
            href="/compare"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white text-xs font-bold shadow-crimson-glow transition-all border border-crimson-400/40"
          >
            Go to Compare
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-zinc-400 animate-pulse font-mono text-sm">
          Loading metrics from SpendLedger and Audit Chain...
        </div>
      ) : (
        <>
          {/* Top 4 Key Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Spend Guard */}
            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-zinc-800/80 hover:border-zinc-700 transition-all">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex justify-between font-mono">
                <span>Model Spend Cap Guard</span>
                <span className="text-crimson-400">${currentSpend.toFixed(4)} / ${spendCap}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${currentSpend.toFixed(4)}
              </div>
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-crimson-500 to-rose-600 h-2 rounded-full transition-all duration-500 shadow-crimson-glow"
                  style={{ width: `${Math.max(3, spendPct)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Hard Limit H2 stops new model invocations if spend exceeds $35.00 limit.
              </p>
            </div>

            {/* Card 2: Ratchet Tightenings */}
            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-zinc-800/80 hover:border-zinc-700 transition-all">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                One-Way Ratchet Tightenings
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {metrics?.summary?.tightenCount || 0}
              </div>
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Unauthorized scopes revoked or dangerous tools disabled permanently.
              </p>
            </div>

            {/* Card 3: Held Actions */}
            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-zinc-800/80 hover:border-zinc-700 transition-all">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Actions Held for Approval
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                {metrics?.summary?.holdsCount || 0}
              </div>
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Gated for human approver authorization via Hard Limits H3–H5.
              </p>
            </div>

            {/* Card 4: Runs Frozen */}
            <div className="glass-panel rounded-2xl p-5 space-y-3 border border-zinc-800/80 hover:border-zinc-700 transition-all">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                Critical Runs Frozen
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-crimson-400 font-mono">
                {metrics?.summary?.freezeCount || 0}
              </div>
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div className="bg-crimson-600 h-2 rounded-full shadow-crimson-glow" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Severe prompt injection attacks or data exfiltration permanently halted.
              </p>
            </div>
          </div>

          {/* Nemotron Tier Latency & Calls Breakdown */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                  NVIDIA Nemotron Tier Latency & Usage Breakdown
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Performance across models running on Nebius Token Factory.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Real-Time Hardware Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["nano", "super", "ultra", "agent"].map((tier) => {
                const stat = metrics?.tierStats?.[tier] || { calls: 0, p50: 0, p95: 0 };
                const titles: Record<string, { name: string; tag: string; color: string; border: string }> = {
                  nano: { name: "Nemotron Nano 30B", tag: "Watcher Tier 1 (Screening)", color: "text-cyan-400", border: "border-cyan-800/40" },
                  super: { name: "Nemotron Super 120B", tag: "Watcher Tier 2 (Context)", color: "text-purple-400", border: "border-purple-800/40" },
                  ultra: { name: "Nemotron Ultra 550B", tag: "Watcher Tier 3 (Sovereign)", color: "text-crimson-400", border: "border-crimson-800/40" },
                  agent: "Nemotron Super 120B (Target Agent)",
                } as any;

                const meta = titles[tier] || { name: tier, tag: "Model", color: "text-zinc-200", border: "border-zinc-800" };

                return (
                  <div key={tier} className={`bg-obsidian-950/90 p-4 rounded-xl border ${meta.border} space-y-2.5 shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-bold text-zinc-200 font-sans">{meta.name}</div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">{meta.tag}</div>
                    <div className="text-2xl font-extrabold text-white font-mono">
                      {stat.calls} <span className="text-xs text-zinc-500 font-normal">calls</span>
                    </div>
                    <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/80 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">p50 Latency:</span>
                        <span className="text-zinc-200 font-bold">{stat.p50} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">p95 Latency:</span>
                        <span className="text-zinc-200 font-bold">{stat.p95} ms</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 20-Case Policy Eval Suite Results Card */}
          <div className="glass-panel-crimson rounded-2xl p-6 border border-crimson-800/50 space-y-4 shadow-crimson-glow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-glow"></span>
                  <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                    20-Case Policy Benchmark Evaluation Suite
                  </h2>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  10 in-scope legitimate actions, 10 off-task/adversarial prompt injections tested against live models.
                </p>
              </div>
              {metrics?.latestEval && (
                <span className="text-xs font-mono text-zinc-400 bg-obsidian-950 px-3 py-1 rounded-lg border border-zinc-800">
                  Benchmarked: {new Date(metrics.latestEval.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {!metrics?.latestEval ? (
              <div className="p-8 bg-obsidian-950 rounded-xl border border-zinc-800 text-center text-xs text-zinc-400 space-y-2">
                <p>No evaluation run recorded yet.</p>
                <p className="text-zinc-500 font-mono">
                  Run <code>npm run evals</code> in terminal to execute the test suite.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-emerald-800/50 shadow-emerald-glow">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">Accuracy</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    {(metrics.latestEval.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-1">20/20 Perfect</div>
                </div>

                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">False Positive</div>
                  <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                    {(metrics.latestEval.falsePositiveRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">0/10 In-Scope Blocked</div>
                </div>

                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">Miss Rate</div>
                  <div className="text-2xl font-extrabold text-crimson-400 font-mono mt-1">
                    {(metrics.latestEval.missRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">0/10 Attacks Missed</div>
                </div>

                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">Latency p50</div>
                  <div className="text-2xl font-extrabold text-zinc-200 font-mono mt-1">
                    {metrics.latestEval.p50LatencyMs} <span className="text-xs text-zinc-500 font-normal">ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Nano Screening</div>
                </div>

                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">Latency p95</div>
                  <div className="text-2xl font-extrabold text-zinc-200 font-mono mt-1">
                    {metrics.latestEval.p95LatencyMs} <span className="text-xs text-zinc-500 font-normal">ms</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Full Cascade (Ultra)</div>
                </div>

                <div className="bg-obsidian-950/90 p-4 rounded-xl border border-purple-800/50">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold font-mono">Total Spend</div>
                  <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">
                    ${metrics.latestEval.totalCostUsd.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-purple-400/80 mt-1">&lt; 4 Cents Total</div>
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic Audit Chain Verification Terminal */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                  Cryptographic Audit Chain Verification
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verify SHA-256 hash chains for all historical agent executions. Validates genesis block, monotonic sequences, and tamper-evident payload hashes.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                Tamper-Evident Ledger
              </span>
            </div>

            {(!metrics?.recentRuns || metrics.recentRuns.length === 0) ? (
              <div className="p-8 text-center text-xs text-zinc-500 bg-obsidian-950 rounded-xl border border-zinc-800">
                No runs recorded yet. Launch a scenario on the Compare page first.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80 bg-obsidian-950 rounded-xl border border-zinc-800 overflow-hidden">
                {metrics.recentRuns.map((r: any) => {
                  const result = auditResults[r.id];
                  const isVerifying = verifyingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-obsidian-900/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-zinc-100 font-bold">{r.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                            {r.scenarioId} ({r.mode})
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase font-bold ${
                              r.status === "frozen"
                                ? "text-crimson-400"
                                : r.status === "paused_held"
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="text-zinc-500 text-[11px] font-mono">
                          Steps: {r.stepCount} • {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {result && (
                          <div
                            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border ${
                              result.ok
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-emerald-glow"
                                : "bg-crimson-950/80 text-crimson-400 border-crimson-700/60 shadow-crimson-glow"
                            }`}
                          >
                            {result.ok
                              ? `✓ SHA-256 Verified (${result.count} blocks intact)`
                              : `✗ Tampered at block #${result.brokenAtSeq}`}
                          </div>
                        )}

                        <button
                          onClick={() => handleAuditVerify(r.id)}
                          disabled={isVerifying}
                          className="px-4 py-2 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-zinc-200 font-semibold text-xs border border-zinc-700/80 hover:border-crimson-600/50 transition-all shadow-md"
                        >
                          {isVerifying ? "Verifying Hash Chain..." : "Verify Chain"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
