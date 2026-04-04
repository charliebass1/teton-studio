import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { GtmSprinter } from "@/components/studio/GtmSprinter";

export default function StudioGtm() {
  return (
    <div>
      <Link
        to="/studio"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Studio
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-6">GTM Sprinter</h1>
      <GtmSprinter />
    </div>
  );
}
