import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findModule, MODULES, trackLabel, type Section, type Track } from "@/content/modules";
import { PracticeBox } from "@/components/PracticeBox";
import { ReadAloud } from "@/components/ReadAloud";

import { moduleVideos, moduleStudyGuide } from "@/content/extras";
import { chunkText, oneLiner, readingMinutes, BREAK_TIPS } from "@/content/simplify";
import { explainJargon } from "@/content/glossary";
import { useAccess } from "@/lib/access";
import { useProgress, moduleProgress, trackProgress } from "@/lib/progress";
import { useEffect, useState } from "react";


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
  const { rows: progressRows, loading: progressLoading, upsert } = useProgress(user.id);
  const row = moduleProgress(progressRows, mod.id);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(row?.notes ?? "");
  const [focusOn, setFocus] = useState(false);
  const [step, setStep] = useState(0);
  const focus = focusOn;

  useEffect(() => {
    setFocus(localStorage.getItem("crackdev-focus") === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("crackdev-focus", focusOn ? "1" : "0");
  }, [focusOn]);
  useEffect(() => {
    setStep(0);
  }, [mod.id]);


  if (loading || progressLoading)
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
  const allSections = mod.sections.map((s: Section, i: number) => ({ s, i }));
  const visibleSections = focus ? allSections.slice(step, step + 1) : allSections;


  async function markComplete() {
    setSaving(true);
    await upsert(mod.id, { completed: true, completed_at: new Date().toISOString() });
    setSaving(false);
  }

  async function saveNotes() {
    setSaving(true);
    await upsert(mod.id, { notes });
    setSaving(false);
  }

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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={markComplete}
          disabled={row?.completed || saving}
          className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:opacity-90 disabled:opacity-60"
        >
          {row?.completed ? "✓ Módulo concluído" : "Marcar como concluído"}
        </button>
        {row?.practice_count ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
            {row.practice_count} prática{row.practice_count > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-sm text-primary">// prefere ouvir em vez de ler?</h2>
          <ReadAloud
            text={`${mod.title}. ${mod.summary}. ${mod.sections.map((s: Section) => `${s.heading}. ${s.body ?? ""}`).join(" ")}`}
            label="Ouvir o módulo inteiro"
          />
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
        <h2 className="font-mono text-sm text-primary">// como estudar este módulo</h2>
        <p className="mt-2 leading-relaxed text-foreground/90">{guide.howToStudy}</p>
      </div>


      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div>
          <p className="font-semibold">🧠 Modo foco</p>
          <p className="text-sm text-muted-foreground">
            Mostra <strong>uma parte por vez</strong>, com resumo e pausas. Ideal se você se perde em textos longos.
          </p>
        </div>
        <button
          onClick={() => { setFocus(!focus); setStep(0); }}
          className={`rounded-md px-4 py-2 text-sm font-medium ${focus ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-accent"}`}
        >
          {focus ? "Modo foco ligado" : "Ligar modo foco"}
        </button>
      </div>

      {focus && (
        <div className="mt-4 flex items-center gap-2">
          {mod.sections.map((_: unknown, i: number) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {step + 1}/{mod.sections.length}
          </span>
        </div>
      )}

      <div className="mt-10 space-y-10">
        {visibleSections.map(({ s, i }: { s: Section; i: number }) => (
          <SectionBlock key={i} s={s} i={i} track={mod.track} />
        ))}
      </div>

      {focus && (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-40"
          >
            ← Parte anterior
          </button>
          <button
            onClick={() => setStep(Math.min(mod.sections.length - 1, step + 1))}
            disabled={step >= mod.sections.length - 1}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            Entendi, próxima parte →
          </button>
        </div>
      )}

      {focus && (step + 1) % 3 === 0 && step < mod.sections.length - 1 && (
        <p className="mt-4 rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
          ⏸ {BREAK_TIPS[Math.floor(step / 3) % BREAK_TIPS.length]}
        </p>
      )}



      <section className="mt-12 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-xl font-bold">Erros comuns que travam o aluno aqui</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/90">
          {guide.mistakes.map((m) => (
            <li key={m} className="flex gap-2"><span className="text-destructive">✗</span>{m}</li>
          ))}
        </ul>
      </section>

      <PracticeBox mod={mod} onSubmit={() => upsert(mod.id, {})} />

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
        {trackDone && (
          <Link
            to="/certificado/$track"
            params={{ track: mod.track }}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:opacity-90"
          >
            🏆 Você concluiu {trackLabel(mod.track)} — pegar meu certificado
          </Link>
        )}
      </section>


      <section className="mt-8 rounded-xl border border-border bg-card/50 p-6">
        <h2 className="text-xl font-bold">📝 Minhas anotações</h2>
        <p className="mt-1 text-sm text-muted-foreground">Salve observações ou dúvidas particulares deste módulo.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="mt-3 w-full rounded-md border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Ex: preciso revisar laço while, link do vídeo que me ajudou..."
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveNotes}
            disabled={saving}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar anotações"}
          </button>
        </div>
      </section>

      <div className="mt-16 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link to="/curso/$moduleId" params={{ moduleId: prev.id }} className="text-sm hover:text-primary">
            ← {String(prev.index).padStart(2, "0")}. {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link to="/curso/$moduleId" params={{ moduleId: next.id }} className="text-right text-sm hover:text-primary">
            {String(next.index).padStart(2, "0")}. {next.title} →
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}

function SectionBlock({ s, i, track }: { s: Section; i: number; track: Track }) {
  const parts = s.body ? chunkText(s.body) : [];
  const jargon = s.body ? explainJargon(s.body) : [];
  const minutes = s.body ? readingMinutes(s.body) : 1;

  return (
    <section>
      <h2 className="mb-2 flex flex-wrap items-baseline gap-3 text-2xl font-bold">
        <span className={`font-mono text-sm text-${track}`}>§{i + 1}</span>
        {s.heading}
        <span className="font-mono text-xs font-normal text-muted-foreground">~{minutes} min de leitura</span>
      </h2>

      {s.body && (
        <div className="mb-4">
          <ReadAloud text={`${s.heading}. ${s.body}`} label="Ouvir esta parte" />
        </div>
      )}

      {s.body && (
        <div className="mb-4 rounded-lg border border-primary/25 bg-primary/5 p-4">
          <p className="font-mono text-xs uppercase text-primary">em 1 frase</p>
          <p className="mt-1 text-foreground/90">{oneLiner(s.body)}</p>
        </div>
      )}


      <div className="space-y-3">
        {parts.map((p, k) => (
          <p key={k} className="text-[1.05rem] leading-8 text-foreground/90">{p}</p>
        ))}
      </div>

      {s.code && (
        <div className="mt-4">
          <p className="mb-1 font-mono text-xs text-muted-foreground">// digite este código você mesmo, não copie</p>
          <pre><code className={`language-${s.code.lang}`}>{s.code.source}</code></pre>
        </div>
      )}

      {jargon.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
          <p className="font-mono text-xs uppercase text-muted-foreground">traduzindo o jargão</p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
            {jargon.map((j) => (
              <li key={j.term}>
                <span className="font-mono text-primary">{j.term}</span> — {j.meaning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
