import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MODULES, type Track } from "@/content/modules";

export type ProgressRow = {
  id: string;
  user_id: string;
  module_id: string;
  track: Track;
  completed: boolean;
  completed_at: string | null;
  practice_count: number;
  notes: string | null;
  updated_at: string;
};

export function useProgress(userId: string) {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) console.error(error);
    setRows((data as ProgressRow[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const upsert = useCallback(
    async (moduleId: string, patch: Partial<ProgressRow>) => {
      const mod = MODULES.find((m) => m.id === moduleId);
      if (!mod) return;

      const { data: existing } = await supabase
        .from("progress")
        .select("id")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (existing) {
        await supabase.from("progress").update(patch).eq("id", existing.id);
      } else {
        await supabase.from("progress").insert({
          user_id: userId,
          module_id: moduleId,
          track: mod.track,
          ...patch,
        });
      }
      await load();
    },
    [userId, load],
  );

  return { rows, loading, reload: load, upsert };
}

export function trackProgress(rows: ProgressRow[], track: Track) {
  const modules = MODULES.filter((m) => m.track === track);
  const completed = modules.filter((m) =>
    rows.find((r) => r.module_id === m.id && r.completed),
  ).length;
  return {
    total: modules.length,
    completed,
    percent: modules.length ? Math.round((completed / modules.length) * 100) : 0,
  };
}

export function moduleProgress(rows: ProgressRow[], moduleId: string) {
  return rows.find((r) => r.module_id === moduleId);
}
