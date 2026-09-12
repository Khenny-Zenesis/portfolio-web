---
name: api-route-scaffolding
description: Use when creating any new file under app/api/. Triggers include new API route, route.ts, new endpoint, new handler.
---

# api-route-scaffolding

Teaches the correct order of operations for assembling any new route handler. Laws live in security.md (auth/rate-limit requirements, no raw error exposure), coding-standards.md (Zod validation, typed handlers, no `any`), ai-pipeline.md (rate limit specifics for AI routes).

## Steps

1. Determine what this route needs: admin auth, rate limiting, or both. Admin routes need auth. `/api/chat` and `/api/cover-letter` need rate limiting.
2. If it's an admin route, rely on `middleware.ts` — do not re-implement auth checking inside the handler.
3. If it's a public/AI-facing route, check the Upstash Redis rate-limit counter first, before parsing the body or touching anything else. Return 429 immediately if exceeded.
4. Parse and validate the request body against its Zod schema before calling the database or any external API.
5. Run the real logic.
6. Wrap the logic in try/catch. On failure, log full detail server-side. Return only a pre-written, non-technical message to the client.
7. Return a typed response.

## Code skeleton

```typescript
export async function POST(request: Request) {
  const rate = await checkRateLimit(request); // step first, always
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, message: "Rate limit reached." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = someSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const result = await doRealWork(parsed.data);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[route-name] error", error); // full detail, server-side only
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
```

## Traps

- Validating input before checking the rate limit, wasting a full parse on a request that should've been rejected first.
- Wrapping only the external API call in try/catch, missing errors from the database write.
- Returning `error.message` directly to the client.
- Assuming an admin route doesn't also need rate limiting if it becomes a future write-heavy endpoint.

## Verify before done

- Hit the route with malformed input — expect a clean 400, not a 500.
- Hit the route past its rate limit — expect 429, not a crash or a partial success.
- Force an internal failure (e.g. a temporary DB disconnect) — confirm the client sees the pre-written message and the server log has the real detail.
- Tests to write: a test with malformed input asserting 400; a test exceeding the rate limit asserting 429; a test forcing an internal error asserting the response body contains no raw error detail.