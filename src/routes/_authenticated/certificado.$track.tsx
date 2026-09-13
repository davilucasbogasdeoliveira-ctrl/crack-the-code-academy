import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TRACKS, modulesByTrack, trackLabel, type Track } from "@/content/modules";
import { useAccess } from "@/lib/access";
import { useProgress, trackProgress } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { makeCertificateCode } from "@/lib/certificates";


const TRACK_IDS = TRACKS.map((t) => t.id) as Track[];

export const Route = createFileRoute("/_authenticated/certificado/$track")({
  loader: ({ params }) => {
    if (!TRACK_IDS.includes(params.track as Track)) throw notFound();
    return { track: params.track as Track };
  },
  component: CertificatePage,
});

function CertificatePage() {
  const { track } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const { loading, tracks } = useAccess(user.id, user.email);
  const { rows, loading: progressLoading } = useProgress(user.id);
  const [certCode, setCertCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tca-nome");
    if (saved) setName(saved);
  }, []);
  useEffect(() => {
    if (name) localStorage.setItem("tca-nome", name);
  }, [name]);

  useEffect(() => {
    if (progressLoading) return;
    if (trackProgress(rows, track).percent !== 100) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("code")
        .eq("user_id", user.id)
        .eq("track", track)
        .maybeSingle();
      if (cancelled) return;
      if (data?.code) {
        setCertCode(data.code);
        return;
      }
      const newCode = makeCertificateCode(track);
      await supabase.from("certificates").insert({ user_id: user.id, track, code: newCode });
      if (!cancelled) setCertCode(newCode);
    })();
    return () => {
      cancelled = true;
    };
  }, [progressLoading, rows, track, user.id]);


  if (loading || progressLoading)
    return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">Carregando…</div>;

  if (!tracks.includes(track))
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Linguagem não liberada</h1>
        <Link to="/curso" className="mt-6 inline-block text-primary hover:underline">Voltar</Link>
      </div>
    );

  const { completed, total, percent } = trackProgress(rows, track);
  const done = percent === 100;
  const label = trackLabel(track);
  const modules = modulesByTrack(track);
  const lastDate = rows
    .filter((r) => r.track === track && r.completed_at)
    .map((r) => new Date(r.completed_at as string).getTime())
    .sort((a, b) => b - a)[0];
  const dateStr = new Date(lastDate ?? Date.now()).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const code = `TCA-${track.toUpperCase()}-${user.id.slice(0, 8).toUpperCase()}`;

  if (!done)
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Certificado de {label}</h1>
        <p className="mt-3 text-muted-foreground">
          Você concluiu <strong>{completed}</strong> de <strong>{total}</strong> módulos ({percent}%). Termine todos os
          módulos para liberar seu certificado.
        </p>
        <div className="mx-auto mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div className={`h-full bg-${track}`} style={{ width: `${percent}%` }} />
        </div>
        <Link to="/curso" className="mt-8 inline-block text-primary hover:underline">← Voltar aos módulos</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground">← Voltar aos módulos</Link>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Baixar / imprimir certificado
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border-4 border-double border-border bg-card p-10 text-center print:border-black print:bg-white">
        <div className={`absolute inset-x-0 top-0 h-2 bg-${track}`} />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">The Code Academy</p>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Certificado de Conclusão</h1>
        <p className="mt-6 text-muted-foreground">Certificamos que</p>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">{name.trim() || user.email}</p>
        <p className="mt-6 leading-relaxed text-foreground/90">
          concluiu integralmente a trilha de{" "}
          <span className={`font-mono font-bold text-${track}`}>{label}</span>, cumprindo os{" "}
          <strong>{modules.length} módulos</strong> do programa, com exercícios práticos avaliados e checklists de
          domínio de cada tópico.
        </p>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6 text-left">
          <div>
            <p className="border-t border-border pt-2 font-mono text-xs text-muted-foreground">Data de conclusão</p>
            <p className="text-sm">{dateStr}</p>
          </div>
          <div>
            <p className="border-t border-border pt-2 font-mono text-xs text-muted-foreground">Código de validação</p>
            <p className="font-mono text-sm">{code}</p>
          </div>
          <div>
            <p className="border-t border-border pt-2 font-mono text-xs text-muted-foreground">Instrutor responsável</p>
            <p className="text-sm">Gabriel de Oliveira — The Code Academy</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
        Dica: no diálogo de impressão escolha “Salvar como PDF” para guardar seu certificado.
      </p>
    </div>
  );
}
