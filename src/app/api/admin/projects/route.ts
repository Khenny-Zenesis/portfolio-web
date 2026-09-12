import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { projectSchema, projectUpdateSchema } from "@/lib/validations/project";

// Admin route — proxy.ts already enforces auth for /api/admin/:path*, so no
// auth check is re-implemented here (api-route-scaffolding skill, step 2).
//
// GET is intentionally not implemented: the admin dashboard and edit pages
// are Server Components that query Prisma directly (database-schema.md:
// Prisma is only ever touched from server components and API routes — a
// Server Component qualifies). This file exists purely for the mutations a
// client component (ProjectForm, ProjectList) needs to call.
//
// No Vercel KV invalidation here — Phase 1 has no cache configured yet
// (project-crud-with-cache-invalidation skill: build CRUD correctly without
// it, add the kv.delete("portfolio:context") call when KV is introduced).
// revalidatePath below is ordinary Next.js page freshness, a separate
// concern from that AI-context cache.

function revalidatePublicAndAdmin() {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid project data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.create({ data: parsed.data });
    revalidatePublicAndAdmin();
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("[api/admin/projects] create error", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid project data.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Visibility/featured toggles go through this exact same path — there is
  // no separate "quick toggle" route that could skip validation
  // (project-crud-with-cache-invalidation skill, step 8).
  const { id, ...data } = parsed.data;

  try {
    // If the screenshots array changed, any key present before but absent
    // now was just removed from the project — clean it up in Blob too, for
    // the same orphaned-storage reason Open Question 4 was resolved this
    // way for full project deletion.
    if (data.screenshots) {
      const existing = await prisma.project.findUnique({
        where: { id },
        select: { screenshots: true },
      });
      const removedKeys = (existing?.screenshots ?? []).filter(
        (key) => !data.screenshots!.includes(key)
      );
      if (removedKeys.length > 0) {
        await del(removedKeys).catch((error) => {
          // Log and continue — a Blob cleanup failure shouldn't block the
          // actual data save the admin is waiting on.
          console.error("[api/admin/projects] blob cleanup error", error);
        });
      }
    }

    const project = await prisma.project.update({ where: { id }, data });
    revalidatePublicAndAdmin();
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("[api/admin/projects] update error", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Missing project id." },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { screenshots: true },
    });
    if (!project) {
      return NextResponse.json(
        { ok: false, message: "Project not found." },
        { status: 404 }
      );
    }

    // Open Question 4, resolved: delete the project's Blob files too.
    // Deleted before the DB row so a failure here aborts the whole
    // operation rather than leaving a DB row pointing at deleted images.
    if (project.screenshots.length > 0) {
      await del(project.screenshots);
    }

    await prisma.project.delete({ where: { id } });
    revalidatePublicAndAdmin();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/projects] delete error", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
