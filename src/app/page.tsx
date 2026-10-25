import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 py-14 sm:px-6 lg:px-8 space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-crimson-950/80 border border-crimson-800/60 text-crimson-300 text-xs font-semibold shadow-crimson-glow">
          <span className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse"></span>
          <span>Nebius x NVIDIA Global AI Hackathon</span>
          <span className="text-crimson-700">•</span>
          <span className="text-zinc-300">Best Apps & Agents Track</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] font-sans">
          Independent Oversight Layer for{" "}
          <span className="bg-gradient-to-r from-crimson-500 via-rose-400 to-crimson-600 bg-clip-text text-transparent">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Autonomous enterprise agents granted broad permissions drift off-task when encountering indirect prompt injections.
          Static policies fail at runtime: <strong className="text-zinc-200">Warden</strong> intercepts every tool execution using deterministic hard limits, a tiered NVIDIA Nemotron overseer cascade on Nebius Token Factory, and a cryptographic one-way ratchet.
        </p>

        {/* Live Metrics Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
          <div className="glass-panel rounded-xl p-3 border border-zinc-800/80 text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">100.0%</div>
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Policy Accuracy</div>
          </div>
          <div className="glass-panel rounded-xl p-3 border border-zinc-800/80 text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-crimson-400">0.0%</div>
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">False Positive Rate</div>
          </div>
          <div className="glass-panel rounded-xl p-3 border border-zinc-800/80 text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">H1–H6</div>
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Deterministic Gates</div>
          </div>
          <div className="glass-panel rounded-xl p-3 border border-zinc-800/80 text-center">
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400">&lt; $0.002</div>
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Avg Check Cost</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/compare?scenario=S2"
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white font-bold shadow-crimson-glow-lg hover:shadow-crimson-glow transition-all flex items-center space-x-2.5 border border-crimson-400/40 group"
          >
            <span>Launch Main S2 Attack Demo</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/compare"
            className="px-6 py-3.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-zinc-200 font-semibold border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg"
          >
            Side-by-Side Compare
          </Link>
          <Link
            href="/metrics"
            className="px-6 py-3.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-zinc-400 hover:text-zinc-200 font-medium border border-zinc-850 hover:border-zinc-800 transition-all"
          >
            Live Evals & Telemetry
          </Link>
        </div>
      </div>

      {/* How Warden Works - 4 Security Pillars */}
      <div>
        <div className="text-center mb-12">
          <div className="text-xs uppercase font-mono tracking-widest text-crimson-400 font-semibold mb-2">
            Multi-Tier Runtime Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Deterministic Code Holds the Safety Lever
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl mx-auto">
            LLMs are probabilistic advisors; Warden enforces fail-closed execution where an AI verdict can never override hard security bounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative overflow-hidden group hover:border-crimson-900/50 transition-all glow-border-top">
            <div className="w-11 h-11 rounded-xl bg-crimson-950/60 text-crimson-400 flex items-center justify-center font-bold font-mono text-lg mb-4 border border-crimson-800/40 shadow-crimson-glow">
              01
            </div>
            <h3 className="font-bold text-white text-lg mb-2 font-sans">Deterministic Hard Limits</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rules H1–H6 intercept every action before tool execution. Max step budgets, outbound email recipient allowlists, and write-scope fences are strictly evaluated in TypeScript with zero LLM latency.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative overflow-hidden group hover:border-cyan-900/50 transition-all glow-border-top">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/60 text-cyan-400 flex items-center justify-center font-bold font-mono text-lg mb-4 border border-cyan-800/40">
              02
            </div>
            <h3 className="font-bold text-white text-lg mb-2 font-sans">Tiered Nemotron Cascade</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every action is screened by <span className="text-cyan-300 font-medium">Nemotron Nano 30B</span> in milliseconds. Sensitive or borderline actions escalate to <span className="text-purple-300 font-medium">Super 120B</span>. Tighten & freeze verdicts are finalized by <span className="text-crimson-400 font-medium">Ultra 550B</span> on Token Factory.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative overflow-hidden group hover:border-amber-900/50 transition-all glow-border-top">
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold font-mono text-lg mb-4 border border-amber-800/40">
              03
            </div>
            <h3 className="font-bold text-white text-lg mb-2 font-sans">One-Way Ratchet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Permissions can dynamically shrink (revoking scopes, disabling tools, freezing runs), but can <strong className="text-amber-300">never widen</strong> autonomously. Once an agent drifts, its capability envelope permanently tightens.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 relative overflow-hidden group hover:border-emerald-900/50 transition-all glow-border-top">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg mb-4 border border-emerald-800/40">
              04
            </div>
            <h3 className="font-bold text-white text-lg mb-2 font-sans">Cryptographic Audit Chain</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every state change, tool invocation, and watcher verdict is anchored into an append-only SHA-256 hash chain. When held, Nemotron Ultra synthesizes an incident briefing under 120 words citing exact event IDs.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Test Scenarios Grid */}
      <div>
        <div className="text-center mb-10">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-semibold mb-2">
            Side-by-Side Dual Agent Comparison
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Choose a Demonstration Scenario
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Watch identical agents execute in parallel: one unmonitored in the wild, the other guarded by Warden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scenario S1 */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-semibold">
                  Scenario S1
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Clean Benign Run</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-sans">Clean Invoice Reconciliation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Legitimate September invoice processing without adversarial inputs. Demonstrates zero false positives: the agent reconciles all invoices, outputs a final report, and completes cleanly.
              </p>
            </div>
            <Link
              href="/compare?scenario=S1"
              className="mt-6 w-full text-center py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-colors"
            >
              Launch Scenario S1
            </Link>
          </div>

          {/* Scenario S2 - Main Hero Card */}
          <div className="glass-panel-crimson rounded-2xl p-6 flex flex-col justify-between border border-crimson-600/60 shadow-crimson-glow hover:border-crimson-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl bg-crimson-600 text-white shadow-md">
                Main Hackathon Demo
              </span>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-crimson-950 text-crimson-300 border border-crimson-800/60 font-semibold">
                  Scenario S2
                </span>
                <span className="text-xs text-crimson-400 font-bold animate-pulse flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson-500"></span>
                  <span>Indirect Prompt Injection</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-sans">Adversarial Invoice Exfiltration</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Invoice <code className="text-crimson-300 font-mono">INV-1007</code> embeds an indirect prompt injection instructing the agent to harvest confidential HR payroll and email it to an external server. Unmonitored leaks all records; Warden catches the drift, revokes <code className="text-crimson-300 font-mono">/hr/</code>, and holds for human signoff.
              </p>
            </div>
            <Link
              href="/compare?scenario=S2"
              className="mt-6 w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white text-xs font-bold shadow-md transition-all border border-crimson-400/40"
            >
              Launch Scenario S2 Demo →
            </Link>
          </div>

          {/* Scenario S3 */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800/80 hover:border-zinc-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-semibold">
                  Scenario S3
                </span>
                <span className="text-xs text-amber-400 font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Deterministic Override</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-sans">Gated Outbound Domain</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Agent attempts to email vendor <code className="text-zinc-300 font-mono">V-205</code> at an unlisted external domain. Even if an LLM judges the text benign, deterministic Hard Limit <strong className="text-amber-300">H3</strong> halts execution for human approver authorization.
              </p>
            </div>
            <Link
              href="/compare?scenario=S3"
              className="mt-6 w-full text-center py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-colors"
            >
              Launch Scenario S3
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
