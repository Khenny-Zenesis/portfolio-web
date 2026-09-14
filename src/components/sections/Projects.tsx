"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { PROJECT_CATEGORIES } from "@/lib/validations/project";
import Reveal from "@/components/Reveal";

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  completedAt: string | null;
  screenshots: { key: string; url: string | null }[];
};

const FILTERS = ["All", ...PROJECT_CATEGORIES] as const;

// Simple CSS device frame around a screenshot: a browser-chrome bar for
// Web App/AI Tool projects (our two literal "on the web" categories), a
// phone bezel outline as the fallback for anything else. No schema field
// distinguishes "mobile-styled" explicitly, so this maps directly off the
// existing category taxonomy rather than inventing a new one.
function DeviceFrame({ category, children }: { category: string[]; children: ReactNode }) {
  const isBrowserStyle = category.includes("Web App") || category.includes("AI Tool");

  if (isBrowserStyle) {
    return (
      <div style={{ background: "var(--color-bg-tertiary)" }}>
        <div
          style={{ gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)" }}
          className="flex items-center"
        >
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-error)" }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-warning)" }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-success)" }} />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ border: "8px solid var(--color-bg-tertiary)", borderRadius: "var(--radius-xl)" }}>
      {children}
    </div>
  );
}

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
    <section id="projects" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
      <Reveal>
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        Projects
      </h2>

      <div
        style={{ marginTop: "var(--space-6)", gap: "var(--space-3)" }}
        className="flex flex-wrap"
        role="group"
        aria-label="Filter projects by category"
      >
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
                padding: "var(--space-2) var(--space-4)",
              }}
              className="border text-sm font-medium"
            >
              {filter}
            </button>
          );
        })}
      </div>
      </Reveal>

      <div
        style={{ marginTop: "var(--space-8)", gap: "var(--space-6)" }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        {visible.map((project, index) => {
          // One button, not two: liveUrl wins when both exist, per the
          // "linking to the live URL or GitHub" fallback this was specified
          // with — replaces the previous separate Live/GitHub links rather
          // than adding a third, redundant one.
          const caseStudyUrl = project.liveUrl || project.githubUrl;

          return (
            <Reveal key={project.id}>
            <article
              style={{
                borderRadius: "var(--radius-lg)",
                borderColor: "var(--color-border)",
                // Same faint top-left corner glow as the premium-card
                // treatment on Skills/Education/Contact (a second
                // background-image layered under the solid color) — brings
                // Projects into the same visual family. hover-lift already
                // gives these cards a border-brighten + lift + shadow on
                // hover (a bit more elaborate than premium-card's own
                // border-only hover), so that's left as-is rather than
                // stacking a second, conflicting transform declaration.
                backgroundImage:
                  "radial-gradient(circle at top left, color-mix(in srgb, var(--color-info) 7%, transparent), transparent 65%)",
                backgroundColor: "var(--color-bg-secondary)",
              }}
              className="hover-lift flex flex-col overflow-hidden border"
            >
              {project.screenshots[0]?.url && (
                <DeviceFrame category={project.category}>
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
                </DeviceFrame>
              )}

              <div
                style={{ gap: "var(--space-3)", padding: "var(--space-6)" }}
                className="flex flex-1 flex-col"
              >
                <div style={{ gap: "var(--space-3)" }} className="flex items-start justify-between">
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
                        padding: "var(--space-1) var(--space-3)",
                      }}
                      className="shrink-0 text-xs font-semibold"
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

                <div style={{ gap: "var(--space-2)" }} className="flex flex-wrap">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontFamily: "var(--font-primary)",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-bg-tertiary)",
                        color: "var(--color-text-secondary)",
                        padding: "var(--space-1) var(--space-3)",
                      }}
                      className="text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {caseStudyUrl && (
                  <a
                    href={caseStudyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-primary)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      padding: "var(--space-2) var(--space-4)",
                      marginTop: "auto",
                      alignSelf: "flex-start",
                    }}
                    className="hover-lift text-sm font-semibold"
                  >
                    Case Study ↗
                  </a>
                )}
              </div>
            </article>
            </Reveal>
          );
        })}

        {visible.length === 0 && (
          <p
            style={{
              fontFamily: "var(--font-primary)",
              color: "var(--color-text-muted)",
              paddingTop: "var(--space-8)",
              paddingBottom: "var(--space-8)",
            }}
            className="col-span-full text-center"
          >
            No projects in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
