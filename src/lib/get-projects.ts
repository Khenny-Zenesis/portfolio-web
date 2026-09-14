import { head } from "@vercel/blob";
import { prisma } from "@/lib/db";
import type { ProjectCardData } from "@/components/sections/Projects";

// Extracted from page.tsx so both the homepage (which no longer renders
// Projects directly) and the new /projects route can share the same
// query/screenshot-resolution logic rather than duplicating it.
//
// Only the Blob storage key is ever persisted (uploads-and-storage.md) — the
// renderable URL is resolved here, at read time, via head(). head() and
// del() both accept a bare pathname (verified against @vercel/blob's own
// type definitions), so storing the key alone is sufficient; no separate
// "public base URL" needs to be reconstructed or guessed.
async function resolveScreenshotUrl(key: string): Promise<string | null> {
  try {
    const blob = await head(key);
    return blob.url;
  } catch (error) {
    // TEMPORARY — sharpened for live debugging of a production-only "image
    // silently doesn't render" report (confirmed via HAR file: zero network
    // requests, not even a failed one — this catch path returning null
    // instead of throwing is exactly why: Projects.tsx's
    // `screenshots[0]?.url &&` gate never renders the <Image> at all when
    // this happens). Logging error.name/message explicitly because a raw
    // Error object often serializes uselessly (e.g. just "{}") in Vercel's
    // Runtime Log viewer. Remove once the underlying cause is confirmed.
    const name = error instanceof Error ? error.name : typeof error;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[get-projects] head() failed for screenshot key="${key}" — ${name}: ${message}`);
    return null;
  }
}

export type ProjectLink = {
  title: string;
  techStack: string[];
  liveUrl: string | null;
  githubUrl: string | null;
};

// Minimal query for Skills.tsx's "proof link" chips — deliberately separate
// from getProjects() above, which also resolves every screenshot's Blob URL
// (a network round-trip per screenshot) that a skill chip has no use for.
// Only published projects: an unpublished project (e.g. this portfolio
// itself, still being built) shouldn't be linked to from a skill chip
// before it's real.
export async function getProjectLinks(): Promise<ProjectLink[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { title: true, techStack: true, liveUrl: true, githubUrl: true },
    orderBy: [{ featured: "desc" }, { completedAt: { sort: "desc", nulls: "first" } }],
  });
  return projects;
}

export async function getProjects(): Promise<ProjectCardData[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    // Exact query PRD 5A item 5 / database-schema.md's index describes:
    // featured first, then most recently completed.
    // nulls: "first" is explicit, not incidental — an in-progress project
    // (no completedAt yet) should read as current, not as if it sorted last
    // by defaulting to the DB's ordinary NULLS LAST behavior for ASC/absent
    // direction.
    orderBy: [{ featured: "desc" }, { completedAt: { sort: "desc", nulls: "first" } }],
  });

  return Promise.all(
    projects.map(async (project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      category: project.category,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      completedAt: project.completedAt ? project.completedAt.toISOString() : null,
      screenshots: await Promise.all(
        project.screenshots.map(async (key) => ({
          key,
          url: await resolveScreenshotUrl(key),
        }))
      ),
    }))
  );
}
