import Reveal from "@/components/Reveal";
import HeroLaptop from "@/components/sections/HeroLaptop";
import ScrollDownIndicator from "@/components/sections/ScrollDownIndicator";

// PRD 5A items 1, 2, 12. Real content from AGENTS.md Section 8.
//
// Restructured per explicit request: the name is now a big, bold opening
// statement occupying most of the first viewport on its own — not sharing
// space with the demo — so a visitor sees the name first, then has to
// scroll (a small amount) to reach the autoplay Provly prototype below.
// Name uses --color-hero-name (a dedicated off-white token, #EDEBE6 — not
// --color-text-primary, not green). Sized at 96px desktop / 56px mobile —
// bumped up from an earlier precise 72px/42px spec, per feedback that the
// exact spec still didn't feel big/premium enough. Letter-spacing (em) and
// line-height (unitless) scale automatically with font-size since they're
// relative units, so only the two size values needed to change.
//
// The hero media is now a laptop mockup image (HeroLaptop.tsx) with the
// real intro video warped into its screen area via a true perspective
// (matrix3d) transform, starting on click rather than autoplaying on load.
// HeroPrototype.tsx (the live Provly iframe prototype) and HeroVideo.tsx (a
// plain full-bleed video) are both left intact, unused, in case either's
// ever preferred again.
//
// Sizing on the media block and the name's font-size/line-height/tracking
// still deliberately use literal Tailwind arbitrary-value utilities
// (aspect-video, text-[96px], tracking-[-0.04em], etc.), per the earlier
// exception to this file's usual --space-*-driven inline style convention.
//
// The subtitle drops the literal "(Learning)" qualifier AGENTS.md Section 8
// lists as part of the professional title — a presentational trim for the
// hero specifically (the same honest "Learning" distinction still lives on
// the actual Product Management skill entries in Skills.tsx), not a change
// to what's true about her.
export default function Hero() {
  return (
    <section id="hero" className="p-4 md:p-8">
      {/* No `gap` on this flex column on purpose — h1's margin-bottom below
          is meant to be the exact, sole space before the subtitle (per
          precise spec: 16px, not 16px stacked on top of a flex gap). Each
          child instead carries its own explicit margin. */}
      <Reveal className="flex min-h-[75vh] flex-col justify-center">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-hero-name)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            marginBottom: "var(--space-4)",
          }}
          className="hero-name hero-name-animate text-[56px] font-semibold md:text-[96px]"
        >
          Fagbo Kehinde Omolola
        </h1>
        <p
          style={{
            fontFamily: "var(--font-primary)",
            color: "var(--color-text-secondary)",
            // Extra breathing room below the name, on top of the h1's own
            // marginBottom (which used to be the sole gap) — per explicit
            // request for more space here specifically.
            marginTop: "var(--space-3)",
            marginBottom: "var(--space-6)",
          }}
          className="text-xl md:text-2xl"
        >
          Product Engineer · AI Builder · Technical Writer · Product
          Management
        </p>
        <div style={{ gap: "var(--space-4)" }} className="flex flex-wrap">
          <a
            href="/projects"
            style={{
              fontFamily: "var(--font-primary)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              // Horizontal padding nudged +4px past the space-6 token (24px
              // -> 28px) per an exact pixel-delta request — the spacing
              // scale jumps 24->32 with nothing in between, so calc() adds
              // the precise delta on top of the token rather than rounding
              // up to the next step or hardcoding an untokened value.
              padding: "var(--space-3) calc(var(--space-6) + 4px)",
            }}
            className="hero-cta font-semibold"
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
              padding: "var(--space-3) calc(var(--space-6) + 4px)",
            }}
            className="hero-cta border font-semibold"
          >
            Contact Me
          </a>
        </div>
      </Reveal>

      <div
        // Slightly lighter than the site's stark near-black — the lightest
        // neutral surface token that already exists (--color-bg-elevated),
        // not a new hex value — per explicit feedback that all-black felt
        // too heavy behind the laptop media specifically.
        style={{ background: "var(--color-bg-elevated)" }}
        className="relative max-h-[620px] w-full overflow-hidden rounded-2xl"
      >
        <HeroLaptop />
      </div>

      <ScrollDownIndicator />
    </section>
  );
}
