// PRD 5A item 8. Real content from AGENTS.md Section 8, reverse
// chronological. Section 8 lists these with only year-level precision and
// three of the four share "2026" — reversed the given list order as the
// best-available proxy for most-recent-first without inventing exact dates.
const EDUCATION = [
  {
    title: "FNB App Academy Digital Entrepreneurship",
    institution: "University of Johannesburg",
    period: "2026",
  },
  {
    title: "Product Management Bootcamp",
    institution: "Scholarship Programme",
    period: "2026, in progress",
  },
  {
    title: "Product Design and Engineering Bootcamp",
    institution: "Dev & Design HQ",
    period: "2026",
  },
  {
    title: "BSc Business Administration",
    institution: "Kwara State University, Ilorin",
    period: "2024",
  },
];

export default function Education() {
  return (
    <section id="education" className="mx-auto max-w-6xl px-6 py-16">
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        Education
      </h2>

      <ol className="mt-8 flex flex-col gap-6">
        {EDUCATION.map((entry) => (
          <li
            key={entry.title}
            style={{ borderColor: "var(--color-border)" }}
            className="border-l-2 pl-6"
          >
            <p
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
              className="text-lg font-semibold"
            >
              {entry.title}
            </p>
            <p
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="mt-1 text-sm"
            >
              {entry.institution} · {entry.period}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
