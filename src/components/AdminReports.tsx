import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACKS, modulesByTrack, trackLabel, type Track } from "@/content/modules";
import { makeCertificateCode } from "@/lib/certificates";

type ProgressLite = {
  user_id: string;
  track: Track;
  module_id: string;
  completed: boolean;
  quiz_score: number;
  updated_at: string;
};

type CertRow = {
  id: string;
  user_id: string;
  track: Track;
  code: string;
  issued_at: string;
  reissued_count: number;
};

type Student = { user_id: string; email: string; created_at: string };

export function AdminReports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<ProgressLite[]>([]);
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: subs }, { data: prog }, { data: cert }] = await Promise.all([
      supabase.from("subscriptions").select("user_id,email,created_at").order("created_at", { ascending: false }),
      supabase.from("progress").select("user_id,track,module_id,completed,quiz_score,updated_at"),
      supabase.from("certificates").select("id,user_id,track,code,issued_at,reissued_count"),
    ]);
    setStudents((subs as Student[]) ?? []);
    setProgress((prog as ProgressLite[]) ?? []);
    setCerts((cert as CertRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reissue(userId: string, track: Track) {
    const key = `${userId}-${track}`;
    setBusy(key);
    setMsg(null);
    const existing = certs.find((c) => c.user_id === userId && c.track === track);
    const code = makeCertificateCode(track);
    const { error } = existing
      ? await supabase
          .from("certificates")
          .update({ code, issued_at: new Date().toISOString(), reissued_count: existing.reissued_count + 1 })
          .eq("id", existing.id)
      : await supabase.from("certificates").insert({ user_id: userId, track, code });
    setBusy(null);
    setMsg(error ? `Erro: ${error.message}` : existing ? `Certificado reemitido: ${code}` : `Certificado emitido: ${code}`);
    load();
  }

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    for (const tr of TRACKS) t[tr.id] = modulesByTrack(tr.id).length;
    return t;
  }, []);

  const filtered = students.filter((s) => s.email.toLowerCase().includes(query.trim().toLowerCase()));

  if (loading) return <p className="text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar aluno por email…"
          className="min-w-[220px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button onClick={load} className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent">
          Atualizar
        </button>
      </div>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      {filtered.length === 0 && <p className="text-muted-foreground">Nenhum aluno encontrado.</p>}

      {filtered.map((s) => {
        const mine = progress.filter((p) => p.user_id === s.user_id);
        const myCerts = certs.filter((c) => c.user_id === s.user_id);
        const activeTracks = Array.from(
          new Set([...mine.map((p) => p.track), ...myCerts.map((c) => c.track)]),
        ) as Track[];
        const quizRows = mine.filter((p) => p.quiz_score > 0);
        const avg = quizRows.length
          ? Math.round(quizRows.reduce((a, b) => a + b.quiz_score, 0) / quizRows.length)
          : 0;

        return (
          <div key={s.user_id} className="glass-card rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm">{s.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inscrito em {new Date(s.created_at).toLocaleDateString("pt-BR")} • {mine.filter((p) => p.completed).length}{" "}
                  módulo(s) concluído(s) • {quizRows.length} quiz(zes) feitos • média {avg}%
                </p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {myCerts.length} certificado(s)
              </span>
            </div>

            {activeTracks.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">Este aluno ainda não iniciou nenhuma linguagem.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2">Linguagem</th>
                      <th className="py-2">Módulos</th>
                      <th className="py-2">Média dos quizzes</th>
                      <th className="py-2">Certificado</th>
                      <th className="py-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTracks.map((t) => {
                      const rows = mine.filter((p) => p.track === t);
                      const done = rows.filter((p) => p.completed).length;
                      const total = totals[t] ?? 0;
                      const q = rows.filter((p) => p.quiz_score > 0);
                      const media = q.length ? Math.round(q.reduce((a, b) => a + b.quiz_score, 0) / q.length) : null;
                      const cert = myCerts.find((c) => c.track === t);
                      const key = `${s.user_id}-${t}`;
                      return (
                        <tr key={t} className="border-t border-border/60">
                          <td className={`py-3 font-mono text-${t}`}>{trackLabel(t)}</td>
                          <td className="py-3">
                            {done}/{total} {total > 0 && done === total && <span className="text-success">✓</span>}
                          </td>
                          <td className="py-3">{media === null ? "—" : `${media}%`}</td>
                          <td className="py-3">
                            {cert ? (
                              <span>
                                <span className="font-mono text-xs">{cert.code}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                                  {cert.reissued_count > 0 && ` • reemitido ${cert.reissued_count}x`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">não emitido</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              disabled={busy === key}
                              onClick={() => reissue(s.user_id, t)}
                              className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                            >
                              {cert ? "Reemitir" : "Emitir"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
