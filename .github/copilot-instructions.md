## Purpose

Short, practical guidance for AI coding agents working in MentorVerse (Next.js + TypeScript).
Focus: where AI is integrated, streaming patterns, important files to read, and repo-specific conventions.

## Big-picture architecture

- Frontend: Next.js (app router) React components under `app/` and `components/`.
- Server/API: Serverless API routes live in `app/api/*` (e.g. `app/api/chat/route.ts`, `check-answer`, `dsa-question`, `explain-concept`). These are the primary integration points for LLM-driven features.
- AI layer: `lib/gemini.ts` and `lib/ai-mentor.ts` centralize use of `@google/generative-ai` and expose helpers for streaming and model access.
- Local data + state: small local stores and utilities under `lib/` and `lib/store` (e.g. progress tracking in `lib/store/progress-store.ts`).

Read these files first to understand runtime behavior:

- `app/api/chat/route.ts` — streaming chat endpoint, uses Gemini, returns a ReadableStream of text.
- `app/api/check-answer/route.ts` — synchronous generation expecting a JSON-only response; code strips code fences and JSON.parse()s the model output.
- `app/api/dsa-question/route.ts` and `app/api/explain-concept/route.ts` — prompt templates expecting exact JSON or plain text formats.
- `lib/gemini.ts` — helper wrappers for model selection and streaming.
- `components/mentor/chat-interface.tsx` — client-side streaming reader (response.body.getReader()) and how chunks are appended to UI.

Key patterns & conventions (do not break these):

- Streaming vs. JSON endpoints:
  - `POST /api/chat` streams plain text back; clients expect chunked text and append chunks to the assistant message. Do not wrap stream data in JSON.
  - `check-answer` and `dsa-question` endpoints instruct the model to "Return ONLY a JSON object" and the server code strips common code fences before JSON.parse. Maintain that exact-output prompt convention.

- Exact output enforcement: Several APIs rely on the model returning a strict JSON object (no markdown/code fences). If you change prompts, keep the explicit instruction and parsing sanitization.

- Environment variables of interest:
  - `GEMINI_API_KEY` — required by `lib/gemini.ts` and all API handlers that call Gemini.

- Model names used in codebase: `gemini-2.0-flash-exp` (see `app/api/*` and `lib/gemini.ts`). Use the same model identifier when adding or testing new prompts.

- Client-side storage keys used by features:
  - `mentorverse_interviews` — used by the chat UI to include interview context in prompts.
  - `mentorverse-theme` — theme preference (see `components/theme-provider.tsx`).

- Progress tracking: the chat UI records mentor sessions via `useProgressStore()` (see `lib/store/progress-store.ts`). If you change session shape, update both client and store.

Developer workflows / commands

- Install + dev: repo has a `pnpm-lock.yaml` — prefer `pnpm install` then `pnpm dev` (scripts in `package.json` use Next commands: `dev`, `build`, `start`). If you use npm: `npm run dev` works too.
- Build: `pnpm build` / `npm run build`.

Testing and quick debugging tips

- To test AI endpoints locally, set `GEMINI_API_KEY` in your environment before `pnpm dev` (PowerShell):

  $env:GEMINI_API_KEY = 'sk-...' ; pnpm dev

- Chat streaming behavior: use `components/mentor/chat-interface.tsx` as the canonical client-side example. Any new client that consumes `/api/chat` must implement incremental reads from `response.body` and append chunks.

Project-specific conventions

- Prompt-driven contracts: Many server routes inline templates that require very specific output shapes; prompts explicitly ask for "ONLY a JSON object". Treat these as API contracts.
- Minimal model post-processing: server code often does only simple text-cleaning and JSON.parse. Avoid relying on complex post-processing of LLM output.
- UI primitives: components reuse `components/ui/*` primitives and Tailwind utilities. Use `lib/utils.ts` (`cn`) for class merging.

Where to look when things break

- If streaming stalls: check `app/api/chat/route.ts` for stream implementation and `components/mentor/chat-interface.tsx` reader loop.
- If JSON.parse fails on endpoints: inspect the prompt in the route and logged output in server logs (handlers log model output before parsing).
- Env variable problems: ensure `GEMINI_API_KEY` is set. The code includes a fallback key — do NOT commit or rely on it for production.

Example snippets (canonical usage)

- Client -> chat (streaming): send messages array to `/api/chat`; read response.body as stream and append chunks to assistant message (see `components/mentor/chat-interface.tsx`).
- Server -> Gemini: use `getGenerativeModel({model: 'gemini-2.0-flash-exp'})` and `startChat()` or `generateContent()` (see `lib/gemini.ts`).

If anything is unclear or you want the instructions to include CI, deploy, or more runtime/debugging steps (e.g., Vercel specifics), tell me and I will expand this file.

Files referenced: `app/api/*`, `lib/gemini.ts`, `lib/ai-mentor.ts`, `lib/question-generator.ts`, `components/mentor/chat-interface.tsx`, `components/theme-provider.tsx`, `lib/store/*`.
