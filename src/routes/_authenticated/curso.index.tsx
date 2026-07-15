import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACKS, modulesByTrack, type Track } from "@/content/modules";

export const Route = createFileRoute("/_authenticated/curso/")({ component: CursoIndex });

type Sub = { status: "pending" | "active" | "expired" | "blocked"; expires_at: string | null; notes: string | null };

function CursoIndex() {
  const { user } = Route.useRouteContext();
  const [sub, setSub] = useState<Sub | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: r }] = await Promise.all([
        supabase.from("subscriptions").select("status,expires_at,notes").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
      ]);
      setSub(s as Sub | null);
      setIsAdmin(!!r);
      setLoading(false);
    }
    load();
  }, [user.id]);

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-16 text-center text-muted-foreground">Carregando…</div>;

  const active = isAdmin || (sub?.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date()));

  if (!active) return <LockedScreen sub={sub} email={user.email!} />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Área do aluno</h1>
        <p className="mt-2 text-muted-foreground">
          {isAdmin ? "Acesso vitalício (admin)" : sub?.expires_at ? `Acesso válido até ${new Date(sub.expires_at).toLocaleDateString("pt-BR")}` : "Acesso ativo"}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {TRACKS.map((t) => (
          <TrackList key={t.id} track={t.id} title={t.name} modules={modulesByTrack(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TrackList({ track, title, modules }: { track: Track; title: string; modules: ReturnType<typeof modulesByTrack> }) {
  return (
    <section>
      <h2 className={`mb-4 font-mono text-2xl font-bold text-${track}`}>{title}</h2>
      <div className="space-y-2">
        {modules.map((m) => (
          <Link key={m.id} to="/curso/$moduleId" params={{ moduleId: m.id }}
            className="block rounded-lg border border-border bg-card/60 p-4 hover:border-primary hover:bg-card transition">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className={`font-mono text-sm text-${track}`}>{String(m.index).padStart(2, "0")}</span>
                <h3 className="font-semibold">{m.title}</h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{m.duration}</span>
            </div>
            <p className="mt-1 ml-9 text-sm text-muted-foreground">{m.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LockedScreen({ sub, email }: { sub: Sub | null; email: string }) {
  const status = sub?.status ?? "pending";
  const messages: Record<string, { title: string; body: string; tone: "warning" | "destructive" }> = {
    pending: { title: "Aguardando liberação do acesso", body: "Sua conta foi criada. Envie o comprovante do pagamento por email para que eu libere seu acesso.", tone: "warning" },
    expired: { title: "Sua assinatura expirou", body: "Renove sua assinatura para continuar tendo acesso ao conteúdo.", tone: "warning" },
    blocked: { title: "Acesso bloqueado", body: "Entre em contato para regularizar.", tone: "destructive" },
    active: { title: "Aguardando confirmação", body: "Assinatura ativa mas expirada. Renove.", tone: "warning" },
  };
  const m = messages[status];
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <div className="glass-card rounded-2xl p-10 text-center">
        <div className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-${m.tone}/20 text-${m.tone}`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{m.title}</h1>
        <p className="mt-3 text-muted-foreground">{m.body}</p>

        <div className="mt-8 rounded-lg border border-border bg-background/50 p-5 text-left">
          <p className="text-xs font-mono text-muted-foreground">Como liberar:</p>
          <ol className="mt-2 space-y-1 text-sm">
            <li>1. Envie o comprovante do pagamento (PIX/etc)</li>
            <li>2. Inclua seu email cadastrado: <span className="font-mono text-primary">{email}</span></li>
            <li>3. WhatsApp: <a className="font-mono text-success hover:underline" target="_blank" rel="noopener noreferrer" href="https://wa.me/5514998422445">(14) 99842-2445</a></li>
            <li>4. Email: <span className="font-mono text-foreground">davilucasbogasdeoliveira@gmail.com</span></li>
          </ol>
        </div>

        {sub?.notes && (
          <div className="mt-4 rounded-lg bg-card/50 p-4 text-left text-sm">
            <span className="font-mono text-xs text-muted-foreground">Nota do admin:</span>
            <p className="mt-1">{sub.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
