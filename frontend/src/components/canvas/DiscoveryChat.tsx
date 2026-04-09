import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { runSocraticDiscovery, saveCanvasSection } from "@/api";
import type { CanvasSectionDefinition } from "@/lib/canvasSections";
import type { DiscoveryMessage, CanvasSection } from "@/types";

interface Props {
  definition: CanvasSectionDefinition;
  dealId: string;
  ventureDescription: string;
  existingContent: string;
  onClose: () => void;
  onSaved: (section: CanvasSection) => void;
}

export function DiscoveryChat({
  definition,
  dealId,
  ventureDescription,
  existingContent,
  onClose,
  onSaved,
}: Props) {
  const [messages, setMessages] = useState<DiscoveryMessage[]>([
    { role: "assistant", content: definition.socraticOpening },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingSynthesis, setPendingSynthesis] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pendingSynthesis]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: DiscoveryMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await runSocraticDiscovery({
        deal_id: dealId,
        section_key: definition.key,
        section_title: definition.title,
        section_focus: definition.socraticFocus,
        venture_description: ventureDescription,
        messages: nextMessages,
      });

      setMessages([
        ...nextMessages,
        { role: "assistant", content: response.message },
      ]);

      if (response.ready_to_save && response.synthesized_content) {
        setPendingSynthesis(response.synthesized_content);
      }
    } catch (err) {
      toast.error("Discovery failed. Try again.");
      // Revert the user message so they can retry
      setMessages(messages);
      setInput(userMsg.content);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSynthesis() {
    if (!pendingSynthesis) return;
    try {
      const combined = existingContent
        ? `${existingContent}\n\n---\n\n${pendingSynthesis}`
        : pendingSynthesis;
      const updated = await saveCanvasSection(
        dealId,
        definition.key,
        combined,
        "in_progress"
      );
      onSaved(updated);
      toast.success("Saved to canvas");
      onClose();
    } catch {
      toast.error("Save failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-[var(--card)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold">Discovery: {definition.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {definition.description}
              </p>
            </div>
            <Badge variant="secondary">{definition.stage}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-2 text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          {pendingSynthesis && (
            <div className="rounded-lg border-2 border-dashed border-[var(--primary)] bg-[var(--accent)] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Proposed canvas entry
              </div>
              <p className="mb-3 whitespace-pre-wrap text-sm">
                {pendingSynthesis}
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSynthesis}>
                  <Save className="mr-1 h-3 w-3" />
                  Save to Canvas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingSynthesis(null)}
                >
                  Keep Discussing
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your answer... (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="resize-none"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
