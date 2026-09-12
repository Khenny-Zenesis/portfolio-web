# ai-pipeline.md

## Purpose
Governs the two AI features — the chatbot and the cover letter generator — and the shared context-building logic underneath them.

## Rules

- **`context-builder.ts` is the single source of truth for building AI context from the database.** It queries published projects and skills, formats them into text, and is called by both `/api/chat` and `/api/cover-letter`. It is never called from a client component.
- **The chatbot and cover letter generator use two distinct, separately-written system prompts — never a shared, generic one.** These are genuinely different roles: one answers questions conversationally, the other writes a formal letter. A shared prompt risks the chatbot drifting into letter-like formality, or the generator producing conversational filler instead of a real letter. This was debated and kept as a hard rule, not merged for the sake of fewer files.
- **Model selection is locked and justified**: `gpt-4o-mini` for the chatbot (cost efficiency, high message volume expected), `gpt-4o` for the cover letter generator (quality matters more here, volume is lower). Do not swap these without documenting why.
- **The chatbot streams its response; the cover letter generator does not** — it waits for the full response before displaying, since a partial, un-validated letter shown mid-stream would be misleading.
- **System prompt caching**: built once, cached in Vercel KV under key `portfolio:context`, 300-second TTL. Never rebuilt on every individual message. Cache is invalidated immediately — not just left to expire — when an admin updates any `Project` or `Skill` record.
- **Every model call has a timeout and a defined fallback message**: 10 seconds for the chatbot, 15 seconds for the cover letter generator (longer output justifies the longer timeout).
- **The cover letter generator validates word count (250–350 words) after the response returns.** If outside range, retry once with an adjusted instruction. If the second attempt also fails the check, return it anyway rather than leaving the user with nothing — a slightly-off-length real letter beats no letter.
- **Both AI endpoints are rate-limited via Upstash Redis** (see security.md for the exact limits) — this rule is restated here because it's as much an AI-cost-control concern as it is a security one.
- **Neither AI feature may fabricate information not present in the dynamically built context.** This is stated explicitly inside both system prompts, not just assumed from good behavior.