import Reveal from "@/components/Reveal";

// PRD 5A item 8. Real content from AGENTS.md Section 8, reverse
// chronological order preserved even though years are no longer shown —
// per explicit request, years and the Product Management Bootcamp's
// "Scholarship Programme" / in-progress status are dropped from display
// (not from AGENTS.md's own record of them) since a recruiter or investor
// reading exact dates and a still-in-progress, scholarship-funded entry
// alongside otherwise-complete credentials could read it less favorably
// than intended. institution is nullable for exactly that one entry —
// there's no other real institution name to show in its place, and
// inventing one isn't an option.
const EDUCATION = [
  {
    title: "FNB App Academy Digital Entrepreneurship",
    institution: "University of Johannesburg",
  },
  {
    title: "Product Management Bootcamp",
    institution: null,
  },
  {
    title: "Product Design and Engineering Bootcamp",
    institution: "Dev & Design HQ",
  },
  {
    title: "BSc Business Administration",
    institution: "Kwara State University, Ilorin",
  },
];

// A plain graduation-cap glyph — matches the small, low-opacity icon
// language already used elsewhere (Skills' proof-link icon), not a full
// icon-library import for one glyph.
function CapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: 0.7, flexShrink: 0 }}>
      <path
        d="M12 3L2 8l10 5 8-4v6M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Restyled to match Skills' premium-card language (bordered card, faint
// corner glow, hover border-brighten) instead of the plain border-left list
// it used to be — brought up to the same bar rather than left as the site's
// most visually plain section once Skills and Hero were elevated.
export default function Education() {
  return (
    <section id="education" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
      <Reveal>
        <h2
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          className="section-title-glow text-3xl md:text-4xl"
        >
          Education
        </h2>

        {/* Same 400px minmax as Skills (not a smaller one sized to this
            content) — at this container width that yields a clean 2x2 grid
            for these four entries instead of 3 columns with the fourth
            card orphaned alone in its own row, the exact awkward-empty-
            space problem already fixed once on Skills. */}
        <div
          style={{
            marginTop: "var(--space-8)",
            gap: "var(--space-6)",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
          }}
          className="grid"
        >
          {EDUCATION.map((entry) => (
            <div
              key={entry.title}
              style={{
                borderRadius: "var(--radius-lg)",
                borderColor: "var(--color-border)",
                backgroundImage:
                  "radial-gradient(circle at top left, color-mix(in srgb, var(--color-info) 7%, transparent), transparent 65%)",
                backgroundColor: "var(--color-bg-secondary)",
                padding: "var(--space-6)",
                gap: "var(--space-3)",
              }}
              className="premium-card border flex items-start"
            >
              <div style={{ color: "var(--color-primary)", marginTop: "var(--space-1)" }}>
                <CapIcon />
              </div>
              <div>
                <p
                  style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
                  className="text-lg font-semibold"
                >
                  {entry.title}
                </p>
                {entry.institution && (
                  <p
                    style={{
                      fontFamily: "var(--font-primary)",
                      color: "var(--color-text-secondary)",
                      marginTop: "var(--space-1)",
                    }}
                    className="text-sm"
                  >
                    {entry.institution}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
