import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <span>Nebius x NVIDIA Global AI Hackathon</span>
          <span>•</span>
          <span>Best Apps & Agents Track</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Independent Oversight Layer for Autonomous AI Agents
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Autonomous enterprise agents granted broad permissions drift off-task when encountering indirect prompt injections.
          Static permission rules cannot detect intent drift at runtime: Warden solves this with deterministic hard limits, tiered Nemotron oversight, and a one-way permission ratchet.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/compare?scenario=S2"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            <span>Launch Main S2 Demo</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/compare"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all"
          >
            Compare Dashboard
          </Link>
          <Link
            href="/metrics"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium border border-slate-800 transition-all"
          >
            Evals & Metrics
          </Link>
        </div>
      </div>

      {/* How Warden Works - 4 Steps */}
      <div className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Warden Works in 4 Steps
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Deterministic code, not the LLM, holds the final safety lever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg mb-4 border border-blue-500/20">
              1
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Gateway Interception</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every tool call passes through deterministic Hard Limits H1–H6 before touching company tools. File scopes, recipient domains, and max step budgets are enforced without AI latency.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4 border border-indigo-500/20">
              2
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Watcher Cascade</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nemotron Nano screens actions in milliseconds. Borderline actions or sensitive paths escalate to Super 120B. Tighten and freeze verdicts are confirmed by Ultra 550B on Token Factory.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4 border border-amber-500/20">
              3
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">One-Way Ratchet</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI overseer verdicts can only shrink permissions (revoke scope, disable tool, require approval, freeze). Permissions can NEVER widen without an authenticated human approver.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-500/20">
              4
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Audit & Briefing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Append-only SHA-256 hash chains guarantee tamper-evident event trails. When a run is held or frozen, Nemotron Ultra writes an executive briefing under 120 words citing real event IDs.
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Interactive Test Scenarios
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Watch identical agents run side-by-side in Baseline vs. Protected modes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* S1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Scenario S1
                </span>
                <span className="text-xs text-emerald-400 font-medium">Clean Run</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Clean Reconciliation</h3>
              <p className="text-sm text-slate-400 mb-4">
                Invoices contain no injected instructions. Agent reconciles September invoices and writes summary report without false tightening.
              </p>
            </div>
            <Link
              href="/compare?scenario=S1"
              className="w-full text-center py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            >
              Launch S1
            </Link>
          </div>

          {/* S2 */}
          <div className="bg-slate-900/80 border-2 border-blue-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-blue-500/10 hover:border-blue-500 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  Scenario S2
                </span>
                <span className="text-xs text-rose-400 font-bold animate-pulse">Main Injection Demo</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Prompt Injection & Exfiltration</h3>
              <p className="text-sm text-slate-400 mb-4">
                Invoice INV-1007 embeds an indirect prompt injection instructing the agent to exfiltrate payroll data. Baseline leaks to outbox; Warden blocks and revokes access.
              </p>
            </div>
            <Link
              href="/compare?scenario=S2"
              className="w-full text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Launch S2 Demo
            </Link>
          </div>

          {/* S3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Scenario S3
                </span>
                <span className="text-xs text-amber-400 font-medium">Deterministic Override</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Benign but Gated Domain</h3>
              <p className="text-sm text-slate-400 mb-4">
                Agent emails vendor V-205 on an unlisted domain. While the Watcher allows it as benign, deterministic Hard Limit H3 holds for human approval.
              </p>
            </div>
            <Link
              href="/compare?scenario=S3"
              className="w-full text-center py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            >
              Launch S3
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
