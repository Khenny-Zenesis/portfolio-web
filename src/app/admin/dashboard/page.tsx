import { prisma } from "@/lib/db";
import ProjectList from "@/components/admin/ProjectList";

// Protected by proxy.ts (NextAuth v5) — no auth check re-implemented here,
// per api-route-scaffolding skill's admin-route rule. Queries Prisma
// directly (a Server Component, so this satisfies database-schema.md's
// "only server components and API routes touch Prisma").
// Never statically prerendered: this is session-gated admin data, and it
// must reflect writes immediately (create/edit/delete/toggle), not whatever
// was true at the last build.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { completedAt: { sort: "desc", nulls: "first" } }],
  });

  return (
    <ProjectList
      projects={projects.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        featured: p.featured,
        published: p.published,
        completedAt: p.completedAt ? p.completedAt.toISOString().slice(0, 10) : null,
      }))}
    />
  );
}
