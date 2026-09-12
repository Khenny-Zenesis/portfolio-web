---
name: project-crud-with-cache-invalidation
description: Use when adding, editing, deleting, or toggling visibility/featured status on a Project. Triggers include ProjectForm.tsx, ProjectList.tsx, /api/admin/projects, /api/admin/upload, add project, edit project, delete project, toggle visibility, toggle featured.
---

# project-crud-with-cache-invalidation

Teaches the correct order for any Project admin mutation. Laws live in database-schema.md (Prisma-only access, screenshots store keys only), uploads-and-storage.md (Blob rules, file limits), ai-pipeline.md (KV cache key and invalidation), security.md (admin route protection).

## Steps

1. Assume the request already passed NextAuth middleware on `/admin/*`. Do not re-check auth inside the handler.
2. Validate the incoming form data against the Zod project schema before touching the database or Blob.
3. If screenshots are included, upload each to Vercel Blob first. Enforce JPEG/PNG/WebP only, 2MB max per file, 5 files max per project. Collect the returned storage keys.
4. Write or update the Project record via Prisma. Store only the Blob storage keys in `screenshots` — never file data, never a full external URL.
5. On a successful write, immediately call `kv.delete("portfolio:context")`. Do not wait for the 300-second TTL to expire.
6. Return the updated project to the client.
7. For delete: require the confirmation modal to actually be submitted before deleting. Decide and document Blob cleanup behavior — this is an open question in uploads-and-storage.md, resolve it here.
8. For visibility/featured toggles specifically: route them through this same validated, cache-invalidating flow. Do not build a separate "quick toggle" shortcut that skips cache invalidation.

## Code skeleton

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const screenshotKeys: string[] = [];
  for (const file of parsed.data.screenshots ?? []) {
    const key = await uploadToBlob(file); // enforces type/size/count
    screenshotKeys.push(key);
  }

  const project = await prisma.project.upsert({
    where: { id: parsed.data.id ?? "" },
    create: { ...parsed.data, screenshots: screenshotKeys },
    update: { ...parsed.data, screenshots: screenshotKeys },
  });

  await kv.delete("portfolio:context"); // never skip this

  return NextResponse.json({ ok: true, project });
}
```

## Traps

- Forgetting the KV invalidation step, leaving the chatbot and cover letter generator serving stale project data.
- Storing the uploaded file object or a full URL instead of just the Blob key.
- Building a separate fast-path for toggles that bypasses cache invalidation.
- Deleting a project without a decided Blob cleanup behavior, leaving orphaned files.

## Verify before done

- Add a project through the real admin UI. Confirm it appears in the public grid immediately, not after a 5-minute wait.
- Ask the chatbot about the new project right after adding it. It should already know, not serve stale context.
- Attempt a 6th screenshot upload — must be rejected.
- Attempt a >2MB or wrong-type file — must be rejected.
- Toggle featured or visibility. Confirm the cache was invalidated, not just the database row updated.
- Tests to write: a test asserting cache is invalidated on create/update/delete; a test asserting upload rejects wrong type, wrong size, and a 6th file; a test asserting only the storage key, never file data, lands in the database row.