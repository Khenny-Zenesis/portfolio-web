import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import Projects from "@/components/sections/Projects";
import { getProjects } from "@/lib/get-projects";

// Real, separate route — same pattern as /about. Per explicit request,
// Projects should be reached by clicking the Navbar's "Projects" link, not
// stumbled into by scrolling the homepage.
//
// Must reflect admin edits immediately (project-crud-with-cache-invalidation
// skill's own verification step), so this can't be statically prerendered
// like /about could — same reasoning as the homepage.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Navbar />
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
        <Projects projects={projects} />
      </main>
    </>
  );
}
