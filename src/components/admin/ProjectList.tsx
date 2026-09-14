"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type AdminProjectRow = {
  id: string;
  title: string;
  category: string[];
  featured: boolean;
  published: boolean;
  completedAt: string | null;
};

// Focus trap for the delete confirmation modal, per focus-trap-implementation
// skill: save focus on open, move focus in, cycle Tab/Shift+Tab within the
// container, Escape closes, restore focus on close. The focusable-elements
// list is re-queried on every keydown rather than cached once at open —
// the skill's own code skeleton caches it, which goes stale if the modal's
// content ever changes while open (e.g. an error message appearing).
function useFocusTrap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  onClose: () => void
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    previouslyFocused.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

    getFocusable()[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, containerRef, onClose]);
}

// PRD 5B: full project CRUD, visibility/featured toggles (routed through the
// same validated API as a full edit — project-crud-with-cache-invalidation
// skill, step 8), delete with a focus-trapped confirmation modal.
export default function ProjectList({ projects }: { projects: AdminProjectRow[] }) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "published" | "drafts">("all");
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, deleteTargetId !== null, () => setDeleteTargetId(null));

  async function toggle(id: string, field: "featured" | "published", value: boolean) {
    setBusyId(id);
    try {
      await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setBusyId(deleteTargetId);
    try {
      await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTargetId }),
      });
      setDeleteTargetId(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const deleteTarget = projects.find((p) => p.id === deleteTargetId);
  const visibleProjects = projects.filter((project) => {
    const matchesQuery = `${project.title} ${project.category.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesView =
      view === "all" || (view === "published" ? project.published : !project.published);
    return matchesQuery && matchesView;
  });
  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;

  return (
    <main className="admin-shell">
      <div className="admin-topbar">
        <div>
          <p className="admin-kicker">Kehinde Omolola / Studio</p>
          <h1 className="admin-title">Portfolio control room</h1>
        </div>
        <Link href="/admin/projects/new" className="admin-primary-action">
          <span aria-hidden="true">+</span> New project
        </Link>
      </div>

      <section className="admin-intro">
        <div>
          <p className="admin-eyebrow">Content library</p>
          <h2>Projects</h2>
          <p>Shape the work people see first. Keep the story sharp, current, and unmistakably yours.</p>
        </div>
        <div className="admin-stat-grid" aria-label="Project overview">
          <div><strong>{projects.length}</strong><span>Total projects</span></div>
          <div><strong>{publishedCount}</strong><span>Published</span></div>
          <div><strong>{featuredCount}</strong><span>Featured</span></div>
        </div>
      </section>

      <section className="admin-toolbar" aria-label="Project filters">
        <label className="admin-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            placeholder="Search by title or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="admin-segmented" role="group" aria-label="Filter projects">
          {(["all", "published", "drafts"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              className={view === option ? "is-active" : ""}
              onClick={() => setView(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <ul className="admin-project-list">
        {visibleProjects.map((project, index) => (
          <li
            key={project.id}
            className="admin-project-card"
          >
            <div className="admin-project-index">0{index + 1}</div>
            <div className="admin-project-details">
              <div className="admin-project-heading">
                <p>{project.title}</p>
                {project.featured && <span className="admin-badge featured">Featured</span>}
              </div>
              <p className="admin-project-meta">{project.category.join(" / ")} <span>·</span> {project.completedAt ?? "In progress"}</p>
            </div>
            <div className="admin-project-controls">
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={project.featured}
                  disabled={busyId === project.id}
                  onChange={(e) => toggle(project.id, "featured", e.target.checked)}
                />
                <span>Featured</span>
              </label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={project.published}
                  disabled={busyId === project.id}
                  onChange={(e) => toggle(project.id, "published", e.target.checked)}
                />
                <span>{project.published ? "Live" : "Draft"}</span>
              </label>
              <div className="admin-card-actions">
                <Link href={`/admin/projects/${project.id}`}>Edit project <span aria-hidden="true">↗</span></Link>
                <button type="button" onClick={() => setDeleteTargetId(project.id)} aria-label={`Delete ${project.title}`}>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}

        {visibleProjects.length === 0 && (
          <li className="admin-empty-state">No projects match this view.</li>
        )}
      </ul>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => setDeleteTargetId(null)}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-elevated)",
              borderRadius: "var(--radius-lg)",
              borderColor: "var(--color-border)",
            }}
            className="w-full max-w-sm border p-6"
          >
            <h2
              id="delete-modal-title"
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
              className="text-lg font-semibold"
            >
              Delete &ldquo;{deleteTarget.title}&rdquo;?
            </h2>
            <p
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="mt-2 text-sm"
            >
              This also deletes its screenshots from storage. This cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                style={{
                  fontFamily: "var(--font-primary)",
                  borderRadius: "var(--radius-md)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
                className="border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busyId === deleteTarget.id}
                style={{
                  fontFamily: "var(--font-primary)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-error)",
                  color: "var(--color-on-error)",
                }}
                className="px-4 py-2 text-sm font-semibold"
              >
                {busyId === deleteTarget.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
