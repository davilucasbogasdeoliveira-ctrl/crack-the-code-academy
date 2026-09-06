import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateModuleIntro } from "@/lib/intro.functions";
import { ReadAloud } from "@/components/ReadAloud";
import type { Module } from "@/content/modules";
import { trackLabel } from "@/content/modules";

/**
 * Professora virtual: no início de cada aula, a IA explica em poucas frases
 * o que o aluno vai aprender e o que vai ter que fazer — com opção de ouvir.
 * O texto é guardado no navegador (sessionStorage) para não gastar IA à toa.
 */
export function AulaIntro({ mod }: { mod: Module }) {
  const run = useServerFn(generateModuleIntro);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const asked = useRef<string | null>(null);

  useEffect(() => {
    const cacheKey = `tca-intro-${mod.id}`;
    if (asked.current === mod.id) return;
    asked.current = mod.id;
    setText(null);
    setError(null);

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setText(cached);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    run({
      data: {
        moduleId: mod.id,
        moduleTitle: mod.title,
        moduleSummary: mod.summary,
        language: trackLabel(mod.track),
        headings: mod.sections.map((s) => s.heading).slice(0, 20),
        track: mod.track,
      },
    })
      .then((r) => {
        if (!alive) return;
        if (r.ok) {
          sessionStorage.setItem(cacheKey, r.text);
          setText(r.text);
        } else setError(r.text);
      })
      .catch(() => alive && setError("Não consegui falar com a professora virtual agora."))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [mod, run]);

  return (
    <div className="mt-8 rounded-xl border border-primary/40 bg-primary/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-mono text-sm text-primary">
          🎧 // professora virtual — antes de começar
        </h2>
        {text && <ReadAloud text={text} label="Ouvir a introdução" />}
      </div>

      {loading && (
        <p className="mt-3 animate-pulse text-sm text-muted-foreground">
          Preparando a introdução desta aula…
        </p>
      )}
      {error && !loading && <p className="mt-3 text-sm text-muted-foreground">{error}</p>}
      {text && !loading && (
        <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-8 text-foreground/90">{text}</p>
      )}
    </div>
  );
}
