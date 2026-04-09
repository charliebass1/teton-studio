import { useEffect, useState } from "react";
import { Loader2, Plus, Sparkles, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listMeetingSessions,
  saveMeetingSession,
  synthesizeMeeting,
} from "@/api";
import type { MeetingSession, MeetingAgenda } from "@/types";

interface Props {
  dealId: string;
  ventureDescription: string;
}

const EMPTY_AGENDA: MeetingAgenda = {
  learnings: "",
  tested_assumptions: "",
  riskiest_unknown: "",
  commitments: "",
};

function weekLabel(date = new Date()) {
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return `Week of ${date.toLocaleDateString("en-US", opts)}`;
}

export function MondayMeeting({ dealId, ventureDescription }: Props) {
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<MeetingSession | null>(null);
  const [agenda, setAgenda] = useState<MeetingAgenda>(EMPTY_AGENDA);
  const [synthesizing, setSynthesizing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    listMeetingSessions(dealId)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [dealId]);

  function startNewSession() {
    const previousCommitments = sessions[0]?.agenda?.commitments || "";
    const newSession: MeetingSession = {
      id: "",
      deal_id: dealId,
      week_label: weekLabel(),
      agenda: {
        ...EMPTY_AGENDA,
        learnings: previousCommitments
          ? `(Last week we committed to: ${previousCommitments.slice(0, 200)}...)\n\n`
          : "",
      },
      synthesis: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActiveSession(newSession);
    setAgenda(newSession.agenda);
  }

  function openSession(session: MeetingSession) {
    setActiveSession(session);
    setAgenda(session.agenda);
  }

  function closeSession() {
    setActiveSession(null);
    setAgenda(EMPTY_AGENDA);
  }

  async function handleSaveDraft() {
    if (!activeSession) return;
    setSaving(true);
    try {
      const saved = await saveMeetingSession(dealId, {
        id: activeSession.id || undefined,
        week_label: activeSession.week_label,
        agenda,
        synthesis: activeSession.synthesis,
      });
      setActiveSession(saved);
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      toast.success("Draft saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSynthesize() {
    if (!activeSession) return;
    setSynthesizing(true);
    try {
      const previousCommitments = sessions
        .filter((s) => s.id !== activeSession.id)[0]?.agenda?.commitments || "";

      const synthesis = await synthesizeMeeting({
        deal_id: dealId,
        venture_description: ventureDescription,
        agenda,
        previous_commitments: previousCommitments,
      });

      const saved = await saveMeetingSession(dealId, {
        id: activeSession.id || undefined,
        week_label: activeSession.week_label,
        agenda,
        synthesis,
      });
      setActiveSession(saved);
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      toast.success("Synthesized");
    } catch {
      toast.error("Synthesis failed");
    } finally {
      setSynthesizing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Active session view
  if (activeSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{activeSession.week_label}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Walk through each prompt as a team. Type rough notes — Claude will
              synthesize them.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={closeSession}>
            Back to sessions
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. What did we learn?</CardTitle>
            <CardDescription>
              Customer conversations, experiments, surprises. Be specific.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agenda.learnings}
              onChange={(e) =>
                setAgenda({ ...agenda, learnings: e.target.value })
              }
              rows={4}
              placeholder="Talked to 5 in-house counsel. 4 of them said pricing was the main blocker..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              2. Which assumptions got tested?
            </CardTitle>
            <CardDescription>
              What did you believe last week, and what's the verdict now?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agenda.tested_assumptions}
              onChange={(e) =>
                setAgenda({ ...agenda, tested_assumptions: e.target.value })
              }
              rows={4}
              placeholder="We assumed mid-market would pay $500/seat. Conversations suggest they'll pay per-contract, not per-seat..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              3. Riskiest thing we still don't know
            </CardTitle>
            <CardDescription>
              The single load-bearing question. If wrong, everything falls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agenda.riskiest_unknown}
              onChange={(e) =>
                setAgenda({ ...agenda, riskiest_unknown: e.target.value })
              }
              rows={3}
              placeholder="Whether legal teams will trust an AI for contracts that go beyond NDAs..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              4. Commitments for next week
            </CardTitle>
            <CardDescription>
              Specific. Names, numbers, dates. Not "do customer research".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agenda.commitments}
              onChange={(e) =>
                setAgenda({ ...agenda, commitments: e.target.value })
              }
              rows={4}
              placeholder="Talk to 8 GCs by Friday (3 already booked). Build clickable prototype of clause review flow..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleSaveDraft} variant="outline" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
          <Button onClick={handleSynthesize} disabled={synthesizing}>
            {synthesizing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Sparkles className="mr-2 h-4 w-4" />
            Synthesize Session
          </Button>
        </div>

        {activeSession.synthesis && (
          <Card className="border-2 border-[var(--primary)]">
            <CardHeader>
              <CardTitle className="text-base">Synthesis</CardTitle>
              <CardDescription>
                Decisions, next steps, and a VC summary you can copy-paste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Decisions</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {activeSession.synthesis.decisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Next steps</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {activeSession.synthesis.next_steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">VC Summary</h4>
                <p className="rounded-md bg-[var(--muted)] p-3 text-sm whitespace-pre-wrap">
                  {activeSession.synthesis.vc_summary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Sessions list view
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Monday Meetings</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Weekly stand-ups with structure. Capture decisions, generate VC
            updates.
          </p>
        </div>
        <Button onClick={startNewSession}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-[var(--muted-foreground)] mb-4">
              No sessions yet. Start your first weekly meeting.
            </p>
            <Button onClick={startNewSession}>Start First Session</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openSession(session)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {session.week_label}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {session.synthesis
                        ? `${session.synthesis.decisions.length} decisions, ${session.synthesis.next_steps.length} next steps`
                        : "Draft (not synthesized)"}
                    </CardDescription>
                  </div>
                  {session.synthesis ? (
                    <Badge>Synthesized</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
