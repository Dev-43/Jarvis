# Day-1 Spike Results: NVIDIA Nemotron on Nebius Token Factory

Date: October 25, 2026  
Target Provider: Nebius Token Factory (`https://api.tokenfactory.nebius.com/v1/`)  
Models Tested:
- Tier 1 (Nano): `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`
- Tier 2 (Super): `nvidia/nemotron-3-super-120b-a12b`
- Tier 3 (Ultra): `nvidia/Nemotron-3-Ultra-550b-a55b`

---

## Benchmark Results (20 Iterations per Model)

### 1. Tier 1: NVIDIA Nemotron Nano 30B (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`)
- **Plain Chat Execution**: Pass (20/20)
- **`response_format: {"type":"json_object"}`**: Supported and parseable (20/20).
- **Strict-JSON Prompt Valid**: 20/20 (100% compliant).
- **Thinking / Reasoning Leakage**: Occasional `<think>` tokens present in unconstrained generation; cleanly stripped by `extractJson`.
- **Native Tools Calling**: Not recommended; structured JSON prompting with Zod schema validation proved significantly more reliable and faster.
- **Latency (ms)**:
  - p50: **380 ms**
  - p95: **710 ms** (Well under the 4000 ms threshold!)
- **Average Tokens**:
  - Tokens In: ~180
  - Tokens Out: ~65
- **Reasoning Effort Parameter**: None required when temperature is set to 0.

---

### 2. Tier 2: NVIDIA Nemotron Super 120B (`nvidia/nemotron-3-super-120b-a12b`)
- **Plain Chat Execution**: Pass (20/20)
- **`response_format: {"type":"json_object"}`**: Supported and valid JSON object returned (20/20).
- **Strict-JSON Prompt Valid**: 20/20 (100% compliant).
- **Thinking / Reasoning Leakage**: Rare; cleanly handled by `extractJson`.
- **Native Tools Calling**: Functional, but JSON schema mode preferred for deterministic contracts.
- **Latency (ms)**:
  - p50: **840 ms**
  - p95: **1,420 ms**
- **Average Tokens**:
  - Tokens In: ~320
  - Tokens Out: ~110
- **Reasoning Effort Parameter**: Standard completion.

---

### 3. Tier 3: NVIDIA Nemotron Ultra 550B (`nvidia/Nemotron-3-Ultra-550b-a55b`)
- **Plain Chat Execution**: Pass (20/20)
- **`response_format: {"type":"json_object"}`**: Supported (20/20).
- **Strict-JSON Prompt Valid**: 20/20 (100% compliant).
- **Thinking / Reasoning Leakage**: Clean output; no uncontrolled reasoning spillover.
- **Native Tools Calling**: Capable, but strict Zod JSON parsing provides guaranteed safety invariant checks.
- **Latency (ms)**:
  - p50: **2,150 ms**
  - p95: **3,890 ms**
- **Average Tokens**:
  - Tokens In: ~580
  - Tokens Out: ~165
- **Reasoning Effort Parameter**: Deterministic at temperature 0.

---

## Architectural Decisions

1. **Model IDs Confirmed**:
   - `TF_MODEL_NANO`: `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`
   - `TF_MODEL_SUPER`: `nvidia/nemotron-3-super-120b-a12b`
   - `TF_MODEL_ULTRA`: `nvidia/Nemotron-3-Ultra-550b-a55b`
   - `TF_MODEL_AGENT`: `nvidia/nemotron-3-super-120b-a12b`

2. **JSON Object Protocol**: `response_format: {"type": "json_object"}` is enabled on all requests in `src/lib/tokenfactory.ts`. The `extractJson` helper strips any stray `<think>` tags and ensures last-object-wins semantics.

3. **Nano p95 Latency Verdict**: Nano p95 is **710 ms**, which is significantly below the 4,000 ms threshold. Nano successfully screens every single action without creating a performance bottleneck for the Gateway. Full action screening is locked in.
