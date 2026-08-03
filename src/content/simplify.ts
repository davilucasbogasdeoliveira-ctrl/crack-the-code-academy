/** Helpers para deixar o conteúdo mais mastigado (leitura amigável para TDAH). */

/** Quebra um texto longo em blocos curtos de 1-2 frases. */
export function chunkText(body: string, perChunk = 2): string[] {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += perChunk) {
    out.push(sentences.slice(i, i + perChunk).join(" "));
  }
  return out.length ? out : [body];
}

/** A ideia central da seção em uma frase só. */
export function oneLiner(body: string): string {
  const first = body.split(/(?<=[.!?])\s+/)[0]?.trim() ?? body;
  return first.length > 220 ? first.slice(0, 217) + "…" : first;
}

/** Tempo de leitura aproximado (200 palavras/min), mínimo 1 min. */
export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

/** Mensagens de pausa — a cada 3 seções o aluno é convidado a respirar. */
export const BREAK_TIPS = [
  "Pausa de 2 minutos: levante, beba água e volte. Seu cérebro fixa melhor com intervalos.",
  "Respira. Antes de continuar, tente explicar em voz alta o que você acabou de ler.",
  "Micro-pausa: olhe para longe por 30 segundos. Depois siga — falta pouco.",
];
