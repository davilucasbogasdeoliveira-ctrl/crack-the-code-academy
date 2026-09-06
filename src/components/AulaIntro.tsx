import { useMemo } from "react";
import { ReadAloud } from "@/components/ReadAloud";
import type { Module } from "@/content/modules";
import { buildModuleIntro } from "@/content/intro";

/**
 * Professora virtual: abertura da aula, pronta na hora (sem espera).
 */
export function AulaIntro({ mod }: { mod: Module }) {
  const text = useMemo(() => buildModuleIntro(mod), [mod]);

  return (
    <div className="mt-8 rounded-xl border border-primary/40 bg-primary/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-mono text-sm text-primary">
          🎧 // professora virtual — antes de começar
        </h2>
        <ReadAloud text={text} label="Ouvir a introdução" />
      </div>
      <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-8 text-foreground/90">{text}</p>
    </div>
  );
}
