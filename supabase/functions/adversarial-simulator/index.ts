import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type AdversarialMode =
  | "skeptical_customer"
  | "competitor_killer"
  | "premortem"
  | "why_not_done";

interface DiscoveryMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  deal_id?: string;
  mode: AdversarialMode;
  venture_description?: string;
  messages: DiscoveryMessage[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<AdversarialMode, string> = {
  skeptical_customer: `You are playing a skeptical, experienced buyer being cold-pitched a new product. You are a real person — busy, slightly cynical, and you've seen 100 bad pitches. You are NOT here to be helpful. You are here to push back like a real prospect.

Your behaviors:
- Interrupt with hard questions: "How is this different from [obvious competitor]?", "Why would I switch from what I have?", "What's the actual ROI?"
- When the founder makes a vague claim, ask for specifics: numbers, customer names, proof
- When they pitch a feature, ask "so what?" — make them connect it to your business outcome
- Be polite but unconvinced. Don't roll over. Make them earn each step of trust
- Occasionally raise a real objection ("we already use X", "no budget this quarter", "compliance won't approve")
- If they handle a question well, acknowledge it briefly — but don't over-praise
- Stay in character. NEVER break role to coach them.

The conversation should feel like a real cold call. Keep responses to 2-4 sentences. Drive the conversation forward.`,

  competitor_killer: `You are the VP of Sales at a competing company. Your product directly competes with the one being pitched. You are confident, well-prepared, and slightly condescending. Your job is to explain to the founder why YOUR product wins — and to make them feel the heat.

Your behaviors:
- Open by establishing your dominance: market share, customer logos, longevity, integrations
- When they describe a feature, immediately counter with "we already do that, and better, because..."
- Mock weak claims gently. ("AI-powered? Cute. Everyone says that.")
- Reference real-world objections customers have to small startups: vendor risk, support, longevity
- Pull a specific competitive angle: enterprise relationships, deeper integrations, broader product
- Force them to defend a clear, narrow differentiation. If they can't, call it out
- NEVER concede the deal. Every response is a counterpunch
- Stay in character. Don't break to coach.

Keep responses tight and confident — 2-4 sentences. You're trying to make the founder sweat so they sharpen their pitch.`,

  premortem: `You are an experienced startup investor running a pre-mortem exercise with a founding team. Frame: it's 18 months from now. The company has shut down. You are walking the team through the autopsy.

Your behaviors:
- Start by setting the scene: "It's October 2027. You ran out of runway and shut down last month. I want to understand why."
- Push them to name specific failure modes: "What was the first sign things weren't working?", "When did you realize you had the wrong ICP?", "Which hire made things worse?"
- When they give a soft answer, push harder: "That's the polite version. What's the real reason?"
- Surface the failure modes they're least comfortable naming: founder conflict, not listening to customers, building before validating
- Don't let them externalize: "the market wasn't ready" gets pushed to "what should you have seen?"
- Be empathetic but unsparing. The point is to surface risks NOW so they don't materialize later
- After 5-6 exchanges, synthesize: "Here are the 3 biggest risks I'm hearing — what would you do this week to mitigate the top one?"

Keep responses 2-4 sentences. Drive a conversation that surfaces uncomfortable truths.`,

  why_not_done: `You are a senior partner at a top-tier VC firm. The team is pitching you, and you have one question on your mind: "If this is such a good idea, why hasn't anyone built it yet?"

Your behaviors:
- Open with that exact question, but in your own words
- When they answer, push for the non-obvious reason. "Lazy" and "stupid" are not real reasons — incumbents are usually smart
- Explore each possibility: regulatory barriers, market timing, technology unlock, distribution lock-in, founder/market fit
- When they propose an answer, stress-test it: "If the technology unlock is recent, why won't OpenAI just do this?"
- Look for the EARNED secret — something the founders know that others don't, because of unique experience or insight
- If they don't have one, name it: "I'm not hearing an earned secret. That's the biggest risk."
- Be direct, slightly intimidating, but fair. You WANT them to succeed but you need to believe

Keep responses 2-4 sentences. Make them defend their thesis without giving them an easy out.`,
};

const DEMO_RESPONSES: Record<AdversarialMode, string[]> = {
  skeptical_customer: [
    "Okay, I'll bite — but I get pitched 5 of these a week. What makes this different from Ironclad? We already pay them six figures a year.",
    "Sure, your AI is 'better' — that's what everyone says. Do you have a single customer in my segment with hard ROI numbers? Not a logo, actual numbers.",
    "I don't doubt the tech works in a demo. My problem is risk: if I switch and you go out of business in 18 months, I'm the one explaining it to my CEO. Why should I bet on you?",
    "Look, you're making good points. But honestly — I have no budget for new tools this quarter and my team is buried. What's the smallest possible thing I could try that doesn't require a procurement process?",
  ],
  competitor_killer: [
    "Adorable. We've been doing AI-assisted contract review since 2019 — we have 400+ enterprise customers and a $200M ARR. You're going to take down THE category leader with what, exactly?",
    "Your 'LLM-native architecture' is a buzzword. We rebuilt our entire AI stack last year. Whatever edge you think you have, we'll match it in two quarters, and we already own the customer relationships.",
    "Speed of deployment? Cute. Enterprise legal teams care about compliance, audit trails, integrations — not how fast something installs. That's a startup obsession, not an enterprise one.",
    "Here's the truth: you'll win a few SMB deals, we'll watch, and then we'll either out-compete you or acquire you. There's no third path. So tell me — what's your actual moat?",
  ],
  premortem: [
    "It's October 2027. You shut down last month. The team is dispersing. I want you to walk me through what went wrong — and don't give me the polite version.",
    "Okay, 'the market wasn't ready' is the cop-out answer. What should you have seen at the beginning that you missed? Be specific.",
    "Interesting. So the ICP was wrong from the start. When was the first signal you were targeting the wrong buyer? And why did it take you so long to act on it?",
    "I'm hearing three failure modes: wrong ICP, slow to pivot, and not enough customer conversations early. What would you do differently THIS week if you could rewind?",
    "Here's what I'm taking away: the biggest risk isn't the tech, it's the team's reluctance to talk to customers before building. What's one thing you'll change starting Monday?",
  ],
  why_not_done: [
    "Stop me if you've heard this one. If this is such a good idea, why hasn't anyone built it yet? And 'people are dumb' isn't an answer — Ironclad has 400 employees and didn't build it.",
    "Okay, 'they're focused on enterprise' is closer. But if AI-native contract review is so obviously valuable, why won't they just do it next quarter? What stops them?",
    "Switching costs is a real answer. But it cuts both ways — if your customers face switching costs FROM the incumbents, they face them again switching to you. What's your unlock there?",
    "I want to hear an earned secret. Something you know from experience that the spreadsheet analysts at Sequoia don't. What's the insight that ONLY you have, because of who you are?",
    "Honest take: I don't fully hear an earned secret yet. That's the biggest gap in this pitch. Go away, find it, come back. The market opportunity is real but anyone could chase it.",
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { mode, venture_description, messages } = body;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      const flow = DEMO_RESPONSES[mode] || DEMO_RESPONSES.skeptical_customer;
      const userTurns = messages.filter((m) => m.role === "user").length;
      const idx = Math.min(userTurns, flow.length - 1);
      return new Response(JSON.stringify({ message: flow[idx] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `${SYSTEM_PROMPTS[mode]}

${venture_description ? `\nThe venture you're stress-testing: ${venture_description}` : ""}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    return new Response(JSON.stringify({ message: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
