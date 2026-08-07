import { useEffect, useRef, useState } from "react";

/**
 * Leitor em voz alta (Web Speech API do navegador) — para alunos que preferem ouvir a ler.
 */
export function ReadAloud({ text, label = "Ouvir esta parte" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speak() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "pt-BR";
    u.rate = rate;
    const ptVoice = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("pt"));
    if (ptVoice) u.voice = ptVoice;
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setPaused(false);
  }

  function toggle() {
    if (!speaking) return speak();
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  if (!supported) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
      >
        {speaking ? (paused ? "▶ Continuar" : "⏸ Pausar") : `🔊 ${label}`}
      </button>
      {speaking && (
        <button
          type="button"
          onClick={stop}
          className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
        >
          ⏹ Parar
        </button>
      )}
      <label className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        velocidade
        <select
          value={rate}
          onChange={(e) => {
            const v = Number(e.target.value);
            setRate(v);
            if (speaking) { stop(); setTimeout(() => { setRate(v); }, 0); }
          }}
          className="rounded border border-border bg-background px-1 py-0.5 text-foreground"
        >
          <option value={0.8}>0.8x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
        </select>
      </label>
    </div>
  );
}
