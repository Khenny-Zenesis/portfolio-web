# uploads-and-storage.md

## Purpose
Governs project screenshot uploads — the only file-upload surface in this product.

## Rules

- **Screenshots are uploaded to Vercel Blob only.** Never stored as binary data, base64, or any form directly in the database.
- **Only the Vercel Blob storage key string is written to `Project.screenshots`** — never a full external URL, never the file itself.
- **Accepted file types: JPEG, PNG, and WebP only.** Anything else is rejected before it reaches Blob.
- **Maximum file size: 2MB per image.**
- **Maximum 5 screenshots per project.** The upload UI enforces this, and the API route enforces it again server-side — never trust the client-side limit alone.
- **Every screenshot renders through the Next.js `Image` component**, never a raw `<img>` tag. Above-the-fold images use the `priority` prop; below-the-fold images lazy-load. Every image has explicit `width` and `height` to prevent layout shift.
- **Open question, not yet resolved**: when a project is deleted, are its Blob files also deleted, or retained? This must be decided and documented before the delete feature is considered complete — an unbounded, orphaned Blob storage is a real, if slow-moving, cost risk.