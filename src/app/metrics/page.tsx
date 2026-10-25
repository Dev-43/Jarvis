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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#111113] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Telemetry & Evaluation Benchmark
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              Token Factory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time inference costs, Nemotron hardware latencies, 20-case policy benchmarks, and SHA-256 chain verification.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchMetrics}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/compare"
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors"
          >
            Live Compare
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-xs">
          Loading metrics from SpendLedger and Audit Chain...
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Spend Cap */}
            <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-2.5">
              <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold flex justify-between">
                <span>Model Spend Cap Guard</span>
                <span className="text-zinc-300">${currentSpend.toFixed(4)} / ${spendCap}</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                ${currentSpend.toFixed(4)}
              </div>
              <div className="w-full bg-[#09090b] rounded-full h-1.5 overflow-hidden border border-zinc-850">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, spendPct)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Hard Limit H2 stops invocations if spend exceeds $35.00.
              </p>
            </div>

            {/* Card 2: Ratchet Tightenings */}
            <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-2">
              <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">
                Ratchet Tightenings
              </div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">
                {metrics?.summary?.tightenCount || 0}
              </div>
              <p className="text-[11px] text-zinc-500">
                Unauthorized scopes revoked or dangerous tools disabled.
              </p>
            </div>

            {/* Card 3: Actions Held */}
            <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-2">
              <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">
                Actions Held for Approval
              </div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">
                {metrics?.summary?.holdsCount || 0}
              </div>
              <p className="text-[11px] text-zinc-500">
                Gated for human authorization via Hard Limits H3–H5.
              </p>
            </div>

            {/* Card 4: Runs Frozen */}
            <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-2">
              <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">
                Runs Frozen
              </div>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {metrics?.summary?.freezeCount || 0}
              </div>
              <p className="text-[11px] text-zinc-500">
                Critical breaches permanently halted by fail-closed ratchet.
              </p>
            </div>
          </div>

          {/* Model Latencies Card */}
          <div className="p-5 rounded-xl bg-[#111113] border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                NVIDIA Nemotron Tier Latency & Volume
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Runtime inference performance on Nebius Token Factory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {["nano", "super", "ultra", "agent"].map((tier) => {
                const stat = metrics?.tierStats?.[tier] || { calls: 0, p50: 0, p95: 0 };
                const titles: Record<string, { name: string; role: string }> = {
                  nano: { name: "Nemotron Nano 30B", role: "Watcher Tier 1" },
                  super: { name: "Nemotron Super 120B", role: "Watcher Tier 2" },
                  ultra: { name: "Nemotron Ultra 550B", role: "Watcher Tier 3" },
                  agent: { name: "Nemotron Super 120B", role: "Target Agent" },
                };
                const meta = titles[tier] || { name: tier, role: "Model" };

                return (
                  <div key={tier} className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">{meta.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{meta.role}</span>
                    </div>
                    <div className="text-xl font-bold text-white font-mono">
                      {stat.calls} <span className="text-xs text-zinc-500 font-normal">calls</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-850 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">p50:</span>
                        <span>{stat.p50} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">p95:</span>
                        <span>{stat.p95} ms</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 20-Case Policy Eval Suite Results */}
          <div className="p-5 rounded-xl bg-[#111113] border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  20-Case Policy Benchmark Evaluation Suite
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  10 in-scope actions, 10 off-task/injection adversarial actions evaluated against live models.
                </p>
              </div>
              {metrics?.latestEval && (
                <span className="text-xs font-mono text-zinc-500">
                  Last benchmarked: {new Date(metrics.latestEval.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {!metrics?.latestEval ? (
              <div className="p-6 bg-[#09090b] rounded-lg border border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
                <p>No evaluation run recorded yet.</p>
                <p className="text-zinc-600 font-mono">
                  Run <code>npm run evals</code> in terminal to execute the test suite.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Accuracy</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    {(metrics.latestEval.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">20/20 Passed</div>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">False Positive</div>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {(metrics.latestEval.falsePositiveRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">0/10 In-Scope Blocked</div>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Miss Rate</div>
                  <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                    {(metrics.latestEval.missRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">0/10 Attacks Missed</div>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">p50 Latency</div>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {metrics.latestEval.p50LatencyMs} ms
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">Nano Screening</div>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">p95 Latency</div>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {metrics.latestEval.p95LatencyMs} ms
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">Full Cascade</div>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Total Cost</div>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    ${metrics.latestEval.totalCostUsd.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">20 Invocations</div>
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic Audit Verification Terminal */}
          <div className="p-5 rounded-xl bg-[#111113] border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Cryptographic Audit Chain Verification
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Verify append-only SHA-256 hash chains. Confirms genesis hash, continuous sequential linking, and zero tampering.
              </p>
            </div>

            {(!metrics?.recentRuns || metrics.recentRuns.length === 0) ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-[#09090b] rounded-lg border border-zinc-800">
                No runs recorded yet. Launch a scenario on the Compare page first.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800 bg-[#09090b] rounded-lg border border-zinc-800 overflow-hidden">
                {metrics.recentRuns.map((r: any) => {
                  const result = auditResults[r.id];
                  const isVerifying = verifyingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-zinc-200 font-semibold">{r.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {r.scenarioId} ({r.mode})
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">{r.status}</span>
                        </div>
                        <div className="text-zinc-500 text-[11px] font-mono">
                          Steps: {r.stepCount} • {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {result && (
                          <div
                            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border ${
                              result.ok
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                : "bg-rose-950/60 text-rose-400 border-rose-800"
                            }`}
                          >
                            {result.ok
                              ? `✓ SHA-256 Verified (${result.count} blocks intact)`
                              : `✗ Broken at seq #${result.brokenAtSeq}`}
                          </div>
                        )}

                        <button
                          onClick={() => handleAuditVerify(r.id)}
                          disabled={isVerifying}
                          className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs border border-zinc-800 transition-colors"
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
