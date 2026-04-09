# Deployment Plan

This is the shortest path from the current branch to a live, testable build. Everything in the app has demo fallbacks, so you can deploy with zero secrets and still have a working product to click through.

## 0. What's in this build

- **Canvas** (8 sections, 3 stages) with Socratic Discovery chat
- **Monday Meetings** (agenda capture + AI synthesis into decisions/next steps/VC summary)
- **Adversarial Drills** (4 hostile personas: skeptical customer, competitor killer, pre-mortem, why-hasn't-this-been-done)
- **Founder/VC comments** on any canvas section, with a global "view as" toggle in the sidebar
- Original Brand Studio / Positioning Canvas / GTM Sprinter still present

## 1. Supabase

You need a Supabase project only if you want persistence across devices. Without it, the app stores everything in `localStorage` and all AI features return realistic demo responses.

### Create project
1. https://supabase.com/dashboard → **New project**
2. Copy the **Project URL** and **anon public key** from *Project Settings → API*

### Run migrations
From `supabase/migrations/` in order:
- `005_studio_outputs.sql`
- `006_canvas_sections.sql`
- `007_meetings_and_comments.sql`

Easiest: paste each file into *SQL Editor → New query → Run*. Or use the CLI:
```bash
supabase link --project-ref <ref>
supabase db push
```

### Deploy edge functions
All five are in `supabase/functions/`:
- `brand-studio`
- `positioning-canvas`
- `gtm-sprinter`
- `socratic-discovery`
- `monday-meeting`
- `adversarial-simulator`

```bash
supabase functions deploy brand-studio
supabase functions deploy positioning-canvas
supabase functions deploy gtm-sprinter
supabase functions deploy socratic-discovery
supabase functions deploy monday-meeting
supabase functions deploy adversarial-simulator
```

### Set the Anthropic key (optional)
Without this, every function returns its `DEMO_*` fallback — good for UI testing, not for real work.
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## 2. Vercel

### Import repo
1. https://vercel.com/new → import `charliebass1/teton-studio`
2. Root Directory: `frontend`
3. Framework preset should auto-detect as Vite

### Environment variables
Add under *Project Settings → Environment Variables* (both Preview and Production):
- `VITE_SUPABASE_URL` — your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key

If you skip these the build still works; the app runs fully on localStorage in demo mode.

### Deploy
`vercel.json` at the repo root already sets `outputDirectory`, `buildCommand`, and the SPA rewrite rule. Push to the branch and Vercel will build.

## 3. Smoke test after deploy

In order, with an empty Supabase:

1. **Dashboard loads** — you should see two demo deals seeded from localStorage.
2. **Open a deal → Canvas tab** — 8 sections across 3 stages should render. Click *Start Discovery* on any section: the chat should open and respond (Claude if key set, scripted replies otherwise).
3. **Edit a section inline** — type, Save. Badge should flip to "In progress".
4. **Mark complete** — the "X / 8 sections complete" counter top-right should update.
5. **Comments** — toggle Founder/VC in the sidebar, post a comment on a section as each role, verify role badges.
6. **Meetings tab → New Session** — fill in the four prompts, click *Synthesize Session*. You should get decisions / next steps / VC summary.
7. **Adversarial tab** — pick any of the 4 drills, the opener message should appear, send a reply, the persona should push back.
8. **Brand / Positioning / GTM tabs** — submit the existing forms, verify output cards render.

If any tab errors, check the browser console — the most common cause is a missing Supabase env var combined with a Supabase URL that's *set but wrong* (empty is fine, wrong is not).

## 4. Known caveats

- RLS policies are wide-open (`for all using (true)`). Before multi-tenant use, scope them to `auth.uid()`.
- `view_as` toggle is client-side only; it determines `author_role` on new comments but doesn't hide anything from the VC.
- Meetings don't currently prompt for attendees — the synthesis treats whatever you typed as the full record.
- Previous-week commitments are pulled by list order, not date. If you create sessions out of order the chain will feel off.
