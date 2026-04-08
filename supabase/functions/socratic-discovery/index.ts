import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface DiscoveryMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  deal_id?: string;
  section_key: string;
  section_title: string;
  section_focus: string;
  venture_description?: string;
  messages: DiscoveryMessage[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Demo responses used when no ANTHROPIC_API_KEY is set.
// They progress through a realistic Socratic flow for the "problem" section.
const DEMO_FLOW: Record<string, Array<{ message: string; ready_to_save: boolean; synthesized_content: string | null }>> = {
  problem: [
    {
      message:
        "That's a starting point, but I want to push you harder. Tell me about a *specific* moment — a real person, a real day, a real cost. Who was it? What did they lose (time, money, sleep)? I'm looking for something vivid, not an abstraction about 'the market'.",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "Okay, that's more concrete. Now — how often does this actually happen, and who feels it most acutely? Is this a weekly annoyance for many people, or a quarterly catastrophe for a few? The answer shapes whether you have a product or a feature.",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "Good. Last question: when this pain hits, what do they do *today* to cope? Even a bad workaround tells you how much they'd pay to solve it properly. If they're not paying anyone or doing anything, that's a signal the pain isn't real enough yet.",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "I have enough to synthesize. Here's what I'm hearing — does this capture it?",
      ready_to_save: true,
      synthesized_content:
        "Mid-market legal teams (50–500 employees) spend 60%+ of their counsel's time on routine contract review — a 3-person legal team processing 500+ contracts/year means a GC spends 4 hours reviewing what should take 30 minutes. The pain peaks around funding events when contract volume doubles. Today they cope by (a) outsourcing to $500/hr outside counsel or (b) rubber-stamping contracts to keep pace with sales. Both create risk. The real cost isn't hours — it's strategic work the GC can't do because they're drowning in redlines.",
    },
  ],
  insight: [
    {
      message:
        "Okay, but 'we understand the space better' is what everyone says. What do you *specifically* know from firsthand experience that someone analyzing this from the outside would get wrong? I want a concrete example.",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "That's more interesting. Why hasn't anyone else built this, then? Cheap answer: they're lazy or dumb. Honest answer: there's usually a non-obvious reason. What's yours?",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "Good answer. Here's my synthesis — does this capture the insight?",
      ready_to_save: true,
      synthesized_content:
        "Legacy CLM vendors treat AI as a bolt-on feature on top of a database product — their architecture is keyword matching with an LLM sticker. The founders worked inside a Big Law firm and saw that contract review is fundamentally a *language understanding* problem, not a *retrieval* problem. Incumbents haven't rewritten their stacks because their enterprise customers aren't demanding it — but mid-market buyers, who are price-sensitive and speed-hungry, will. The insight: you can own the mid-market by being AI-native from day one, while incumbents defend their enterprise moat.",
    },
  ],
  default: [
    {
      message:
        "Tell me more about that. What's the specific evidence you have that this is true — not what you believe, but what you've *seen*?",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "Okay. If you had to defend that in front of a skeptical partner who said 'that's not enough' — what would you say?",
      ready_to_save: false,
      synthesized_content: null,
    },
    {
      message:
        "Good. I think I have enough to synthesize. Here's my take — does it capture what you meant?",
      ready_to_save: true,
      synthesized_content:
        "[Demo synthesis] Based on the conversation, the core answer to this section is emerging but needs real customer validation. Key points: (1) the team has a specific hypothesis rooted in lived experience, (2) they've identified at least one concrete early signal, (3) the next step is to test this with 3-5 real conversations. This is a strong starting point for a Day-1 canvas entry — revisit after initial discovery calls.",
    },
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { section_key, section_title, section_focus, venture_description, messages } = body;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    // Demo fallback
    if (!anthropicKey) {
      const flow = DEMO_FLOW[section_key] || DEMO_FLOW.default;
      const userTurns = messages.filter((m) => m.role === "user").length;
      const idx = Math.min(userTurns - 1, flow.length - 1);
      const response = flow[Math.max(0, idx)];
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a sharp, experienced startup coach running a Socratic discovery conversation with a 2-4 person founding team. They are on Day 1 of building a company — early and uncertain.

You are currently working on the "${section_title}" section of their company canvas.
Focus: ${section_focus}

${venture_description ? `Venture context (what you know so far): ${venture_description}` : "This is a brand-new venture. Assume nothing."}

Rules for this conversation:
1. Ask ONE focused question at a time. Never bulk-ask or offer a menu of options.
2. Follow up on vague or hand-wavy answers. Push for specificity: real names, real numbers, real moments.
3. Challenge weak reasoning directly but kindly. A founding team needs honesty more than encouragement.
4. Notice when the team is being defensive, aspirational, or generic — and call it out.
5. Don't write their answers for them. Your job is to draw out their insight, not replace it.
6. After 4-6 meaningful exchanges (or sooner if you have enough signal), synthesize what you've heard into a 3-6 sentence canvas entry and ask: "Should I save this to your canvas?"
7. The synthesis must be crisp, specific, and written as if the founders said it — not as a list of platitudes.

You MUST return ONLY valid JSON matching this exact schema:
{
  "message": "your response text — a question, a challenge, or a synthesis",
  "ready_to_save": boolean — true only when you're offering a synthesis for the canvas,
  "synthesized_content": "the canvas entry text if ready_to_save is true, otherwise null"
}

Do not include any text outside the JSON object.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If Claude returned non-JSON, wrap it as a plain message
      parsed = {
        message: text,
        ready_to_save: false,
        synthesized_content: null,
      };
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
