import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Track } from "@/content/modules";

export const OWNER_EMAIL = "davilucasbogasdeoliveira@gmail.com";

export type SubRow = {
  status: "pending" | "active" | "expired" | "blocked";
  expires_at: string | null;
  notes: string | null;
};

export type Access = {
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  sub: SubRow | null;
  /** Assinatura liberada (vitalícia) */
  active: boolean;
  /** Linguagens liberadas para este aluno */
  tracks: Track[];
  reload: () => void;
};

export function useAccess(userId: string, email?: string | null): Access {
  const [state, setState] = useState<Omit<Access, "reload">>({
    loading: true,
    isAdmin: false,
    isOwner: false,
    sub: null,
    active: false,
    tracks: [],
  });

  const reload = useCallback(async () => {
    const [{ data: s }, { data: r }, { data: ta }] = await Promise.all([
      supabase.from("subscriptions").select("status,expires_at,notes").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
      supabase.from("track_access").select("track").eq("user_id", userId),
    ]);
    const isAdmin = !!r;
    const sub = (s as SubRow | null) ?? null;
    const active =
      isAdmin ||
      (!!sub && sub.status === "active" && (!sub.expires_at || new Date(sub.expires_at) > new Date()));
    const granted = (ta ?? []).map((x) => x.track as Track);
    setState({
      loading: false,
      isAdmin,
      isOwner: (email ?? "").toLowerCase() === OWNER_EMAIL,
      sub,
      active,
      tracks: isAdmin ? (["html", "css", "java", "python", "cpp", "csharp", "javascript", "lua", "typescript"] as Track[]) : active ? granted : [],
    });
  }, [userId, email]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
