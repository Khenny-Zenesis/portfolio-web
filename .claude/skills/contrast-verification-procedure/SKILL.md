---
name: contrast-verification-procedure
description: Use when introducing any new or changed text/background colour pairing not already verified in design-tokens.css. Triggers include contrast check, WCAG, accessibility color, text on background, new color pairing.
---

# contrast-verification-procedure

Teaches the real verification steps for a colour pairing. Law lives in design-system-rule.md (every pairing verified with a real contrast checker before shipping) and PRD.md Section 7E (WCAG 2.1 AA minimum).

## Steps

1. Identify the exact two hex values being paired — the foreground (text/icon) and the background.
2. Confirm both values exist as named variables in design-tokens.css. Never check a value that isn't actually in the token system.
3. Open a real contrast checker tool.
4. Enter the foreground hex as the text colour, the background hex as the background colour.
5. Read the resulting ratio.
6. Confirm the ratio meets 4.5:1 for normal text, or 3:1 for large text (18pt+, or 14pt+ bold) and UI components — apply the correct threshold based on actual size/weight, not a guess.
7. If it fails, do not ship it. Choose an already-verified pairing, or flag the token for adjustment. Do not eyeball a "close enough" pass.
8. Record the verified ratio somewhere durable — a comment, a doc, or the commit message — so the same pairing isn't re-litigated later.

## Code skeleton

```typescript
// Automatable regression check, run against the full token pairing list —
// catches an accidental future token change that breaks a previously-passing pair.
import { getContrast } from "color-contrast-lib"; // any real contrast-ratio library

const pairings = [
  { fg: "#2A1F0A", bg: "#D4AF5F", label: "on-primary / primary", minRatio: 4.5 },
  { fg: "#F4F0E8", bg: "#1A1712", label: "text-primary / bg-primary", minRatio: 4.5 },
  // ...every verified pairing in design-tokens.css
];

for (const p of pairings) {
  const ratio = getContrast(p.fg, p.bg);
  if (ratio < p.minRatio) {
    throw new Error(`${p.label} fails contrast: ${ratio.toFixed(2)} < ${p.minRatio}`);
  }
}
```

## Traps

- Testing a pairing by eye and assuming it passes.
- Applying the 4.5:1 threshold to large text/UI components when 3:1 is the correct, applicable bar — or the reverse, applying 3:1 to normal body text.
- Assuming a new pairing is fine because a similar-looking one already passed.
- Not recording the result, causing the same pairing to be re-checked repeatedly or, worse, never checked again after a token value changes.

## Verify before done

- Every new text/background pairing introduced in this build has been run through a real checker, not reasoned about.
- The exact ratio for each new pairing is recorded.
- The correct threshold (4.5:1 vs 3:1) was applied based on actual text size and weight.
- Tests to write: an automated regression test running the contrast calculation across every pairing currently defined in design-tokens.css, failing the build if any pairing's ratio drops below its required threshold.