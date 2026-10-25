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
    setRuleMessage("Drafting rule with Nemotron Super...");
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

  // Compute summary stats
  const baselineSentEmails = baselineOutbox.length;
  const protectedSentEmails = protectedOutbox.length;
  const protectedTightenings =
    protectedState?.restrictionLog.filter((r) => r.by === "watcher").length || 0;
  const protectedHeldCount = protectedEvents.filter((e) => e.type === "action_held").length;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
              <span>Warden Live Compare</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Baseline vs. Protected
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              {currentScenario.description}
            </p>
          </div>

          {/* Scenario Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={scenarioId}
              disabled={isRunning}
              onChange={(e) => setScenarioId(e.target.value as ScenarioId)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="S1">S1: Clean Reconcile</option>
              <option value="S2">S2: Prompt Injection & Exfiltration</option>
              <option value="S3">S3: Benign Gated Domain</option>
            </select>

            <button
              onClick={handleRunBoth}
              disabled={isRunning}
              className={`px-5 py-2 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center space-x-2 ${
                isRunning
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
              }`}
            >
              <span>{isRunning ? "Running Lockstep..." : "Run Both Side-by-Side"}</span>
            </button>

            {isRunning && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

        {/* Task String Box */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-start space-x-3 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
            Declared Task:
          </span>
          <span className="font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1">
            {currentScenario.declaredTask}
          </span>
        </div>
      </div>

      {/* Summary Strip (Shown when both finish or have data) */}
      {(baselineRun || protectedRun) && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-slate-300">Run Comparison:</span>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Baseline Outbound Mail:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  baselineSentEmails > 0
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {baselineSentEmails} external email{baselineSentEmails === 1 ? "" : "s"}{" "}
                {baselineSentEmails > 0 && "(LEAKED!)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Protected Outbound:</span>
              <span className="font-bold px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {protectedSentEmails} sent, {protectedHeldCount} held, {protectedTightenings} tightened
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            {protectedState?.frozen ? (
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>PROTECTED RUN FROZEN — SAFETY LEVER TRIPPED</span>
              </span>
            ) : protectedRun?.status === "paused_held" ? (
              <span className="text-amber-400 font-bold">PAUSED HELD FOR APPROVAL</span>
            ) : (
              <span>Lockstep stepping active</span>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: BASELINE RUN (CONTROL GROUP)                  */}
        {/* ========================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Baseline Run</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Control Group
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Over-broad grants, H1/H2 only, no Watcher oversight.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                Step: {baselineRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                  baselineRun?.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : baselineRun?.status === "running"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {baselineRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Baseline Permissions Panel (Static, Never Changes) */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Static Permissions</span>
              <span>Version: 1 (Unrestricted)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_OVERBROAD_GRANTS.map((g, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {g.tool} {g.scope}
                </span>
              ))}
            </div>
          </div>

          {/* Baseline Outbound Mail Card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Outbound Mail ({baselineOutbox.length})
              </span>
              {baselineOutbox.length > 0 && (
                <span className="text-rose-400 font-bold text-xs animate-pulse">
                  Data Exfiltration Succeeded!
                </span>
              )}
            </div>
            {baselineOutbox.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No external emails sent yet.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {baselineOutbox.map((mail, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-mono text-rose-300">
                      <span>To: {mail.to}</span>
                      <span>Subj: {mail.subject}</span>
                    </div>
                    <pre className="text-slate-400 text-xs overflow-x-auto whitespace-pre-wrap max-h-24 bg-slate-900 p-2 rounded">
                      {mail.body}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Baseline Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Execution Timeline ({baselineEvents.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {baselineEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Click "Run Both" to start baseline execution.
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
        <div className="bg-slate-900 border-2 border-blue-500/40 rounded-2xl p-5 space-y-5 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Protected Run (Warden)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                  Active Ratchet
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic limits + Tiered Watcher + One-way Ratchet.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                Step: {protectedRun?.stepCount || 0}/25
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                  protectedState?.frozen
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                    : protectedRun?.status === "paused_held"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : protectedRun?.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {protectedState?.frozen ? "FROZEN" : protectedRun?.status || "Idle"}
              </span>
            </div>
          </div>

          {/* Frozen Alert Banner */}
          {protectedState?.frozen && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center space-x-3 text-rose-200 text-xs">
              <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Run Frozen:</strong> Security violation detected. All tool execution is strictly locked. An authenticated human approver must review and unfreeze.
              </span>
            </div>
          )}

          {/* Dynamic Permission Panel (One-Way Ratchet) */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Ratchet Permission Panel
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400 font-mono font-bold">
                  Version: {protectedState?.version || 1}
                </span>
                <span className="text-slate-400 text-xs">
                  (Tightened {protectedTightenings} time{protectedTightenings === 1 ? "" : "s"})
                </span>
              </div>
            </div>

            {/* Grants with Struck-Through Revoked scopes */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_OVERBROAD_GRANTS.map((initialGrant, idx) => {
                const isCurrentlyActive = protectedState?.grants.some(
                  (g) => g.tool === initialGrant.tool && g.scope === initialGrant.scope
                );

                if (isCurrentlyActive) {
                  return (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {initialGrant.tool} {initialGrant.scope}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-500/30 line-through decoration-rose-500 decoration-2"
                      title="Revoked by Watcher Ratchet"
                    >
                      {initialGrant.tool} {initialGrant.scope}
                    </span>
                  );
                }
              })}
            </div>

            {/* Badges for disabled or approval-required tools */}
            {((protectedState?.disabledTools && protectedState.disabledTools.length > 0) ||
              (protectedState?.approvalRequiredTools && protectedState.approvalRequiredTools.length > 0)) && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
                {protectedState?.disabledTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 border border-rose-700">
                    Disabled: {t}
                  </span>
                ))}
                {protectedState?.approvalRequiredTools.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700">
                    Approval Required: {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Protected Outbound Mail Card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Outbound Mail ({protectedOutbox.length})
              </span>
              <span className="text-emerald-400 font-medium text-xs">
                Exfiltration Prevented
              </span>
            </div>
            {protectedOutbox.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No unauthorized mail sent (Protected).</p>
            ) : (
              <div className="space-y-2 pt-1">
                {protectedOutbox.map((mail, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-mono text-slate-300">To: {mail.to}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interpreter Incident Briefing Card */}
          {(briefing || loadingBriefing) && (
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 rounded-xl p-4 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-indigo-500/20 pb-2">
                <span className="font-bold text-indigo-300 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Interpreter Briefing (Nemotron Ultra)</span>
                </span>
                <span className="text-indigo-400/80 font-mono text-[10px]">
                  &le; 120 words • Cites Audit Trail
                </span>
              </div>

              {loadingBriefing ? (
                <div className="py-4 text-center text-xs text-indigo-300/70 animate-pulse">
                  Nemotron Ultra synthesizing incident briefing from audit chain...
                </div>
              ) : (
                briefing && (
                  <div className="text-xs space-y-2 text-slate-300">
                    <p>
                      <strong className="text-white">Incident:</strong> {briefing.whatHappened}
                    </p>
                    <p>
                      <strong className="text-white">Why Flagged:</strong> {briefing.whyFlagged}
                    </p>
                    <p>
                      <strong className="text-white">Action Taken:</strong> {briefing.whatWasRestricted}
                    </p>
                    <div className="pt-1">
                      <strong className="text-white">Approver Options:</strong>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-300">
                        {briefing.humanOptions.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                    {briefing.cites.length > 0 && (
                      <div className="pt-2 border-t border-indigo-500/20 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-indigo-400 uppercase font-semibold">Citations:</span>
                        {briefing.cites.map((citeId) => (
                          <button
                            key={citeId}
                            onClick={() => setHighlightedEventId(citeId)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors"
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

          {/* Approver Controls Section */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Human Approver Terminal
              </span>
              <span className={`text-xs font-mono ${isApprover ? "text-emerald-400" : "text-slate-500"}`}>
                {isApprover ? "Authenticated (HMAC Session)" : "Authentication Required"}
              </span>
            </div>

            {!isApprover ? (
              <form onSubmit={handleApproverLogin} className="flex gap-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Approver Passcode"
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Log In
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleHumanAction({ action: "approve_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                  >
                    Approve Held Action
                  </button>
                  <button
                    onClick={() => handleHumanAction({ action: "deny_held" })}
                    disabled={protectedRun?.status !== "paused_held"}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
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
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    Restore /hr/ Scope
                  </button>
                  {protectedState?.frozen && (
                    <button
                      onClick={() => handleHumanAction({ action: "unfreeze" })}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
                    >
                      Unfreeze Run
                    </button>
                  )}
                </div>

                {/* P2 Rule Drafting Box */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Draft Policy Rule (Nemotron Super)
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ruleText}
                      onChange={(e) => setRuleText(e.target.value)}
                      placeholder='e.g., "require approval for send_email"'
                      className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 flex-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleDraftRule}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700"
                    >
                      Draft Rule
                    </button>
                  </div>
                  {ruleMessage && <p className="text-[11px] text-blue-400">{ruleMessage}</p>}
                  {draftedRule && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300">
                        {JSON.stringify(draftedRule.restriction)}
                      </span>
                      <button
                        onClick={handleActivateRule}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                      >
                        Activate via Ratchet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {loginError && <p className="text-xs text-rose-400">{loginError}</p>}
          </div>

          {/* Protected Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Protected Audit Timeline ({protectedEvents.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {protectedEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Click "Run Both" to observe protected execution.
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
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "action_blocked":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "action_held":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "run_frozen":
        return "bg-rose-600/30 text-rose-300 border-rose-500";
      case "verdict_issued":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "watcher_called":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "restriction_applied":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div
      onClick={onClick}
      id={`event-${event.id}`}
      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
        isHighlighted
          ? "border-blue-400 bg-blue-950/40 ring-1 ring-blue-400"
          : "bg-slate-950/80 border-slate-800/90 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-slate-500 text-[10px]">#{event.seq}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle()}`}>
            {event.type}
          </span>
          {Boolean(payload.tier) && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {String(payload.tier).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-slate-500 text-[10px] font-mono">
          {new Date(event.at).toLocaleTimeString()}
        </span>
      </div>

      {/* Payload summary */}
      <div className="text-slate-300 text-[11px] leading-relaxed">
        {event.type === "action_proposed" && (
          <div className="space-y-0.5">
            <span className="font-mono text-blue-300 font-semibold">{String(payload.tool)}</span>
            <span className="text-slate-400 ml-1.5">
              {JSON.stringify(payload.args || {})}
            </span>
            {Boolean(payload.rationale) && (
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                "{String(payload.rationale)}"
              </p>
            )}
          </div>
        )}

        {event.type === "verdict_issued" && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">Decision: {String(payload.decision).toUpperCase()}</span>
              <span className="text-slate-400">({Math.round(Number(payload.confidence) * 100)}% conf)</span>
              <span className="text-indigo-400">Match: {String(payload.intentMatch)}</span>
            </div>
            {Array.isArray(payload.reasons) && (
              <p className="text-slate-400 text-[10px]">
                {payload.reasons.join("; ")}
              </p>
            )}
          </div>
        )}

        {event.type === "watcher_called" && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Latency: {String(payload.latencyMs)}ms</span>
            <span>Tokens: in {String(payload.tokensIn)} / out {String(payload.tokensOut)}</span>
            <span>Cost: ${Number(payload.costUsd).toFixed(5)}</span>
          </div>
        )}

        {event.type === "hard_limit_checked" && (
          <div>
            <span>Rule: {String(payload.rule || "H1-H2")}</span>
            <span className="ml-2 text-slate-400">{String(payload.message || "")}</span>
          </div>
        )}

        {event.type === "restriction_applied" && (
          <div className="text-orange-300 font-mono">
            {JSON.stringify(payload.restriction)} (State Version: {String(payload.version)})
          </div>
        )}

        {event.type === "action_executed" && (
          <div className="text-emerald-400">
            Tool executed successfully {payload.warning ? "(with warning)" : ""}.
          </div>
        )}

        {event.type === "action_held" && (
          <div className="text-amber-300">
            {String(payload.message || payload.reason || "Action held for human authorization.")}
          </div>
        )}

        {event.type === "action_blocked" && (
          <div className="text-rose-400">
            {String(payload.message || payload.reason || "Action blocked.")}
          </div>
        )}

        {event.type === "run_frozen" && (
          <div className="text-rose-300 font-bold">
            Run frozen. Human unfreeze required.
          </div>
        )}

        {event.type === "human_action" && (
          <div className="text-indigo-300 font-semibold">
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
        <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
          Loading comparison dashboard...
        </div>
      }
    >
      <CompareDashboard />
    </Suspense>
  );
}
