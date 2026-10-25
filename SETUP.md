# SETUP.md — Accounts, Keys and First Deploy (Warden, solo)

> Do these in order on Oct 25 (tasks T1 and T3 in BUILD_solo-tasks.md). Everything here is free except Token Factory usage, which is paid from the hackathon credits. Time needed: about 2 hours.

---

## Part 0: Devpost and Discord (5 minutes)

1. Log in at devpost.com and open nebiusglobalaihackathon.devpost.com.
2. If the page still shows **Join hackathon**, click it. You cannot submit without joining. Solo entries are allowed.
3. Join the Nebius Discord (link on the hackathon page). Token Factory account and billing problems are answered there.

## Part 1: Nebius Token Factory (30 minutes) — do this FIRST

1. Create an account at tokenfactory.nebius.com.
2. Claim the hackathon credits: open the **Resources** tab of the hackathon page, fill the credits form, and enter activation code `NEBIUS-DEVPOST-GLOBAL26` ($25).
3. Join the **Nebius Builders Program** (link on the same Resources tab) for the second $25. It is free.
4. In the Token Factory dashboard, confirm the credits show as a balance.
   - If your country is missing from the billing screen, or the account asks for a card or a $25 first payment you did not expect: **stop** and ask in the Nebius Discord the same day. Do not switch to another model provider; the rules require Token Factory.
5. Create an **API key** in the dashboard's API keys section. Copy it once and store it in a password manager. This is `NEBIUS_API_KEY`. Never paste it into the repo, screenshots, or any committed file.
6. Open the models list and note the exact IDs and prices of the three Nemotron models (Nano 30B, Super 120B, Ultra 550B). Fill `TF_MODEL_NANO`, `TF_MODEL_SUPER`, `TF_MODEL_ULTRA`, `TF_MODEL_AGENT` (same as Super) and the six `PRICE_*` values. If an ID differs from BUILD.md section 5, use the console's ID and update that table.
7. Run the spike (task T2). A model reply from each tier means Part 1 is done.

## Part 2: GitHub, Neon, Vercel (45 minutes)

**GitHub**
1. Create a new **public** repo named `warden`. Choose the **MIT** license in the creation form. Add a `.gitignore` for Node that also ignores `.env`, `.env.local` and `.env*.local`.

**Neon (database)**
1. Create a free account at neon.com (no card). Create one project named `warden`.
2. Pick the region that matches your Vercel functions region (check Vercel project settings, Functions region, after the Vercel steps; US East is the usual default). If they differ, change Neon's region now, before any data exists.
3. From the connection details copy two strings:
   - the **pooled** connection string (host contains `-pooler`) → `DATABASE_URL`
   - the **direct** (non-pooled) string → `DIRECT_URL`

**Vercel**
1. Create a free account at vercel.com (Hobby plan; personal, non-commercial use).
2. Import the GitHub repo `warden` as a new project (framework: Next.js).
3. Do not deploy an empty repo; first complete Part 3 locally, then deploy.
4. In the Vercel project settings open **Environment Variables** and add every variable in the table below for **Production** and **Preview**.

## Part 3: Local project and env vars

1. Install Node.js 20. Scaffold per task T3 in BUILD_solo-tasks.md (Next.js 14, TypeScript, Tailwind, Prisma, zod, openai, vitest, tsx; no other packages).
2. `package.json` must define these scripts (the tasks refer to them by name): `dev`, `build`, `start`, `test` (vitest), `seed` (runs `prisma/seed.ts` with tsx), `evals` (runs `evals/run-evals.ts` with tsx), `db:push` (prisma db push).
3. Copy `.env.example` to `.env.local` and fill it:

| Variable | Where the value comes from |
|---|---|
| `NEBIUS_API_KEY` | Part 1, step 5 |
| `TF_BASE_URL` | `https://api.tokenfactory.nebius.com/v1/` |
| `TF_MODEL_NANO`, `TF_MODEL_SUPER`, `TF_MODEL_ULTRA`, `TF_MODEL_AGENT` | Part 1, step 6 |
| `PRICE_NANO_IN`, `PRICE_NANO_OUT`, `PRICE_SUPER_IN`, `PRICE_SUPER_OUT`, `PRICE_ULTRA_IN`, `PRICE_ULTRA_OUT` | Part 1, step 6 (USD per 1M tokens) |
| `SPEND_CAP_USD` | `35` |
| `RUNS_PER_IP_PER_HOUR` | `6` |
| `DATABASE_URL`, `DIRECT_URL` | Part 2, Neon step 3 |
| `APPROVER_PASSCODE` | A short passphrase. It goes in the Devpost testing instructions, so do not reuse a real password. |
| `SESSION_SECRET` | A random 64-character hex string (`openssl rand -hex 32`, or any password generator) |
| `DEMO_AGENT_KEY` | Another random string, different from `SESSION_SECRET` (only needed for the P2 external endpoint) |
| `NEXT_PUBLIC_APP_NAME` | `Warden` |

4. Security rule: only `NEXT_PUBLIC_APP_NAME` may start with `NEXT_PUBLIC_`. Every other variable is server-only; never reference them in client components.
5. After task T4, push the schema once with `npm run db:push`; after task T8, run `npm run seed`.
6. Start locally: `npm run dev` and open http://localhost:3000.
7. Add the same variables in Vercel (Part 2, Vercel step 4) and deploy. Open the live URL and confirm the placeholder page loads.

## Part 4: Verify before building (15 minutes)

- [ ] Devpost joined; Discord joined
- [ ] Token Factory balance shows $25 (and $50 if the Builders Program credits arrived)
- [ ] Spike result file shows a real reply from Nano, Super and Ultra
- [ ] Public GitHub repo with MIT license visible in About
- [ ] Neon project exists; schema pushed after T4
- [ ] Vercel deployment live at a public URL with all env vars set for Production and Preview
- [ ] `npm install`, `npm run build` and `npm run dev` work locally
- [ ] `.env.local` is in `.gitignore`; search the repo history to confirm no key was ever committed (if one was, revoke it in the Token Factory dashboard and create a new one)
- [ ] The API key lives only in a password manager, `.env.local` and Vercel
- [ ] `FEEDBACK.md` started with the first onboarding notes (how long account, credits and first call took)

## If something fails

| Problem | What to do |
|---|---|
| Credits form or billing rejects your country | Ask in the Nebius Discord immediately; do not use another provider |
| Key returns 401 | Re-copy the key without spaces; confirm the base URL ends with `/v1/` |
| Model ID not found | Use the exact ID shown in the Token Factory models list |
| Prisma cannot connect from Vercel | Use the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL`; confirm both are set in Vercel |
| First Neon query is slow | Normal after 5 idle minutes; compute resumes in under a second |
| Vercel build fails | Run `npm run build` locally first and fix errors before pushing |
