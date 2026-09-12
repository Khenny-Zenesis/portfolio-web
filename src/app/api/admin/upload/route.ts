import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Admin route — proxy.ts already enforces auth for /api/admin/:path*, so no
// auth check is re-implemented here (api-route-scaffolding skill, step 2).
//
// uploads-and-storage.md: JPEG/PNG/WebP only, 2MB max per image. The 5-per-
// project limit is enforced where the full screenshots array is persisted
// (src/lib/validations/project.ts), since that's the one place that actually
// knows a project's total count regardless of how many separate upload
// calls produced it.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, message: "No file provided." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { ok: false, message: "Only JPEG, PNG, and WebP images are accepted." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Image must be 2MB or smaller." },
      { status: 400 }
    );
  }

  try {
    // Stored key is `pathname` from the result, not `url` — the only value
    // that ever reaches Project.screenshots, per uploads-and-storage.md.
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    // `url` here is only for the admin form's immediate thumbnail preview —
    // it is never what gets persisted. Only `key` (blob.pathname) is ever
    // written to Project.screenshots.
    return NextResponse.json({ ok: true, key: blob.pathname, url: blob.url });
  } catch (error) {
    console.error("[api/admin/upload] error", error);
    return NextResponse.json(
      { ok: false, message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
