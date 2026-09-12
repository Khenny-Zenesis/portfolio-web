// PRD 5A item 3. Real content from AGENTS.md Section 8.
export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-16">
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        About
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr]">
        <p
          style={{
            fontFamily: "var(--font-primary)",
            color: "var(--color-text-secondary)",
          }}
          className="text-lg leading-relaxed"
        >
          I am a Nigerian product engineer and AI builder who went from
          founding a salon business to building AI-powered startup products
          in months. I completed a Product Design and Engineering Bootcamp
          specializing in context engineering, Next.js, TypeScript, and
          AI-assisted development, and I&apos;m currently building my
          product management foundation through a scholarship-funded
          bootcamp. I&apos;m the founder of Provly — an AI field-reporting
          tool for independent contractors in Africa — and I build in
          public, documenting every step. I hold a BSc in Business
          Administration and was selected for the Women in Cloud
          FoundHerWorld global founder spotlight. Available immediately for
          remote roles in product engineering, AI product development, and
          product management.
        </p>

        <dl
          style={{ fontFamily: "var(--font-primary)" }}
          className="flex flex-col gap-4 text-base"
        >
          <div>
            <dt style={{ color: "var(--color-text-muted)" }}>Location</dt>
            <dd style={{ color: "var(--color-text-primary)" }} className="mt-1">
              Ilorin, Nigeria — Open to Remote Globally
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--color-text-muted)" }}>Availability</dt>
            <dd style={{ color: "var(--color-success)" }} className="mt-1">
              Available Immediately — Full-time or Part-time
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
