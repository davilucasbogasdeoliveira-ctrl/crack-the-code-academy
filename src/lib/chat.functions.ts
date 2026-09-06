import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
});

const RATE_LIMIT = { max: 20, windowMs: 60_000 };
const hits = new Map<string, number[]>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) throw new Error("Muitas perguntas seguidas. Espere um minutinho.");
  recent.push(now);
  hits.set(userId, recent);
}

const SYSTEM = `Você é o CodeBot, o tutor de programação da The Code Academy, e responde sempre em português do Brasil.
Ajuda alunos iniciantes nas linguagens HTML, CSS, JavaScript, TypeScript, Python, Java, C++, C# e Lua.
Seja direto, animado e didático: frases curtas, exemplos de código curtos em blocos markdown, e passo a passo quando for explicar algo.
Se o aluno mandar um erro, explique a causa em linguagem simples antes de mostrar a correção.
Se a pergunta não for sobre programação/estudos, responda rápido e traga de volta para o curso.`;

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    try {
      checkRateLimit(userId);
      const key = process.env.LOVABLE_API_KEY;
      if (!key) return { ok: false as const, text: "O tutor de IA está indisponível agora." };

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          messages: [{ role: "system", content: SYSTEM }, ...data.messages],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[askTutor] gateway ${res.status}: ${body}`);
        if (res.status === 429) return { ok: false as const, text: "Muita gente perguntando agora. Tente de novo em instantes." };
        if (res.status === 402) return { ok: false as const, text: "Os créditos de IA acabaram. Avise o professor no WhatsApp." };
        return { ok: false as const, text: "Não consegui responder agora. Tente de novo." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false as const, text: "A resposta veio vazia. Pergunte de novo." };
      return { ok: true as const, text };
    } catch (e) {
      console.error("[askTutor]", e);
      const msg = e instanceof Error ? e.message : "Erro inesperado.";
      return { ok: false as const, text: msg.startsWith("Muitas") ? msg : "Algo deu errado ao falar com o tutor." };
    }
  });
