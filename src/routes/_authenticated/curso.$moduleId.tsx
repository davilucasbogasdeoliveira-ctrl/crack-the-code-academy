import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findModule, MODULES, trackLabel } from "@/content/modules";
import { PracticeBox } from "@/components/PracticeBox";

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
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      const [{ data: s }, { data: r }] = await Promise.all([
        supabase.from("subscriptions").select("status,expires_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
      ]);
      const isAdmin = !!r;
      const active = s && s.status === "active" && (!s.expires_at || new Date(s.expires_at) > new Date());
      setAllowed(isAdmin || !!active);
    }
    check();
  }, [user.id]);

  if (allowed === null) return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">Verificando acesso…</div>;
  if (!allowed) return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Acesso não liberado</h1>
      <p className="mt-2 text-muted-foreground">Sua assinatura não está ativa.</p>
      <Link to="/curso" className="mt-6 inline-block text-primary hover:underline">Voltar</Link>
    </div>
  );

  const sameTrack = MODULES.filter((x) => x.track === mod.track);
  const idx = sameTrack.findIndex((x) => x.id === mod.id);
  const prev = idx > 0 ? sameTrack[idx - 1] : null;
  const next = idx < sameTrack.length - 1 ? sameTrack[idx + 1] : null;

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

      <PracticeBox mod={mod} />

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
