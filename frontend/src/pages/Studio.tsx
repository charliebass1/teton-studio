import { Link } from "react-router-dom";
import { Palette, Target, Rocket } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tools = [
  {
    to: "/studio/brand",
    icon: Palette,
    title: "Brand Studio",
    description:
      "Generate company name candidates with trademark risk flags, domain notes, taglines, and brand voice profiles. Tuned to sector and stage.",
    cta: "Open Brand Studio",
  },
  {
    to: "/studio/positioning",
    icon: Target,
    title: "Positioning Canvas",
    description:
      "Build competitive feature matrices, 2x2 positioning maps, and differentiated messaging angles. Includes kill-the-incumbent briefs.",
    cta: "Open Positioning Canvas",
  },
  {
    to: "/studio/gtm",
    icon: Rocket,
    title: "GTM Sprinter",
    description:
      "Define buyer personas, craft cold outbound sequences, generate landing page copy, and set first 90-day metrics. Sector-specific guidance.",
    cta: "Open GTM Sprinter",
  },
];

export default function Studio() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Studio</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Pre-investment and portfolio design tools. Help founders move faster on
          naming, positioning, and go-to-market.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.to} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]">
                <tool.icon className="h-5 w-5 text-[var(--accent-foreground)]" />
              </div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link to={tool.to} className="w-full">
                <Button className="w-full">{tool.cta}</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
