# coding-standards.md

## Purpose
Governs how code in this project is written, day to day — not what to build (see PRD.md) or how the project is arranged (see AGENTS.md Section 4).

## Rules

- **Never use the `any` TypeScript type.** Find or define the correct type. This includes API responses from OpenAI, Flutterwave-adjacent patterns, and form event handlers — the places `any` most commonly sneaks in.
- **Every function parameter and return value is explicitly typed.** No relying on inference for anything that crosses a function boundary.
- **Every AI-facing or database-facing function has real error handling** — no bare `try/catch` that swallows an error silently. A caught error either produces a real fallback state the user sees, or is re-thrown with added context.
- **Zod schemas validate all form and API input** — never trust a request body's shape without checking it first.
- **Client and server code stay clearly separated.** A file that queries the database or calls OpenAI is never imported into a client component.

## Convention (not a hard rule — downgraded after debate)

Comments should generally explain *why* a decision was made, not narrate what the code obviously does. This is a strong convention carried over from every other project in this portfolio, but it's a style preference, not something that fails a task if occasionally missed.