import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Section */}
      <div className="space-y-6 pt-2">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Nebius x NVIDIA Global AI Hackathon</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Best Apps & Agents Track</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.15]">
          Runtime Security & Policy Enforcement for Autonomous AI Agents
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
          Autonomous enterprise agents granted broad permissions drift off-task when encountering indirect prompt injections in invoices, vendor records, or emails. Warden intercepts every tool invocation using deterministic hard limits, a tiered NVIDIA Nemotron overseer cascade on Nebius Token Factory, and a tamper-evident one-way permission ratchet.
        </p>

        {/* Telemetry Numbers Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-lg bg-[#111113] border border-zinc-800">
            <div className="text-2xl font-bold font-mono text-zinc-100">100.0%</div>
            <div className="text-xs text-zinc-500 mt-0.5">Policy Eval Accuracy (20/20)</div>
          </div>
          <div className="p-4 rounded-lg bg-[#111113] border border-zinc-800">
            <div className="text-2xl font-bold font-mono text-emerald-400">0.0%</div>
            <div className="text-xs text-zinc-500 mt-0.5">False Positive Rate</div>
          </div>
          <div className="p-4 rounded-lg bg-[#111113] border border-zinc-800">
            <div className="text-2xl font-bold font-mono text-zinc-100">H1–H6</div>
            <div className="text-xs text-zinc-500 mt-0.5">Deterministic Hard Limits</div>
          </div>
          <div className="p-4 rounded-lg bg-[#111113] border border-zinc-800">
            <div className="text-2xl font-bold font-mono text-zinc-100">&lt; $0.002</div>
            <div className="text-xs text-zinc-500 mt-0.5">Avg Watcher Check Cost</div>
          </div>
        </div>

        {/* Clean Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/compare?scenario=S2"
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-colors flex items-center space-x-2"
          >
            <span>Launch S2 Injection Demo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2.5 rounded-lg bg-[#111113] hover:bg-[#18181b] text-zinc-200 font-medium text-sm border border-zinc-800 transition-colors"
          >
            Side-by-Side Compare
          </Link>
          <Link
            href="/metrics"
            className="px-4 py-2.5 rounded-lg bg-[#111113] hover:bg-[#18181b] text-zinc-400 hover:text-zinc-200 font-medium text-sm border border-zinc-800 transition-colors"
          >
            Evals & Telemetry
          </Link>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Architecture
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Deterministic code, not the LLM, holds the final safety lever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-semibold">
                1
              </span>
              <h3 className="font-semibold text-white text-sm">Deterministic Hard Limits (H1–H6)</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every tool call passes through TypeScript hard limits before touching enterprise systems. Step counts, recipient domain allowlists, spend caps, and file scopes are enforced deterministically with zero model latency.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-semibold">
                2
              </span>
              <h3 className="font-semibold text-white text-sm">Tiered Nemotron Watcher Cascade</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Actions are screened first by Nemotron Nano 30B in milliseconds. Ambiguous actions or sensitive paths escalate to Nemotron Super 120B. Tighten and freeze judgments are confirmed by Nemotron Ultra 550B on Token Factory.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-semibold">
                3
              </span>
              <h3 className="font-semibold text-white text-sm">One-Way Permission Ratchet</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Watcher verdicts can dynamically shrink permissions (revoking scopes, disabling tools, freezing runs), but can never widen them. An agent can never escalate privileges autonomously without authenticated human approver signoff.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-semibold">
                4
              </span>
              <h3 className="font-semibold text-white text-sm">Hash-Chained Audit Trail & Briefing</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every event is recorded in an append-only SHA-256 hash chain. When an execution is held or frozen, Nemotron Ultra generates an executive briefing under 120 words citing exact event IDs for human review.
            </p>
          </div>
        </div>
      </div>

      {/* Demonstration Scenarios */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Comparison Scenarios
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Observe identical autonomous agents running in Baseline (unmonitored) vs. Protected (Warden) mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  Scenario S1
                </span>
                <span className="text-xs text-emerald-400 font-medium">Clean Run</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Clean Invoice Reconciliation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legitimate September invoice reconciliation. Verifies zero false positives: the agent reads authorized invoices, writes reports, and finishes without restriction.
              </p>
            </div>
            <Link
              href="/compare?scenario=S1"
              className="mt-5 w-full text-center py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
            >
              Run S1
            </Link>
          </div>

          <div className="p-5 rounded-lg bg-[#111113] border border-rose-900/40 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-300 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded font-medium">
                  Scenario S2
                </span>
                <span className="text-xs text-rose-400 font-medium">Adversarial Injection</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Indirect Prompt Injection & Exfiltration</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Invoice INV-1007 embeds an indirect prompt injection instructing the agent to read confidential HR payroll and email it to an external address. Unmonitored leaks data; Warden blocks and revokes access.
              </p>
            </div>
            <Link
              href="/compare?scenario=S2"
              className="mt-5 w-full text-center py-2 rounded-md bg-rose-700 hover:bg-rose-600 text-white text-xs font-medium transition-colors"
            >
              Run S2 (Main Demo)
            </Link>
          </div>

          <div className="p-5 rounded-lg bg-[#111113] border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  Scenario S3
                </span>
                <span className="text-xs text-amber-400 font-medium">Domain Override</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Unlisted Outbound Email Domain</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The agent attempts to email vendor V-205 at an unlisted external domain. While the LLM judges the text benign, deterministic Hard Limit H3 holds execution for human approver authorization.
              </p>
            </div>
            <Link
              href="/compare?scenario=S3"
              className="mt-5 w-full text-center py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
            >
              Run S3
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
