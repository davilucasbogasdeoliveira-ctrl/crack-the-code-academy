import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Leitor em voz alta (Web Speech API do navegador) — para alunos que preferem ouvir a ler.
 *
 * Correções aplicadas:
 * - Textos longos são divididos em pedaços (Chrome corta a fala depois de ~15s).
 * - Espera a lista de vozes carregar (voiceschanged) antes de escolher a voz pt-BR.
 * - "Keep-alive": Chrome pausa sozinho em falas longas; um resume periódico evita travar.
 * - Trocar a velocidade continua a leitura de onde parou, sem recarregar nada.
 */

const MAX_CHUNK = 180;

function splitText(raw: string): string[] {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?;:\n]+[.!?;:]*\s*/g) ?? [clean];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (s.length > MAX_CHUNK) {
      if (buf.trim()) { chunks.push(buf.trim()); buf = ""; }
      const words = s.split(" ");
      let line = "";
      for (const w of words) {
        if ((line + " " + w).trim().length > MAX_CHUNK) { chunks.push(line.trim()); line = w; }
        else line = (line + " " + w).trim();
      }
      if (line.trim()) chunks.push(line.trim());
      continue;
    }
    if ((buf + s).length > MAX_CHUNK) { chunks.push(buf.trim()); buf = s; }
    else buf += s;
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter(Boolean);
}

export function ReadAloud({ text, label = "Ouvir esta parte" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const rateRef = useRef(1);
  const activeRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { rateRef.current = rate; }, [rate]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    // dispara o carregamento assíncrono das vozes
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
      activeRef.current = false;
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const pickVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang?.toLowerCase() === "pt-br") ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
      null
    );
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
  }, []);

  const finish = useCallback(() => {
    activeRef.current = false;
    stopKeepAlive();
    setSpeaking(false);
    setPaused(false);
  }, [stopKeepAlive]);

  const speakFrom = useCallback((i: number) => {
    if (!activeRef.current) return;
    const chunk = chunksRef.current[i];
    if (chunk === undefined) { finish(); return; }
    indexRef.current = i;

    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = "pt-BR";
    u.rate = rateRef.current;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = () => {
      if (!activeRef.current) return;
      speakFrom(i + 1);
    };
    u.onerror = (e) => {
      // "interrupted"/"canceled" acontecem quando o usuário para — não é erro real
      const err = (e as SpeechSynthesisErrorEvent).error;
      if (err === "interrupted" || err === "canceled") return;
      finish();
    };
    window.speechSynthesis.speak(u);
  }, [finish, pickVoice]);

  const start = useCallback((fromIndex = 0) => {
    if (!supported) return;
    const chunks = chunksRef.current.length && fromIndex > 0 ? chunksRef.current : splitText(text);
    if (!chunks.length) return;
    chunksRef.current = chunks;
    window.speechSynthesis.cancel();
    activeRef.current = true;
    setSpeaking(true);
    setPaused(false);
    stopKeepAlive();
    keepAliveRef.current = setInterval(() => {
      const s = window.speechSynthesis;
      if (activeRef.current && s.speaking && !s.paused) { s.pause(); s.resume(); }
    }, 10000);
    // pequeno atraso: alguns navegadores ignoram speak() logo após cancel()
    setTimeout(() => speakFrom(fromIndex), 60);
  }, [supported, text, speakFrom, stopKeepAlive]);

  function toggle() {
    if (!speaking) return start(0);
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    activeRef.current = false;
    stopKeepAlive();
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    indexRef.current = 0;
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
            rateRef.current = v;
            if (speaking) {
              const resumeAt = indexRef.current;
              activeRef.current = false;
              window.speechSynthesis.cancel();
              setTimeout(() => start(resumeAt), 80);
            }
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
