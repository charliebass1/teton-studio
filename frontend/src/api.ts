import type {
  Deal,
  StudioOutput,
  BrandStudioInputs,
  PositioningCanvasInputs,
  GtmSprinterInputs,
  CanvasSection,
  CanvasSectionStatus,
  DiscoveryMessage,
  DiscoveryResponse,
  MeetingSession,
  MeetingAgenda,
  MeetingSynthesis,
  AdversarialMode,
  Comment,
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

// ---- Canvas sections ----

function canvasLocalKey(dealId: string) {
  return `canvas_${dealId}`;
}

function readLocalCanvas(dealId: string): Record<string, CanvasSection> {
  try {
    const raw = localStorage.getItem(canvasLocalKey(dealId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalCanvas(dealId: string, sections: Record<string, CanvasSection>) {
  localStorage.setItem(canvasLocalKey(dealId), JSON.stringify(sections));
}

export async function listCanvasSections(dealId: string): Promise<CanvasSection[]> {
  if (!SUPABASE_URL) {
    return Object.values(readLocalCanvas(dealId));
  }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/canvas_sections?deal_id=eq.${dealId}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) return Object.values(readLocalCanvas(dealId));
  return res.json();
}

export async function saveCanvasSection(
  dealId: string,
  sectionKey: string,
  content: string,
  status: CanvasSectionStatus = "in_progress"
): Promise<CanvasSection> {
  const now = new Date().toISOString();
  const section: CanvasSection = {
    id: `${dealId}-${sectionKey}`,
    deal_id: dealId,
    section_key: sectionKey,
    content,
    status,
    created_at: now,
    updated_at: now,
  };

  if (!SUPABASE_URL) {
    const existing = readLocalCanvas(dealId);
    existing[sectionKey] = { ...existing[sectionKey], ...section };
    writeLocalCanvas(dealId, existing);
    return existing[sectionKey];
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/canvas_sections?on_conflict=deal_id,section_key`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        deal_id: dealId,
        section_key: sectionKey,
        content,
        status,
      }),
    }
  );

  if (!res.ok) {
    // Fall back to local storage
    const existing = readLocalCanvas(dealId);
    existing[sectionKey] = { ...existing[sectionKey], ...section };
    writeLocalCanvas(dealId, existing);
    return existing[sectionKey];
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function runSocraticDiscovery(params: {
  deal_id: string;
  section_key: string;
  section_title: string;
  section_focus: string;
  venture_description: string;
  messages: DiscoveryMessage[];
}): Promise<DiscoveryResponse> {
  return invokeFunction<DiscoveryResponse>("socratic-discovery", params);
}

// ---- Meeting sessions ----

function meetingsLocalKey(dealId: string) {
  return `meetings_${dealId}`;
}

function readLocalMeetings(dealId: string): MeetingSession[] {
  try {
    const raw = localStorage.getItem(meetingsLocalKey(dealId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalMeetings(dealId: string, sessions: MeetingSession[]) {
  localStorage.setItem(meetingsLocalKey(dealId), JSON.stringify(sessions));
}

export async function listMeetingSessions(dealId: string): Promise<MeetingSession[]> {
  if (!SUPABASE_URL) return readLocalMeetings(dealId);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/meeting_sessions?deal_id=eq.${dealId}&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) return readLocalMeetings(dealId);
  return res.json();
}

export async function saveMeetingSession(
  dealId: string,
  session: Partial<MeetingSession> & { week_label: string; agenda: MeetingAgenda }
): Promise<MeetingSession> {
  const now = new Date().toISOString();
  const record: MeetingSession = {
    id: session.id || crypto.randomUUID(),
    deal_id: dealId,
    week_label: session.week_label,
    agenda: session.agenda,
    synthesis: session.synthesis || null,
    created_at: session.id ? (session.created_at || now) : now,
    updated_at: now,
  };

  if (!SUPABASE_URL) {
    const existing = readLocalMeetings(dealId);
    const idx = existing.findIndex((s) => s.id === record.id);
    if (idx >= 0) existing[idx] = record;
    else existing.unshift(record);
    writeLocalMeetings(dealId, existing);
    return record;
  }

  const isUpdate = !!session.id;
  const url = isUpdate
    ? `${SUPABASE_URL}/rest/v1/meeting_sessions?id=eq.${session.id}`
    : `${SUPABASE_URL}/rest/v1/meeting_sessions`;
  const method = isUpdate ? "PATCH" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      deal_id: dealId,
      week_label: record.week_label,
      agenda: record.agenda,
      synthesis: record.synthesis,
    }),
  });

  if (!res.ok) {
    const existing = readLocalMeetings(dealId);
    const idx = existing.findIndex((s) => s.id === record.id);
    if (idx >= 0) existing[idx] = record;
    else existing.unshift(record);
    writeLocalMeetings(dealId, existing);
    return record;
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function synthesizeMeeting(params: {
  deal_id: string;
  venture_description: string;
  agenda: MeetingAgenda;
  previous_commitments?: string;
}): Promise<MeetingSynthesis> {
  return invokeFunction<MeetingSynthesis>("monday-meeting", params);
}

// ---- Adversarial simulator ----

export async function runAdversarial(params: {
  deal_id: string;
  mode: AdversarialMode;
  venture_description: string;
  messages: DiscoveryMessage[];
}): Promise<{ message: string }> {
  return invokeFunction<{ message: string }>("adversarial-simulator", params);
}

// ---- Comments ----

function commentsLocalKey(dealId: string) {
  return `comments_${dealId}`;
}

function readLocalComments(dealId: string): Comment[] {
  try {
    const raw = localStorage.getItem(commentsLocalKey(dealId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalComments(dealId: string, comments: Comment[]) {
  localStorage.setItem(commentsLocalKey(dealId), JSON.stringify(comments));
}

export async function listComments(dealId: string): Promise<Comment[]> {
  if (!SUPABASE_URL) return readLocalComments(dealId);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?deal_id=eq.${dealId}&order=created_at.asc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) return readLocalComments(dealId);
  return res.json();
}

export async function addComment(
  dealId: string,
  sectionKey: string,
  authorRole: "founder" | "vc",
  content: string
): Promise<Comment> {
  const now = new Date().toISOString();
  const comment: Comment = {
    id: crypto.randomUUID(),
    deal_id: dealId,
    section_key: sectionKey,
    author_role: authorRole,
    content,
    created_at: now,
  };

  if (!SUPABASE_URL) {
    const existing = readLocalComments(dealId);
    existing.push(comment);
    writeLocalComments(dealId, existing);
    return comment;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      deal_id: dealId,
      section_key: sectionKey,
      author_role: authorRole,
      content,
    }),
  });

  if (!res.ok) {
    const existing = readLocalComments(dealId);
    existing.push(comment);
    writeLocalComments(dealId, existing);
    return comment;
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteComment(commentId: string, dealId: string): Promise<void> {
  if (!SUPABASE_URL) {
    const existing = readLocalComments(dealId);
    writeLocalComments(dealId, existing.filter((c) => c.id !== commentId));
    return;
  }
  await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${commentId}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
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
