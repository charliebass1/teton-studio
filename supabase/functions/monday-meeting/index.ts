import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface MeetingAgenda {
  learnings: string;
  tested_assumptions: string;
  riskiest_unknown: string;
  commitments: string;
}

interface RequestBody {
  deal_id?: string;
  venture_description?: string;
  agenda: MeetingAgenda;
  previous_commitments?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_SYNTHESIS = {
  decisions: [
    "Narrow ICP from 'mid-market legal teams' to specifically 'in-house counsel at Series B-D tech companies, 200-1000 employees'",
    "Drop the templates feature for v1 — focus entirely on AI clause review",
    "Charge usage-based, not seat-based — pricing starts at $0.50/contract",
  ],
  next_steps: [
    "Talk to 8 in-house counsel at Series B-D companies this week (have 3 intros lined up)",
    "Build a Loom demo of the clause review flow using 5 real (anonymized) contracts",
    "Test the $0.50/contract pricing with the 3 founders we already have warm intros to",
    "Write a one-page positioning doc by Friday for the team to align on",
  ],
  vc_summary:
    "The team made a hard but right call this week: narrowing the ICP and dropping a feature. Their conviction is growing on the AI-native angle vs. legacy CLM, and they have specific evidence from 3 customer conversations supporting the new ICP. Biggest open question is pricing model — they're testing usage-based this week. No blockers; momentum looks healthy. Recommend pushing them on whether 8 conversations is enough validation before committing to the new positioning.",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { agenda, venture_description, previous_commitments } = body;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(JSON.stringify(DEMO_SYNTHESIS), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an experienced startup coach who runs the weekly stand-up for a 2-4 person founding team. Your job is to take the messy notes from their meeting and produce a crisp synthesis the team can act on AND share with their VC.

Context about the venture: ${venture_description || "Early-stage startup, day-1 team"}
${previous_commitments ? `Last week the team committed to: ${previous_commitments}` : ""}

You will receive their notes from this week's meeting. Synthesize them into:
1. **Decisions** — concrete decisions the team made this week (3-6 bullets, each one specific and actionable)
2. **Next steps** — commitments for the coming week (3-6 bullets, each with owner-implied actions, no fluff)
3. **VC summary** — a single paragraph (4-6 sentences) the team would send their lead VC. It should be honest about uncertainty, name the biggest open question, and call out anything where the VC could help. Do NOT make it a sales pitch.

Rules:
- Reject vague decisions ("we'll think about pricing"). If their notes are vague, write the decision as "STILL OPEN: [topic]".
- Reject vague next steps ("do customer research"). Force specificity ("talk to 5 named CTOs by Friday").
- The VC summary should sound like a smart founder writing honestly to a partner who wants the truth, not the highlight reel.

Return ONLY valid JSON in this exact schema:
{
  "decisions": [string],
  "next_steps": [string],
  "vc_summary": string
}`;

    const userMessage = `Here are this week's notes:

LEARNINGS:
${agenda.learnings || "(empty)"}

ASSUMPTIONS WE TESTED:
${agenda.tested_assumptions || "(empty)"}

RISKIEST UNKNOWN RIGHT NOW:
${agenda.riskiest_unknown || "(empty)"}

COMMITMENTS DISCUSSED:
${agenda.commitments || "(empty)"}

Synthesize this into the JSON format.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = DEMO_SYNTHESIS;
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
