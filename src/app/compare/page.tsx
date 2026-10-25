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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
    setSelectedEvent(null);

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
    setRuleMessage("Synthesizing rule with Nemotron Super 120B...");
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
        setRuleMessage("Rule activated! Applied to permission state via ratchet.");
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
  const protectedHeldCount = protectedEvents.filter((e) => e.type === "action_held").length;

  // Latest Watcher Verdict for protected
  const latestVerdictEvent = [...protectedEvents].reverse().find((e) => e.type === "verdict_issued");
  const latestWatcherCall = [...protectedEvents].reverse().find((e) => e.type === "watcher_called");
  const latestVerdict = latestVerdictEvent ? (latestVerdictEvent.payload as any) : null;
  const latestCall = latestWatcherCall ? (latestWatcherCall.payload as any) : null;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header Command Deck */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-950/40 glow-border-top shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                Warden Live Compare
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crimson-950/90 text-crimson-400 border border-crimson-800/60 font-mono font-semibold uppercase">
                Lockstep Simulation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Parallel execution comparing an unmonitored baseline agent against Warden's tiered Nemotron oversight layer and one-way ratchet.
            </p>
          </div>

          {/* Interactive Controls & Scenario Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Scenario Selector Pills */}
            <div className="flex rounded-xl bg-obsidian-900 border border-zinc-800/80 p-1">
              {(["S1", "S2", "S3"] as ScenarioId[]).map((sId) => (
                <button
                  key={sId}
                  disabled={isRunning}
                  onClick={() => setScenarioId(sId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                    scenarioId === sId
                      ? "bg-crimson-600 text-white shadow-crimson-glow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {sId}: {sId === "S1" ? "Clean" : sId === "S2" ? "Attack" : "Gated"}
                </button>
              ))}
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunBoth}
              disabled={isRunning}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 border ${
                isRunning
                  ? "bg-zinc-800/80 text-zinc-500 border-zinc-700/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white shadow-crimson-glow-lg border-crimson-400/40"
              }`}
            >
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              )}
              <span>{isRunning ? "Running Simulation..." : "Run Side-by-Side"}</span>
            </button>

            {isRunning && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

        {/* Task Box & Threat Callout */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-1">
            <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
              Declared Agent Objective:
            </span>
            <div className="font-mono text-zinc-300 bg-obsidian-950 px-3 py-2 rounded-xl border border-zinc-800/80">
              {currentScenario.declaredTask}
            </div>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-crimson-400 uppercase tracking-wider text-[10px]">
              Security Invariant:
            </span>
            <div className="text-zinc-300 bg-crimson-950/30 px-3 py-2 rounded-xl border border-crimson-900/40 text-[11px] leading-tight">
              {scenarioId === "S2"
                ? "Hard Limit H4 + Nemotron Watcher cascades to freeze exfiltration of payroll."
                : scenarioId === "S3"
                ? "Hard Limit H3 intercepts unlisted outbound email domain."
                : "Zero false-positive tightening on authorized invoice reconciliation."}
            </div>
          </div>
        </div>
      </div>

      {/* Top Live Telemetry HUD Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Exfiltration Status */}
        <div className="glass-panel rounded-xl p-4 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Data Exfiltration Check
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-lg font-bold text-white font-mono">
              {baselineSentEmails > 0 ? (
                <span className="text-crimson-400 animate-pulse">BREACH IN BASELINE</span>
              ) : (
                <span className="text-zinc-400">No Leaks Yet</span>
              )}
            </div>
            <div className="text-xs font-mono">
              Warden: <span className="text-emerald-400 font-bold">0 Leaks</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ratchet Permission Envelope */}
        <div className="glass-panel rounded-xl p-4 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            One-Way Ratchet Envelope
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-lg font-bold text-white font-mono">
              v{protectedState?.version || 1}
            </div>
            <div className="text-xs font-mono text-amber-400">
              {protectedTightenings} Tighten{protectedTightenings === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Card 3: Watcher Tier Cascade */}
        <div className="glass-panel rounded-xl p-4 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Active Nemotron Tier
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono">
              {latestCall?.tier ? (
                <span
                  className={
                    latestCall.tier === "ultra"
                      ? "text-crimson-400"
                      : latestCall.tier === "super"
                      ? "text-purple-400"
                      : "text-cyan-400"
                  }
                >
                  {String(latestCall.tier).toUpperCase()} 
                  {latestCall.tier === "nano" ? " (30B)" : latestCall.tier === "super" ? " (120B)" : " (550B)"}
                </span>
              ) : (
                <span className="text-zinc-500">Standby</span>
              )}
            </div>
            {latestCall?.latencyMs && (
              <span className="text-xs text-zinc-400 font-mono">{latestCall.latencyMs}ms</span>
            )}
          </div>
        </div>

        {/* Card 4: Cryptographic Chain */}
        <div className="glass-panel rounded-xl p-4 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Audit Chain Proof
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>SHA-256 Valid</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {protectedEvents.length} Blocks
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: BASELINE RUN (CONTROL GROUP)                  */}
        {/* ========================================================= */}
        <div className="bg-obsidian-900/90 border border-red-950/40 rounded-2xl p-5 space-y-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-sans">
                  Baseline Agent (Unmonitored)
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  Vulnerable
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full overbroad permissions, static rules only, no Watcher oversight.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian-950 text-zinc-400 border border-zinc-800">
                Step: {baselineRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase font-mono ${
                  baselineRun?.status === "completed"
                    ? "bg-zinc-800 text-zinc-300"
                    : baselineRun?.status === "running"
                    ? "bg-blue-950/60 text-blue-400 border border-blue-800/40 animate-pulse"
                    : "bg-zinc-800/80 text-zinc-400"
                }`}
              >
                {baselineRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Breach Hazard Warning Banner (Active when data leaked) */}
          {baselineSentEmails > 0 && (
            <div className="p-3.5 rounded-xl bg-crimson-950/80 border border-crimson-600/70 shadow-crimson-glow space-y-1">
              <div className="flex items-center space-x-2 text-crimson-400 font-bold text-xs uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-crimson-500 animate-ping"></span>
                <span>Critical Security Breach — Data Leaked</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                The agent fell for the indirect prompt injection in <code className="text-crimson-300 font-mono">INV-1007</code>, read <code className="text-crimson-300 font-mono">/hr/payroll/</code>, and dispatched confidential salaries to an external attacker via email.
              </p>
            </div>
          )}

          {/* Baseline Permissions Matrix (Static, Overbroad) */}
          <div className="bg-obsidian-950/80 rounded-xl p-4 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Static Permission Grants (Never Shrinks)
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">v1 (Unrestricted)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_OVERBROAD_GRANTS.map((g, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {g.tool} {g.scope}
                </span>
              ))}
            </div>
          </div>

          {/* Baseline Outbox Card */}
          <div className="bg-obsidian-950/80 rounded-xl p-4 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Outbound Mail Dispatched ({baselineOutbox.length})
              </span>
              {baselineOutbox.length > 0 && (
                <span className="text-crimson-400 font-bold text-[11px] font-mono animate-pulse">
                  EXFILTRATION SUCCESSFUL
                </span>
              )}
            </div>
            {baselineOutbox.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">No external emails sent yet.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {baselineOutbox.map((mail, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-crimson-950/40 border border-crimson-800/50 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-mono text-crimson-300 text-[11px]">
                      <span>To: {mail.to}</span>
                      <span>Subj: {mail.subject}</span>
                    </div>
                    <pre className="text-zinc-300 text-[11px] overflow-x-auto whitespace-pre-wrap max-h-24 bg-obsidian-950 p-2 rounded border border-zinc-800/80 font-mono">
                      {mail.body}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Baseline Timeline */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Execution Timeline ({baselineEvents.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {baselineEvents.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Click "Run Side-by-Side" to launch baseline agent.
                </div>
              ) : (
                baselineEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isHighlighted={highlightedEventId === ev.id}
                    onClick={() => {
                      setHighlightedEventId(ev.id);
                      setSelectedEvent(ev);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PROTECTED RUN (WARDEN OVERSIGHT LAYER)       */}
        {/* ========================================================= */}
        <div className="glass-panel-crimson rounded-2xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-crimson-900/30 pb-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white font-sans flex items-center space-x-2">
                  <span>Warden Supervised Agent</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-emerald-glow"></span>
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-crimson-950 text-crimson-300 border border-crimson-700/50 font-semibold">
                  Protected
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Deterministic limits + Tiered Nemotron + One-way ratchet.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian-950 text-zinc-400 border border-zinc-800">
                Step: {protectedRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase font-mono ${
                  protectedState?.frozen
                    ? "bg-crimson-950 text-crimson-400 border border-crimson-600 animate-pulse shadow-crimson-glow"
                    : protectedRun?.status === "paused_held"
                    ? "bg-amber-950/80 text-amber-400 border border-amber-600/50"
                    : protectedRun?.status === "completed"
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/50"
                    : "bg-blue-950/60 text-blue-400 border border-blue-800/40 animate-pulse"
                }`}
              >
                {protectedState?.frozen ? "FROZEN" : protectedRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Frozen / Security Hold Callout */}
          {protectedState?.frozen && (
            <div className="p-3.5 rounded-xl bg-crimson-950/90 border border-crimson-600/80 shadow-crimson-glow flex items-start space-x-3 text-xs text-crimson-200">
              <svg className="w-5 h-5 text-crimson-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong className="text-white block mb-0.5 font-sans">Run Frozen — Fail-Closed Safety Lever Engaged</strong>
                Malicious prompt injection or critical boundary breach halted immediately. Outbox transmission aborted. An authenticated human approver must review the incident briefing below.
              </div>
            </div>
          )}

          {/* Dynamic One-Way Ratchet Permissions Matrix */}
          <div className="bg-obsidian-950/90 rounded-xl p-4 border border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                One-Way Ratchet Capability Envelope
              </span>
              <div className="flex items-center space-x-3 font-mono text-[11px]">
                <span className="text-crimson-400 font-bold">
                  v{protectedState?.version || 1}
                </span>
                <span className="text-zinc-500">
                  ({protectedTightenings} Tighten Intervention{protectedTightenings === 1 ? "" : "s"})
                </span>
              </div>
            </div>

            {/* Grants Matrix with Visual Struck-through Revocations */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_OVERBROAD_GRANTS.map((initialGrant, idx) => {
                const isCurrentlyActive = protectedState?.grants.some(
                  (g) => g.tool === initialGrant.tool && g.scope === initialGrant.scope
                );

                if (isCurrentlyActive) {
                  return (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800"
                    >
                      {initialGrant.tool} {initialGrant.scope}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-crimson-950/80 text-crimson-400 border border-crimson-800/70 line-through decoration-crimson-500 decoration-2 font-bold"
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
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-2 text-[10px] font-mono">
                {protectedState?.disabledTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-crimson-950 text-crimson-300 border border-crimson-800 font-bold">
                    TOOL DISABLED: {t}
                  </span>
                ))}
                {protectedState?.approvalRequiredTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    APPROVAL REQUIRED: {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Protected Outbound Mail Card (Guaranteed Zero Leaks) */}
          <div className="bg-obsidian-950/90 rounded-xl p-4 border border-zinc-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Outbound Exfiltration Gate
              </span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>0 Unauthorized Emails Dispatched</span>
              </span>
            </div>
            {protectedOutbox.length === 0 ? (
              <p className="text-xs text-emerald-400/80 italic py-1">
                Zero data exfiltration. All unauthorized outbound messages blocked.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {protectedOutbox.map((mail, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                    <div className="font-mono text-zinc-300">To: {mail.to}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nemotron Ultra Incident Briefing Card */}
          {(briefing || loadingBriefing) && (
            <div className="glass-panel-crimson rounded-xl p-5 border border-crimson-600/70 space-y-3.5 shadow-crimson-glow">
              <div className="flex items-center justify-between text-xs border-b border-crimson-900/40 pb-2.5">
                <span className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse"></span>
                  <span className="font-sans">Executive Incident Briefing (Nemotron Ultra)</span>
                </span>
                <span className="text-crimson-400 font-mono text-[10px]">
                  &le; 120 words • Cites Real Audit Trail
                </span>
              </div>

              {loadingBriefing ? (
                <div className="py-6 text-center text-xs text-crimson-300/80 animate-pulse font-mono">
                  Nemotron Ultra synthesizing incident briefing from SHA-256 audit chain...
                </div>
              ) : (
                briefing && (
                  <div className="text-xs space-y-2.5 text-zinc-300">
                    <p>
                      <strong className="text-white font-sans">Incident:</strong> {briefing.whatHappened}
                    </p>
                    <p>
                      <strong className="text-white font-sans">Why Flagged:</strong> {briefing.whyFlagged}
                    </p>
                    <p>
                      <strong className="text-white font-sans">Action Taken:</strong> {briefing.whatWasRestricted}
                    </p>
                    <div className="pt-1">
                      <strong className="text-white font-sans">Approver Options:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-zinc-300">
                        {briefing.humanOptions.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                    {briefing.cites.length > 0 && (
                      <div className="pt-2 border-t border-crimson-900/30 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Citations:</span>
                        {briefing.cites.map((citeId) => (
                          <button
                            key={citeId}
                            onClick={() => setHighlightedEventId(citeId)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-crimson-950 hover:bg-crimson-900 text-crimson-300 border border-crimson-800 transition-colors"
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

          {/* Human Approver Command Terminal */}
          <div className="bg-obsidian-950/95 rounded-xl p-4 border border-zinc-800/90 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                Human Approver Command Terminal
              </span>
              <span className={`text-[11px] font-mono font-semibold ${isApprover ? "text-emerald-400" : "text-zinc-500"}`}>
                {isApprover ? "HMAC Session: ACTIVE" : "Auth Required"}
              </span>
            </div>

            {!isApprover ? (
              <form onSubmit={handleApproverLogin} className="flex gap-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Approver Passcode"
                  className="bg-obsidian-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 flex-1 focus:ring-1 focus:ring-crimson-500 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-bold rounded-lg border border-crimson-500/40 transition-colors shadow-crimson-glow"
                >
                  Unlock Session
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleHumanAction({ action: "approve_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-md"
                  >
                    Approve Once
                  </button>
                  <button
                    onClick={() => handleHumanAction({ action: "deny_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3.5 py-1.5 rounded-lg bg-crimson-700 hover:bg-crimson-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                  >
                    Deny Held Action
                  </button>
                  <button
                    onClick={() =>
                      handleHumanAction({
                        action: "restore_scope",
                        grant: { tool: "read_file", scope: "/hr/" },
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                  >
                    Restore /hr/ Scope
                  </button>
                  {protectedState?.frozen && (
                    <button
                      onClick={() => handleHumanAction({ action: "unfreeze" })}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                    >
                      Unfreeze Run
                    </button>
                  )}
                </div>

                {/* Natural Language Rule Drafter with Nemotron Super */}
                <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Draft Policy Rule (Nemotron Super 120B)
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ruleText}
                      onChange={(e) => setRuleText(e.target.value)}
                      placeholder='e.g., "require approval for send_email"'
                      className="bg-obsidian-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-1.5 flex-1 focus:ring-1 focus:ring-crimson-500 outline-none font-mono"
                    />
                    <button
                      onClick={handleDraftRule}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700"
                    >
                      Draft Rule
                    </button>
                  </div>
                  {ruleMessage && <p className="text-[11px] text-crimson-400 font-mono">{ruleMessage}</p>}
                  {draftedRule && (
                    <div className="p-3 rounded-lg bg-obsidian-900 border border-zinc-700 flex items-center justify-between text-xs">
                      <span className="font-mono text-zinc-200">
                        {JSON.stringify(draftedRule.restriction)}
                      </span>
                      <button
                        onClick={handleActivateRule}
                        className="px-3 py-1 rounded bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-crimson-glow"
                      >
                        Activate via Ratchet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {loginError && <p className="text-xs text-crimson-400">{loginError}</p>}
          </div>

          {/* Protected Timeline */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Cryptographic Audit Timeline ({protectedEvents.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {protectedEvents.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Click "Run Side-by-Side" to observe protected execution.
                </div>
              ) : (
                protectedEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isHighlighted={highlightedEventId === ev.id}
                    onClick={() => {
                      setHighlightedEventId(ev.id);
                      setSelectedEvent(ev);
                    }}
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
        return "bg-emerald-950/80 text-emerald-400 border-emerald-700/60";
      case "action_blocked":
        return "bg-crimson-950 text-crimson-400 border-crimson-700/80 shadow-crimson-glow";
      case "action_held":
        return "bg-amber-950 text-amber-400 border-amber-700/80";
      case "run_frozen":
        return "bg-crimson-950 text-crimson-300 border-crimson-500 font-bold shadow-crimson-glow";
      case "verdict_issued":
        return "bg-blue-950/80 text-blue-400 border-blue-700/60";
      case "watcher_called":
        return "bg-purple-950/80 text-purple-400 border-purple-700/60";
      case "restriction_applied":
        return "bg-orange-950/80 text-orange-400 border-orange-700/60";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  return (
    <div
      onClick={onClick}
      id={`event-${event.id}`}
      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
        isHighlighted
          ? "border-crimson-500 bg-crimson-950/40 ring-1 ring-crimson-500 shadow-crimson-glow"
          : "bg-obsidian-950/80 border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-zinc-500 text-[10px]">#{event.seq}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border font-mono ${getBadgeStyle()}`}>
            {event.type}
          </span>
          {Boolean(payload.tier) && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
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
          <div className="space-y-0.5">
            <span className="font-mono text-crimson-400 font-semibold">{String(payload.tool)}</span>
            <span className="text-zinc-400 ml-1.5 font-mono">
              {JSON.stringify(payload.args || {})}
            </span>
            {Boolean(payload.rationale) && (
              <p className="text-[10px] text-zinc-500 italic mt-0.5">
                "{String(payload.rationale)}"
              </p>
            )}
          </div>
        )}

        {event.type === "verdict_issued" && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 font-mono">
              <span className="font-bold text-white">Decision: {String(payload.decision).toUpperCase()}</span>
              <span className="text-zinc-400">({Math.round(Number(payload.confidence) * 100)}% conf)</span>
              <span className="text-purple-400">Match: {String(payload.intentMatch)}</span>
            </div>
            {Array.isArray(payload.reasons) && (
              <p className="text-zinc-400 text-[10px]">
                {payload.reasons.join("; ")}
              </p>
            )}
          </div>
        )}

        {event.type === "watcher_called" && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Latency: {String(payload.latencyMs)}ms</span>
            <span>Tokens: in {String(payload.tokensIn)} / out {String(payload.tokensOut)}</span>
            <span>Cost: ${Number(payload.costUsd).toFixed(5)}</span>
          </div>
        )}

        {event.type === "hard_limit_checked" && (
          <div>
            <span className="font-mono text-zinc-200">Rule: {String(payload.rule || "H1-H2")}</span>
            <span className="ml-2 text-zinc-400">{String(payload.message || "")}</span>
          </div>
        )}

        {event.type === "restriction_applied" && (
          <div className="text-amber-300 font-mono text-[10px]">
            {JSON.stringify(payload.restriction)} (State Version: {String(payload.version)})
          </div>
        )}

        {event.type === "action_executed" && (
          <div className="text-emerald-400 font-mono">
            Tool executed successfully {payload.warning ? "(with warning)" : ""}.
          </div>
        )}

        {event.type === "action_held" && (
          <div className="text-amber-300 font-mono">
            {String(payload.message || payload.reason || "Action held for human authorization.")}
          </div>
        )}

        {event.type === "action_blocked" && (
          <div className="text-crimson-400 font-mono">
            {String(payload.message || payload.reason || "Action blocked.")}
          </div>
        )}

        {event.type === "run_frozen" && (
          <div className="text-crimson-300 font-bold font-mono">
            Run frozen. Human unfreeze required.
          </div>
        )}

        {event.type === "human_action" && (
          <div className="text-indigo-300 font-semibold font-mono">
            Action: {String(payload.action)} {payload.newVersion ? `(Version -> ${String(payload.newVersion)})` : ""}
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
        <div className="flex-1 flex items-center justify-center p-12 text-zinc-400">
          Loading comparison dashboard...
        </div>
      }
    >
      <CompareDashboard />
    </Suspense>
  );
}
