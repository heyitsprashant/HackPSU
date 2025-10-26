type Stats = { completed: number; avgScore: number; practiceMinutes: number };
const STATS_KEY = "mv.stats";
const SESS_KEY = "mv.sessions";
const STUDY_KEY = "mv.studySets";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}

export function pushStudySet(set: StudySet) {
  const list = read<StudySet[]>(STUDY_KEY, [])
  const next = [set, ...list].slice(0, 10)
  write(STUDY_KEY, next)
}
export function getStudySets(): StudySet[] {
  return read<StudySet[]>(STUDY_KEY, [])
}
export function clearStudySets() {
  write(STUDY_KEY, [])
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

export function getUserStats(): Stats {
  return read<Stats>(STATS_KEY, { completed: 0, avgScore: 0, practiceMinutes: 0 });
}
export function setUserStats(partial: Partial<Stats>) {
  const cur = getUserStats();
  const next = { ...cur, ...partial };
  write(STATS_KEY, next);
  return next;
}

export type Session = {
  id: string; mode: "quick"|"full"|"behavioral"|"system";
  startedAt: string; endedAt?: string; durationMin?: number;
  questions: { id: string; prompt: string; difficulty?: "E"|"M"|"H" }[];
  artifacts?: { code?: string; notes?: string; diagramUrl?: string };
  score?: number; rubric?: any;
  transcript?: { role: "user"|"ai"; text: string }[];
};

type SessionMap = Record<string, Session[]>;

export type StudySet = {
  id: string;
  createdAt: string;
  summary: { company?: string|null; position?: string|null; interview_type?: string|null };
  parsed: any;
  questions: any; // generated questions payload
};

// Helpers to bridge various question payloads into Session.questions
function normalizeQuestions(gen: any): { id: string; prompt: string }[] {
  if (!gen) return []
  if (Array.isArray(gen.questions)) {
    return gen.questions.map((q: any, i: number) => ({ id: q.id || String(i), prompt: q.prompt || q.title || q.question || "" }))
  }
  if (Array.isArray(gen.categories)) {
    const arr: { id: string; prompt: string }[] = []
    gen.categories.forEach((c: any) => (c.questions || []).forEach((q: any, i: number) => arr.push({ id: q.id || String(i), prompt: q.prompt || q.title || q.question || "" })))
    return arr
  }
  return []
}

function mapModeFromParsed(parsed: any): Session["mode"] {
  const t = String(parsed?.interview_type || "").toLowerCase()
  if (t.includes("behavior")) return "behavioral"
  if (t.includes("system")) return "system"
  if (t.includes("quick")) return "quick"
  return "full"
}

export function getSession(mode: Session["mode"], id: string): Session | undefined {
  const list = getSessions(mode)
  return list.find((s) => s.id === id)
}

export function updateSession(mode: Session["mode"], id: string, patch: Partial<Session>) {
  const all = read<SessionMap>(SESS_KEY, {})
  const list = all[mode] ?? []
  const idx = list.findIndex((s) => s.id === id)
  if (idx >= 0) {
    const next = { ...list[idx], ...patch }
    const newList = [...list]
    newList[idx] = next
    write(SESS_KEY, { ...all, [mode]: newList })
  }
}

export function createSessionFromEmail(parsed: any, gen: any) {
  const mode = mapModeFromParsed(parsed)
  const id = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string
  let qs = normalizeQuestions(gen)
  const emailQs: string[] = Array.isArray(parsed?.extracted_questions) ? parsed.extracted_questions.slice(0, 8) : []
  if (emailQs.length > 0) {
    qs = emailQs.map((q, i) => ({ id: `seed-${i+1}`, prompt: q }))
  }
  const s: Session = { id, mode, startedAt: new Date().toISOString(), questions: qs, transcript: [] }
  pushSession(mode, s)
  return { mode, id }
}

export function pushSession(mode: Session["mode"], s: Session) {
  const all = read<SessionMap>(SESS_KEY, {});
  const list = [s, ...(all[mode] ?? [])].slice(0, 10);
  const next = { ...all, [mode]: list };
  write(SESS_KEY, next);
}
export function getSessions(mode: Session["mode"]): Session[] {
  const all = read<SessionMap>(SESS_KEY, {});
  return (all[mode] ?? []).sort((a,b)=> (b.startedAt > a.startedAt ? 1 : -1));
}
