import { notFound } from "next/navigation";
import { head } from "@vercel/blob";
import { prisma } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";

// Session-gated admin data — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const screenshots = await Promise.all(
    project.screenshots.map(async (key) => {
      try {
        const blob = await head(key);
        return { key, url: blob.url };
      } catch {
        return { key, url: null };
      }
    })
  );

  return (
    <ProjectForm
      mode="edit"
      project={{
        id: project.id,
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        category: project.category,
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
        featured: project.featured,
        published: project.published,
        completedAt: project.completedAt
          ? project.completedAt.toISOString().slice(0, 10)
          : "",
        screenshots,
      }}
    />
  );
}
