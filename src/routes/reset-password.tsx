import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha | CrackDev" },
      { name: "description", content: "Defina uma nova senha para acessar sua área de aluno na CrackDev." },
      { property: "og:title", content: "Redefinir senha | CrackDev" },
      { property: "og:description", content: "Defina uma nova senha para acessar sua área de aluno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // O link de recuperação cria uma sessão temporária; esperamos ela existir.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As duas senhas não são iguais.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/curso" }), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono font-bold text-lg">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" /> CrackDev<span className="text-primary">.</span>
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Nova senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma senha nova para sua conta. Mínimo de 6 caracteres.
          </p>

          {!ready && !done && (
            <p className="mt-6 rounded-md border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              Abra esta página pelo link enviado no seu email. Se você já abriu, aguarde um instante…
            </p>
          )}

          {done ? (
            <p className="mt-6 text-sm text-success">Senha alterada! Redirecionando para o curso…</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground">nova senha</label>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground">confirmar senha</label>
                <input
                  type="password" required minLength={6} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                disabled={loading || !ready}
                type="submit"
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary font-medium hover:underline">Voltar para o login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
