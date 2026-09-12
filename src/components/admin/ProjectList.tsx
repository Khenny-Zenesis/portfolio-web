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
  completedAt: string;
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          className="text-3xl"
        >
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          style={{
            fontFamily: "var(--font-primary)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
          className="px-4 py-2 text-sm font-semibold"
        >
          + New project
        </Link>
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {projects.map((project) => (
          <li
            key={project.id}
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border p-4"
          >
            <div>
              <p
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
                className="font-semibold"
              >
                {project.title}
              </p>
              <p
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-muted)" }}
                className="text-sm"
              >
                {project.category.join(", ")} · {project.completedAt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={project.featured}
                  disabled={busyId === project.id}
                  onChange={(e) => toggle(project.id, "featured", e.target.checked)}
                />
                Featured
              </label>
              <label
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={project.published}
                  disabled={busyId === project.id}
                  onChange={(e) => toggle(project.id, "published", e.target.checked)}
                />
                Published
              </label>
              <Link
                href={`/admin/projects/${project.id}`}
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-secondary)" }}
                className="text-sm font-semibold"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTargetId(project.id)}
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-error)" }}
                className="text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </li>
        ))}

        {projects.length === 0 && (
          <p style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-muted)" }}>
            No projects yet.
          </p>
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
    </div>
  );
}
