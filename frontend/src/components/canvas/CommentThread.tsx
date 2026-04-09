import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2, User, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { addComment, deleteComment, listComments } from "@/api";
import { useViewAs } from "@/lib/viewAs";
import type { Comment } from "@/types";

interface Props {
  dealId: string;
  sectionKey: string;
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
}

function timeAgo(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return date.toLocaleDateString();
}

export function CommentThread({
  dealId,
  sectionKey,
  comments,
  onChange,
}: Props) {
  const [viewAs] = useViewAs();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd() {
    if (!draft.trim()) return;
    setSubmitting(true);
    try {
      const created = await addComment(dealId, sectionKey, viewAs, draft.trim());
      onChange([...comments, created]);
      setDraft("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment(commentId, dealId);
      onChange(comments.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border border-dashed bg-[var(--muted)]/30 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
        <MessageSquare className="h-3 w-3" />
        Comments ({comments.length})
      </div>

      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-md border bg-[var(--background)] p-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={c.author_role === "vc" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {c.author_role === "vc" ? (
                      <Eye className="mr-1 h-2.5 w-2.5" />
                    ) : (
                      <User className="mr-1 h-2.5 w-2.5" />
                    )}
                    {c.author_role === "vc" ? "VC" : "Founder"}
                  </Badge>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            viewAs === "vc"
              ? "Leave a note for the team..."
              : "Add a comment for the team or your VC..."
          }
          rows={2}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleAdd}
          disabled={!draft.trim() || submitting}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
