import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "my_access",
  title: "Ver meu acesso",
  description: "Mostra o status da assinatura do usuário conectado (ativa, vitalícia, pendente) e se ele é admin.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input: Record<string, never>, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text" as const, text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [{ data: sub }, { data: role }] = await Promise.all([
      supabase.from("subscriptions").select("status,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    ]);
    const isAdmin = !!role;
    const active =
      !!sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    const label = isAdmin
      ? "Admin — acesso total."
      : active
        ? sub?.expires_at
          ? `Assinatura ativa até ${new Date(sub.expires_at).toLocaleDateString("pt-BR")}.`
          : "Assinatura vitalícia ativa."
        : "Sem assinatura ativa.";
    return {
      content: [{ type: "text" as const, text: `${ctx.getUserEmail() ?? "Aluno"}: ${label}` }],
      structuredContent: { isAdmin, active, status: sub?.status ?? null, expiresAt: sub?.expires_at ?? null },
    };
  },
});
