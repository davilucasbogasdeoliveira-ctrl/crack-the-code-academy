import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccess } from "@/lib/access";
import { useProgress } from "@/lib/progress";
import { computeStats, todayKey, XP_PER_MODULE } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/progresso")({
  head: () => ({
    meta: [
      { title: "Meu Progresso — The Code Academy" },
      { name: "description", content: "Acompanhe seu XP, nível, sequência de estudos e conquistas na The Code Academy." },
      { property: "og:title", content: "Meu Progresso — The Code Academy" },
      { property: "og:description", content: "XP, níveis, streak de estudos e conquistas do aluno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgressoPage,
});

function ProgressoPage() {
  const { user } = Route.useRouteContext();
  const { loading, tracks } = useAccess(user.id, user.email);
  const { rows, loading: progressLoading } = useProgress(user.id);

  if (loading || progressLoading)
    return <div className="mx-auto max-w-5xl px-6 py-16 text-center text-muted-foreground">Carregando…</div>;

  const s = computeStats(rows);
  const mine = s.perTrack.filter((p) => tracks.includes(p.track));
  const firstName = (user.email ?? "aluno").split("@")[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link to="/curso" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao curso</Link>

      <h1 className="mt-4 text-4xl font-bold">
        Olá, <span className="gradient-text">{firstName}</span>!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Nível {s.level.level} — <span className="font-semibold text-foreground">{s.level.name}</span>
      </p>

      {/* Barra de nível */}
      <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-sm text-primary">⭐ {s.xp.toLocaleString("pt-BR")} XP</span>
          <span className="font-mono text-xs text-muted-foreground">
            {s.level.nextName ? `faltam ${s.level.xpToNext} XP para ${s.level.nextName}` : "nível máximo 🎉"}
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${s.level.percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada módulo concluído vale {XP_PER_MODULE} XP, cada exercício enviado vale 25 XP e cada quiz vale até 50 XP.
        </p>
      </div>

      {/* Cards resumo */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="🔥" value={`${s.streak}`} label={s.streak === 1 ? "dia de sequência" : "dias de sequência"} />
        <Stat icon="📚" value={`${s.completedCount}`} label="módulos concluídos" />
        <Stat icon="⌨️" value={`${s.practices}`} label="exercícios praticados" />
        <Stat icon="🏅" value={`${s.unlockedCount}/${s.achievements.length}`} label="conquistas" />
      </div>

      {/* Progresso geral */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Progresso geral</h2>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
            <div className="h-full bg-success transition-all duration-700" style={{ width: `${s.overallPercent}%` }} />
          </div>
          <span className="font-mono text-sm">{s.overallPercent}%</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {s.completedCount} de {s.totalModules} módulos de todas as linguagens da plataforma.
        </p>
      </section>

      {/* Linguagens */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Suas linguagens</h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma linguagem liberada na sua conta ainda.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {mine.map((p) => (
              <div key={p.track}>
                <div className="flex items-baseline justify-between">
                  <span className={`font-mono font-bold text-${p.track}`}>{p.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.done}/{p.total} · {p.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className={`h-full bg-${p.track} transition-all duration-700`} style={{ width: `${p.percent}%` }} />
                </div>
                {p.percent === 100 && (
                  <Link to="/certificado/$track" params={{ track: p.track }} className="mt-1 inline-block text-xs text-success hover:underline">
                    🏆 Ver certificado de {p.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Meta semanal */}
      <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-xl font-bold">🎯 Próximo objetivo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Concluir {s.weekGoal} módulos esta semana · recompensa: <span className="font-mono text-primary">+500 XP de ritmo</span>
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((s.weekDone / s.weekGoal) * 100))}%` }}
            />
          </div>
          <span className="font-mono text-xs">{s.weekDone}/{s.weekGoal}</span>
        </div>
      </section>

      {/* Calendário de streak */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">🔥 Sequência de estudos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Últimos 35 dias — cada quadrado aceso é um dia em que você estudou.</p>
        <div className="mt-4 grid grid-cols-7 gap-2 sm:w-fit">
          {Array.from({ length: 35 }, (_, i) => 34 - i).map((offset) => {
            const key = todayKey(offset);
            const on = s.days.has(key);
            return (
              <div
                key={key}
                title={key}
                className={`h-8 w-8 rounded-md border text-center text-[10px] leading-8 ${
                  on ? "border-success bg-success/25 text-success" : "border-border bg-card/40 text-muted-foreground"
                }`}
              >
                {Number(key.slice(-2))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Conquistas */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">🏅 Conquistas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 transition ${
                a.unlocked ? "border-success/40 bg-success/5" : "border-border bg-card/30 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.unlocked ? a.icon : "🔒"}</span>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 font-mono text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
