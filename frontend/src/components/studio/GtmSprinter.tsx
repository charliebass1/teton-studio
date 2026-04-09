import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateGtmSprinter } from "@/api";
import type { Deal, GtmSprinterInputs, GtmSprinterOutputs } from "@/types";

interface Props {
  deal?: Deal | null;
}

const DEMO_OUTPUT: GtmSprinterOutputs = {
  buyer_personas: [
    {
      title: "VP of Legal / General Counsel",
      company_size: "200-2000 employees (mid-market tech)",
      pain: "Drowning in contract volume with a 3-person legal team. Spending 60% of time on routine reviews instead of strategic work.",
      trigger: "Just closed Series B+ and contract volume doubled. Board is asking about compliance risk.",
      objection: "We already have a CLM tool — why do we need another vendor?",
    },
    {
      title: "Head of Legal Operations",
      company_size: "500-5000 employees",
      pain: "Legal is the bottleneck for deal closings. Sales complains about 2-week review cycles killing momentum.",
      trigger: "CEO mandated 'faster contracting' as Q1 priority after losing a deal due to slow legal review.",
      objection: "How accurate is the AI? We can't afford errors in legal documents.",
    },
    {
      title: "CFO / COO at SMB",
      company_size: "50-200 employees (no in-house counsel)",
      pain: "Paying $500/hr for outside counsel to review standard contracts. Spending $80K+/year on routine legal review.",
      trigger: "Just got a surprising legal bill or realized they're signing contracts without proper review.",
      objection: "We're not big enough to need a contract tool — can't we just use templates?",
    },
  ],
  messaging_matrix: [
    {
      persona: "VP of Legal / General Counsel",
      headline: "Give your legal team superpowers, not more headcount",
      subheadline: "AI-powered contract review that handles the routine so your team can focus on strategy",
      bullets: [
        "Review contracts 10x faster with automated clause analysis",
        "Catch risks that human reviewers miss on first pass",
        "Deploy in days, not months — no IT project required",
      ],
    },
    {
      persona: "Head of Legal Operations",
      headline: "Stop being the bottleneck. Start being the accelerator.",
      subheadline: "Turn 2-week review cycles into same-day turnarounds",
      bullets: [
        "Automated redlines for standard agreements",
        "Risk scoring so your team triages intelligently",
        "Sales team self-serves on low-risk contracts with AI guardrails",
      ],
    },
    {
      persona: "CFO / COO at SMB",
      headline: "Enterprise-grade contract review at SMB prices",
      subheadline: "Stop paying $500/hr for a lawyer to review NDAs",
      bullets: [
        "AI reviews contracts in minutes for a fraction of outside counsel costs",
        "Built-in templates and clause libraries for common agreements",
        "Flag only the contracts that actually need a lawyer's attention",
      ],
    },
  ],
  email_sequences: [
    {
      persona: "VP of Legal / General Counsel",
      emails: [
        {
          subject: "Your legal team is reviewing contracts the hard way",
          opener: "I noticed {company} recently closed a funding round — congrats. As you scale, contract volume typically 3x within 12 months.",
          value: "We help legal teams at companies like yours review contracts 10x faster using AI — without sacrificing accuracy. Our LLM catches risk clauses that human reviewers miss 73% of the time on first pass.",
          cta: "Worth a 15-minute look? I can show you a live review of one of your actual contracts.",
        },
        {
          subject: "Re: contract review",
          opener: "Quick follow-up — wanted to share a specific example.",
          value: "One of our customers (similar size, B2B SaaS) cut their average contract review time from 4 hours to 25 minutes. Their GC told us it was like 'adding 3 lawyers to the team overnight.'",
          cta: "Happy to run a free pilot review on 5 of your contracts so you can see the output quality firsthand.",
        },
        {
          subject: "Last note on this",
          opener: "I know inboxes are brutal, so I'll keep this short.",
          value: "We deploy in 2 days (vs. 6 months for legacy CLM tools), integrate with MS Word and DocuSign, and we're priced for mid-market — not enterprise budgets.",
          cta: "If contract review is even a minor pain point, I think you'll find the demo eye-opening. 15 minutes, no pitch deck.",
        },
      ],
    },
  ],
  landing_page_brief: {
    hero_copy: "Contract review at the speed of AI. Accuracy your legal team can trust.",
    feature_callouts: [
      "AI Clause Analysis — Automatically extract, categorize, and score every clause against your playbook",
      "Instant Redlines — Get AI-generated markup suggestions in minutes, not hours",
      "Risk Dashboard — See your entire contract portfolio's risk profile at a glance",
    ],
    social_proof_placeholder: "Trusted by legal teams at 50+ mid-market companies. Average contract review time reduced by 85%.",
    faq: [
      { question: "How accurate is the AI?", answer: "Our LLM achieves 94% accuracy on clause extraction and risk scoring, benchmarked against senior attorney reviews. Every output includes confidence scores so your team knows where to focus human attention." },
      { question: "How long does implementation take?", answer: "Most teams are live within 2 business days. We integrate with MS Word and DocuSign — no IT project required." },
      { question: "Is our data secure?", answer: "Yes. All contracts are encrypted at rest and in transit. We're SOC 2 Type II certified and never use customer data for model training." },
    ],
  },
  objections: [
    { objection: "We already have a CLM tool", response: "Great — we integrate with your CLM, we don't replace it. Think of us as the AI brain that sits on top of your existing workflow. Most of our customers use us alongside Ironclad or DocuSign CLM." },
    { objection: "AI isn't accurate enough for legal work", response: "You're right to be cautious. That's why we show confidence scores on every analysis and flag anything below 90% for human review. We augment your lawyers, we don't replace them." },
    { objection: "Our contracts are too complex/specialized", response: "We handle that with custom playbooks — you define your clause standards, risk thresholds, and preferred language. The AI learns your firm's specific approach, not just generic legal rules." },
    { objection: "We can't afford another tool right now", response: "What's your outside counsel spend on routine reviews? Most mid-market teams spend $80-200K/year on contracts a lawyer doesn't actually need to touch. We typically pay for ourselves in month one." },
    { objection: "What about data privacy?", response: "SOC 2 Type II certified, end-to-end encryption, and we never train on customer data. We can also deploy in your VPC for maximum control." },
  ],
  first_90_day_metrics: [
    { metric: "Contracts Reviewed", target: "100+ contracts through the platform", why: "Validates product-market fit and generates usage data for optimization" },
    { metric: "Average Review Time", target: "< 30 minutes (down from 4 hours)", why: "Core value prop — if you can't prove speed, nothing else matters" },
    { metric: "Accuracy Rate", target: "> 90% clause extraction accuracy", why: "Legal teams won't adopt a tool they can't trust" },
    { metric: "Pipeline Generated", target: "$500K qualified pipeline", why: "Proves the GTM motion works and funds the next phase" },
    { metric: "CAC", target: "< $15K blended", why: "At seed-stage pricing, CAC above $15K makes the unit economics unsustainable" },
    { metric: "Net Promoter Score", target: "> 40", why: "Early adopters who love the product become your best sales channel" },
  ],
};

