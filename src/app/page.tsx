import { head } from "@vercel/blob";
import { prisma } from "@/lib/db";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects, { type ProjectCardData } from "@/components/sections/Projects";
import Skills, { type SkillData } from "@/components/sections/Skills";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";

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
    console.error("[page] failed to resolve screenshot", key, error);
    return null;
  }
}

async function getProjects(): Promise<ProjectCardData[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    // Exact query PRD 5A item 5 / database-schema.md's index describes:
    // featured first, then most recently completed.
    orderBy: [{ featured: "desc" }, { completedAt: "desc" }],
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
      completedAt: project.completedAt.toISOString(),
      screenshots: await Promise.all(
        project.screenshots.map(async (key) => ({
          key,
          url: await resolveScreenshotUrl(key),
        }))
      ),
    }))
  );
}

async function getSkills(): Promise<SkillData[]> {
  const skills = await prisma.skill.findMany({ orderBy: { category: "asc" } });
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
  }));
}

// Never statically prerendered: this page must reflect admin edits
// immediately (project-crud-with-cache-invalidation skill's own verification
// step — "Add a project... Confirm it appears in the public grid
// immediately, not after a wait"), and the mutation routes' revalidatePath
// calls only matter if this page renders per-request rather than being
// baked in at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, skills] = await Promise.all([getProjects(), getSkills()]);

  return (
    <main>
      <Hero />
      <About />
      <Projects projects={projects} />
      <Skills skills={skills} />
      <Education />
      <Contact />
    </main>
  );
}
