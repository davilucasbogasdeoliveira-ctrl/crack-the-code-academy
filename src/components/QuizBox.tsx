import { useMemo, useState } from "react";
import { quizFor } from "@/content/quizzes";
import type { Module } from "@/content/modules";

type Props = {
  mod: Module;
  bestScore: number;
  onFinish: (scorePercent: number) => void;
};

export function QuizBox({ mod, bestScore, onFinish }: Props) {
  const questions = useMemo(() => quizFor(mod.track, mod.index), [mod.track, mod.index]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const q = questions[step];
  const total = questions.length;
  const score = Math.round((correct / total) * 100);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setCorrect((c) => c + 1);
    } else {
      setWrongTopics((t) => [...t, q.topic]);
    }
  }

  function next() {
    if (step + 1 >= total) {
      setDone(true);
      if (score > bestScore) onFinish(score);
    } else {
      setStep((s) => s + 1);
      setPicked(null);
    }
  }

  function restart() {
    setStep(0);
    setPicked(null);
    setCorrect(0);
    setWrongTopics([]);
    setDone(false);
  }

  return (
    <section className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">🧠 Quiz do módulo</h2>
        {bestScore > 0 && (
          <span className="rounded-full bg-success/15 px-3 py-1 font-mono text-xs text-success">
            Melhor nota: {bestScore}%
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} perguntas rápidas. Acertou tudo? Ganha XP extra de bônus!
      </p>

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
                ? "👏 Mandou bem! Revise os pontos abaixo para fechar 100%."
                : "💪 Não desanime — revisar faz parte de aprender."}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {correct} de {total} corretas · +{Math.round(score / 10) * 10} XP de quiz
          </p>

          {wrongTopics.length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-left">
              <p className="font-mono text-xs uppercase text-warning">revise antes de avançar</p>
              <ul className="mt-2 space-y-1 text-sm">
                {wrongTopics.map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={restart}
            className="mt-5 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent"
          >
            Refazer quiz
          </button>
        </div>
      )}
    </section>
  );
}
