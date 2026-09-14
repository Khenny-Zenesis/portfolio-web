// Small "scroll for more" cue at the bottom of the hero, centered — plain
// CSS bounce (see .scroll-down-chevron in globals.css), no library. A real
// anchor link to #skills, not just decoration, so it's also a functional
// shortcut, not only a hint. prefers-reduced-motion turns the bounce off
// (globals.css) while keeping the chevron itself visible and clickable.
export default function ScrollDownIndicator() {
  return (
    <a
      href="#skills"
      aria-label="Scroll down to Skills"
      style={{ marginTop: "var(--space-8)", color: "var(--color-text-muted)" }}
      className="scroll-down-chevron flex justify-center"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
