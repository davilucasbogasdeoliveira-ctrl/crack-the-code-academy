import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  moduleTitle: z.string(),
  moduleSummary: z.string(),
  language: z.string(),
  exercisePrompt: z.string(),
  userCode: z.string(),
});

export const evaluateExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    // Verifica assinatura ativa ou admin
    const { supabase, userId } = context;
    const [{ data: sub }, { data: role }] = await Promise.all([
      supabase.from("subscriptions").select("status,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    ]);
    const isAdmin = !!role;
    const active = sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    if (!isAdmin && !active) throw new Error("Assinatura não está ativa.");

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
