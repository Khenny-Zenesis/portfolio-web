"use client";

import { useState, type FormEvent } from "react";

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
  { label: "Email", href: "mailto:khennyomolola@gmail.com" },
  { label: "LinkedIn", href: "https://linkedin.com/in/kehinde-omolola-fagbo" },
  { label: "X", href: "https://x.com/zenesis1520" },
  { label: "Medium", href: "https://medium.com/@khennyomolola" },
  { label: "GitHub", href: "https://github.com/Khenny-Zenesis" },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        Contact
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
        <ul className="flex flex-col gap-3">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-secondary)" }}
                className="text-base font-medium"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="contact-name"
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm"
            >
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              style={{
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-primary)",
              }}
              className="mt-1 w-full border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm"
            >
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              style={{
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-primary)",
              }}
              className="mt-1 w-full border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="contact-source"
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm"
            >
              How did you find this portfolio?
            </label>
            <select
              id="contact-source"
              name="source"
              required
              defaultValue=""
              style={{
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-primary)",
              }}
              className="mt-1 w-full border px-3 py-2"
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
            <label
              htmlFor="contact-message"
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              style={{
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-primary)",
              }}
              className="mt-1 w-full border px-3 py-2"
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
            }}
            className="px-6 py-3 font-semibold"
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
    </section>
  );
}
