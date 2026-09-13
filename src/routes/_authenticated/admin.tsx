import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACKS, type Track } from "@/content/modules";
import { OWNER_EMAIL } from "@/lib/access";

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
  const { user } = Route.useRouteContext();
  const isOwner = (user.email ?? "").toLowerCase() === OWNER_EMAIL;
  const [tab, setTab] = useState<"alunos" | "relatorios" | "admins">("alunos");

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Painel do admin</h1>
        <p className="mt-1 text-muted-foreground">Libere o acesso vitalício e escolha as linguagens de cada aluno.</p>
      </div>

      <div className="mb-8 flex gap-2 border-b border-border">
        <TabButton active={tab === "alunos"} onClick={() => setTab("alunos")}>Alunos e linguagens</TabButton>
        <TabButton active={tab === "relatorios"} onClick={() => setTab("relatorios")}>Notas e certificados</TabButton>
        {isOwner && <TabButton active={tab === "admins"} onClick={() => setTab("admins")}>Administradores</TabButton>}
      </div>

      {tab === "alunos" ? <StudentsTab /> : tab === "relatorios" ? <AdminReports /> : isOwner ? <AdminsTab currentUserId={user.id} /> : null}
    </div>
  );
}


function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}>
      {children}
    </button>
  );
}

/* ---------------- Alunos ---------------- */

function StudentsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [accessMap, setAccessMap] = useState<Record<string, Track[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: subs }, { data: access }] = await Promise.all([
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("track_access").select("user_id,track"),
    ]);
    const map: Record<string, Track[]> = {};
    for (const a of access ?? []) {
      (map[a.user_id] ??= []).push(a.track as Track);
    }
    setRows((subs as Row[]) ?? []);
    setAccessMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(id: string, patch: Partial<Row>) {
    setSavingId(id);
    await supabase.from("subscriptions").update(patch).eq("id", id);
    setSavingId(null);
    load();
  }

  async function toggleTrack(row: Row, track: Track, on: boolean) {
    setSavingId(row.id);
    if (on) {
      await supabase.from("track_access").insert({ user_id: row.user_id, track });
    } else {
      await supabase.from("track_access").delete().eq("user_id", row.user_id).eq("track", track);
    }
    setSavingId(null);
    load();
  }

  const filtered = rows.filter((r) => r.email.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por email…"
          className="flex-1 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={load} className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent">
          Atualizar
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const granted = accessMap[r.user_id] ?? [];
            return (
              <div key={r.id} className="glass-card rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{r.email}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cadastro: {new Date(r.created_at).toLocaleDateString("pt-BR")} • {granted.length} linguagem(ns) liberada(s)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={savingId === r.id}
                      onClick={() => update(r.id, { status: "active", expires_at: null })}
                      className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:opacity-90 disabled:opacity-50">
                      Liberar vitalício
                    </button>
                    <button disabled={savingId === r.id} onClick={() => update(r.id, { status: "blocked" })}
                      className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">
                      Bloquear
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
                  <p className="font-mono text-xs text-muted-foreground">// linguagens do plano deste aluno</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TRACKS.map((t) => {
                      const on = granted.includes(t.id);
                      return (
                        <button key={t.id} disabled={savingId === r.id}
                          onClick={() => toggleTrack(r, t.id, !on)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-mono transition disabled:opacity-50 ${
                            on
                              ? `border-${t.id} bg-${t.id}/15 text-${t.id}`
                              : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                          }`}>
                          {on ? "✓ " : "+ "}{t.name}
                        </button>
                      );
                    })}
                  </div>
                  {r.status !== "active" && granted.length > 0 && (
                    <p className="mt-3 text-xs text-warning">
                      Atenção: as linguagens só valem depois de clicar em “Liberar vitalício”.
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <NotesEditor row={r} onSave={(notes) => update(r.id, { notes })} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------------- Admins ---------------- */

type AdminRow = { user_id: string; email: string };

function AdminsTab({ currentUserId }: { currentUserId: string }) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [candidates, setCandidates] = useState<{ user_id: string; email: string }[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: roles }, { data: subs }] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
      supabase.from("subscriptions").select("user_id,email").order("email"),
    ]);
    const adminIds = new Set((roles ?? []).map((r) => r.user_id));
    const all = (subs ?? []) as { user_id: string; email: string }[];
    setAdmins(all.filter((s) => adminIds.has(s.user_id)));
    setCandidates(all.filter((s) => !adminIds.has(s.user_id)));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function promote(userId: string) {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    setBusy(false);
    setMsg(error ? `Erro: ${error.message}` : "Administrador adicionado.");
    load();
  }

  async function demote(userId: string) {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    setBusy(false);
    setMsg(error ? `Erro: ${error.message}` : "Administrador removido.");
    load();
  }

  const filtered = candidates.filter((c) => c.email.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        Somente você (dono do site) pode adicionar ou remover administradores. Um administrador pode liberar planos e
        linguagens, mas não pode promover ninguém.
      </div>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      <section>
        <h2 className="text-xl font-bold">Administradores atuais</h2>
        <div className="mt-4 space-y-2">
          {admins.length === 0 && <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</p>}
          {admins.map((a) => (
            <div key={a.user_id} className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3">
              <span className="font-mono text-sm">
                {a.email}
                {a.email.toLowerCase() === OWNER_EMAIL && (
                  <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">dono</span>
                )}
              </span>
              {a.email.toLowerCase() !== OWNER_EMAIL && a.user_id !== currentUserId && (
                <button disabled={busy} onClick={() => demote(a.user_id)}
                  className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50">
                  Remover admin
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Adicionar novo administrador</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A pessoa precisa já ter criado a conta no site. Busque pelo email dela abaixo.
        </p>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar email…"
          className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <div className="mt-3 space-y-2">
          {query.trim() === "" ? (
            <p className="text-sm text-muted-foreground">Digite parte do email para buscar.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conta encontrada com esse email.</p>
          ) : (
            filtered.slice(0, 20).map((c) => (
              <div key={c.user_id} className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3">
                <span className="font-mono text-sm">{c.email}</span>
                <button disabled={busy} onClick={() => promote(c.user_id)}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  Tornar admin
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Compartilhado ---------------- */

function StatusBadge({ status }: { status: Row["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-warning/15 text-warning",
    active: "bg-success/15 text-success",
    expired: "bg-muted text-muted-foreground",
    blocked: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = { pending: "Aguardando", active: "Vitalício ativo", expired: "Inativo", blocked: "Bloqueado" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
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
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ex: pagou PIX 15/07 — HTML + CSS"
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
