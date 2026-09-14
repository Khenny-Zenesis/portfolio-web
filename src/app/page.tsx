import { prisma } from "@/lib/db";
import { getProjectLinks } from "@/lib/get-projects";
import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Skills, { type SkillData } from "@/components/sections/Skills";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";

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
  const [skills, projectLinks] = await Promise.all([getSkills(), getProjectLinks()]);

  return (
    <>
      <Navbar />
      {/* Single max-width container for the whole page, per the reported
          bug: no container existed anywhere, so content ran edge-to-edge.
          Each section only handles its own vertical rhythm
          (paddingTop/Bottom); horizontal max-width/centering/side-padding
          lives here, once. paddingTop offsets the fixed Navbar so it never
          covers Hero's content. */}
      <main
        style={{
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "var(--space-6)",
          paddingRight: "var(--space-6)",
          paddingTop: NAVBAR_HEIGHT,
        }}
      >
        <Hero />
        {/* About and Projects both live at their own routes now (/about,
            /projects) — per explicit request, reached only by clicking
            their Navbar links, never stumbled into by scrolling the
            homepage. */}
        <Skills skills={skills} projectLinks={projectLinks} />
        <Education />
        <Contact />
      </main>
    </>
  );
}
