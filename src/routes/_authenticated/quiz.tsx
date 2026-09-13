import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TRACKS, type Track } from "@/content/modules";
import { quizBank, randomQuiz, type QuizQuestion } from "@/content/quizzes";
import { useAccess } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({
    meta: [
      { title: "Modo Quiz — treine a linguagem | The Code Academy" },
      {
        name: "description",
        content:
          "Escolha uma linguagem e treine com um quiz aleatório: perguntas embaralhadas, explicação de cada resposta e lista do que revisar.",
      },
      { property: "og:title", content: "Modo Quiz — treine a linguagem" },
      {
        property: "og:description",
        content: "Quiz de treino por linguagem com correção na hora e dicas de revisão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizTrainer,
});

const BEST_KEY = "tca-quiz-treino";

function readBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function QuizTrainer() {
  const { user } = Route.useRouteContext();
  const access = useAccess(user.id, user.email);

  const [track, setTrack] = useState<Track | null>(null);
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);

  const available = useMemo(
    () => TRACKS.filter((t) => access.tracks.includes(t.id)),
    [access.tracks],
  );
  const best = useMemo(() => (typeof window === "undefined" ? {} : readBest()), [questions]);

  function start(t: Track, n: number) {
    setTrack(t);
    setCount(n);
    setQuestions(randomQuiz(t, n));
  }

  function finish(scorePercent: number) {
    if (!track) return;
    const all = readBest();
    if ((all[track] ?? 0) < scorePercent) {
      all[track] = scorePercent;
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">🎯 Modo Quiz</h1>
      <p className="mt-2 text-muted-foreground">
        Escolha uma linguagem, defina quantas perguntas e treine. As perguntas vêm embaralhadas a cada
        rodada.
      </p>

      {access.loading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">Carregando…</p>
      ) : available.length === 0 ? (
        <div className="mt-8 rounded-xl border border-warning/40 bg-warning/10 p-6">
          <p className="font-semibold">Nenhuma linguagem liberada ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assim que sua linguagem for liberada, o modo quiz aparece aqui.
          </p>
        </div>
      ) : !questions || !track ? (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {available.map((t) => (
              <button
                key={t.id}
                onClick={() => start(t.id, count)}
                className="rounded-xl border border-border bg-card/60 p-5 text-left transition hover:border-primary"
              >
                <p className={`font-mono text-xs uppercase text-${t.id}`}>{t.tag}</p>
                <p className="mt-1 text-lg font-bold">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quizBank(t.id).length} perguntas no banco
                  {best[t.id] ? ` · melhor: ${best[t.id]}%` : ""}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Perguntas por rodada:</span>
            {[3, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  count === n ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      ) : (
        <TrainingRound
          key={questions.map((q) => q.q).join("|")}
          questions={questions}
          trackName={TRACKS.find((t) => t.id === track)?.name ?? track}
          bestScore={best[track] ?? 0}
          onFinish={finish}
          onAgain={() => start(track, count)}
          onBack={() => {
            setQuestions(null);
            setTrack(null);
          }}
        />
      )}
    </main>
  );
}

function TrainingRound({
  questions,
  trackName,
  bestScore,
  onFinish,
  onAgain,
  onBack,
}: {
  questions: QuizQuestion[];
  trackName: string;
  bestScore: number;
  onFinish: (score: number) => void;
  onAgain: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[step];
  const score = Math.round((correct / total) * 100);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
    else setWrongTopics((t) => [...t, q.topic]);
  }

  function next() {
    if (step + 1 >= total) {
      setDone(true);
      onFinish(score);
    } else {
      setStep((s) => s + 1);
      setPicked(null);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Treino de {trackName}</h2>
        <div className="flex items-center gap-2">
          {bestScore > 0 && (
            <span className="rounded-full bg-success/15 px-3 py-1 font-mono text-xs text-success">
              Melhor: {bestScore}%
            </span>
          )}
          <button onClick={onBack} className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent">
            Trocar linguagem
          </button>
        </div>
      </div>

      {!done ? (
        <div className="mt-5">
          <div className="mb-4 flex items-center gap-2">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-success" : i === step ? "bg-primary" : "bg-border"}`}
              />
            ))}
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              {step + 1}/{total}
            </span>
          </div>

          <p className="font-semibold">{q.q}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              let cls = "border-border bg-background hover:border-primary";
              if (picked !== null) {
                if (i === q.answer) cls = "border-success bg-success/15 text-success";
                else if (i === picked) cls = "border-destructive bg-destructive/15 text-destructive";
                else cls = "border-border bg-background opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={`rounded-lg border px-4 py-3 text-left font-mono text-sm transition ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="mt-4 rounded-lg border border-border bg-card/60 p-4 text-sm">
              <p className={picked === q.answer ? "font-semibold text-success" : "font-semibold text-destructive"}>
                {picked === q.answer ? "✓ Acertou!" : "✗ Não foi dessa vez."}
              </p>
              <p className="mt-1 text-foreground/90">{q.why}</p>
              <button
                onClick={next}
                className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {step + 1 >= total ? "Ver resultado" : "Próxima pergunta →"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-border bg-card/60 p-6 text-center">
          <p className="text-5xl font-bold">{score}%</p>
          <p className="mt-2 font-semibold">
            {score === 100
              ? "🏆 Perfeito! Você dominou este assunto."
              : score >= 60
                ? "👏 Mandou bem! Revise os pontos abaixo."
                : "💪 Bora treinar mais uma rodada."}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {correct} de {total} corretas
          </p>

          {wrongTopics.length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-left">
              <p className="font-mono text-xs uppercase text-warning">revise estes assuntos</p>
              <ul className="mt-2 space-y-1 text-sm">
                {wrongTopics.map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={onAgain}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Nova rodada
            </button>
            <button onClick={onBack} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
              Trocar linguagem
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
