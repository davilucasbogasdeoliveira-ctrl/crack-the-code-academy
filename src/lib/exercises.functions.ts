import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  moduleId: z.string().min(1).max(80),
  moduleTitle: z.string().min(1).max(200),
  moduleSummary: z.string().max(1000),
  language: z.string().min(1).max(30),
  exercisePrompt: z.string().max(4000),
  userCode: z.string().max(20000),
  track: z.enum(["python", "cpp", "html", "css", "java", "csharp", "javascript", "lua"]),
});

// Limite simples de uso da IA por aluno (melhor esforço, por instância do servidor).
const RATE_LIMIT = { max: 20, windowMs: 60_000 };
const hits = new Map<string, number[]>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    throw new Error("Muitas correções seguidas. Aguarde um minuto e tente de novo.");
  }
  recent.push(now);
  hits.set(userId, recent);
}

export const evaluateExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    try {
      checkRateLimit(userId);
      // Verifica assinatura ativa (vitalícia) + linguagem liberada, ou admin
      const [{ data: sub }, { data: role }, { data: access }] = await Promise.all([
        supabase.from("subscriptions").select("status,expires_at").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
        supabase.from("track_access").select("track").eq("user_id", userId).eq("track", data.track).maybeSingle(),
      ]);
      const isAdmin = !!role;
      const active = sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
      if (!isAdmin && !active) return { ok: false as const, feedback: "Sua assinatura não está ativa. Fale no WhatsApp (14) 99842-2445 para liberar." };
      if (!isAdmin && !access) return { ok: false as const, feedback: "Esta linguagem não está liberada no seu plano." };

      // Incrementa contador de prática do aluno neste módulo
      const { data: existing } = await supabase
        .from("progress")
        .select("id,practice_count")
        .eq("user_id", userId)
        .eq("module_id", data.moduleId)
        .maybeSingle();
      if (existing) {
        await supabase.from("progress").update({ practice_count: existing.practice_count + 1 }).eq("id", existing.id);
      } else {
        await supabase.from("progress").insert({
          user_id: userId,
          module_id: data.moduleId,
          track: data.track,
          practice_count: 1,
        });
      }

      const key = process.env.LOVABLE_API_KEY;
      if (!key) return { ok: false as const, feedback: "O corretor automático está indisponível no momento. Tente de novo mais tarde." };

      const system = `Você é um professor rigoroso e didático de programação, respondendo SEMPRE em português do Brasil.
Avalie o código do aluno para o exercício proposto na linguagem ${data.language}.
Formato da sua resposta em Markdown, curto e direto:

**Veredito:** ✅ Correto | ⚠️ Quase lá | ❌ Incorreto

**Análise:** (2-4 linhas explicando o que está certo e o que está errado)

**O que corrigir:** (bullets objetivos; se houver erro conceitual, explique o conceito por trás)

**Exemplo de solução correta:**
\`\`\`${data.language}
// código
\`\`\`

Regras:
- Se o código está correto mas pode melhorar, elogie e dê 1 dica de melhoria.
- Se está incorreto, seja gentil mas direto — o aluno quer aprender de verdade.
- Nunca invente saída de execução; raciocine sobre o código.
- Se o código estiver vazio ou irrelevante, diga isso e mostre por onde começar.`;

      const prompt = `Módulo: ${data.moduleTitle}
Contexto do módulo: ${data.moduleSummary}

Exercício:
${data.exercisePrompt}

Código do aluno (${data.language}):
\`\`\`${data.language}
${data.userCode || "(vazio)"}
\`\`\``;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[evaluateExercise] gateway ${res.status}: ${body}`);
        if (res.status === 429) return { ok: false as const, feedback: "Muitas correções ao mesmo tempo. Espere alguns segundos e tente de novo." };
        if (res.status === 402) return { ok: false as const, feedback: "Os créditos do corretor automático acabaram. Avise o professor no WhatsApp." };
        return { ok: false as const, feedback: "Não consegui corrigir agora (erro no serviço de IA). Tente novamente em instantes." };
      }

      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false as const, feedback: "A correção veio vazia. Tente enviar de novo." };
      return { ok: true as const, feedback: text };
    } catch (e) {
      console.error("[evaluateExercise]", e);
      const msg = e instanceof Error ? e.message : "Erro inesperado.";
      return { ok: false as const, feedback: msg.startsWith("Muitas correções") ? msg : "Algo deu errado ao corrigir seu código. Tente novamente." };
    }
  });


