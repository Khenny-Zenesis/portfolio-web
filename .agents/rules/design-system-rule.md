# design-system-rule.md

## Purpose
Governs colour, typography, spacing, and imagery — the stark monochrome + deep forest green accent system (revised from an earlier "Brass & Slate" direction after design review). Full token values live in `design-tokens.css` at the project root; this file governs *usage*, not the values themselves.

## Rules

- **Never hardcode a hex colour value in any component file — not even `#000` or `#fff`.** Always reference a CSS variable from `design-tokens.css`.
- **Never use a Tailwind colour utility class** (`bg-blue-500`, `text-gray-300`, etc.). Use the CSS variables exclusively — Tailwind is for layout/spacing utilities, not colour.
- **Warning's colour stays visually distinct from Primary.** This project doesn't have safety-critical UI the way Provly does, but the discipline carries over: a caution/error signal should never share a hue with a decorative brand colour.
- **`--font-display` (Space Grotesk) is reserved for the hero name and section titles only.** Body text, buttons, and form labels always use `--font-primary` (Inter).
- **The hero photo is real, not AI-generated, and shown in natural, true color — no duotone tint over the face.** A heavy color tint was tried and rejected for looking unprofessional and obscuring the actual photo. Brand color is instead expressed through a thin accent-colored border/frame around the image.
- **Border radius stays in the tighter, editorial range** (2px–12px) — do not default to the larger, "app-friendly" rounding common in consumer product UI. This is a deliberate brand choice separating this personal site's visual register from Provly's.
- **Every text/background colour pairing is verified with a real contrast checker before shipping** — reasoning through a pairing carefully is not a substitute for the actual check.