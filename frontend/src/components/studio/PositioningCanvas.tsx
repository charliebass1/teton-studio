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
import { generatePositioningCanvas } from "@/api";
import type { Deal, PositioningCanvasInputs, PositioningCanvasOutputs } from "@/types";

interface Props {
  deal?: Deal | null;
}

const DEMO_OUTPUT: PositioningCanvasOutputs = {
  feature_matrix: {
    features: ["AI Clause Extraction", "Risk Scoring", "Redline Suggestions", "Template Library", "MS Word Plugin", "Audit Trail", "Multi-language"],
    companies: {
      "Arcline AI": { "AI Clause Extraction": "Core strength", "Risk Scoring": "Automated with LLM", "Redline Suggestions": "AI-generated", "Template Library": "Industry-specific", "MS Word Plugin": "Yes", "Audit Trail": "Full", "Multi-language": "Planned" },
      "Ironclad": { "AI Clause Extraction": "Basic", "Risk Scoring": "Rule-based", "Redline Suggestions": "Manual", "Template Library": "Extensive", "MS Word Plugin": "Yes", "Audit Trail": "Full", "Multi-language": "Yes" },
      "Luminance": { "AI Clause Extraction": "Strong", "Risk Scoring": "AI-driven", "Redline Suggestions": "AI-assisted", "Template Library": "Limited", "MS Word Plugin": "No", "Audit Trail": "Full", "Multi-language": "Yes" },
      "ContractPodAi": { "AI Clause Extraction": "Moderate", "Risk Scoring": "Rule-based", "Redline Suggestions": "Manual", "Template Library": "Moderate", "MS Word Plugin": "Yes", "Audit Trail": "Full", "Multi-language": "Partial" },
    },
  },
  positioning_map: {
    x_axis: "Ease of Implementation",
    y_axis: "AI Sophistication",
    positions: {
      "Arcline AI": { x: 75, y: 85 },
      "Ironclad": { x: 60, y: 40 },
      "Luminance": { x: 35, y: 80 },
      "ContractPodAi": { x: 50, y: 45 },
    },
  },
  positioning_angles: [
    {
      headline: "Contract review at the speed of AI, at the price of a paralegal",
      who_its_for: "Mid-market legal teams drowning in contract volume",
      core_claim: "Review contracts 10x faster with LLM-powered clause analysis and automated redlines",
      proof_point: "Reduces average contract review time from 4 hours to 25 minutes in pilot deployments",
    },
    {
      headline: "The contract intelligence platform built for teams without a legal army",
      who_its_for: "Tech companies with 1-5 person legal teams managing 500+ contracts/year",
      core_claim: "Enterprise-grade contract AI without enterprise complexity or cost",
      proof_point: "Deploys in 2 days vs. 6-month implementation cycles of legacy CLM tools",
    },
    {
      headline: "Stop reviewing contracts. Start understanding them.",
      who_its_for: "General counsel who want strategic insight, not just risk flags",
      core_claim: "Beyond redlines — contextual analysis that surfaces business implications, not just legal risks",
      proof_point: "Identifies commercial risks that 73% of human reviewers miss in first-pass review",
    },
  ],
  kill_briefs: [
    { competitor: "Ironclad", how_to_win: "Ironclad is a CLM platform first, AI second. Their AI features are bolt-ons. Lead with: 'We're AI-native — our entire architecture is built around LLM understanding of legal language, not keyword matching.'" },
    { competitor: "Luminance", how_to_win: "Luminance targets large law firms and enterprise. Lead with deployment speed and price: 'We deliver 80% of Luminance's AI capability at 30% of the cost, live in days not months.'" },
    { competitor: "ContractPodAi", how_to_win: "ContractPodAi has weak AI and strong CLM. Lead with: 'If you want a filing cabinet, use ContractPodAi. If you want a second brain for your legal team, talk to us.'" },
  ],
  differentiation_risks: {
    defensible: [
      "LLM-native architecture (competitors would need full rewrites)",
      "Speed of deployment (2-day vs. 6-month implementations)",
      "Mid-market focus and pricing (incumbents can't easily move downmarket)",
    ],
    easily_copied: [
      "MS Word plugin integration",
      "Template library",
      "Basic clause extraction (table stakes within 12 months)",
    ],
  },
};

