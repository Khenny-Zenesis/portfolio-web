"use client";

import { useState } from "react";
import Image from "next/image";
import { PROJECT_CATEGORIES } from "@/lib/validations/project";

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  completedAt: string;
  screenshots: { key: string; url: string | null }[];
};

const FILTERS = ["All", ...PROJECT_CATEGORIES] as const;

// PRD 5A items 4-6, 11. Client-side category filter (item 4): the projects
// array itself is fetched once, server-side, in page.tsx — only the active
// filter is client state here.
export default function Projects({ projects }: { projects: ProjectCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category.includes(activeFilter));

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16">
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        Projects
      </h2>

      <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Filter projects by category">
        {FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={isActive}
              style={{
                fontFamily: "var(--font-primary)",
                borderRadius: "var(--radius-full)",
                borderColor: "var(--color-border-accent)",
                background: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "var(--color-on-primary)" : "var(--color-text-primary)",
              }}
              className="border px-4 py-2 text-sm font-medium"
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((project, index) => (
          <article
            key={project.id}
            style={{
              borderRadius: "var(--radius-lg)",
              borderColor: "var(--color-border)",
              background: "var(--color-bg-secondary)",
            }}
            className="flex flex-col overflow-hidden border"
          >
            {project.screenshots[0]?.url && (
              <div className="relative aspect-video w-full">
                <Image
                  src={project.screenshots[0].url}
                  alt={`${project.title} screenshot`}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3
                  style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
                  className="text-xl font-semibold"
                >
                  {project.title}
                </h3>
                {project.featured && (
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-primary-container)",
                      color: "var(--color-on-primary-container)",
                    }}
                    className="shrink-0 px-3 py-1 text-xs font-semibold"
                  >
                    Featured
                  </span>
                )}
              </div>

              <p
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
                className="text-sm leading-relaxed"
              >
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontFamily: "var(--font-primary)",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-bg-tertiary)",
                      color: "var(--color-text-secondary)",
                    }}
                    className="px-3 py-1 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex gap-4 pt-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-primary)", color: "var(--color-primary)" }}
                    className="text-sm font-semibold"
                  >
                    Live ↗
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--font-primary)", color: "var(--color-secondary)" }}
                    className="text-sm font-semibold"
                  >
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}

        {visible.length === 0 && (
          <p
            style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-muted)" }}
            className="col-span-full py-8 text-center"
          >
            No projects in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
