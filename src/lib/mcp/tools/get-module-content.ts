import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findModule } from "@/content/modules";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_module_content",
  title: "Ler conteúdo de um módulo",
  description:
    "Retorna o conteúdo completo (seções, explicações e código) de um módulo. Requer assinatura ativa ou admin.",
  inputSchema: { module_id: z.string().describe("ID do módulo, ex.: py-01") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ module_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text" as const, text: "Não autenticado." }], isError: true };
    }
    const mod = findModule(module_id);
    if (!mod) {
      return { content: [{ type: "text" as const, text: `Módulo "${module_id}" não encontrado.` }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [{ data: sub }, { data: role }] = await Promise.all([
      supabase.from("subscriptions").select("status,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    ]);
    const active =
      !!sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    if (!role && !active) {
      return {
        content: [{ type: "text" as const, text: "Assinatura não está ativa. Fale com o professor no WhatsApp (14) 99842-2445." }],
        isError: true,
      };
    }

    const text = [
      `# ${mod.index}. ${mod.title} (${mod.track}, ${mod.duration})`,
      mod.summary,
      ...mod.sections.map(
        (s) => `\n## ${s.heading}\n${s.body}${s.code ? `\n\n\`\`\`${s.code.lang}\n${s.code.source}\n\`\`\`` : ""}`,
      ),
    ].join("\n");

    return { content: [{ type: "text" as const, text }], structuredContent: { module: mod } };
  },
});
