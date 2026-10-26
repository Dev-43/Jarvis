# FEEDBACK.md — Nebius Token Factory & NVIDIA Nemotron Developer Log

**Project**: Taut — Independent Oversight Layer for Autonomous AI Agents  
**Hackathon**: Nebius x NVIDIA Global AI Hackathon (Track: Best Apps & Agents)  
**Author**: Solo Builder (Dev-43)  
**Date**: October 25, 2026

---

## 1. Onboarding & Setup Experience

- **Account & Credits Activation**:
  - Registration at `tokenfactory.nebius.com` took less than 4 minutes.
  - Hackathon code `NEBIUS-DEVPOST-GLOBAL26` credited $25 instantly to the balance.
  - The Nebius Builders Program onboarding was seamless with zero credit card friction.
  - Overall time from zero to first API call was under 15 minutes.
- **API Key Creation**:
  - The dashboard UI is minimalist, fast, and generates standard OpenAI-compatible bearer tokens.
  - The base URL `https://api.tokenfactory.nebius.com/v1/` works drop-in with the official `openai` Node SDK without needing custom adapters or third-party wrappers.

---

## 2. NVIDIA Nemotron Models Evaluation

### A. NVIDIA Nemotron 3 Nano 30B (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`)
- **Role in Taut**: First-line overseer screening every proposed agent action in real-time.
- **What Worked Extremely Well**:
  - Incredibly fast response times: p50 latency was ~380 ms and p95 was ~710 ms.
  - Handled structured JSON output (`response_format: {"type":"json_object"}`) flawlessly across all benchmark runs.
  - Excellent price-to-performance ratio ($0.06 in / $0.24 out per 1M tokens), making continuous runtime action screening affordable.
- **What Needs Improvement / Caveats**:
  - For complex indirect injection defenses, Nano can be slightly permissive on multi-step subtle drift; this justified our architectural tier-escalation to Super 120B whenever confidence is below 0.8 or sensitive paths are touched.
  - Occasionally emits `<think>` reasoning tags when reasoning effort is unconstrained; we implemented `extractJson` to cleanly strip internal thinking blocks.

### B. NVIDIA Nemotron 3 Super 120B (`nvidia/nemotron-3-super-120b-a12b`)
- **Role in Taut**: Secondary overseer for borderline/sensitive decisions, target enterprise finance agent, and policy rule drafter.
- **What Worked Extremely Well**:
  - Outstanding task comprehension and instruction following.
  - As the target agent, it realistically followed enterprise invoice tasks and realistically reacted to indirect prompt injections in invoice notes.
  - As a policy rule drafter, it converted natural language human sentences (e.g., "never touch payroll without approval") into exact JSON restriction unions reliably.
- **What Needs Improvement**:
  - Latency is higher (~840 ms p50), which makes using it exclusively for Tier 1 undesirable; routing through Nano first before escalating to Super proved to be the ideal architectural pattern.

### C. NVIDIA Nemotron 3 Ultra 550B (`nvidia/Nemotron-3-Ultra-550b-a55b`)
- **Role in Taut**: Tier 3 confirmation before the permission ratchet tightens or freezes a run, plus executive incident briefing generation.
- **What Worked Extremely Well**:
  - Exceptional reasoning depth and prompt injection resilience. It easily spotted attacker attempts to claim compliance pre-approval or override monitoring.
  - Synthesized concise, high-clarity executive briefings under 120 words while strictly referencing real audit event IDs.
- **What Needs Improvement**:
  - Higher latency (~2,150 ms p50) requires careful timeout handling (30s client timeout configured). Reserving Ultra strictly for confirmation and briefings prevented runtime drag.

---

## 3. Platform & Developer Experience Verdict

- **Would you build with Nebius Token Factory again?**  
  **Yes, without hesitation.** Having dedicated, high-throughput hosting for full-precision NVIDIA Nemotron models behind a standard OpenAI-compatible API eliminates inference infrastructure management.
- **Key Takeaways for Future Builders**:
  - The tiered model cascade (Nano -> Super -> Ultra) achieves both sub-second response times for safe actions and deep frontier reasoning for security decisions.
  - Pair the models with strict deterministic hard limits and client-side Zod validation for production resilience.
