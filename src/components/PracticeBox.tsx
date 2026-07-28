import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { evaluateExercise } from "@/lib/exercises.functions";
import type { Module } from "@/content/modules";
import { getPractice } from "@/content/practices";

export function PracticeBox({ mod }: { mod: Module }) {
  const practice = getPractice(mod);
  const [code, setCode] = useState(practice.starter);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const evalFn = useServerFn(evaluateExercise);

  async function submit() {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await evalFn({
        data: {
          moduleTitle: mod.title,
          moduleSummary: mod.summary,
          language: practice.language,
          exercisePrompt: practice.prompt,
          userCode: code,
        },
      });
      setFeedback(res.feedback);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao avaliar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-12 rounded-lg border border-border bg-card/40 p-6">
      <h2 className={`flex items-baseline gap-3 text-2xl font-bold text-${mod.track}`}>
        <span className="font-mono text-sm">▶</span>
        Pratique aqui
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Coloque a mão no código. Nosso avaliador vai revisar, apontar erros e explicar o conceito por trás.
      </p>

      <div className="mt-4 rounded-md border border-border bg-background/60 p-4">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{practice.prompt}</p>
      </div>

      <label className="mt-4 block text-xs font-mono uppercase text-muted-foreground">
        Seu código ({practice.language})
      </label>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={12}
        className="mt-2 w-full rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className={`rounded-md bg-${mod.track} px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50`}
        >
          {loading ? "Avaliando…" : "Verificar minha resposta"}
        </button>
        <button
          onClick={() => { setCode(practice.starter); setFeedback(null); setError(null); }}
          className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent"
        >
          Limpar
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {feedback && (
        <div className="mt-4 rounded-md border border-border bg-background/60 p-4">
          <div className="mb-2 text-xs font-mono uppercase text-muted-foreground">Feedback do professor</div>
          <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">{feedback}</div>
        </div>
      )}
    </section>
  );
}
