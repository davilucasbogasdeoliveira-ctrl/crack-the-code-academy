import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  moduleId: z.string().min(1).max(80),
  moduleTitle: z.string().min(1).max(200),
  moduleSummary: z.string().max(1000),
  language: z.string().min(1).max(30),
  headings: z.array(z.string().max(200)).max(20),
  track: z.enum(["python", "cpp", "html", "css", "java", "csharp", "javascript", "lua", "typescript"]),
});

const RATE_LIMIT = { max: 15, windowMs: 60_000 };
const hits = new Map<string, number[]>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) throw new Error("Muitas aberturas seguidas. Espere um minuto.");
  recent.push(now);
  hits.set(userId, recent);
}

export const generateModuleIntro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    try {
      checkRateLimit(userId);
      const [{ data: role }, { data: access }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
        supabase.from("track_access").select("track").eq("user_id", userId).eq("track", data.track).maybeSingle(),
      ]);
      if (!role && !access) return { ok: false as const, text: "Esta linguagem não está liberada no seu plano." };

      const key = process.env.LOVABLE_API_KEY;
      if (!key) return { ok: false as const, text: "A professora virtual está indisponível agora." };

      const system = `Você é a professora virtual da The Code Academy, falando em português do Brasil.
Você faz a ABERTURA falada de uma aula, como se estivesse conversando com o aluno (que pode ter TDAH: seja curta, animada e concreta).
Escreva no máximo 130 palavras, em texto corrido simples (sem markdown, sem títulos, sem listas com símbolos), pronto para ser lido em voz alta.
Estrutura: 1) cumprimente e diga em 1 frase o que a aula ensina; 2) diga por que isso importa na prática; 3) diga o que o aluno vai FAZER nesta aula (as etapas), 4) termine com uma frase de incentivo.
Nunca ensine o conteúdo inteiro — só a abertura.`;

      const prompt = `Linguagem: ${data.language}
Aula: ${data.moduleTitle}
Resumo: ${data.moduleSummary}
Partes da aula: ${data.headings.join("; ")}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[generateModuleIntro] gateway ${res.status}: ${body}`);
        if (res.status === 429) return { ok: false as const, text: "Muita gente ao mesmo tempo. Tente de novo em instantes." };
        if (res.status === 402) return { ok: false as const, text: "Os créditos da professora virtual acabaram. Avise o professor no WhatsApp." };
        return { ok: false as const, text: "Não consegui preparar a introdução agora." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false as const, text: "A introdução veio vazia. Tente recarregar." };
      return { ok: true as const, text };
    } catch (e) {
      console.error("[generateModuleIntro]", e);
      const msg = e instanceof Error ? e.message : "Erro inesperado.";
      return { ok: false as const, text: msg.startsWith("Muitas") ? msg : "Algo deu errado ao preparar a introdução." };
    }
  });
