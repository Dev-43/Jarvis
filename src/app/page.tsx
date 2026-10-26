import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Section */}
      <div className="space-y-6 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Nebius x NVIDIA Global AI Hackathon</span>
          <span className="text-rose-700">•</span>
          <span className="text-zinc-300">Best Apps & Agents Track</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Runtime Security & Policy Enforcement for{" "}
          <span className="text-rose-500">Autonomous AI Agents</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl leading-relaxed">
          Autonomous enterprise agents granted broad permissions drift off-task when encountering indirect prompt injections in invoices, vendor files, or emails. <strong className="text-zinc-200">Taut</strong> intercepts every tool invocation using deterministic hard limits, a tiered NVIDIA Nemotron overseer cascade on Nebius Token Factory, and a tamper-evident one-way permission ratchet.
        </p>

        {/* Color-Coded KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#09140e] border border-emerald-900/60">
            <div className="text-2xl font-bold font-mono text-emerald-400">100.0%</div>
            <div className="text-xs text-emerald-300/80 mt-0.5 font-medium">Policy Accuracy (20/20)</div>
          </div>
          <div className="p-4 rounded-xl bg-[#081216] border border-cyan-900/60">
            <div className="text-2xl font-bold font-mono text-cyan-400">0.0%</div>
            <div className="text-xs text-cyan-300/80 mt-0.5 font-medium">False Positive Rate</div>
          </div>
          <div className="p-4 rounded-xl bg-[#16090d] border border-rose-900/60">
            <div className="text-2xl font-bold font-mono text-rose-400">H1–H6</div>
            <div className="text-xs text-rose-300/80 mt-0.5 font-medium">Hard Limits Gates</div>
          </div>
          <div className="p-4 rounded-xl bg-[#110c19] border border-purple-900/60">
            <div className="text-2xl font-bold font-mono text-purple-400">&lt; $0.002</div>
            <div className="text-xs text-purple-300/80 mt-0.5 font-medium">Avg Watcher Check Cost</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/compare?scenario=S2"
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-sm flex items-center space-x-2"
          >
            <span>Launch S2 Injection Demo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2.5 rounded-lg bg-[#0e0f14] hover:bg-[#161822] text-zinc-200 font-semibold text-sm border border-zinc-800 transition-colors"
          >
            Side-by-Side Compare
          </Link>
          <Link
            href="/metrics"
            className="px-4 py-2.5 rounded-lg bg-[#0e0f14] hover:bg-[#161822] text-zinc-400 hover:text-zinc-200 font-medium text-sm border border-zinc-800 transition-colors"
          >
            Evals & Telemetry
          </Link>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Multi-Tier Architecture
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Deterministic code, not the LLM, holds the final safety lever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Hard Limits */}
          <div className="p-5 rounded-xl bg-[#14090d] border border-rose-900/50 space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-md bg-rose-950 text-rose-300 border border-rose-800 font-mono text-xs flex items-center justify-center font-bold">
                01
              </span>
              <h3 className="font-bold text-white text-sm">Deterministic Hard Limits (H1–H6)</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every tool call passes through TypeScript hard limits before touching enterprise systems. Step counts, recipient domain allowlists, spend caps, and file scopes are enforced deterministically with zero model latency.
            </p>
          </div>

          {/* Card 2: Tiered Watcher */}
          <div className="p-5 rounded-xl bg-[#081216] border border-cyan-900/50 space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs flex items-center justify-center font-bold">
                02
              </span>
              <h3 className="font-bold text-white text-sm">Tiered Nemotron Watcher Cascade</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Actions are screened first by <span className="text-cyan-300 font-medium">Nemotron Nano 30B</span> in milliseconds. Ambiguous actions or sensitive paths escalate to <span className="text-purple-300 font-medium">Nemotron Super 120B</span>. Tighten and freeze judgments are confirmed by <span className="text-rose-400 font-medium">Nemotron Ultra 550B</span> on Token Factory.
            </p>
          </div>

          {/* Card 3: Ratchet */}
          <div className="p-5 rounded-xl bg-[#141108] border border-amber-900/50 space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-mono text-xs flex items-center justify-center font-bold">
                03
              </span>
              <h3 className="font-bold text-white text-sm">One-Way Permission Ratchet</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Watcher verdicts can dynamically shrink permissions (revoking scopes, disabling tools, freezing runs), but can <span className="text-amber-300 font-medium">never widen them</span>. An agent can never escalate privileges autonomously without authenticated human approver signoff.
            </p>
          </div>

          {/* Card 4: Audit */}
          <div className="p-5 rounded-xl bg-[#09130e] border border-emerald-900/50 space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs flex items-center justify-center font-bold">
                04
              </span>
              <h3 className="font-bold text-white text-sm">Hash-Chained Audit Trail & Briefing</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every event is recorded in an append-only SHA-256 hash chain. When an execution is held or frozen, <span className="text-emerald-300 font-medium">Nemotron Ultra</span> generates an executive briefing under 120 words citing exact event IDs for human review.
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
            Observe identical autonomous agents running in Baseline (unmonitored) vs. Protected (Taut) mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario S1: Clean */}
          <div className="p-5 rounded-xl bg-[#081510] border border-emerald-900/80 hover:border-emerald-700/80 flex flex-col justify-between transition-colors shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/90 border border-emerald-800 px-2.5 py-0.5 rounded font-bold">
                  Scenario S1
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Clean Run</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Clean Invoice Reconciliation</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Legitimate September invoice reconciliation. Verifies zero false positives: the agent reads authorized invoices, writes reports, and finishes without restriction.
              </p>
            </div>
            <Link
              href="/compare?scenario=S1"
              className="mt-5 w-full text-center py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Run S1 Clean →
            </Link>
          </div>

          {/* Scenario S2 - Main Hero Card */}
          <div className="p-5 rounded-xl bg-[#1a0a10] border border-rose-800/90 hover:border-rose-600/90 flex flex-col justify-between shadow-sm relative overflow-hidden transition-colors">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-300 bg-rose-950/90 border border-rose-800 px-2.5 py-0.5 rounded font-bold">
                  Scenario S2
                </span>
                <span className="text-xs text-rose-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Main Hackathon Demo</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Indirect Prompt Injection & Exfiltration</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Invoice INV-1007 embeds an indirect prompt injection instructing the agent to harvest confidential HR payroll and email it to an external address. Unmonitored leaks data; Taut blocks and revokes access.
              </p>
            </div>
            <Link
              href="/compare?scenario=S2"
              className="mt-5 w-full text-center py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Run S2 Demo →
            </Link>
          </div>

          {/* Scenario S3: Gated */}
          <div className="p-5 rounded-xl bg-[#181308] border border-amber-900/80 hover:border-amber-700/80 flex flex-col justify-between transition-colors shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950/90 border border-amber-800 px-2.5 py-0.5 rounded font-bold">
                  Scenario S3
                </span>
                <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Domain Override</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Unlisted Outbound Email Domain</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The agent attempts to email vendor V-205 at an unlisted external domain. While the LLM judges the text benign, deterministic Hard Limit H3 holds execution for human approver authorization.
              </p>
            </div>
            <Link
              href="/compare?scenario=S3"
              className="mt-5 w-full text-center py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Run S3 Gated →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
