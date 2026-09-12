"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { PROJECT_CATEGORIES } from "@/lib/validations/project";

export type ProjectFormValues = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  published: boolean;
  completedAt: string; // yyyy-mm-dd, for <input type="date">
  screenshots: { key: string; url: string | null }[];
};

const MAX_SCREENSHOTS = 5;

// PRD 5B (create/edit project), uploads-and-storage.md (2MB/5-file limits,
// enforced again here client-side though the API is the real authority),
// project-crud-with-cache-invalidation skill.
export default function ProjectForm({
  mode,
  project,
}: {
  mode: "create" | "edit";
  project?: ProjectFormValues;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [techStackInput, setTechStackInput] = useState(
    project?.techStack.join(", ") ?? ""
  );
  const [category, setCategory] = useState<Set<string>>(
    new Set(project?.category ?? [])
  );
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? true);
  const [completedAt, setCompletedAt] = useState(project?.completedAt ?? "");
  const [screenshots, setScreenshots] = useState(project?.screenshots ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(value: string) {
    setCategory((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    if (screenshots.length + files.length > MAX_SCREENSHOTS) {
      setError(`Maximum ${MAX_SCREENSHOTS} screenshots per project.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          setError(result.message ?? "Upload failed.");
          continue;
        }
        setScreenshots((prev) => [...prev, { key: result.key, url: result.url }]);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeScreenshot(key: string) {
    setScreenshots((prev) => prev.filter((s) => s.key !== key));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (category.size === 0) {
      setError("Select at least one category.");
      return;
    }

    const payload = {
      title,
      description,
      techStack: techStackInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category: Array.from(category),
      liveUrl: liveUrl || undefined,
      githubUrl: githubUrl || undefined,
      screenshots: screenshots.map((s) => s.key),
      featured,
      published,
      completedAt,
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/projects", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? payload : { id: project!.id, ...payload }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(result.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputStyle = {
    borderRadius: "var(--radius-md)",
    borderColor: "var(--color-border)",
    background: "var(--color-bg-secondary)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-primary)",
  };
  const labelStyle = { fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-10">
      <div>
        <label htmlFor="title" style={labelStyle} className="text-sm">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="description" style={labelStyle} className="text-sm">
          Short description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="techStack" style={labelStyle} className="text-sm">
          Tech stack (comma-separated)
        </label>
        <input
          id="techStack"
          value={techStackInput}
          onChange={(e) => setTechStackInput(e.target.value)}
          required
          placeholder="Next.js, TypeScript, Prisma"
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <fieldset>
        <legend style={labelStyle} className="text-sm">
          Category (select all that apply)
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {PROJECT_CATEGORIES.map((c) => (
            <label
              key={c}
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={category.has(c)}
                onChange={() => toggleCategory(c)}
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="liveUrl" style={labelStyle} className="text-sm">
          Live URL (optional)
        </label>
        <input
          id="liveUrl"
          type="url"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="githubUrl" style={labelStyle} className="text-sm">
          GitHub URL (optional)
        </label>
        <input
          id="githubUrl"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="completedAt" style={labelStyle} className="text-sm">
          Completed on
        </label>
        <input
          id="completedAt"
          type="date"
          value={completedAt}
          onChange={(e) => setCompletedAt(e.target.value)}
          required
          style={inputStyle}
          className="mt-1 w-full border px-3 py-2"
        />
      </div>

      <div>
        <span style={labelStyle} className="text-sm">
          Screenshots ({screenshots.length}/{MAX_SCREENSHOTS}) — JPEG, PNG, or WebP, 2MB max each
        </span>
        <div className="mt-2 flex flex-wrap gap-3">
          {screenshots.map((s) => (
            <div key={s.key} className="relative h-20 w-20">
              {s.url && (
                <Image
                  src={s.url}
                  alt="Screenshot preview"
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
              )}
              <button
                type="button"
                onClick={() => removeScreenshot(s.key)}
                aria-label="Remove screenshot"
                style={{ background: "var(--color-error)", color: "var(--color-on-error)" }}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {screenshots.length < MAX_SCREENSHOTS && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="mt-3 text-sm"
            style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
          />
        )}
      </div>

      <div className="flex gap-6">
        <label
          style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
          className="flex items-center gap-2 text-sm"
        >
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        <label
          style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
          className="flex items-center gap-2 text-sm"
        >
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published (visible on public site)
        </label>
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--color-error)", fontFamily: "var(--font-primary)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        style={{
          fontFamily: "var(--font-primary)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          opacity: submitting || uploading ? 0.7 : 1,
        }}
        className="mt-2 px-6 py-3 font-semibold"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
      </button>
    </form>
  );
}
