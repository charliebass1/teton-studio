import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEMO_OUTPUT = {
  buyer_personas: [
    { title: "VP of Legal / General Counsel", company_size: "200-2000 employees", pain: "Drowning in contract volume with a 3-person legal team. Spending 60% of time on routine reviews.", trigger: "Just closed Series B+ and contract volume doubled.", objection: "We already have a CLM tool — why do we need another vendor?" },
    { title: "Head of Legal Operations", company_size: "500-5000 employees", pain: "Legal is the bottleneck for deal closings. Sales complains about 2-week review cycles.", trigger: "CEO mandated 'faster contracting' as Q1 priority.", objection: "How accurate is the AI? We can't afford errors in legal documents." },
    { title: "CFO / COO at SMB", company_size: "50-200 employees", pain: "Paying $500/hr for outside counsel to review standard contracts.", trigger: "Just got a surprising legal bill.", objection: "We're not big enough to need a contract tool." },
  ],
  messaging_matrix: [
    { persona: "VP of Legal", headline: "Give your legal team superpowers, not more headcount", subheadline: "AI-powered contract review that handles the routine so your team can focus on strategy", bullets: ["Review contracts 10x faster", "Catch risks human reviewers miss", "Deploy in days, not months"] },
    { persona: "Head of Legal Ops", headline: "Stop being the bottleneck. Start being the accelerator.", subheadline: "Turn 2-week review cycles into same-day turnarounds", bullets: ["Automated redlines for standard agreements", "Risk scoring for intelligent triage", "Sales self-serve on low-risk contracts"] },
    { persona: "CFO / COO", headline: "Enterprise-grade contract review at SMB prices", subheadline: "Stop paying $500/hr for a lawyer to review NDAs", bullets: ["AI reviews in minutes at a fraction of the cost", "Built-in templates for common agreements", "Flag only contracts that need a lawyer"] },
  ],
  email_sequences: [
    { persona: "VP of Legal", emails: [
      { subject: "Your legal team is reviewing contracts the hard way", opener: "I noticed {company} recently closed a funding round — congrats.", value: "We help legal teams review contracts 10x faster using AI.", cta: "Worth a 15-minute look?" },
      { subject: "Re: contract review", opener: "Quick follow-up with a specific example.", value: "One customer cut review time from 4 hours to 25 minutes.", cta: "Happy to run a free pilot on 5 of your contracts." },
      { subject: "Last note on this", opener: "I'll keep this short.", value: "We deploy in 2 days, integrate with MS Word and DocuSign, priced for mid-market.", cta: "15 minutes, no pitch deck." },
    ]},
  ],
  landing_page_brief: {
    hero_copy: "Contract review at the speed of AI. Accuracy your legal team can trust.",
    feature_callouts: ["AI Clause Analysis — automatically score every clause against your playbook", "Instant Redlines — AI markup in minutes, not hours", "Risk Dashboard — see your portfolio's risk profile at a glance"],
    social_proof_placeholder: "Trusted by legal teams at 50+ mid-market companies.",
    faq: [
      { question: "How accurate is the AI?", answer: "94% accuracy on clause extraction, benchmarked against senior attorney reviews." },
      { question: "How long does implementation take?", answer: "Most teams are live within 2 business days." },
      { question: "Is our data secure?", answer: "SOC 2 Type II certified. Never use customer data for training." },
    ],
  },
  objections: [
    { objection: "We already have a CLM tool", response: "We integrate with your CLM, we don't replace it. Think of us as the AI brain on top." },
    { objection: "AI isn't accurate enough for legal work", response: "We show confidence scores and flag anything below 90% for human review." },
    { objection: "Our contracts are too specialized", response: "Custom playbooks let you define your standards. The AI learns your approach." },
    { objection: "We can't afford another tool", response: "What's your outside counsel spend on routine reviews? We typically pay for ourselves in month one." },
    { objection: "What about data privacy?", response: "SOC 2 Type II certified, end-to-end encryption, never train on customer data." },
  ],
  first_90_day_metrics: [
    { metric: "Contracts Reviewed", target: "100+", why: "Validates product-market fit" },
    { metric: "Average Review Time", target: "< 30 minutes", why: "Core value prop" },
    { metric: "Accuracy Rate", target: "> 90%", why: "Legal teams won't adopt untrusted tools" },
    { metric: "Pipeline Generated", target: "$500K qualified", why: "Proves GTM motion works" },
    { metric: "CAC", target: "< $15K blended", why: "Unit economics sustainability" },
    { metric: "NPS", target: "> 40", why: "Early adopters become best sales channel" },
  ],
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
    const { company_description, product, sector, stage, deal_id } = await req.json();

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    let outputs;

    if (!anthropicKey) {
      outputs = DEMO_OUTPUT;
    } else {
      const systemPrompt = `You are a VC partner at a top-tier early-stage fund, advising a founder on go-to-market strategy.
Context: Sector: ${sector || "General"}, Stage: ${stage || "Seed"}
Tailor all outputs to this specific sector and stage. SaaS metrics differ from marketplace metrics.
Return ONLY valid JSON in this exact schema:
{
  "buyer_personas": [{ "title": string, "company_size": string, "pain": string, "trigger": string, "objection": string }] (exactly 3),
  "messaging_matrix": [{ "persona": string, "headline": string, "subheadline": string, "bullets": [3 strings] }] (one per persona),
  "email_sequences": [{ "persona": string, "emails": [{ "subject": string, "opener": string, "value": string, "cta": string }] (3 emails) }] (at least 1 sequence),
  "landing_page_brief": { "hero_copy": string, "feature_callouts": [3 strings], "social_proof_placeholder": string, "faq": [{ "question": string, "answer": string }] (3 items) },
  "objections": [{ "objection": string, "response": string }] (5 items),
  "first_90_day_metrics": [{ "metric": string, "target": string, "why": string }] (6 items, sector-specific)
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
            content: `Generate a complete GTM plan for this company:\n\nDescription: ${company_description}\nProduct: ${product || "Not specified"}\n\nReturn JSON only.`,
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
        tool: "gtm-sprinter",
        inputs: { company_description, product, sector, stage },
        outputs,
      }).select().single();
      savedRecord = data;
    }

    return new Response(
      JSON.stringify(savedRecord || { id: crypto.randomUUID(), deal_id: deal_id || null, tool: "gtm-sprinter", inputs: { company_description, product, sector, stage }, outputs, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
