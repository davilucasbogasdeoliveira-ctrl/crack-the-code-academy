import { useEffect, useRef, useState } from "react";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Cronômetro de foco (estilo pomodoro): 25 min estudando, 5 min de pausa. */
export function FocusTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [left, setLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((v) => {
        if (v > 1) return v - 1;
        const next = modeRef.current === "focus" ? "break" : "focus";
        setMode(next);
        if (next === "break") setCycles((c) => c + 1);
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.frequency.value = next === "break" ? 660 : 440;
          osc.connect(ctx.destination);
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 400);
        } catch { /* som é opcional */ }
        return (next === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  function reset() {
    setRunning(false);
    setMode("focus");
    setLeft(FOCUS_MIN * 60);
  }

  const total = (mode === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
  const percent = Math.round(((total - left) / total) * 100);

  return (
    <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold">⏱ Cronômetro de foco</p>
          <p className="text-sm text-muted-foreground">
            {mode === "focus"
              ? "Estude sem sair desta aba até o tempo acabar. Depois vem a pausa."
              : "Pausa! Levante, beba água e volte quando o tempo zerar."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-3xl tabular-nums ${mode === "focus" ? "text-primary" : "text-success"}`}>
            {fmt(left)}
          </span>
          <button
            onClick={() => setRunning(!running)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {running ? "Pausar" : "Começar"}
          </button>
          <button onClick={reset} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
            Zerar
          </button>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
        <div className={`h-full ${mode === "focus" ? "bg-primary" : "bg-success"}`} style={{ width: `${percent}%` }} />
      </div>
      {cycles > 0 && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {cycles} bloco(s) de 25 min concluído(s) hoje — mandou bem.
        </p>
      )}
    </div>
  );
}
