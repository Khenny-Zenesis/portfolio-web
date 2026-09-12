import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

// New route, not in AGENTS.md Section 4's original tree — a direct
// consequence of Open Question 3's resolution (Checkpoint 5): the contact
// form (PRD 5A item 10) persists a ContactSubmission row (for Goal 6's
// tracking metric) and sends a Resend notification email. Neither existed
// when Section 4 was written, since this was still an open question.
//
// No rate limiting: api-route-scaffolding names /api/chat and
// /api/cover-letter as the routes that need it, and Upstash isn't installed
// in Phase 1 (security.md forbids an in-memory substitute).
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  message: z.string().trim().min(1, "Message is required"),
  source: z.enum([
    "LINKEDIN",
    "X",
    "WOMEN_IN_CLOUD",
    "GOOGLE_SEARCH",
    "REFERRAL",
    "OTHER",
  ]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please check the form and try again." },
      { status: 400 }
    );
  }

  try {
    // The database write is the source of truth for Goal 6's tracking
    // metric — it must succeed for this request to count as a success.
    await prisma.contactSubmission.create({ data: parsed.data });
  } catch (error) {
    console.error("[api/contact] db error", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // The notification email is best-effort: a submission that's safely
  // stored but failed to email shouldn't be reported as a failure to the
  // visitor who already successfully reached out.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: "khennyomolola@gmail.com",
        subject: `New contact form submission from ${parsed.data.name}`,
        text: `From: ${parsed.data.name} <${parsed.data.email}>\nSource: ${parsed.data.source}\n\n${parsed.data.message}`,
      });
    } catch (error) {
      console.error("[api/contact] email notification error", error);
    }
  }

  return NextResponse.json({ ok: true });
}
