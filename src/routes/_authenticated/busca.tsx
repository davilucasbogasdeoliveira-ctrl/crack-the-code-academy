import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MODULES, trackLabel, type Section } from "@/content/modules";
import { useAccess } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/busca")({
  head: () => ({
    meta: [
      { title: "Busca — The Code Academy" },
      { name: "description", content: "Busque aulas, módulos e exemplos de código dentro das suas linguagens liberadas." },
      { property: "og:title", content: "Busca — The Code Academy" },
      { property: "og:description", content: "Encontre rapidamente qualquer assunto dentro do curso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuscaPage,
});

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function snippet(text: string, q: string) {
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return text.slice(0, 140) + "…";
  const start = Math.max(0, i - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + 180) + "…";
}

function BuscaPage() {
  const { user } = Route.useRouteContext();
  const { loading, tracks } = useAccess(user.id, user.email);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim();
    if (term.length < 2) return [];
    const pool = MODULES.filter((m) => tracks.includes(m.track));
    const out: { moduleId: string; title: string; track: string; where: string; text: string }[] = [];
    for (const m of pool) {
      if (norm(m.title + " " + m.summary).includes(norm(term))) {
        out.push({ moduleId: m.id, title: m.title, track: m.track, where: "Módulo", text: snippet(m.summary, term) });
      }
      for (const s of m.sections as Section[]) {
        const hay = `${s.heading} ${s.body ?? ""} ${s.code?.source ?? ""}`;
        if (norm(hay).includes(norm(term))) {
          out.push({ moduleId: m.id, title: m.title, track: m.track, where: s.heading, text: snippet(s.body ?? s.code?.source ?? "", term) });
        }
      }
    }
    return out.slice(0, 60);
  }, [q, tracks]);

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao curso</Link>
      <h1 className="mt-4 text-4xl font-bold">🔍 Busca no curso</h1>
      <p className="mt-2 text-muted-foreground">
        Digite um assunto (ex.: <span className="font-mono">array</span>, <span className="font-mono">função</span>,{" "}
        <span className="font-mono">classe</span>) e encontre a aula exata.
      </p>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar em todas as suas linguagens…"
        className="mt-6 w-full rounded-xl border border-border bg-card/60 px-5 py-4 text-lg outline-none focus:border-primary"
      />

      {q.trim().length >= 2 && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {results.length} resultado{results.length === 1 ? "" : "s"}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {results.map((r, i) => (
          <Link
            key={`${r.moduleId}-${i}`}
            to="/curso/$moduleId"
            params={{ moduleId: r.moduleId }}
            className="block rounded-lg border border-border bg-card/60 p-4 hover:border-primary"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`rounded-full bg-${r.track}/15 px-2 py-0.5 font-mono text-[10px] uppercase text-${r.track}`}>
                {trackLabel(r.track as never)}
              </span>
              <span className="font-semibold">{r.title}</span>
              <span className="text-xs text-muted-foreground">· {r.where}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
          </Link>
        ))}
        {q.trim().length >= 2 && results.length === 0 && (
          <p className="rounded-lg border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Nada encontrado para “{q}”. Tente outra palavra.
          </p>
        )}
      </div>
    </div>
  );
}
