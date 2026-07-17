import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role")
      .eq("user_id", context.user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/curso" });
  },
  component: AdminPanel,
});

type Row = {
  id: string; user_id: string; email: string;
  status: "pending" | "active" | "expired" | "blocked";
  expires_at: string | null; notes: string | null; created_at: string;
};

function AdminPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(id: string, patch: Partial<Row>) {
    setSavingId(id);
    await supabase.from("subscriptions").update(patch).eq("id", id);
    setSavingId(null);
    load();
  }

  async function activate(row: Row, days: number) {
    const base = row.expires_at && new Date(row.expires_at) > new Date() ? new Date(row.expires_at) : new Date();
    base.setDate(base.getDate() + days);
    await update(row.id, { status: "active", expires_at: base.toISOString() });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-4xl font-bold">Painel do admin</h1>
          <p className="mt-1 text-muted-foreground">Gerencie o acesso dos alunos.</p>
        </div>
        <button onClick={load} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">
          Atualizar
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="glass-card rounded-lg p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{r.email}</span>
                    <StatusBadge status={r.status} expiresAt={r.expires_at} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cadastro: {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    {r.expires_at && ` • Expira: ${new Date(r.expires_at).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={savingId === r.id} onClick={() => activate(r, 30)}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                    {r.status === "active" ? "+30 dias" : "Liberar 30 dias"}
                  </button>
                  <button disabled={savingId === r.id} onClick={() => activate(r, 7)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50">
                    +7 dias
                  </button>
                  <button disabled={savingId === r.id} onClick={() => update(r.id, { status: "active", expires_at: null, notes: r.notes ?? "Plano vitalício" })}
                    className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:opacity-90 disabled:opacity-50">
                    Liberar vitalício
                  </button>
                  <button disabled={savingId === r.id} onClick={() => update(r.id, { status: "blocked" })}
                    className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">
                    Bloquear
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <NotesEditor row={r} onSave={(notes) => update(r.id, { notes })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, expiresAt }: { status: Row["status"]; expiresAt: string | null }) {
  const isExpired = status === "active" && expiresAt && new Date(expiresAt) < new Date();
  const effective = isExpired ? "expired" : status;
  const styles: Record<string, string> = {
    pending: "bg-warning/15 text-warning",
    active: "bg-success/15 text-success",
    expired: "bg-muted text-muted-foreground",
    blocked: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = { pending: "Aguardando", active: "Ativo", expired: "Expirado", blocked: "Bloqueado" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[effective]}`}>{labels[effective]}</span>;
}

function NotesEditor({ row, onSave }: { row: Row; onSave: (n: string) => void }) {
  const [val, setVal] = useState(row.notes ?? "");
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-left w-full text-xs text-muted-foreground hover:text-foreground">
        <span className="font-mono">nota:</span> {row.notes || <span className="italic">(clique para adicionar)</span>}
      </button>
    );
  }
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ex: pagou PIX 15/07"
        className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs" autoFocus />
      <button onClick={() => { onSave(val); setEditing(false); }} className="rounded-md bg-primary px-3 text-xs text-primary-foreground">
        Salvar
      </button>
      <button onClick={() => { setVal(row.notes ?? ""); setEditing(false); }} className="rounded-md border border-border px-3 text-xs">
        Cancelar
      </button>
    </div>
  );
}