export function GtmSprinter({ deal }: Props) {
  const [inputs, setInputs] = useState<GtmSprinterInputs>({
    company_description: deal?.description || "",
    product: deal?.product_capabilities || "",
    sector: deal?.sector || "",
    stage: deal?.stage || "",
  });
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GtmSprinterOutputs | null>(null);

  async function handleGenerate() {
    if (!inputs.company_description.trim()) {
      toast.error("Please enter a company description.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateGtmSprinter(inputs, deal?.id);
      setOutput(result.outputs as unknown as GtmSprinterOutputs);
      toast.success("GTM Sprinter output generated!");
    } catch {
      setOutput(DEMO_OUTPUT);
      toast.success("Loaded demo output (no API configured).");
    } finally {
      setLoading(false);
    }
  }

  const update = (field: keyof GtmSprinterInputs, value: string) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Input Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Description</Label>
              <Textarea
                placeholder="AI-powered contract review platform..."
                value={inputs.company_description}
                onChange={(e) => update("company_description", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Product / Capabilities</Label>
              <Textarea
                placeholder="Clause extraction, risk scoring..."
                value={inputs.product}
                onChange={(e) => update("product", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Input
                placeholder="Legal Tech / B2B SaaS"
                value={inputs.sector}
                onChange={(e) => update("sector", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Input
                placeholder="Seed"
                value={inputs.stage}
                onChange={(e) => update("stage", e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generating..." : "Generate GTM Plan"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output Panel */}
      <div className="space-y-4">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!loading && !output && (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center p-6">
              <p className="text-[var(--muted-foreground)]">
                Fill in the inputs and click Generate to create a GTM plan.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && output && (
          <>
            {/* Buyer Personas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buyer Personas ({output.buyer_personas.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {output.buyer_personas.map((p, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{p.title}</h4>
                      <Badge variant="secondary">{p.company_size}</Badge>
                    </div>
                    <div className="grid gap-1 text-sm text-[var(--muted-foreground)]">
                      <p><span className="font-medium text-[var(--foreground)]">Pain:</span> {p.pain}</p>
                      <p><span className="font-medium text-[var(--foreground)]">Trigger:</span> {p.trigger}</p>
                      <p><span className="font-medium text-[var(--foreground)]">Objection:</span> {p.objection}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Messaging Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messaging Matrix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {output.messaging_matrix.map((m, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-2">
                    <Badge variant="outline" className="mb-1">{m.persona}</Badge>
                    <h4 className="font-semibold">{m.headline}</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">{m.subheadline}</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
                      {m.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Email Sequences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cold Outbound Sequences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {output.email_sequences.map((seq, i) => (
                  <div key={i}>
                    <h4 className="font-medium mb-3">Sequence for: {seq.persona}</h4>
                    <div className="space-y-3">
                      {seq.emails.map((email, j) => (
                        <div key={j} className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Email {j + 1}</Badge>
                            <span className="text-sm font-medium">{email.subject}</span>
                          </div>
                          <div className="text-sm text-[var(--muted-foreground)] space-y-1">
                            <p><span className="font-medium text-[var(--foreground)]">Opener:</span> {email.opener}</p>
                            <p><span className="font-medium text-[var(--foreground)]">Value:</span> {email.value}</p>
                            <p><span className="font-medium text-[var(--foreground)]">CTA:</span> {email.cta}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Landing Page Brief */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Landing Page Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Hero Copy</h4>
                  <p className="text-lg font-semibold">{output.landing_page_brief.hero_copy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Feature Callouts</h4>
                  <div className="space-y-2">
                    {output.landing_page_brief.feature_callouts.map((f, i) => (
                      <div key={i} className="rounded border p-3 text-sm text-[var(--muted-foreground)]">{f}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Social Proof</h4>
                  <p className="text-sm text-[var(--muted-foreground)] italic">{output.landing_page_brief.social_proof_placeholder}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">FAQ</h4>
                  <div className="space-y-3">
                    {output.landing_page_brief.faq.map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium">{item.question}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Objections & Responses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {output.objections.map((o, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-1">"{o.objection}"</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{o.response}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 90-Day Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First 90-Day Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {output.first_90_day_metrics.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.metric}</span>
                          <Badge variant="secondary">{m.target}</Badge>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{m.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
