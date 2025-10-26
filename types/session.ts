export type Session = {
  id: string; mode: "quick"|"full"|"behavioral"|"system";
  startedAt: string; endedAt?: string; durationMin?: number;
  questions: { id: string; prompt: string; difficulty?: "E"|"M"|"H" }[];
  artifacts?: { code?: string; notes?: string; diagramUrl?: string };
  score?: number; rubric?: any;
  transcript?: { role: "user"|"ai"; text: string }[];
};
