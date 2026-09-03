import { MODULES, TRACKS, type Track } from "@/content/modules";
import type { ProgressRow } from "@/lib/progress";

export const XP_PER_MODULE = 100;
export const XP_PER_PRACTICE = 25;

export const LEVELS = [
  { min: 0, name: "Iniciante" },
  { min: 300, name: "Aprendiz" },
  { min: 800, name: "Dev Júnior" },
  { min: 1600, name: "Dev Júnior+" },
  { min: 2600, name: "Dev Intermediário" },
  { min: 4000, name: "Dev Intermediário+" },
  { min: 6000, name: "Dev Avançado" },
  { min: 9000, name: "Dev Sênior" },
  { min: 13000, name: "Mestre do código" },
];

export function levelFor(xp: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) index = i;
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const floor = current.min;
  const ceil = next?.min ?? current.min;
  const percent = next ? Math.round(((xp - floor) / (ceil - floor)) * 100) : 100;
  return {
    level: index + 1,
    name: current.name,
    nextName: next?.name ?? null,
    xpToNext: next ? next.min - xp : 0,
    percent: Math.max(0, Math.min(100, percent)),
  };
}

/** Converte um timestamp em "YYYY-MM-DD" no fuso do aluno. */
function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function studyDays(rows: ProgressRow[]) {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.updated_at) set.add(dayKey(r.updated_at));
    if (r.completed_at) set.add(dayKey(r.completed_at));
  }
  return set;
}

export function streakFrom(days: Set<string>) {
  let streak = 0;
  let offset = days.has(todayKey(0)) ? 0 : 1;
  if (offset === 1 && !days.has(todayKey(1))) return 0;
  while (days.has(todayKey(offset))) {
    streak++;
    offset++;
  }
  return streak;
}

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
};

export type Stats = ReturnType<typeof computeStats>;

export function computeStats(rows: ProgressRow[]) {
  const completed = rows.filter((r) => r.completed);
  const practices = rows.reduce((sum, r) => sum + (r.practice_count ?? 0), 0);
  const xp = completed.length * XP_PER_MODULE + practices * XP_PER_PRACTICE;
  const level = levelFor(xp);
  const days = studyDays(rows);
  const streak = streakFrom(days);

  const perTrack = TRACKS.map((t) => {
    const total = MODULES.filter((m) => m.track === t.id).length;
    const done = completed.filter((r) => r.track === t.id).length;
    return {
      track: t.id as Track,
      name: t.name,
      total,
      done,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  });

  const totalModules = MODULES.length;
  const overallPercent = totalModules ? Math.round((completed.length / totalModules) * 100) : 0;

  // meta semanal: 3 módulos nos últimos 7 dias
  const weekAgo = Date.now() - 7 * 86400000;
  const weekDone = completed.filter((r) => r.completed_at && new Date(r.completed_at).getTime() >= weekAgo).length;

  const masteredTracks = perTrack.filter((p) => p.total > 0 && p.percent === 100);

  const achievements: Achievement[] = [
    { id: "first", icon: "🥇", title: "Primeira aula concluída", desc: "Você começou de verdade.", unlocked: completed.length >= 1 },
    { id: "practice1", icon: "💻", title: "Primeiro código enviado", desc: "Fez o exercício prático.", unlocked: practices >= 1 },
    { id: "five", icon: "📚", title: "5 módulos concluídos", desc: "Constância batendo.", unlocked: completed.length >= 5 },
    { id: "twenty", icon: "🚀", title: "20 módulos concluídos", desc: "Você já é outro dev.", unlocked: completed.length >= 20 },
    { id: "p25", icon: "⌨️", title: "25 exercícios praticados", desc: "Mão na massa de verdade.", unlocked: practices >= 25 },
    { id: "streak3", icon: "✨", title: "3 dias seguidos", desc: "Hábito nascendo.", unlocked: streak >= 3 },
    { id: "streak7", icon: "🔥", title: "7 dias estudando", desc: "Uma semana sem falhar.", unlocked: streak >= 7 },
    { id: "streak30", icon: "🏔️", title: "30 dias seguidos", desc: "Disciplina de elite.", unlocked: streak >= 30 },
    { id: "track1", icon: "🏆", title: "Primeira trilha completa", desc: "Certificado liberado.", unlocked: masteredTracks.length >= 1 },
    { id: "track3", icon: "👑", title: "3 trilhas completas", desc: "Poliglota de código.", unlocked: masteredTracks.length >= 3 },
    { id: "xp2000", icon: "⭐", title: "2.000 XP", desc: "Muito estudo acumulado.", unlocked: xp >= 2000 },
    { id: "level5", icon: "🧠", title: "Nível 5", desc: "Evolução constante.", unlocked: level.level >= 5 },
  ];

  return {
    xp,
    level,
    streak,
    days,
    practices,
    completedCount: completed.length,
    totalModules,
    overallPercent,
    perTrack,
    weekDone,
    weekGoal: 3,
    achievements,
    unlockedCount: achievements.filter((a) => a.unlocked).length,
  };
}
