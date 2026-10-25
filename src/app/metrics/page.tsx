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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
            <span>Model Metrics & Evals</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Live Telemetry
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time inference costs, Nemotron tier latencies, and cryptographic audit proofs.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Refresh Telemetry
          </button>
          <Link
            href="/compare"
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Go to Compare
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse">
          Loading metrics from SpendLedger and Audit Chain...
        </div>
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Spend Guard Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex justify-between">
                <span>Model Spend Guard</span>
                <span className="text-blue-400 font-mono">${currentSpend.toFixed(4)} / ${spendCap}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${currentSpend.toFixed(4)}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, spendPct)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Refuses new runs when spending reaches the $35 limit.
              </p>
            </div>

            {/* Tightenings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Ratchet Tightenings
              </div>
              <div className="text-3xl font-bold text-orange-400">
                {metrics?.summary?.tightenCount || 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Scopes revoked or tools disabled by the Watcher.
              </p>
            </div>

            {/* Held Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Actions Held
              </div>
              <div className="text-3xl font-bold text-amber-400">
                {metrics?.summary?.holdsCount || 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Gated for human authorization via Hard Limits H3–H5.
              </p>
            </div>

            {/* Freezes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Runs Frozen
              </div>
              <div className="text-3xl font-bold text-rose-400">
                {metrics?.summary?.freezeCount || 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Critical breaches permanently halted.
              </p>
            </div>
          </div>

          {/* Tier Latency & Calls Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Nemotron Tier Inference Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["nano", "super", "ultra", "agent"].map((tier) => {
                const stat = metrics?.tierStats?.[tier] || { calls: 0, p50: 0, p95: 0 };
                const titles: Record<string, string> = {
                  nano: "Nano 30B (Watcher T1)",
                  super: "Super 120B (Watcher T2)",
                  ultra: "Ultra 550B (Watcher T3)",
                  agent: "Super 120B (Target Agent)",
                };
                return (
                  <div key={tier} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">{titles[tier]}</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {stat.calls} <span className="text-xs text-slate-500 font-normal">calls</span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
                      <div>p50 Latency: <span className="text-slate-200">{stat.p50} ms</span></div>
                      <div>p95 Latency: <span className="text-slate-200">{stat.p95} ms</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benchmark Evaluation Suite Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  20-Case Policy Eval Suite Results
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  10 in-scope actions, 10 off-task/injection adversarial actions.
                </p>
              </div>
              {metrics?.latestEval && (
                <span className="text-xs font-mono text-slate-500">
                  Evaluated: {new Date(metrics.latestEval.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {!metrics?.latestEval ? (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500 space-y-2">
                <p>No evaluation run recorded yet.</p>
                <p className="text-slate-600 font-mono">
                  Run <code>npm run evals</code> in terminal to execute the test suite.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {(metrics.latestEval.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">False Positive</div>
                  <div className="text-xl font-bold text-blue-400 font-mono">
                    {(metrics.latestEval.falsePositiveRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Miss Rate</div>
                  <div className="text-xl font-bold text-rose-400 font-mono">
                    {(metrics.latestEval.missRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">p50 Latency</div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    {metrics.latestEval.p50LatencyMs} ms
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">p95 Latency</div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    {metrics.latestEval.p95LatencyMs} ms
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Eval Cost</div>
                  <div className="text-xl font-bold text-indigo-400 font-mono">
                    ${metrics.latestEval.totalCostUsd.toFixed(4)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Chain Verification Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cryptographic Audit Chain Verification
            </h2>
            <p className="text-xs text-slate-400">
              Verify SHA-256 hash chains for recent runs. Click "Verify Chain" to validate genesis hash, sequence continuity, and cryptographic payload integrity.
            </p>

            {(!metrics?.recentRuns || metrics.recentRuns.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                No runs recorded yet. Launch a scenario on the Compare page first.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                {metrics.recentRuns.map((r: any) => {
                  const result = auditResults[r.id];
                  const isVerifying = verifyingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-white font-semibold">{r.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {r.scenarioId} ({r.mode})
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">{r.status}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Steps: {r.stepCount} • {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {result && (
                          <div
                            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold border ${
                              result.ok
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {result.ok
                              ? `✓ Verified: ${result.count} events intact`
                              : `✗ Tampered at seq #${result.brokenAtSeq}`}
                          </div>
                        )}

                        <button
                          onClick={() => handleAuditVerify(r.id)}
                          disabled={isVerifying}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                        >
                          {isVerifying ? "Verifying..." : "Verify Chain"}
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
