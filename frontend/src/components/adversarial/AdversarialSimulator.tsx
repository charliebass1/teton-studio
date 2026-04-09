import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  Swords,
  Skull,
  HelpCircle,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { runAdversarial } from "@/api";
import type { AdversarialMode, DiscoveryMessage } from "@/types";

interface Props {
  dealId: string;
  ventureDescription: string;
}

interface ModeDef {
  mode: AdversarialMode;
  title: string;
  description: string;
  icon: typeof ShieldAlert;
  opener: string;
}

const MODES: ModeDef[] = [
  {
    mode: "skeptical_customer",
    title: "Skeptical Customer",
    description:
      "Pitch your product to a real buyer who's seen 100 bad pitches. They will not be polite.",
    icon: ShieldAlert,
    opener:
      "Hi. I have ten minutes. What is this and why should I care? And please don't say 'AI-powered' in the first sentence.",
  },
  {
    mode: "competitor_killer",
    title: "Competitor Killer",
    description:
      "Defend your differentiation against a confident, well-prepared VP of Sales from a competitor.",
    icon: Swords,
    opener:
      "So you're the new entrant. We've been doing this since 2019, with 400+ enterprise customers. Let me hear what you think makes you different — I'm sure I've got an answer.",
  },
  {
    mode: "premortem",
    title: "Pre-Mortem",
    description:
      "It's 18 months from now. The company shut down. Walk through what went wrong.",
    icon: Skull,
    opener:
      "It's October 2027. You ran out of runway and shut down last month. I want to understand what went wrong — and don't give me the polite version. Where did it start to break?",
  },
  {
    mode: "why_not_done",
    title: "Why Hasn't This Been Done?",
    description:
      "A senior VC stress-tests whether you have an earned secret. The bar is high.",
    icon: HelpCircle,
    opener:
      "Stop me if you've heard this one. If this is such an obviously good idea, why hasn't anyone built it yet? And 'people are dumb' isn't an answer — Ironclad has 400 employees.",
  },
];

export function AdversarialSimulator({ dealId, ventureDescription }: Props) {
  const [activeMode, setActiveMode] = useState<ModeDef | null>(null);
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function startMode(modeDef: ModeDef) {
    setActiveMode(modeDef);
    setMessages([{ role: "assistant", content: modeDef.opener }]);
    setInput("");
  }

  function closeMode() {
    setActiveMode(null);
    setMessages([]);
    setInput("");
  }

  async function handleSend() {
    if (!input.trim() || loading || !activeMode) return;
    const userMsg: DiscoveryMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await runAdversarial({
        deal_id: dealId,
        mode: activeMode.mode,
        venture_description: ventureDescription,
        messages: nextMessages,
      });
      setMessages([
        ...nextMessages,
        { role: "assistant", content: response.message },
      ]);
    } catch {
      toast.error("Adversary failed to respond. Try again.");
      setMessages(messages);
      setInput(userMsg.content);
    } finally {
      setLoading(false);
    }
  }

  if (activeMode) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <activeMode.icon className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-semibold">{activeMode.title}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {activeMode.description}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={closeMode}>
            <X className="mr-1 h-3 w-3" />
            End Drill
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div
              ref={scrollRef}
              className="max-h-[60vh] min-h-[400px] space-y-4 overflow-y-auto p-4"
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
            </div>
            <div className="border-t p-3">
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
                  placeholder="Your response..."
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Adversarial Drills</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Stress-test your thinking against four hostile personas. The point is
          to surface holes in your story before a real prospect does.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <Card key={m.mode} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-[var(--accent)]">
                <m.icon className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">{m.title}</CardTitle>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button onClick={() => startMode(m)} className="w-full">
                Start Drill
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-6 rounded-md border border-dashed bg-[var(--muted)]/30 p-4">
        <div className="flex items-start gap-3">
          <Badge variant="secondary">Tip</Badge>
          <p className="text-sm text-[var(--muted-foreground)]">
            Run one of these drills 10 minutes before any pitch meeting. Even if
            you "lose," you'll discover the question you're least prepared for.
          </p>
        </div>
      </div>
    </div>
  );
}
