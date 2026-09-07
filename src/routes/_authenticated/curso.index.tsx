import { createFileRoute, Link } from "@tanstack/react-router";
import { TRACKS, modulesByTrack, type Track } from "@/content/modules";
import { useAccess, type SubRow } from "@/lib/access";
import { useProgress, trackProgress } from "@/lib/progress";
import { computeStats } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/curso/")({ component: CursoIndex });

const WHATSAPP_LINK = `https://wa.me/5514998422445?text=${encodeURIComponent(
  "Olá! Quero liberar o acesso a uma linguagem do The Code Academy.",
)}`;

function CursoIndex() {
  const { user } = Route.useRouteContext();
  const { loading, isAdmin, sub, active, tracks } = useAccess(user.id, user.email);
  const { rows: progressRows, loading: progressLoading } = useProgress(user.id);

  if (loading || progressLoading)
    return <div className="mx-auto max-w-6xl px-6 py-16 text-center text-muted-foreground">Carregando…</div>;

  if (!active) return <LockedScreen sub={sub} email={user.email!} />;

  const unlocked = TRACKS.filter((t) => tracks.includes(t.id));
  const locked = TRACKS.filter((t) => !tracks.includes(t.id));

  const stats = computeStats(progressRows);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Área do aluno</h1>
          <p className="mt-2 text-muted-foreground">
            {isAdmin ? (
              "Acesso total (admin)"
            ) : (
              <>
                Plano <span className="font-mono text-primary">Vitalício</span> • acesso para sempre ✨
              </>
            )}
          </p>
        </div>
        <Link
          to="/progresso"
          className="flex min-w-72 flex-col gap-2 rounded-2xl border border-border bg-card/60 px-5 py-4 hover:border-primary"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">{stats.streak >= 3 ? "🔥" : "⭐"}</div>
            <div>
              <p className="font-mono text-sm font-bold text-primary">
                Nível {stats.level.level} · {stats.level.name} · {stats.xp.toLocaleString("pt-BR")} XP
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.streak > 0 ? `🔥 ${stats.streak} dias de sequência` : `${stats.completedCount} módulos concluídos`}
                {stats.quizXpTotal > 0 && ` · 🎯 ${stats.quizXpTotal} XP de quizzes`}
              </p>
            </div>
          </div>
          {stats.level.nextName && (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.level.percent}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Faltam {stats.level.xpToNext} XP para {stats.level.nextName}
              </p>
            </div>
          )}
        </Link>
      </div>

      {unlocked.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold">Nenhuma linguagem liberada ainda</h2>
          <p className="mt-2 text-muted-foreground">
            Seu acesso está ativo, mas nenhuma linguagem foi atribuída à sua conta. Fale comigo no WhatsApp.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-block rounded-md bg-success px-5 py-3 font-semibold text-success-foreground hover:opacity-90">
            WhatsApp (14) 99842-2445
          </a>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          {unlocked.map((t) => (
            <TrackList key={t.id} track={t.id} title={t.name} modules={modulesByTrack(t.id)} progressRows={progressRows} />
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-bold">Linguagens não liberadas na sua conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada linguagem é vendida separadamente, com acesso vitalício. Fale comigo para liberar mais alguma.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card/40 p-5 opacity-80">
                <div className="flex items-baseline justify-between">
                  <h3 className={`font-mono text-lg font-bold text-${t.id}`}>{t.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{modulesByTrack(t.id).length} módulos</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Liberar {t.name} →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrackList({
  track,
  title,
  modules,
  progressRows,
}: {
  track: Track;
  title: string;
  modules: ReturnType<typeof modulesByTrack>;
  progressRows: ReturnType<typeof useProgress>["rows"];
}) {
  const { completed, total, percent } = trackProgress(progressRows, track);
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <h2 className={`font-mono text-2xl font-bold text-${track}`}>{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{completed}/{total} concluídos</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className={`h-full bg-${track} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mb-4">
        {percent === 100 ? (
          <Link
            to="/certificado/$track"
            params={{ track }}
            className="inline-flex items-center gap-2 rounded-md bg-success px-3 py-2 text-sm font-medium text-success-foreground hover:opacity-90"
          >
            🏆 Ver meu certificado de {title}
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">
            Conclua os {total} módulos para liberar o certificado de {title}.
          </p>
        )}
      </div>

      <div className="space-y-2">
        {modules.map((m) => {
          const row = progressRows.find((r) => r.module_id === m.id);
          const done = row?.completed;
          return (
            <Link key={m.id} to="/curso/$moduleId" params={{ moduleId: m.id }}
              className="block rounded-lg border border-border bg-card/60 p-4 transition hover:border-primary hover:bg-card">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono text-sm text-${track}`}>{String(m.index).padStart(2, "0")}</span>
                  <h3 className="font-semibold">{m.title}</h3>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{m.duration}</span>
              </div>
              <div className="mt-1 ml-9 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{m.summary}</p>
                {done && <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">✓ concluído</span>}
                {row && row.practice_count > 0 && !done && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{row.practice_count} prática{row.practice_count > 1 ? "s" : ""}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function LockedScreen({ sub, email }: { sub: SubRow | null; email: string }) {
  const status = sub?.status ?? "pending";
  const messages: Record<string, { title: string; body: string; tone: "warning" | "destructive" }> = {
    pending: { title: "Aguardando liberação do acesso", body: "Sua conta foi criada. Fale comigo no WhatsApp para escolher a linguagem e liberar o acesso vitalício.", tone: "warning" },
    expired: { title: "Acesso não liberado", body: "Fale comigo no WhatsApp para reativar seu acesso.", tone: "warning" },
    blocked: { title: "Acesso bloqueado", body: "Entre em contato para regularizar.", tone: "destructive" },
    active: { title: "Aguardando confirmação", body: "Acesso em processamento. Fale comigo no WhatsApp.", tone: "warning" },
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
            <li>1. Escolha a linguagem que quer aprender (HTML, CSS, Java, Python ou C/C++)</li>
            <li>2. Envie o comprovante do pagamento (PIX/etc)</li>
            <li>3. Inclua seu email cadastrado: <span className="font-mono text-primary">{email}</span></li>
            <li>4. WhatsApp: <a className="font-mono text-success hover:underline" target="_blank" rel="noopener noreferrer" href={WHATSAPP_LINK}>(14) 99842-2445</a></li>
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

