import { useState } from "react";
import {
  AlertCircle,
  Lightbulb,
  Zap,
  Users,
  Target,
  Crosshair,
  Sparkles,
  Rocket,
  MessageCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { saveCanvasSection } from "@/api";
import type { CanvasSectionDefinition } from "@/lib/canvasSections";
import type { CanvasSection, CanvasSectionStatus } from "@/types";

const ICONS = {
  AlertCircle,
  Lightbulb,
  Zap,
  Users,
  Target,
  Crosshair,
  Sparkles,
  Rocket,
};

interface Props {
  definition: CanvasSectionDefinition;
  section: CanvasSection | null;
  dealId: string;
  onUpdate: (updated: CanvasSection) => void;
  onStartDiscovery: () => void;
}

function statusBadge(status: CanvasSectionStatus) {
  if (status === "complete")
    return <Badge variant="default">Complete</Badge>;
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  return <Badge variant="outline">Empty</Badge>;
}

export function CanvasSectionCard({
  definition,
  section,
  dealId,
  onUpdate,
  onStartDiscovery,
}: Props) {
  const Icon = ICONS[definition.icon];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section?.content || "");
  const [saving, setSaving] = useState(false);

  const content = section?.content || "";
  const status: CanvasSectionStatus = section?.status || "empty";

  async function handleSave() {
    setSaving(true);
    try {
      const nextStatus: CanvasSectionStatus = draft.trim() ? "in_progress" : "empty";
      const updated = await saveCanvasSection(dealId, definition.key, draft, nextStatus);
      onUpdate(updated);
      setEditing(false);
      toast.success("Saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkComplete() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const updated = await saveCanvasSection(
        dealId,
        definition.key,
        content,
        status === "complete" ? "in_progress" : "complete"
      );
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{definition.title}</h3>
                {statusBadge(status)}
              </div>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                {definition.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder="Write what you know so far..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setDraft(content);
                }}
              >
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {content ? (
              <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">
                {content}
              </p>
            ) : (
              <p className="text-sm italic text-[var(--muted-foreground)]">
                Not explored yet. Start a discovery conversation or write your
                current thinking directly.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={onStartDiscovery}>
                <MessageCircle className="mr-1 h-3 w-3" />
                {content ? "Continue Discovery" : "Start Discovery"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(content);
                  setEditing(true);
                }}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              {content && (
                <Button
                  size="sm"
                  variant={status === "complete" ? "secondary" : "outline"}
                  onClick={handleMarkComplete}
                  disabled={saving}
                >
                  {status === "complete" ? "Reopen" : "Mark Complete"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
