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
import { generateBrandStudio } from "@/api";
import type { Deal, BrandStudioInputs, BrandStudioOutputs } from "@/types";

interface Props {
  deal?: Deal | null;
}

const DEMO_OUTPUT: BrandStudioOutputs = {
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
  gut_check: "A VP of Legal at a Fortune 500 would take a meeting with 'Clausewell' or 'Pactum' — they sound credible and purpose-built. 'Redline AI' is more literal but immediately understood. Avoid overly clever names that require explanation in an enterprise sales context.",
};

export function BrandStudio({ deal }: Props) {
  const [inputs, setInputs] = useState<BrandStudioInputs>({
    company_description: deal?.description || "",
    sector: deal?.sector || "",
    stage: deal?.stage || "",
    target_customer: deal?.target_market || "",
    competitors: deal?.competitors || "",
  });
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<BrandStudioOutputs | null>(null);

  async function handleGenerate() {
    if (!inputs.company_description.trim()) {
      toast.error("Please enter a company description.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateBrandStudio(inputs, deal?.id);
      setOutput(result.outputs as unknown as BrandStudioOutputs);
      toast.success("Brand Studio output generated!");
    } catch {
      // Demo fallback
      setOutput(DEMO_OUTPUT);
      toast.success("Loaded demo output (no API configured).");
    } finally {
      setLoading(false);
    }
  }

  const update = (field: keyof BrandStudioInputs, value: string) =>
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
            <div className="space-y-2">
              <Label>Target Customer</Label>
              <Input
                placeholder="Mid-market legal teams"
                value={inputs.target_customer}
                onChange={(e) => update("target_customer", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Competitors</Label>
              <Input
                placeholder="Ironclad, Luminance, ContractPodAi"
                value={inputs.competitors}
                onChange={(e) => update("competitors", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generating..." : "Generate Brand Identity"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Output Panel */}
      <div className="space-y-4">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!loading && !output && (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center p-6">
              <p className="text-[var(--muted-foreground)]">
                Fill in the inputs and click Generate to create brand identity
                options.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && output && (
          <>
            {/* Name Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Name Candidates ({output.name_candidates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {output.name_candidates.map((c) => (
                    <div
                      key={c.name}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{c.name}</span>
                        <Badge variant="secondary">{c.style}</Badge>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {c.rationale}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        <span>Domain: {c.domain_note}</span>
                        <span>Trademark: {c.trademark_risk}</span>
                        <span>Pronunciation: {c.pronunciation_score}/10</span>
                        <span>Intl: {c.international_risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Taglines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taglines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(output.taglines).map(([name, lines]) => (
                    <div key={name}>
                      <h4 className="font-medium mb-2">{name}</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
                        {lines.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand Voice */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Voice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Adjectives: </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {output.brand_voice.adjectives.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Sounds like: </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {output.brand_voice.sounds_like}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    Doesn't sound like:{" "}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {output.brand_voice.does_not_sound_like}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Gut Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gut Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {output.gut_check}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
