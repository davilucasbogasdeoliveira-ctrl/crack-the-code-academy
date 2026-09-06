import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askTutor } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/ia")({
  head: () => ({
    meta: [
      { title: "Tutor I.A — The Code Academy" },
      { name: "description", content: "Tire dúvidas de programação a qualquer hora com o tutor de inteligência artificial da The Code Academy." },
      { property: "og:title", content: "Tutor I.A — The Code Academy" },
      { property: "og:description", content: "Pergunte sobre HTML, CSS, JavaScript, Python, Java e mais — resposta na hora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IaPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Explica o que é uma variável com um exemplo simples",
  "Qual a diferença entre HTML, CSS e JavaScript?",
  "Meu código Python deu IndentationError, o que é isso?",
  "Me dá um exercício fácil de JavaScript para praticar",
];

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.role === "user";
  const parts = msg.content.split(/```/g);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-[0.95rem] leading-7 ${
          mine ? "bg-primary/15 border border-primary/30" : "border border-border bg-card"
        }`}
      >
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <pre key={i} className="my-2 overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">
              <code>{part.replace(/^[a-zA-Z]*\n/, "")}</code>
            </pre>
          ) : (
            <span key={i} className="whitespace-pre-line">{part}</span>
          ),
        )}
      </div>
    </div>
  );
}

function IaPage() {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Oi! Eu sou o CodeBot, seu tutor de programação. Pode perguntar qualquer dúvida sobre as aulas, colar um erro do seu código ou pedir um exercício. Vamos lá?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await ask({ data: { messages: next.slice(1).slice(-12) } });
      setMessages((m) => [...m, { role: "assistant", content: r.text }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Não consegui responder agora. Tente de novo em instantes." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-mono text-2xl font-bold">
        Tutor I.A<span className="text-primary">.</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pergunte o que quiser sobre programação — o CodeBot responde na hora, em português.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-border bg-card/40 p-4">
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {loading && <p className="animate-pulse font-mono text-xs text-muted-foreground">CodeBot está digitando…</p>}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="Escreva sua dúvida… (Enter envia, Shift+Enter pula linha)"
          className="min-h-[56px] flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </main>
  );
}
