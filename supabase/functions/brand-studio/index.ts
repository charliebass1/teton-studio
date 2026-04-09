import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEMO_OUTPUT = {
  name_candidates: [
    { name: "Clausewell", style: "coined", rationale: "Combines 'clause' (legal) with 'well' (health/accuracy). Implies contracts that are well-crafted.", domain_note: "clausewell.com likely available", trademark_risk: "Low — coined word, no existing marks found", pronunciation_score: 9, international_risk: "Low — phonetically clear across major languages" },
    { name: "Redline AI", style: "descriptive", rationale: "Directly references the legal practice of redlining contracts. 'AI' signals the tech approach.", domain_note: "redlineai.com may be taken, redline.ai worth checking", trademark_risk: "Medium — 'redline' is common in legal contexts", pronunciation_score: 10, international_risk: "Low — 'redline' is understood globally in legal contexts" },
    { name: "Pactum", style: "metaphorical", rationale: "Latin for 'agreement/pact'. Evokes authority and legal tradition with modern brevity.", domain_note: "pactum.com likely taken, pactum.ai worth checking", trademark_risk: "Medium — Latin term, may have existing uses", pronunciation_score: 8, international_risk: "Low — Latin root recognized in Romance languages" },
    { name: "Vericlause", style: "coined", rationale: "Blends 'verify' with 'clause'. Signals trust and accuracy in contract review.", domain_note: "vericlause.com likely available", trademark_risk: "Low — coined compound", pronunciation_score: 8, international_risk: "Low — clear phonetics" },
    { name: "ContractMind", style: "descriptive", rationale: "Straightforward: AI that understands contracts. Accessible to non-technical buyers.", domain_note: "contractmind.com worth checking", trademark_risk: "Medium — descriptive, hard to protect broadly", pronunciation_score: 10, international_risk: "Low" },
    { name: "Sigil", style: "metaphorical", rationale: "A sigil is a seal or sign — evokes the binding nature of contracts. Short, memorable, premium feel.", domain_note: "sigil.com taken, sigil.ai or sigil.legal worth checking", trademark_risk: "Medium — short word, may exist in other categories", pronunciation_score: 7, international_risk: "Medium — less intuitive in Asian languages" },
    { name: "Lexigo", style: "coined", rationale: "From 'lex' (law) + 'go' (speed). Implies moving fast on legal work.", domain_note: "lexigo.com may be taken", trademark_risk: "Medium — similar to existing translation company", pronunciation_score: 9, international_risk: "Low — Romance language roots" },
    { name: "Ironmark", style: "metaphorical", rationale: "Evokes strength and permanence. A mark that's iron-clad — like a well-reviewed contract.", domain_note: "ironmark.com likely taken, ironmark.ai available", trademark_risk: "Medium — 'Ironmark' exists as a print company", pronunciation_score: 9, international_risk: "Low" },
  ],
  taglines: {
    "Clausewell": ["Every clause, covered.", "Contract confidence, automated.", "The second pair of eyes your legal team needs.", "Well-reviewed. Well-protected.", "AI that reads between the clauses."],
    "Redline AI": ["Redline smarter, close faster.", "AI-powered contract review in minutes.", "Your contracts, bulletproofed.", "From draft to done, faster.", "The redline that never misses."],
    "Pactum": ["Agreements, perfected.", "Where contracts meet clarity.", "Review with confidence.", "The intelligence behind every agreement.", "Precision for every pact."],
  },
  brand_voice: {
    adjectives: ["Precise", "Authoritative", "Approachable"],
    sounds_like: "A senior in-house counsel who explains complex terms in plain language — confident but never condescending",
    does_not_sound_like: "A flashy startup pitch or overly casual tech bro energy. Not legalese-heavy either.",
  },
  gut_check: "A VP of Legal at a Fortune 500 would take a meeting with 'Clausewell' or 'Pactum' — they sound credible and purpose-built. 'Redline AI' is more literal but immediately understood.",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { company_description, sector, stage, target_customer, competitors, deal_id } = await req.json();

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    let outputs;

    if (!anthropicKey) {
      outputs = DEMO_OUTPUT;
    } else {
      const systemPrompt = `You are a VC partner at a top-tier early-stage fund, advising a founder on brand identity and naming.
Context: Sector: ${sector || "General"}, Stage: ${stage || "Seed"}, Target customer: ${target_customer || "Not specified"}
Tailor all outputs to this context. A B2B SaaS company needs different naming than a consumer fintech.
Return ONLY valid JSON in this exact schema:
{
  "name_candidates": [{ "name": string, "style": "coined"|"descriptive"|"metaphorical", "rationale": string, "domain_note": string, "trademark_risk": string, "pronunciation_score": number(1-10), "international_risk": string }] (8-12 candidates across 3 styles),
  "taglines": { "NameA": [5 taglines], "NameB": [5 taglines], "NameC": [5 taglines] } (for top 3 names),
  "brand_voice": { "adjectives": [3 strings], "sounds_like": string, "does_not_sound_like": string },
  "gut_check": string (would a VP at a Fortune 500 take this meeting?)
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: `Generate brand identity options for this company:\n\nDescription: ${company_description}\nCompetitors: ${competitors || "None specified"}\n\nReturn JSON only.`,
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "{}";
      outputs = JSON.parse(text);
    }

    // Save to database if Supabase is configured
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let savedRecord = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("studio_outputs").insert({
        deal_id: deal_id || null,
        tool: "brand-studio",
        inputs: { company_description, sector, stage, target_customer, competitors },
        outputs,
      }).select().single();
      savedRecord = data;
    }

    return new Response(
      JSON.stringify(savedRecord || { id: crypto.randomUUID(), deal_id: deal_id || null, tool: "brand-studio", inputs: { company_description, sector, stage, target_customer, competitors }, outputs, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
