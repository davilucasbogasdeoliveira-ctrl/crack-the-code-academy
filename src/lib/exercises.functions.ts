import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  moduleId: z.string().min(1).max(80),
  moduleTitle: z.string().min(1).max(200),
  moduleSummary: z.string().max(1000),
  language: z.string().min(1).max(30),
  exercisePrompt: z.string().max(4000),
  userCode: z.string().max(20000),
  track: z.enum(["python", "cpp", "html", "css", "java"]),
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
    // Verifica assinatura ativa (vitalícia) + linguagem liberada, ou admin
    const { supabase, userId } = context;
    checkRateLimit(userId);
    const [{ data: sub }, { data: role }, { data: access }] = await Promise.all([
      supabase.from("subscriptions").select("status,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("track_access").select("track").eq("user_id", userId).eq("track", data.track).maybeSingle(),
    ]);
    const isAdmin = !!role;
    const active = sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    if (!isAdmin && !active) throw new Error("Assinatura não está ativa.");
    if (!isAdmin && !access) throw new Error("Esta linguagem não está liberada no seu plano.");

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
    if (!key) throw new Error("LOVABLE_API_KEY ausente.");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

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

    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system,
      prompt,
    });
    return { feedback: text };
  });

