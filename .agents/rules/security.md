# security.md

## Purpose
Governs authentication, secrets, and abuse-resistance. This is the file with the most real teeth — an admin compromise or a leaked API key are genuinely expensive failures, not style issues.

## Rules

- **No agent ever writes a real API key, token, password, or secret into any file.** `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `KV_REST_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXTAUTH_SECRET`, `RESEND_API_KEY` — every one of these is written into `.env` by hand, by Kehinde, every time.
- **No agent ever logs or prints a secret value in console output**, even for debugging.
- **All routes matching `/admin/*` are protected by NextAuth middleware.** An unauthenticated request to any admin route redirects to `/admin/login` — no exceptions, no partial admin views for unauthenticated visitors.
- **The admin login page is never linked from any public-facing page or navigation element.** Reachable only by direct URL.
- **Visitors never authenticate.** There is no visitor login system anywhere in this product — authentication exists solely for the single admin user.
- **All rate limiting uses Upstash Redis — never an in-memory counter.** In-memory counters reset on serverless cold starts, which means they silently stop working under real production conditions. This is not a style preference; a rate limit that quietly fails is functionally the same as no rate limit at all.
- **Rate limits**: `/api/chat` — 20 messages per IP per hour. `/api/cover-letter` — 5 generations per IP per hour, treated with real weight now that this feature is public-facing, not just a personal convenience limit.
- **No raw error message, stack trace, or environment variable name is ever shown to a visitor.** Every failure state shows a specific, pre-written, honest message instead (see error copy in the PRD).
- **The chatbot's system prompt explicitly instructs the model never to fabricate information beyond what's provided** — this is a trust and reputation risk (a recruiter reading a false claim about Kehinde's experience), not just an accuracy nicety.