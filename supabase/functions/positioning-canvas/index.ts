import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEMO_OUTPUT = {
  feature_matrix: {
    features: ["AI Clause Extraction", "Risk Scoring", "Redline Suggestions", "Template Library", "MS Word Plugin", "Audit Trail", "Multi-language"],
    companies: {
      "Arcline AI": { "AI Clause Extraction": "Core strength", "Risk Scoring": "Automated with LLM", "Redline Suggestions": "AI-generated", "Template Library": "Industry-specific", "MS Word Plugin": "Yes", "Audit Trail": "Full", "Multi-language": "Planned" },
      "Ironclad": { "AI Clause Extraction": "Basic", "Risk Scoring": "Rule-based", "Redline Suggestions": "Manual", "Template Library": "Extensive", "MS Word Plugin": "Yes", "Audit Trail": "Full", "Multi-language": "Yes" },
      "Luminance": { "AI Clause Extraction": "Strong", "Risk Scoring": "AI-driven", "Redline Suggestions": "AI-assisted", "Template Library": "Limited", "MS Word Plugin": "No", "Audit Trail": "Full", "Multi-language": "Yes" },
    },
  },
  positioning_map: {
    x_axis: "Ease of Implementation",
    y_axis: "AI Sophistication",
    positions: { "Arcline AI": { x: 75, y: 85 }, "Ironclad": { x: 60, y: 40 }, "Luminance": { x: 35, y: 80 } },
  },
  positioning_angles: [
    { headline: "Contract review at the speed of AI, at the price of a paralegal", who_its_for: "Mid-market legal teams drowning in contract volume", core_claim: "Review contracts 10x faster with LLM-powered clause analysis", proof_point: "Reduces average contract review time from 4 hours to 25 minutes" },
    { headline: "The contract intelligence platform built for teams without a legal army", who_its_for: "Tech companies with 1-5 person legal teams", core_claim: "Enterprise-grade contract AI without enterprise complexity", proof_point: "Deploys in 2 days vs. 6-month implementation cycles" },
    { headline: "Stop reviewing contracts. Start understanding them.", who_its_for: "General counsel who want strategic insight", core_claim: "Beyond redlines — contextual analysis that surfaces business implications", proof_point: "Identifies commercial risks that 73% of human reviewers miss" },
  ],
  kill_briefs: [
    { competitor: "Ironclad", how_to_win: "Ironclad is a CLM platform first, AI second. Lead with: 'We're AI-native — our architecture is built around LLM understanding, not keyword matching.'" },
    { competitor: "Luminance", how_to_win: "Luminance targets large law firms. Lead with deployment speed and price: '80% of Luminance's AI at 30% of the cost, live in days not months.'" },
  ],
  differentiation_risks: {
    defensible: ["LLM-native architecture", "Speed of deployment (2-day vs. 6-month)", "Mid-market focus and pricing"],
    easily_copied: ["MS Word plugin integration", "Template library", "Basic clause extraction"],
  },
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
    const { company_description, product_capabilities, competitors, sector, stage, deal_id } = await req.json();

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    let outputs;

    if (!anthropicKey) {
      outputs = DEMO_OUTPUT;
    } else {
      const competitorList = competitors ? competitors.split(",").map((c: string) => c.trim()).join(", ") : "not specified";

      const systemPrompt = `You are a VC partner at a top-tier early-stage fund, advising a founder on competitive positioning.
Context: Sector: ${sector || "General"}, Stage: ${stage || "Seed"}
The company's competitors are: ${competitorList}
Tailor all outputs to this context.
Return ONLY valid JSON in this exact schema:
{
  "feature_matrix": { "features": [string], "companies": { "CompanyName": { "FeatureName": string } } },
  "positioning_map": { "x_axis": string, "y_axis": string, "positions": { "CompanyName": { "x": number(0-100), "y": number(0-100) } } },
  "positioning_angles": [{ "headline": string, "who_its_for": string, "core_claim": string, "proof_point": string }] (exactly 3),
  "kill_briefs": [{ "competitor": string, "how_to_win": string }],
  "differentiation_risks": { "defensible": [string], "easily_copied": [string] }
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
            content: `Generate a positioning canvas for this company:\n\nDescription: ${company_description}\nProduct capabilities: ${product_capabilities || "Not specified"}\nCompetitors: ${competitorList}\n\nReturn JSON only.`,
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "{}";
      outputs = JSON.parse(text);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    let savedRecord = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("studio_outputs").insert({
        deal_id: deal_id || null,
        tool: "positioning-canvas",
        inputs: { company_description, product_capabilities, competitors, sector, stage },
        outputs,
      }).select().single();
      savedRecord = data;
    }

    return new Response(
      JSON.stringify(savedRecord || { id: crypto.randomUUID(), deal_id: deal_id || null, tool: "positioning-canvas", inputs: { company_description, product_capabilities, competitors, sector, stage }, outputs, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
