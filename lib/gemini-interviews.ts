export async function generateInterview(mode: "quick"|"full"|"behavioral"|"system", constraints?: any) {
  const url = "/api/gemini/generate";
  let attempt = 0;
  const max = 3;
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  while (true) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, constraints }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (++attempt >= max) throw e;
      await delay(2 ** attempt * 250);
    }
  }
}

export async function evaluateSubmission(mode: "quick"|"full"|"behavioral"|"system", payload: any, onChunk?: (t: string) => void) {
  const res = await fetch("/api/gemini/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, payload }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) return await res.json();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    full += chunk;
    onChunk?.(chunk);
  }
  try { return JSON.parse(full); } catch { return { score: 0, feedback: full } }
}
