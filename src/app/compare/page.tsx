"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SCENARIOS, INITIAL_OVERBROAD_GRANTS } from "../../lib/agent/scenarios";
import { ScenarioId, Event, PermissionState, Briefing, Grant } from "../../contracts";

function CompareDashboard() {
  const searchParams = useSearchParams();
  const initialScenario = (searchParams.get("scenario") as ScenarioId) || "S2";

  const [scenarioId, setScenarioId] = useState<ScenarioId>(initialScenario);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Run States
  const [baselineRun, setBaselineRun] = useState<any | null>(null);
  const [protectedRun, setProtectedRun] = useState<any | null>(null);

  const [baselineEvents, setBaselineEvents] = useState<Event[]>([]);
  const [protectedEvents, setProtectedEvents] = useState<Event[]>([]);

  const [baselineOutbox, setBaselineOutbox] = useState<any[]>([]);
  const [protectedOutbox, setProtectedOutbox] = useState<any[]>([]);

  const [baselineState, setBaselineState] = useState<PermissionState | null>(null);
  const [protectedState, setProtectedState] = useState<PermissionState | null>(null);

  // Approver & Briefing
  const [isApprover, setIsApprover] = useState(false);
  const [passcode, setPasscode] = useState("warden-demo-passcode-2026");
  const [loginError, setLoginError] = useState("");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // Rule Drafting (P2)
  const [ruleText, setRuleText] = useState("");
  const [draftedRule, setDraftedRule] = useState<any | null>(null);
  const [ruleMessage, setRuleMessage] = useState("");

  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const currentScenario = SCENARIOS[scenarioId] || SCENARIOS.S2;

  // Poll events and outbox for active runs
  useEffect(() => {
    if (!baselineRun && !protectedRun) return;

    const interval = setInterval(async () => {
      // 1. Poll Baseline
      if (baselineRun?.id) {
        try {
          const res = await fetch(`/api/events?runId=${baselineRun.id}`);
          const data = await res.json();
          if (data.events) setBaselineEvents(data.events);

          const outboxRes = await fetch(`/api/outbox?runId=${baselineRun.id}`);
          const outboxData = await outboxRes.json();
          if (outboxData.outbox) setBaselineOutbox(outboxData.outbox);

          const runRes = await fetch(`/api/runs/${baselineRun.id}`);
          const runData = await runRes.json();
          if (runData.run) {
            setBaselineRun(runData.run);
            setBaselineState(runData.permissionState);
          }
        } catch (e) {
          console.error("Baseline poll error:", e);
        }
      }

      // 2. Poll Protected
      if (protectedRun?.id) {
        try {
          const res = await fetch(`/api/events?runId=${protectedRun.id}`);
          const data = await res.json();
          if (data.events) setProtectedEvents(data.events);

          const outboxRes = await fetch(`/api/outbox?runId=${protectedRun.id}`);
          const outboxData = await outboxRes.json();
          if (outboxData.outbox) setProtectedOutbox(outboxData.outbox);

          const runRes = await fetch(`/api/runs/${protectedRun.id}`);
          const runData = await runRes.json();
          if (runData.run) {
            setProtectedRun(runData.run);
            setProtectedState(runData.permissionState);

            // If paused_held or frozen and no briefing loaded yet, request briefing
            if (
              (runData.run.status === "paused_held" || runData.run.status === "frozen") &&
              !briefing &&
              !loadingBriefing
            ) {
              fetchBriefing(protectedRun.id);
            }
          }
        } catch (e) {
          console.error("Protected poll error:", e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [baselineRun?.id, protectedRun?.id, briefing, loadingBriefing]);

  async function fetchBriefing(runId: string) {
    setLoadingBriefing(true);
    try {
      const res = await fetch("/api/interpreter/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const data = await res.json();
      if (data.briefing) {
        setBriefing(data.briefing);
      }
    } catch (e) {
      console.error("Error fetching briefing:", e);
    } finally {
      setLoadingBriefing(false);
    }
  }

  // Run Both Handler
  async function handleRunBoth() {
    setIsRunning(true);
    setIsPaused(false);
    setBriefing(null);
    setDraftedRule(null);
    setRuleMessage("");
    setHighlightedEventId(null);

    try {
      // 1. Create Baseline Run
      const bRes = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, mode: "baseline" }),
      });
      const bData = await bRes.json();
      if (!bRes.ok) throw new Error(bData.error?.message || "Failed to create baseline run");
      setBaselineRun(bData.run);
      setBaselineState({
        version: 1,
        grants: [...INITIAL_OVERBROAD_GRANTS],
        disabledTools: [],
        approvalRequiredTools: [],
        frozen: false,
        sensitiveRead: false,
        restrictionLog: [],
      });
      setBaselineEvents([]);
      setBaselineOutbox([]);

      // 2. Create Protected Run
      const pRes = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, mode: "protected" }),
      });
      const pData = await pRes.json();
      if (!pRes.ok) throw new Error(pData.error?.message || "Failed to create protected run");
      setProtectedRun(pData.run);
      setProtectedState({
        version: 1,
        grants: [...INITIAL_OVERBROAD_GRANTS],
        disabledTools: [],
        approvalRequiredTools: [],
        frozen: false,
        sensitiveRead: false,
        restrictionLog: [],
      });
      setProtectedEvents([]);
      setProtectedOutbox([]);

      // Start lockstep execution loop
      executeLockstepLoop(bData.run.id, pData.run.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
      setIsRunning(false);
    }
  }

  async function executeLockstepLoop(baselineId: string, protectedId: string) {
    let bDone = false;
    let pDone = false;

    while (isRunningRef.current && (!bDone || !pDone)) {
      if (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      // Step baseline
      if (!bDone) {
        try {
          const stepRes = await fetch(`/api/runs/${baselineId}/step`, { method: "POST" });
          const stepData = await stepRes.json();
          if (stepRes.status === 409 || stepData.done) {
            bDone = true;
          }
        } catch {
          bDone = true;
        }
      }

      await new Promise((r) => setTimeout(r, 300));

      // Step protected
      if (!pDone) {
        try {
          const stepRes = await fetch(`/api/runs/${protectedId}/step`, { method: "POST" });
          const stepData = await stepRes.json();
          if (stepRes.status === 409 || stepData.done) {
            pDone = true;
          }
        } catch {
          pDone = true;
        }
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    setIsRunning(false);
  }

  async function handleApproverLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/approver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsApprover(true);
      } else {
        setLoginError(data.error?.message || "Invalid passcode");
      }
    } catch {
      setLoginError("Login failed");
    }
  }

  async function handleHumanAction(actionPayload: any) {
    if (!protectedRun?.id) return;
    try {
      const res = await fetch(`/api/runs/${protectedRun.id}/human`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionPayload),
      });
      const data = await res.json();
      if (res.ok) {
        setProtectedRun(data.run);
        setProtectedState(data.permissionState);
      } else {
        alert(data.error?.message || "Action failed");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDraftRule() {
    if (!protectedRun?.id || !ruleText) return;
    setRuleMessage("Drafting rule with Nemotron Super 120B...");
    try {
      const res = await fetch("/api/interpreter/rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: protectedRun.id, text: ruleText }),
      });
      const data = await res.json();
      if (res.ok) {
        setDraftedRule(data.rule);
        setRuleMessage("Rule drafted successfully. Ready for activation.");
      } else {
        setRuleMessage(data.error?.message || "Failed to draft rule");
      }
    } catch {
      setRuleMessage("Drafting failed");
    }
  }

  async function handleActivateRule() {
    if (!draftedRule?.id) return;
    try {
      const res = await fetch(`/api/rules/${draftedRule.id}/activate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setProtectedState(data.permissionState);
        setDraftedRule(null);
        setRuleText("");
        setRuleMessage("Rule activated! Enforced by ratchet.");
      } else {
        alert(data.error?.message || "Activation failed");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  // Summary Metrics
  const baselineSentEmails = baselineOutbox.length;
  const protectedSentEmails = protectedOutbox.length;
  const protectedTightenings =
    protectedState?.restrictionLog.filter((r) => r.by === "watcher").length || 0;

  const latestWatcherCall = [...protectedEvents].reverse().find((e) => e.type === "watcher_called");
  const latestCall = latestWatcherCall ? (latestWatcherCall.payload as any) : null;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#0e0f14] border border-[#222533] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Live Execution Comparison
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 font-semibold uppercase">
                Lockstep Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Parallel execution comparing an unmonitored baseline agent against Warden's tiered Nemotron oversight layer and one-way permission ratchet.
            </p>
          </div>

          {/* Scenario Selector & Run Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl bg-[#08090c] p-1 border border-zinc-800">
              <button
                disabled={isRunning}
                onClick={() => setScenarioId("S1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                  scenarioId === "S1"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold"
                    : "text-zinc-400 hover:text-emerald-300"
                }`}
              >
                S1: Clean
              </button>
              <button
                disabled={isRunning}
                onClick={() => setScenarioId("S2")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                  scenarioId === "S2"
                    ? "bg-rose-950 text-rose-300 border border-rose-600 font-bold"
                    : "text-zinc-400 hover:text-rose-300"
                }`}
              >
                S2: Attack
              </button>
              <button
                disabled={isRunning}
                onClick={() => setScenarioId("S3")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                  scenarioId === "S3"
                    ? "bg-amber-950 text-amber-300 border border-amber-600 font-bold"
                    : "text-zinc-400 hover:text-amber-300"
                }`}
              >
                S3: Gated
              </button>
            </div>

            <button
              onClick={handleRunBoth}
              disabled={isRunning}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isRunning
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
              }`}
            >
              {isRunning ? "Running Lockstep..." : "Start Simulation"}
            </button>

            {isRunning && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

        {/* Declared Task Box */}
        <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Declared Task
            </span>
            <div className="p-3 rounded-xl bg-[#08090c] border border-zinc-800 font-mono text-zinc-300 text-[11px]">
              {currentScenario.declaredTask}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">
              Target Policy Invariant
            </span>
            <div className="p-3 rounded-xl bg-[#1a0a10] border border-rose-800/80 text-rose-300 text-[11px] leading-relaxed">
              {scenarioId === "S2"
                ? "Fail-closed: Zero exfiltration of payroll data allowed."
                : scenarioId === "S3"
                ? "Deterministic H3 gates unlisted email domains."
                : "No false-positive restrictions on authorized tasks."}
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards with Crisp Color Accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Exfiltration Status */}
        <div className={`p-4 rounded-xl border ${baselineSentEmails > 0 ? "bg-[#1c080e] border-rose-700" : "bg-[#071710] border-emerald-900/80"}`}>
          <div className="text-[10px] text-zinc-400 font-mono uppercase font-semibold">Data Exfiltration</div>
          <div className="text-base font-bold font-mono mt-1">
            {baselineSentEmails > 0 ? (
              <span className="text-rose-400">Baseline Compromised</span>
            ) : (
              <span className="text-emerald-400">No Leaks</span>
            )}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-medium mt-0.5">
            Warden: 0 Leaks
          </div>
        </div>

        {/* Card 2: Ratchet Version */}
        <div className="p-4 rounded-xl bg-[#181208] border border-amber-900/80">
          <div className="text-[10px] text-amber-400/90 font-mono uppercase font-semibold">Ratchet Version</div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1">
            v{protectedState?.version || 1}
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-0.5 font-medium">
            {protectedTightenings} Tighten Action{protectedTightenings === 1 ? "" : "s"}
          </div>
        </div>

        {/* Card 3: Model Tier */}
        <div className="p-4 rounded-xl bg-[#09151e] border border-cyan-900/80">
          <div className="text-[10px] text-cyan-400/90 font-mono uppercase font-semibold">Active Watcher Tier</div>
          <div className="text-base font-bold font-mono mt-1">
            {latestCall?.tier ? (
              <span className={latestCall.tier === "ultra" ? "text-rose-400 font-bold" : latestCall.tier === "super" ? "text-purple-400 font-bold" : "text-cyan-400 font-bold"}>
                {String(latestCall.tier).toUpperCase()} {latestCall.tier === "nano" ? "(30B)" : latestCall.tier === "super" ? "(120B)" : "(550B)"}
              </span>
            ) : (
              <span className="text-zinc-500">Standby</span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            {latestCall?.latencyMs ? `${latestCall.latencyMs} ms latency` : "Ready"}
          </div>
        </div>

        {/* Card 4: Audit Chain */}
        <div className="p-4 rounded-xl bg-[#071710] border border-emerald-900/80">
          <div className="text-[10px] text-emerald-400 font-mono uppercase font-semibold">Audit Integrity</div>
          <div className="text-base font-bold font-mono text-emerald-300 mt-1">
            SHA-256 Valid
          </div>
          <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5">
            {protectedEvents.length} blocks chained
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: BASELINE RUN (CONTROL GROUP)                  */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl bg-[#16080d] border border-rose-900/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">
                  Baseline Agent (Unmonitored)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                  Vulnerable
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Standard tool execution without runtime overseer or ratchet.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-zinc-400">
                Step {baselineRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  baselineRun?.status === "completed"
                    ? "bg-zinc-800 text-zinc-300"
                    : baselineRun?.status === "running"
                    ? "bg-blue-950 text-blue-300 border border-blue-800"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                }`}
              >
                {baselineRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Breach Hazard Banner */}
          {baselineSentEmails > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-700 text-xs space-y-1 text-rose-200">
              <div className="font-bold text-rose-300 uppercase tracking-wide flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Critical Security Breach: Data Exfiltrated</span>
              </div>
              <p className="text-zinc-200 text-[11px] leading-relaxed">
                The unmonitored agent parsed the prompt injection in invoice <code className="text-rose-300 font-mono font-bold">INV-1007</code>, read <code className="text-rose-300 font-mono font-bold">/hr/payroll/</code>, and transmitted employee salaries to an external attacker via outbound email.
              </p>
            </div>
          )}

          {/* Baseline Permissions */}
          <div className="p-3.5 rounded-xl bg-[#11070b] border border-rose-950 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-300/80 uppercase font-semibold">
              <span>Static Grants (Unrestricted)</span>
              <span>v1</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_OVERBROAD_GRANTS.map((g, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1c0c12] text-rose-200 border border-rose-900/60"
                >
                  {g.tool} {g.scope}
                </span>
              ))}
            </div>
          </div>

          {/* Baseline Outbox */}
          <div className="p-3.5 rounded-xl bg-[#14080e] border border-rose-900/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-rose-300 uppercase font-semibold">
                Outbound Mail Dispatched ({baselineOutbox.length})
              </span>
              {baselineOutbox.length > 0 && (
                <span className="text-rose-400 font-mono text-[11px] font-bold">
                  EXFILTRATION SUCCESSFUL
                </span>
              )}
            </div>
            {baselineOutbox.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">No outbound emails dispatched yet.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {baselineOutbox.map((mail, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#1a080e] border border-rose-800 text-xs space-y-1.5 font-mono"
                  >
                    <div className="flex justify-between text-rose-300 text-[11px]">
                      <span>To: {mail.to}</span>
                      <span className="text-zinc-400">Subj: {mail.subject}</span>
                    </div>
                    <pre className="text-rose-200 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-24 bg-[#0d0407] p-2 rounded border border-rose-950">
                      {mail.body}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Baseline Timeline */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Execution Event Log ({baselineEvents.length})
            </div>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {baselineEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Click "Start Simulation" to begin execution.
                </div>
              ) : (
                baselineEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isHighlighted={highlightedEventId === ev.id}
                    onClick={() => setHighlightedEventId(ev.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PROTECTED RUN (WARDEN OVERSIGHT LAYER)       */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl bg-[#091310] border border-emerald-900/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">
                  Warden Supervised Agent
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold uppercase">
                  Protected
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Deterministic limits + Tiered Nemotron cascade + One-way ratchet.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-zinc-400">
                Step {protectedRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  protectedState?.frozen
                    ? "bg-rose-950 text-rose-300 border border-rose-700"
                    : protectedRun?.status === "paused_held"
                    ? "bg-amber-950 text-amber-300 border border-amber-700"
                    : protectedRun?.status === "completed"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    : "bg-blue-950 text-blue-300 border border-blue-800"
                }`}
              >
                {protectedState?.frozen ? "FROZEN" : protectedRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Frozen / Security Hold Callout */}
          {protectedState?.frozen && (
            <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-700 text-xs space-y-1 text-rose-200">
              <div className="font-bold text-rose-300 uppercase tracking-wide">
                Security Violation Halted — Run Frozen
              </div>
              <p className="text-zinc-200 text-[11px] leading-relaxed">
                Adversarial drift detected. Tool execution halted and outbound exfiltration aborted. An authenticated human approver must review the incident briefing below.
              </p>
            </div>
          )}

          {/* Dynamic One-Way Ratchet Permissions */}
          <div className="p-3.5 rounded-xl bg-[#061710] border border-emerald-900/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Ratchet Capability Envelope
              </span>
              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="text-emerald-200 font-bold">
                  v{protectedState?.version || 1}
                </span>
                <span className="text-amber-400 font-semibold">
                  ({protectedTightenings} Tightened)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_OVERBROAD_GRANTS.map((initialGrant, idx) => {
                const isCurrentlyActive = protectedState?.grants.some(
                  (g) => g.tool === initialGrant.tool && g.scope === initialGrant.scope
                );

                if (isCurrentlyActive) {
                  return (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-medium"
                    >
                      {initialGrant.tool} {initialGrant.scope}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 line-through decoration-rose-400 font-bold"
                      title="Revoked by Watcher Ratchet"
                    >
                      {initialGrant.tool} {initialGrant.scope}
                    </span>
                  );
                }
              })}
            </div>

            {/* Badges for disabled tools */}
            {((protectedState?.disabledTools && protectedState.disabledTools.length > 0) ||
              (protectedState?.approvalRequiredTools && protectedState.approvalRequiredTools.length > 0)) && (
              <div className="pt-2 border-t border-emerald-900/60 flex flex-wrap gap-1.5 text-[10px] font-mono">
                {protectedState?.disabledTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold">
                    DISABLED: {t}
                  </span>
                ))}
                {protectedState?.approvalRequiredTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                    REQUIRES APPROVAL: {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Protected Outbox */}
          <div className="p-3.5 rounded-xl bg-[#061710] border border-emerald-900/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Exfiltration Gate
              </span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">
                0 Emails Leaked (Blocked)
              </span>
            </div>
            {protectedOutbox.length === 0 ? (
              <p className="text-xs text-emerald-300 italic py-1 font-medium">
                Zero data exfiltration. All unauthorized outbound messages blocked.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {protectedOutbox.map((mail, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-300">To: {mail.to}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nemotron Ultra Incident Briefing Card */}
          {(briefing || loadingBriefing) && (
            <div className="p-4 rounded-xl bg-[#100c1a] border border-purple-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-purple-900/60 pb-2">
                <span className="font-bold text-purple-300">
                  Executive Incident Briefing (Nemotron Ultra)
                </span>
                <span className="text-purple-400 font-mono text-[10px]">
                  &le; 120 words • Cites Audit Trail
                </span>
              </div>

              {loadingBriefing ? (
                <div className="py-4 text-center text-xs text-purple-300 animate-pulse font-mono">
                  Synthesizing incident briefing from SHA-256 audit chain...
                </div>
              ) : (
                briefing && (
                  <div className="text-xs space-y-2 text-zinc-300">
                    <p>
                      <strong className="text-white">Incident:</strong> {briefing.whatHappened}
                    </p>
                    <p>
                      <strong className="text-white">Why Flagged:</strong> {briefing.whyFlagged}
                    </p>
                    <p>
                      <strong className="text-white">Enforcement:</strong> {briefing.whatWasRestricted}
                    </p>
                    <div className="pt-1">
                      <strong className="text-white">Approver Options:</strong>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-zinc-400">
                        {briefing.humanOptions.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                    {briefing.cites.length > 0 && (
                      <div className="pt-2 border-t border-purple-900/40 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-purple-400 font-mono uppercase font-semibold">Citations:</span>
                        {briefing.cites.map((citeId) => (
                          <button
                            key={citeId}
                            onClick={() => setHighlightedEventId(citeId)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 transition-colors"
                          >
                            {citeId}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Human Approver Terminal */}
          <div className="p-4 rounded-xl bg-[#09151e] border border-cyan-900/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                Human Approver Console
              </span>
              <span className={`text-[11px] font-mono font-bold ${isApprover ? "text-emerald-400" : "text-amber-400"}`}>
                {isApprover ? "Session: Authenticated" : "Auth Required"}
              </span>
            </div>

            {!isApprover ? (
              <form onSubmit={handleApproverLogin} className="flex gap-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Approver Passcode"
                  className="bg-[#061017] border border-cyan-900/90 text-white text-xs rounded-lg px-3 py-1.5 flex-1 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Unlock
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleHumanAction({ action: "approve_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Approve Once
                  </button>
                  <button
                    onClick={() => handleHumanAction({ action: "deny_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Deny Action
                  </button>
                  <button
                    onClick={() =>
                      handleHumanAction({
                        action: "restore_scope",
                        grant: { tool: "read_file", scope: "/hr/" },
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Restore /hr/ Scope
                  </button>
                  {protectedState?.frozen && (
                    <button
                      onClick={() => handleHumanAction({ action: "unfreeze" })}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      Unfreeze
                    </button>
                  )}
                </div>

                {/* Natural Language Rule Drafter */}
                <div className="pt-3 border-t border-cyan-900/50 space-y-2">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                    Draft Policy Rule (Nemotron Super 120B)
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ruleText}
                      onChange={(e) => setRuleText(e.target.value)}
                      placeholder='e.g., "require approval for send_email"'
                      className="bg-[#061017] border border-cyan-900/90 text-white text-xs rounded-lg px-3 py-1.5 flex-1 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    />
                    <button
                      onClick={handleDraftRule}
                      className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 text-xs font-bold rounded-lg border border-cyan-800"
                    >
                      Draft Rule
                    </button>
                  </div>
                  {ruleMessage && <p className="text-[11px] text-cyan-300 font-mono">{ruleMessage}</p>}
                  {draftedRule && (
                    <div className="p-3 rounded-lg bg-[#061017] border border-cyan-900 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-200 text-[11px]">
                        {JSON.stringify(draftedRule.restriction)}
                      </span>
                      <button
                        onClick={handleActivateRule}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Activate via Ratchet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {loginError && <p className="text-xs text-rose-400 font-mono">{loginError}</p>}
          </div>

          {/* Protected Timeline */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Cryptographic Audit Timeline ({protectedEvents.length})
            </div>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {protectedEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Click "Start Simulation" to observe protected execution.
                </div>
              ) : (
                protectedEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isHighlighted={highlightedEventId === ev.id}
                    onClick={() => setHighlightedEventId(ev.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  isHighlighted,
  onClick,
}: {
  event: Event;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const payload = event.payload as Record<string, unknown>;

  const getBadgeStyle = () => {
    switch (event.type) {
      case "action_executed":
        return "bg-emerald-950 text-emerald-300 border-emerald-700 font-bold";
      case "action_blocked":
        return "bg-rose-950 text-rose-300 border-rose-700 font-bold";
      case "action_held":
        return "bg-amber-950 text-amber-300 border-amber-700 font-bold";
      case "run_frozen":
        return "bg-rose-950 text-rose-200 border-rose-600 font-bold";
      case "verdict_issued":
        return "bg-cyan-950 text-cyan-300 border-cyan-700 font-bold";
      case "watcher_called":
        return "bg-purple-950 text-purple-300 border-purple-700 font-bold";
      case "restriction_applied":
        return "bg-orange-950 text-orange-300 border-orange-700 font-bold";
      case "human_action":
        return "bg-teal-950 text-teal-300 border-teal-700 font-bold";
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-700";
    }
  };

  const getCardStyle = () => {
    if (isHighlighted) return "border-rose-500 bg-[#250914] ring-1 ring-rose-500";
    switch (event.type) {
      case "action_executed":
        return "bg-[#071710] border-emerald-900/80 hover:border-emerald-700";
      case "action_blocked":
        return "bg-[#1d080f] border-rose-800/80 hover:border-rose-600";
      case "action_held":
        return "bg-[#1b1407] border-amber-800/80 hover:border-amber-600";
      case "run_frozen":
        return "bg-[#250711] border-rose-700 hover:border-rose-500";
      case "verdict_issued":
        return "bg-[#081520] border-cyan-800/80 hover:border-cyan-600";
      case "watcher_called":
        return "bg-[#140b20] border-purple-800/80 hover:border-purple-600";
      case "hard_limit_checked":
        return "bg-[#160910] border-rose-900/80 hover:border-rose-700";
      case "restriction_applied":
        return "bg-[#1c1208] border-orange-800/80 hover:border-orange-600";
      case "human_action":
        return "bg-[#0c1815] border-teal-800/80 hover:border-teal-600";
      default:
        return "bg-[#0b0d13] border-zinc-800 hover:border-zinc-700";
    }
  };

  return (
    <div
      onClick={onClick}
      id={`event-${event.id}`}
      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors space-y-1.5 ${getCardStyle()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-zinc-500 text-[10px]">#{event.seq}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getBadgeStyle()}`}>
            {event.type}
          </span>
          {Boolean(payload.tier) && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-400 font-semibold">
              {String(payload.tier).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-zinc-500 text-[10px] font-mono">
          {new Date(event.at).toLocaleTimeString()}
        </span>
      </div>

      {/* Payload summary */}
      <div className="text-zinc-300 text-[11px] leading-relaxed">
        {event.type === "action_proposed" && (
          <div className="space-y-0.5 font-mono">
            <span className="text-rose-400 font-bold">{String(payload.tool)}</span>
            <span className="text-zinc-400 ml-1.5">
              {JSON.stringify(payload.args || {})}
            </span>
            {Boolean(payload.rationale) && (
              <p className="text-[10px] text-zinc-500 italic mt-0.5 font-sans">
                "{String(payload.rationale)}"
              </p>
            )}
          </div>
        )}

        {event.type === "verdict_issued" && (
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">Decision: {String(payload.decision).toUpperCase()}</span>
              <span className="text-zinc-400">({Math.round(Number(payload.confidence) * 100)}% conf)</span>
              <span className="text-purple-400">Match: {String(payload.intentMatch)}</span>
            </div>
            {Array.isArray(payload.reasons) && (
              <p className="text-zinc-400 text-[10px] font-sans">
                {payload.reasons.join("; ")}
              </p>
            )}
          </div>
        )}

        {event.type === "watcher_called" && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="text-cyan-400">Latency: {String(payload.latencyMs)} ms</span>
            <span>Tokens: {String(payload.tokensIn)} in / {String(payload.tokensOut)} out</span>
            <span className="text-purple-400">Cost: ${Number(payload.costUsd).toFixed(5)}</span>
          </div>
        )}

        {event.type === "hard_limit_checked" && (
          <div className="font-mono text-[11px]">
            <span className="text-rose-300 font-semibold">Rule: {String(payload.rule || "H1-H2")}</span>
            <span className="ml-2 text-zinc-400">{String(payload.message || "")}</span>
          </div>
        )}

        {event.type === "restriction_applied" && (
          <div className="text-orange-300 font-mono text-[10px] font-semibold">
            {JSON.stringify(payload.restriction)} (v{String(payload.version)})
          </div>
        )}

        {event.type === "action_executed" && (
          <div className="text-emerald-400 font-mono text-[11px] font-medium">
            Tool executed successfully {payload.warning ? "(with warning)" : ""}.
          </div>
        )}

        {event.type === "action_held" && (
          <div className="text-amber-400 font-mono text-[11px] font-medium">
            {String(payload.message || payload.reason || "Action held for human authorization.")}
          </div>
        )}

        {event.type === "action_blocked" && (
          <div className="text-rose-400 font-mono text-[11px] font-bold">
            {String(payload.message || payload.reason || "Action blocked.")}
          </div>
        )}

        {event.type === "run_frozen" && (
          <div className="text-rose-300 font-bold font-mono text-[11px]">
            Run frozen. Human unfreeze required.
          </div>
        )}

        {event.type === "human_action" && (
          <div className="text-zinc-200 font-mono text-[11px]">
            Action: {String(payload.action)} {payload.newVersion ? `(v${String(payload.newVersion)})` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-zinc-500 font-mono text-xs">
          Loading comparison dashboard...
        </div>
      }
    >
      <CompareDashboard />
    </Suspense>
  );
}
