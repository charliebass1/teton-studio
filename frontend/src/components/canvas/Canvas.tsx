import { useEffect, useMemo, useState } from "react";
import { CANVAS_SECTIONS, STAGES } from "@/lib/canvasSections";
import type { CanvasSectionDefinition } from "@/lib/canvasSections";
import type { CanvasSection, Comment } from "@/types";
import { listCanvasSections, listComments } from "@/api";
import { CanvasSectionCard } from "./CanvasSectionCard";
import { DiscoveryChat } from "./DiscoveryChat";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  dealId: string;
  ventureDescription: string;
}

export function Canvas({ dealId, ventureDescription }: Props) {
  const [sections, setSections] = useState<Record<string, CanvasSection>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDiscovery, setActiveDiscovery] = useState<CanvasSectionDefinition | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([listCanvasSections(dealId), listComments(dealId)])
      .then(([sectionList, commentList]) => {
        const map: Record<string, CanvasSection> = {};
        for (const s of sectionList) map[s.section_key] = s;
        setSections(map);
        setComments(commentList);
      })
      .finally(() => setLoading(false));
  }, [dealId]);

  function handleUpdate(updated: CanvasSection) {
    setSections((prev) => ({ ...prev, [updated.section_key]: updated }));
  }

  function handleCommentsChange(sectionKey: string, sectionComments: Comment[]) {
    setComments((prev) => [
      ...prev.filter((c) => c.section_key !== sectionKey),
      ...sectionComments,
    ]);
  }

  const commentsBySection = useMemo(() => {
    const out: Record<string, Comment[]> = {};
    for (const c of comments) {
      if (!out[c.section_key]) out[c.section_key] = [];
      out[c.section_key].push(c);
    }
    return out;
  }, [comments]);

  const grouped = useMemo(() => {
    const out: Record<string, CanvasSectionDefinition[]> = {};
    for (const s of CANVAS_SECTIONS) {
      if (!out[s.stage]) out[s.stage] = [];
      out[s.stage].push(s);
    }
    return out;
  }, []);

  const completedCount = Object.values(sections).filter(
    (s) => s.status === "complete"
  ).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Company Canvas</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            A living document of what you know, in the order it becomes relevant.
            Use Discovery to think out loud with an AI coach.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {completedCount} / {CANVAS_SECTIONS.length}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            sections complete
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {STAGES.filter((stage) => grouped[stage]?.length).map((stage) => (
          <div key={stage}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {stage}
              </h3>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="grid gap-3">
              {grouped[stage].map((def) => (
                <CanvasSectionCard
                  key={def.key}
                  definition={def}
                  section={sections[def.key] || null}
                  dealId={dealId}
                  comments={commentsBySection[def.key] || []}
                  onUpdate={handleUpdate}
                  onCommentsChange={(c) => handleCommentsChange(def.key, c)}
                  onStartDiscovery={() => setActiveDiscovery(def)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeDiscovery && (
        <DiscoveryChat
          definition={activeDiscovery}
          dealId={dealId}
          ventureDescription={ventureDescription}
          existingContent={sections[activeDiscovery.key]?.content || ""}
          onClose={() => setActiveDiscovery(null)}
          onSaved={handleUpdate}
        />
      )}
    </div>
  );
}
