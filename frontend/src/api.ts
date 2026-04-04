import type {
  Deal,
  StudioOutput,
  BrandStudioInputs,
  PositioningCanvasInputs,
  GtmSprinterInputs,
} from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

async function invokeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Function ${functionName} failed: ${text}`);
  }

  return res.json();
}

export async function generateBrandStudio(
  inputs: BrandStudioInputs,
  dealId?: string
): Promise<StudioOutput> {
  return invokeFunction<StudioOutput>("brand-studio", {
    ...inputs,
    deal_id: dealId,
  });
}

export async function generatePositioningCanvas(
  inputs: PositioningCanvasInputs,
  dealId?: string
): Promise<StudioOutput> {
  return invokeFunction<StudioOutput>("positioning-canvas", {
    ...inputs,
    deal_id: dealId,
  });
}

export async function generateGtmSprinter(
  inputs: GtmSprinterInputs,
  dealId?: string
): Promise<StudioOutput> {
  return invokeFunction<StudioOutput>("gtm-sprinter", {
    ...inputs,
    deal_id: dealId,
  });
}

export async function listStudioOutputs(
  dealId?: string
): Promise<StudioOutput[]> {
  return invokeFunction<StudioOutput[]>("list-studio-outputs", {
    deal_id: dealId,
  });
}

export async function getStudioOutput(id: string): Promise<StudioOutput> {
  return invokeFunction<StudioOutput>("get-studio-output", { id });
}

// Deal CRUD (simplified — reads from Supabase directly)
export async function listDeals(): Promise<Deal[]> {
  if (!SUPABASE_URL) return DEMO_DEALS;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deals?order=created_at.desc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) return DEMO_DEALS;
  const data = await res.json();
  return data.length > 0 ? data : DEMO_DEALS;
}

export async function getDeal(id: string): Promise<Deal | null> {
  if (!SUPABASE_URL) return DEMO_DEALS.find((d) => d.id === id) || null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/deals?id=eq.${id}&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) return DEMO_DEALS.find((d) => d.id === id) || null;
  const data = await res.json();
  return data[0] || DEMO_DEALS.find((d) => d.id === id) || null;
}

const DEMO_DEALS: Deal[] = [
  {
    id: "demo-1",
    company_name: "Arcline AI",
    description:
      "AI-powered contract review platform for mid-market legal teams. Uses LLMs to identify risk clauses, suggest edits, and benchmark against industry standards.",
    sector: "Legal Tech / B2B SaaS",
    stage: "Seed",
    target_market: "Mid-market legal teams (50-500 employees), in-house counsel at tech companies",
    competitors: "Ironclad, Luminance, ContractPodAi",
    product_capabilities:
      "Automated clause extraction, risk scoring, redline suggestions, template library, integration with DocuSign and MS Word",
    status: "active",
    created_at: "2025-11-15T00:00:00Z",
    updated_at: "2025-11-15T00:00:00Z",
  },
  {
    id: "demo-2",
    company_name: "GreenLedger",
    description:
      "Carbon accounting platform for SMBs. Automates Scope 1-3 emissions tracking with bank-feed integration and generates audit-ready reports for ESG compliance.",
    sector: "Climate Tech / Fintech",
    stage: "Pre-seed",
    target_market: "SMBs with 10-200 employees facing ESG reporting requirements",
    competitors: "Watershed, Persefoni, Sweep",
    product_capabilities:
      "Automated emissions calculation, bank feed integration, supply chain mapping, audit-ready reporting, offset marketplace",
    status: "active",
    created_at: "2025-12-01T00:00:00Z",
    updated_at: "2025-12-01T00:00:00Z",
  },
];
