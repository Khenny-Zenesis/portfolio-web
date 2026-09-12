// PRD 5A items 1, 2, 12. Real content from AGENTS.md Section 8.
//
// Styling convention used across every section component: Tailwind utility
// classes for layout/spacing/sizing (design-system-rule.md frames Tailwind's
// role as exactly that), inline `style` only where a value must come from a
// design-tokens.css variable (color, font-family, border-radius) — never a
// Tailwind color utility class, never a hardcoded hex.
export default function Hero() {
  return (
    <section
      id="hero"
      className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16"
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-gradient-brass text-5xl leading-tight md:text-6xl"
          >
            Fagbo Kehinde Omolola
          </h1>
          <p
            style={{
              fontFamily: "var(--font-primary)",
              color: "var(--color-text-secondary)",
            }}
            className="mt-4 text-xl"
          >
            Product Engineer · AI Builder · Technical Writer · Product
            Management (Learning)
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#projects"
              style={{
                fontFamily: "var(--font-primary)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
              className="px-6 py-3 font-semibold"
            >
              View Work
            </a>
            <a
              href="#contact"
              style={{
                fontFamily: "var(--font-primary)",
                borderRadius: "var(--radius-md)",
                borderColor: "var(--color-border-accent)",
                color: "var(--color-text-primary)",
              }}
              className="border px-6 py-3 font-semibold"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Real, prominent photo of Kehinde required here (design-system-rule.md:
            never a small avatar, never AI-generated, brass/burgundy duotone
            treatment). No real photo file exists in this repo yet — this
            placeholder marks exactly where public/kehinde-hero.jpg (or
            similar) needs to be dropped in and wired up with next/image. */}
        <div
          role="img"
          aria-label="Placeholder for Kehinde's hero photo — real photo not yet provided"
          style={{
            borderRadius: "var(--radius-lg)",
            borderColor: "var(--color-border-accent)",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-primary)",
          }}
          className="flex aspect-[4/5] items-center justify-center border border-dashed p-6 text-center"
        >
          Real photo pending — add public/kehinde-hero.jpg
        </div>
      </div>
    </section>
  );
}
