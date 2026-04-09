# Teton Studio

Venture Launchpad toolkit — pre-investment and portfolio design tools for VC firms.

## Local Development

```bash
cd frontend
cp .env.example .env    # fill in your Supabase credentials
npm install
npm run dev             # → http://localhost:5173
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in Vercel → it auto-detects the `vercel.json` config
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Supabase Setup

1. Create a Supabase project
2. Run `supabase/migrations/005_studio_outputs.sql` in the SQL editor
3. Deploy edge functions:
   ```bash
   supabase functions deploy brand-studio
   supabase functions deploy positioning-canvas
   supabase functions deploy gtm-sprinter
   ```
4. Set edge function secrets:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```

## Demo Mode

Everything works without any Supabase/API configuration — all tools return realistic sample output for a fictitious legal-tech company.
