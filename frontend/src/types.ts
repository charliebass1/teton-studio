export interface Deal {
  id: string;
  company_name: string;
  description: string;
  sector: string;
  stage: string;
  target_market: string;
  competitors: string;
  product_capabilities: string;
  status: "active" | "passed" | "closed";
  created_at: string;
  updated_at: string;
}

export interface StudioOutput {
  id: string;
  deal_id: string | null;
  tool: "brand-studio" | "positioning-canvas" | "gtm-sprinter";
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrandStudioInputs {
  company_description: string;
  sector: string;
  stage: string;
  target_customer: string;
  competitors: string;
}

export interface BrandNameCandidate {
  name: string;
  style: "coined" | "descriptive" | "metaphorical";
  rationale: string;
  domain_note: string;
  trademark_risk: string;
  pronunciation_score: number;
  international_risk: string;
}

export interface BrandStudioOutputs {
  name_candidates: BrandNameCandidate[];
  taglines: Record<string, string[]>;
  brand_voice: {
    adjectives: string[];
    sounds_like: string;
    does_not_sound_like: string;
  };
  gut_check: string;
}

export interface PositioningCanvasInputs {
  company_description: string;
  product_capabilities: string;
  competitors: string;
  sector: string;
  stage: string;
}

export interface PositioningAngle {
  headline: string;
  who_its_for: string;
  core_claim: string;
  proof_point: string;
}

export interface CompetitorBrief {
  competitor: string;
  how_to_win: string;
}

export interface PositioningCanvasOutputs {
  feature_matrix: {
    features: string[];
    companies: Record<string, Record<string, string>>;
  };
  positioning_map: {
    x_axis: string;
    y_axis: string;
    positions: Record<string, { x: number; y: number }>;
  };
  positioning_angles: PositioningAngle[];
  kill_briefs: CompetitorBrief[];
  differentiation_risks: {
    defensible: string[];
    easily_copied: string[];
  };
}

export interface GtmSprinterInputs {
  company_description: string;
  product: string;
  sector: string;
  stage: string;
}

export interface BuyerPersona {
  title: string;
  company_size: string;
  pain: string;
  trigger: string;
  objection: string;
}

export interface EmailSequence {
  persona: string;
  emails: {
    subject: string;
    opener: string;
    value: string;
    cta: string;
  }[];
}

export interface GtmSprinterOutputs {
  buyer_personas: BuyerPersona[];
  messaging_matrix: {
    persona: string;
    headline: string;
    subheadline: string;
    bullets: string[];
  }[];
  email_sequences: EmailSequence[];
  landing_page_brief: {
    hero_copy: string;
    feature_callouts: string[];
    social_proof_placeholder: string;
    faq: { question: string; answer: string }[];
  };
  objections: { objection: string; response: string }[];
  first_90_day_metrics: { metric: string; target: string; why: string }[];
}
