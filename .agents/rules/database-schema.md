# database-schema.md

## Purpose
Governs how data is modeled and accessed in this project.

## Rules

- **All database access goes through Prisma.** No raw SQL queries anywhere in the codebase.
- **The database is never accessed from client components.** Only server components and API routes touch Prisma.
- **Required indexes are not optional:** `Project` must be indexed on `[published, featured, completedAt]` (the exact query the public grid runs) and on `[category]` (the filter). `Skill` is indexed on `[category]`. `CoverLetterGeneration` is indexed on `[ipAddress, generatedAt]` (the rate-limit check) — these aren't general best practice, they're the specific queries this product actually runs.
- **JSON fields use JSONB, not JSON**, for query performance — `ChatSession.messages` specifically.
- **All four NextAuth Prisma adapter tables (`User`, `Account`, `Session`, `VerificationToken`) are required exactly as NextAuth v5 expects them.** Do not rename or remove a field on these tables even if it looks unused — NextAuth's adapter depends on the exact shape.
- **Screenshots field on `Project` stores only Vercel Blob storage keys — never a file, a base64 string, or a full URL to an external, non-Blob source.**
- **Any operation writing to two tables at once uses a transaction.**

## Migrations

- Run `prisma migrate dev` locally for every schema change — never hand-edit the database directly.
- Migration commit messages describe the schema change plainly (e.g. "Add featured index to Project"), not just "update schema."