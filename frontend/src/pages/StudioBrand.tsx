import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandStudio } from "@/components/studio/BrandStudio";

export default function StudioBrand() {
  return (
    <div>
      <Link
        to="/studio"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Studio
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Brand Studio</h1>
      <BrandStudio />
    </div>
  );
}
