// Shared "this leads somewhere else" glyph — used by Skills' proof-link
// chips and Contact's social links, so the same visual cue means the same
// thing everywhere on the site rather than one place using a text "↗"
// character and another an SVG. Kept small and low-opacity by default; the
// caller can override size/opacity via props for context (e.g. Contact's
// links read it a little larger and clearer than Skills' inline chips do).
export default function ExternalLinkIcon({ size = 10, opacity = 0.55 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity, flexShrink: 0 }}>
      <path
        d="M7 17L17 7M17 7H8M17 7V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