export function PositioningCanvas({ deal }: Props) {
  const [inputs, setInputs] = useState<PositioningCanvasInputs>({
    company_description: deal?.description || "",
    product_capabilities: deal?.product_capabilities || "",
    competitors: deal?.competitors || "",
    sector: deal?.sector || "",
    stage: deal?.stage || "",
  });
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<PositioningCanvasOutputs | null>(null);

  async function handleGenerate() {
    if (!inputs.company_description.trim()) {
      toast.error("Please enter a company description.");
      return;
    }
    setLoading(true);
    try {
      const result = await generatePositioningCanvas(inputs, deal?.id);
      setOutput(result.outputs as unknown as PositioningCanvasOutputs);
      toast.success("Positioning Canvas generated!");
    } catch {
      setOutput(DEMO_OUTPUT);
      toast.success("Loaded demo output (no API configured).");
    } finally {
      setLoading(false);
    }
  }

  const update = (field: keyof PositioningCanvasInputs, value: string) =>
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
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Product Capabilities</Label>
              <Textarea
                placeholder="Clause extraction, risk scoring..."
                value={inputs.product_capabilities}
                onChange={(e) => update("product_capabilities", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Competitors (comma-separated)</Label>
              <Input
                placeholder="Ironclad, Luminance, ContractPodAi"
                value={inputs.competitors}
                onChange={(e) => update("competitors", e.target.value)}
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
              {loading ? "Analyzing..." : "Generate Positioning Canvas"}
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
                Fill in the inputs and click Generate to create a positioning
                canvas.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && output && (
          <>
            {/* Feature Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Comparison Matrix</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Feature</th>
                      {Object.keys(output.feature_matrix.companies).map((co) => (
                        <th key={co} className="text-left p-2 font-medium">{co}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {output.feature_matrix.features.map((feat) => (
                      <tr key={feat} className="border-b">
                        <td className="p-2 font-medium">{feat}</td>
                        {Object.values(output.feature_matrix.companies).map((caps, i) => (
                          <td key={i} className="p-2 text-[var(--muted-foreground)]">
                            {caps[feat] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* 2x2 Positioning Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Positioning Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto h-80 w-full max-w-lg border-l-2 border-b-2 border-[var(--border)]">
                  {/* Axis labels */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[var(--muted-foreground)]">
                    {output.positioning_map.x_axis} →
                  </span>
                  <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-[var(--muted-foreground)]">
                    {output.positioning_map.y_axis} →
                  </span>
                  {/* Company dots */}
                  {Object.entries(output.positioning_map.positions).map(
                    ([name, pos]) => (
                      <div
                        key={name}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${pos.x}%`,
                          bottom: `${pos.y}%`,
                          transform: "translate(-50%, 50%)",
                        }}
                      >
                        <div className="h-3 w-3 rounded-full bg-[var(--primary)]" />
                        <span className="mt-1 whitespace-nowrap text-xs font-medium">
                          {name}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Positioning Angles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Positioning Angles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {output.positioning_angles.map((angle, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-semibold">"{angle.headline}"</h4>
                    <div className="grid gap-1 text-sm text-[var(--muted-foreground)]">
                      <p><span className="font-medium text-[var(--foreground)]">For:</span> {angle.who_its_for}</p>
                      <p><span className="font-medium text-[var(--foreground)]">Claim:</span> {angle.core_claim}</p>
                      <p><span className="font-medium text-[var(--foreground)]">Proof:</span> {angle.proof_point}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Kill Briefs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kill the Incumbent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {output.kill_briefs.map((brief) => (
                  <div key={brief.competitor} className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-1">vs. {brief.competitor}</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">{brief.how_to_win}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Differentiation Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Differentiation Risk Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Badge variant="secondary">Defensible</Badge>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
                      {output.differentiation_risks.defensible.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Badge variant="outline">Easily Copied</Badge>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
                      {output.differentiation_risks.easily_copied.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
