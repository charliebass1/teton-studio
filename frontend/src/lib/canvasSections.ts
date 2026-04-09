export type CanvasSectionKey =
  | "problem"
  | "insight"
  | "solution"
  | "customers"
  | "mvp"
  | "positioning"
  | "brand"
  | "gtm";

export type CanvasStage = "Day 1" | "Week 1" | "Week 2" | "Week 3" | "Month 2" | "Month 2-3" | "Month 3+";

export interface CanvasSectionDefinition {
  key: CanvasSectionKey;
  title: string;
  stage: CanvasStage;
  description: string;
  icon: "AlertCircle" | "Lightbulb" | "Zap" | "Users" | "Target" | "Crosshair" | "Sparkles" | "Rocket";
  socraticOpening: string;
  socraticFocus: string;
}

export const CANVAS_SECTIONS: CanvasSectionDefinition[] = [
  {
    key: "problem",
    title: "Problem",
    stage: "Day 1",
    description: "What pain are you addressing, who feels it, and what evidence do you have?",
    icon: "AlertCircle",
    socraticOpening:
      "What's the pain point you keep noticing — the one you're convinced has to be solved? Walk me through a specific time you or someone you know felt it acutely.",
    socraticFocus:
      "Identify a concrete, high-intensity pain. Push back on vague 'it would be nice if' problems. Get to a specific person, a specific moment, and a specific cost (time, money, or emotional toll). Reject generic statements about markets.",
  },
  {
    key: "insight",
    title: "Insight",
    stage: "Day 1",
    description: "What do you understand about this problem that others don't?",
    icon: "Lightbulb",
    socraticOpening:
      "Other smart people have looked at this problem before you. What do you understand about it that they don't? What's your unfair advantage — domain expertise, an unusual perspective, or something else?",
    socraticFocus:
      "Surface the non-obvious insight. Challenge 'we're just better at it' with 'why hasn't this been done?'. Look for earned secrets based on lived experience, not shower thoughts. If the insight is weak, say so directly.",
  },
  {
    key: "solution",
    title: "Solution Hypothesis",
    stage: "Week 1",
    description: "What's the simplest thing that could plausibly solve it?",
    icon: "Zap",
    socraticOpening:
      "Describe the simplest possible version of your solution. Not the full product vision — the crude, ugly version that would still solve the core pain for one specific person.",
    socraticFocus:
      "Strip away scope. Get to the one thing the product must do. Resist feature lists and platform ambitions. If the answer is 'an AI platform that...', push them to describe a single interaction.",
  },
  {
    key: "customers",
    title: "First 10 Customers",
    stage: "Week 2",
    description: "Real names, not personas.",
    icon: "Users",
    socraticOpening:
      "Forget personas for a moment. Give me the names of 10 real people or companies you could call today who might actually pay for this. If you can't name them, who in your network could introduce you?",
    socraticFocus:
      "Force concreteness. Get actual names and relationships. If the founders can't name anyone, that's a major signal — push them on why. Reject 'mid-market SaaS CTOs' as an answer.",
  },
  {
    key: "mvp",
    title: "MVP Scope",
    stage: "Week 3",
    description: "The riskiest assumption to test first.",
    icon: "Target",
    socraticOpening:
      "What's the single biggest assumption your whole business rests on — the one that, if wrong, everything falls apart? How would you test it this week with the crudest possible prototype?",
    socraticFocus:
      "Identify the load-bearing assumption. Push for the fastest, cheapest test. Resist 'we need to build the app first'. A Google Form, a Figma click-through, or 10 sales conversations are valid MVPs.",
  },
  {
    key: "positioning",
    title: "Positioning",
    stage: "Month 2",
    description: "How you stand out from alternatives. Unlock once solution is validated.",
    icon: "Crosshair",
    socraticOpening:
      "Now that you've validated your solution, let's talk positioning. Who are the main alternatives customers consider, and what's the ONE thing you do better or differently that they can't copy easily?",
    socraticFocus:
      "Get to a crisp, defensible differentiation statement. Avoid 'we're faster and cheaper and better'. Force a single claim that's sharp enough to cut.",
  },
  {
    key: "brand",
    title: "Brand & Name",
    stage: "Month 2-3",
    description: "Your company's name, voice, and identity.",
    icon: "Sparkles",
    socraticOpening:
      "What should this company feel like to interact with? If your brand were a person walking into a sales meeting, who would they be? What would they never say?",
    socraticFocus:
      "Define voice and emotional tone before worrying about word choices or logos. Get to adjectives a founder could use to evaluate copy.",
  },
  {
    key: "gtm",
    title: "Go-to-Market",
    stage: "Month 3+",
    description: "How you acquire your first paying customers.",
    icon: "Rocket",
    socraticOpening:
      "How will your first 10 paying customers actually find you? Walk me through the exact sequence — not 'content marketing', not 'SEO', but the literal path from stranger to paying customer.",
    socraticFocus:
      "Force a specific motion. Reject 'we'll do content marketing'. Get to a repeatable channel and a realistic conversion path. If they don't know, help them identify 2-3 channels to test.",
  },
];

export const STAGES: CanvasStage[] = [
  "Day 1",
  "Week 1",
  "Week 2",
  "Week 3",
  "Month 2",
  "Month 2-3",
  "Month 3+",
];
