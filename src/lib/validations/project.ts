import { z } from "zod";

// The four filter categories from PRD 5A item 4. A project can belong to
// more than one (see prisma/schema.prisma's note on Project.category — the
// real seed content tags Provly "AI Tool + Startup").
export const PROJECT_CATEGORIES = [
  "Product Design",
  "Web App",
  "AI Tool",
  "Startup",
] as const;

// Zod schemas validate all form and API input, per coding-standards.md.
// Shared by the create and update paths in api/admin/projects/route.ts so
// visibility/featured toggles go through the same validation as a full edit
// — no separate, unvalidated "quick toggle" shortcut
// (project-crud-with-cache-invalidation skill, step 8).
export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  techStack: z.array(z.string().trim().min(1)).min(1, "Add at least one tech stack tag"),
  category: z
    .array(z.enum(PROJECT_CATEGORIES))
    .min(1, "Select at least one category"),
  liveUrl: z.url().optional().or(z.literal("")),
  githubUrl: z.url().optional().or(z.literal("")),
  // Blob storage keys only — never a file, base64, or full external URL.
  // Max 5 enforced here as the authoritative server-side check
  // (uploads-and-storage.md: "never trust the client-side limit alone").
  screenshots: z.array(z.string()).max(5, "Maximum 5 screenshots per project"),
  featured: z.boolean(),
  published: z.boolean(),
  completedAt: z.coerce.date(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// PATCH allows a partial update (e.g. a visibility/featured-only toggle)
// while still running every field it does receive through the same rules.
export const projectUpdateSchema = projectSchema.partial().extend({
  id: z.string().min(1),
});
