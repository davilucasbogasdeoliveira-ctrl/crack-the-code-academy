import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findModule, MODULES, trackLabel } from "@/content/modules";
import { PracticeBox } from "@/components/PracticeBox";
import { moduleVideos, moduleStudyGuide } from "@/content/extras";
import { useAccess } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/curso/$moduleId")({
  loader: ({ params }) => {
    const m = findModule(params.moduleId);
    if (!m) throw notFound();
    return { module: m };
  },
  component: ModulePage,
});

function ModulePage() {
  const { module: mod } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const { loading, tracks } = useAccess(user.id, user.email);

  if (loading)
    return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">Verificando acesso…</div>;

  if (!tracks.includes(mod.track))
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Linguagem não liberada</h1>
        <p className="mt-2 text-muted-foreground">
          Seu plano não inclui a trilha de <span className="font-mono">{trackLabel(mod.track)}</span>. Fale comigo no
          WhatsApp (14) 99842-2445 para liberar.
        </p>
        <Link to="/curso" className="mt-6 inline-block text-primary hover:underline">Voltar</Link>
      </div>
    );

  const sameTrack = MODULES.filter((x) => x.track === mod.track);
  const idx = sameTrack.findIndex((x) => x.id === mod.id);
  const prev = idx > 0 ? sameTrack[idx - 1] : null;
  const next = idx < sameTrack.length - 1 ? sameTrack[idx + 1] : null;
  const videos = moduleVideos(mod);
  const guide = moduleStudyGuide(mod);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground">← Voltar aos módulos</Link>

      <div className="mt-4 flex items-baseline gap-4">
        <span className={`font-mono text-xl text-${mod.track}`}>{String(mod.index).padStart(2, "0")}</span>
        <span className={`rounded-full bg-${mod.track}/15 px-3 py-0.5 text-xs font-mono text-${mod.track} uppercase`}>
          {trackLabel(mod.track)}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{mod.duration}</span>
      </div>
      <h1 className="mt-3 text-4xl font-bold">{mod.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{mod.summary}</p>

      <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
        <h2 className="font-mono text-sm text-primary">// como estudar este módulo</h2>
        <p className="mt-2 text-foreground/90 leading-relaxed">{guide.howToStudy}</p>
      </div>

      <div className="mt-10 space-y-10">
        {mod.sections.map((s: typeof mod.sections[number], i: number) => (
          <section key={i}>
            <h2 className="mb-3 flex items-baseline gap-3 text-2xl font-bold">
              <span className={`font-mono text-sm text-${mod.track}`}>§{i + 1}</span>
              {s.heading}
            </h2>
            {s.body && <p className="text-foreground/90 leading-relaxed">{s.body}</p>}
            {s.code && (
              <pre className="mt-3"><code className={`language-${s.code.lang}`}>{s.code.source}</code></pre>
            )}
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-xl font-bold">Erros comuns que travam o aluno aqui</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/90">
          {guide.mistakes.map((m) => (
            <li key={m} className="flex gap-2"><span className="text-destructive">✗</span>{m}</li>
          ))}
        </ul>
      </section>

      <PracticeBox mod={mod} />

      <section className="mt-12 rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-bold">🎥 Aulas em vídeo para reforçar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assista depois de ler o módulo — ver alguém digitando o código fixa o conteúdo.
        </p>
        <div className="mt-4 space-y-2">
          {videos.map((v) => (
            <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3 text-sm hover:border-primary">
              <span>{v.title}</span>
              <span className="font-mono text-xs text-muted-foreground uppercase">{v.kind} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-success/30 bg-success/5 p-6">
        <h2 className="text-xl font-bold">Checklist: só avance se marcar tudo</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/90">
          {guide.checklist.map((c) => (
            <li key={c} className="flex gap-2"><span className="text-success">✓</span>{c}</li>
          ))}
        </ul>
      </section>

      <div className="mt-16 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link to="/curso/$moduleId" params={{ moduleId: prev.id }} className="text-sm hover:text-primary">
            ← {String(prev.index).padStart(2, "0")}. {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link to="/curso/$moduleId" params={{ moduleId: next.id }} className="text-sm text-right hover:text-primary">
            {String(next.index).padStart(2, "0")}. {next.title} →
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
