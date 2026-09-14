import Image from "next/image";
import Reveal from "@/components/Reveal";

// PRD 5A item 3. Real content from AGENTS.md Section 8 (latest paste —
// the Women in Cloud FoundHerWorld clause was dropped per your
// confirmation that the newer bio is correct).
//
// Restyled to match the reference screenshot (public/portfolio-about.png):
// small dot + "About Me" eyebrow, a greeting-style display headline with
// the name in the accent color, bio split into short paragraphs rather
// than one dense block, portrait photo in a simple thin frame — no glow,
// no float animation here, unlike Hero's treatment. Same real bio text as
// before, just reformatted into natural paragraph breaks, not reworded.
const BIO_PARAGRAPHS = [
  "I am a Nigerian product engineer and AI builder who went from founding a salon business to building AI-powered startup products in months.",
  "I completed a Product Design and Engineering Bootcamp specializing in context engineering, Next.js, TypeScript, and AI-assisted development, and I'm currently building my product management foundation through a scholarship-funded bootcamp.",
  "I'm the founder of Provly — an AI field-reporting tool for independent contractors in Africa — and I build in public, documenting every step.",
  "I hold a BSc in Business Administration. Available immediately for remote roles in product engineering, AI product development, and product management.",
];

export default function About() {
  return (
    <section id="about" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
      <Reveal
        className="grid grid-cols-1 items-start md:grid-cols-[1.3fr_1fr]"
        style={{ gap: "var(--space-12)" }}
      >
        <div>
          <div style={{ gap: "var(--space-2)" }} className="flex items-center">
            <span
              aria-hidden="true"
              style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-primary)",
                color: "var(--color-text-muted)",
                letterSpacing: "0.1em",
              }}
              className="text-xs font-semibold uppercase"
            >
              About Me
            </span>
          </div>

          <h2
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", marginTop: "var(--space-4)" }}
            className="text-4xl leading-tight md:text-5xl"
          >
            <span style={{ color: "var(--color-text-primary)" }}>Kehinde </span>
            <span className="text-gradient-accent">Here!</span>
          </h2>

          {/* max-width caps the line length independently of the column's
              own 1.3fr width, so paragraphs stop well short of the photo
              rather than stretching the full column — comfortable reading
              measure (roughly 65-75 characters/line at this font size) is
              about line length, not about how wide the layout happens to
              have room for. lineHeight/letterSpacing set explicitly here
              rather than via a Tailwind leading-* utility, to hit the exact
              requested values (1.7 / 0.01em) precisely and self-document
              them, rather than relying on leading-relaxed's implicit 1.625. */}
          <div
            style={{ marginTop: "var(--space-6)", gap: "var(--space-4)", maxWidth: "640px" }}
            className="flex flex-col"
          >
            {BIO_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  fontFamily: "var(--font-primary)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                  letterSpacing: "0.01em",
                }}
                className="text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* marginTop bumped from space-8 to space-12 so this reads as a
              clearly separate block from the bio prose above it, not just
              another paragraph in the same rhythm. */}
          <div style={{ marginTop: "var(--space-12)", gap: "var(--space-8)" }} className="flex flex-wrap">
            <div>
              <p
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-muted)" }}
                className="text-sm"
              >
                Location
              </p>
              <p
                style={{
                  fontFamily: "var(--font-primary)",
                  color: "var(--color-text-primary)",
                  marginTop: "var(--space-1)",
                }}
              >
                Ilorin, Nigeria — Open to Remote Globally
              </p>
            </div>
            <div>
              <p
                style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-muted)" }}
                className="text-sm"
              >
                Availability
              </p>
              <p
                style={{
                  fontFamily: "var(--font-primary)",
                  color: "var(--color-success)",
                  marginTop: "var(--space-1)",
                }}
              >
                Available Immediately — Full-time or Part-time
              </p>
            </div>
          </div>
        </div>

        {/* Real photo, per design-system-rule.md: never a small avatar,
            never AI-generated. This photo is itself black-and-white as
            delivered — not a CSS filter applied here, so "shown in
            natural, true color" still holds; nothing is tinting it.
            .about-photo (globals.css) adds a premium resting shadow and,
            on hover, a lift + a green-tinted glow/border using the
            existing --color-primary token — not a new hardcoded "sage"
            hex, which would've broken AGENTS.md's locked-palette rule. */}
        <div
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
          className="about-photo relative aspect-4/5 w-full overflow-hidden"
        >
          <Image
            src="/kehinde-hero.jpg"
            alt="Portrait of Fagbo Kehinde Omolola"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </Reveal>
    </section>
  );
}
