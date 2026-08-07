import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .maybeSingle().then(({ data }) => setIsAdmin(!!data));
  }, [user.id]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/curso" className="flex items-center gap-2 font-mono font-bold">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            The Code Academy<span className="text-primary">.</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/curso" className="text-muted-foreground hover:text-foreground [&.active]:text-foreground">Curso</Link>
            {isAdmin && <Link to="/admin" className="text-warning hover:opacity-80 [&.active]:opacity-100">Admin</Link>}
            <span className="hidden font-mono text-xs text-muted-foreground md:inline">{user.email}</span>
            <button onClick={signOut} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">Sair</button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
