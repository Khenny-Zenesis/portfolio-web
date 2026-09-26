"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Reveal from "@/components/Reveal";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";

const EMAIL = "khennyomolola@gmail.com";

// PRD 5A items 9-10. Real links from AGENTS.md Section 8. Submits to
// /api/contact (Checkpoint 5, Open Question 3: persisted + Resend email).
const SOURCE_OPTIONS = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "X", label: "X" },
  { value: "WOMEN_IN_CLOUD", label: "Women in Cloud" },
  { value: "GOOGLE_SEARCH", label: "Google search" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER", label: "Other" },
] as const;

const LINKS = [
  { label: "Email", href: `mailto:${EMAIL}` },
  { label: "LinkedIn", href: "https://linkedin.com/in/kehinde-omolola-fagbo" },
  { label: "X", href: "https://x.com/zenesis1520" },
  { label: "Medium", href: "https://medium.com/@khennyomolola" },
  { label: "GitHub", href: "https://github.com/Khenny-Zenesis" },
];

type Status = "idle" | "submitting" | "success" | "error";

const fieldStyle = {
  borderRadius: "var(--radius-md)",
  // border-color lives on .contact-field (globals.css) instead — an inline
  // value here would outrank and silently disable :focus-visible's own
  // border-color change (the box-shadow ring still showed either way, an
  // inline style doesn't touch box-shadow, which is exactly why this one
  // slipped past visual review before — the ring alone read as "it works").
  background: "var(--color-bg-secondary)",
  color: "var(--color-text-primary)",
  fontFamily: "var(--font-primary)",
  padding: "var(--space-2) var(--space-3)",
  marginTop: "var(--space-1)",
};
const labelStyle = { fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" };

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // "Copy Email" button state. "error" (not just success) matters here —
  // navigator.clipboard.writeText can genuinely fail (insecure context,
  // permissions denied), and silently showing "Copied!" when it didn't
  // work would be a dishonest error state (AGENTS.md build rule 10).
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clears any pending "revert to idle" timer if the component unmounts
  // mid-countdown, so it never fires a setState after unmount.
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function handleCopyEmail() {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    // The "brief message that fades after ~2 seconds" — CSS
    // (.copy-confirmation in globals.css) handles the actual fade
    // transition; this just reverts the state that drives it, which is
    // what triggers the fade-out via the opacity transition.
    copyTimeoutRef.current = setTimeout(() => setCopyStatus("idle"), 2000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      source: data.get("source"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(result.message ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section id="contact" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
      <Reveal>
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="section-title-glow text-3xl md:text-4xl"
      >
        Contact
      </h2>

      {/* Both halves restyled as premium-cards (Skills' bordered/corner-glow
          language), matching the bar the rest of the site was brought up
          to, rather than sitting as plain, uncarded content — the last
          thing a recruiter sees before deciding to reach out. */}
      <div
        style={{ marginTop: "var(--space-8)", gap: "var(--space-6)" }}
        className="grid grid-cols-1 md:grid-cols-2"
      >
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            // border-color lives on .premium-card (globals.css), not here —
            // see Skills.tsx's comment on the same pattern.
            backgroundImage:
              "radial-gradient(circle at top left, color-mix(in srgb, var(--color-info) 7%, transparent), transparent 65%)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "var(--space-6)",
          }}
          className="premium-card border"
        >
          <p
            style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
            className="text-sm font-semibold tracking-wide uppercase"
          >
            Get in touch
          </p>
          <ul style={{ marginTop: "var(--space-4)", gap: "var(--space-1)" }} className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.label} style={{ gap: "var(--space-2)" }} className="flex items-center">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-primary)",
                    color: "var(--color-text-primary)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-2) var(--space-2)",
                    gap: "var(--space-2)",
                  }}
                  className="contact-link text-base font-medium flex items-center"
                >
                  {link.label}
                  <ExternalLinkIcon size={13} opacity={0.5} />
                </a>

                {/* Email-only: a copy-to-clipboard shortcut alongside the
                    mailto: link, not a replacement for it. */}
                {link.label === "Email" && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy email address to clipboard"
                      style={{
                        fontFamily: "var(--font-primary)",
                        color: "var(--color-text-muted)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-1) var(--space-2)",
                      }}
                      className="copy-email-btn text-xs font-semibold"
                    >
                      Copy
                    </button>
                    {/* Always mounted (not conditionally rendered) so a
                        screen reader's live region is established up front
                        — aria-live regions are unreliable if the element
                        itself only appears at the same moment as the
                        content update. Visibility is purely the CSS
                        opacity transition in globals.css. */}
                    <span
                      role="status"
                      aria-live="polite"
                      style={{
                        fontFamily: "var(--font-primary)",
                        color: copyStatus === "error" ? "var(--color-error)" : "var(--color-success)",
                      }}
                      className={`copy-confirmation text-xs font-semibold${
                        copyStatus !== "idle" ? " copy-confirmation-visible" : ""
                      }`}
                    >
                      {copyStatus === "copied" ? "Copied!" : copyStatus === "error" ? "Couldn't copy" : ""}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            borderRadius: "var(--radius-lg)",
            // border-color lives on .premium-card (globals.css), not here —
            // see Skills.tsx's comment on the same pattern.
            backgroundImage:
              "radial-gradient(circle at top left, color-mix(in srgb, var(--color-info) 7%, transparent), transparent 65%)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "var(--space-6)",
            gap: "var(--space-4)",
          }}
          className="premium-card border flex flex-col"
        >
          <div>
            <label htmlFor="contact-name" style={labelStyle} className="text-sm">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              style={fieldStyle}
              className="contact-field w-full border"
            />
          </div>

          <div>
            <label htmlFor="contact-email" style={labelStyle} className="text-sm">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              style={fieldStyle}
              className="contact-field w-full border"
            />
          </div>

          <div>
            <label htmlFor="contact-source" style={labelStyle} className="text-sm">
              How did you find this portfolio?
            </label>
            <select
              id="contact-source"
              name="source"
              required
              defaultValue=""
              style={fieldStyle}
              className="contact-field w-full border"
            >
              <option value="" disabled>
                Select one
              </option>
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" style={labelStyle} className="text-sm">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              style={fieldStyle}
              className="contact-field w-full border"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              fontFamily: "var(--font-primary)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              opacity: status === "submitting" ? 0.7 : 1,
              padding: "var(--space-3) var(--space-6)",
            }}
            className="hover-lift font-semibold"
          >
            {status === "submitting" ? "Sending…" : "Send message"}
          </button>

          {status === "success" && (
            <p style={{ color: "var(--color-success)", fontFamily: "var(--font-primary)" }} role="status">
              Thanks — I&apos;ll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p style={{ color: "var(--color-error)", fontFamily: "var(--font-primary)" }} role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
      </Reveal>
    </section>
  );
}
