import Reveal from "@/components/Reveal";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import type { ProjectLink } from "@/lib/get-projects";

export type SkillData = {
  id: string;
  name: string;
  category: string;
  level: "LEARNING" | "PROFICIENT" | "ADVANCED";
};

const LEVEL_LABEL: Record<SkillData["level"], string> = {
  LEARNING: "Learning",
  PROFICIENT: "Proficient",
  ADVANCED: "Advanced",
};

// Level colors stay visually distinct without implying "Learning" is a
// failure state — it's honest progress-in-motion, not a warning
// (design-system-rule.md's warning-vs-primary distinction is about hue
// separation, applied here to keep "Learning" from reading as an error).
//
// LEARNING changed from --color-info (blue) to --color-text-muted (a
// desaturated grey) per explicit feedback: blue reads as a clickable
// link/action affordance and was drawing more attention than a
// still-in-progress skill should. Reusing --color-warning (amber) instead
// was considered and rejected — AGENTS.md reserves that hue specifically
// for warning/error states ("clearly distinct hues, no overlap"),
// repurposing it here would blur that meaning. --color-text-muted is
// already darker/dimmer than PROFICIENT's --color-secondary, so the three
// levels now form a real hierarchy — Advanced (green) reads most prominent,
// Proficient (light grey) next, Learning (dim grey) quietest — using only
// existing tokens, no new hex value.
const LEVEL_COLOR: Record<SkillData["level"], string> = {
  LEARNING: "var(--color-text-muted)",
  PROFICIENT: "var(--color-secondary)",
  ADVANCED: "var(--color-primary)",
};

// "Proof link" chips (item 6): for ADVANCED/PROFICIENT skills only — a
// still-Learning skill has no shipped proof to point to, so no icon is
// offered for those regardless of a text match below. Matches a skill's
// exact name (case-insensitive) against a published project's own
// techStack array — real cross-references between already-real data, not
// a new claim about either the skill or the project. Only published
// projects are ever passed in (see getProjectLinks), so an in-progress or
// unpublished project never gets linked from a skill chip before it's real.
const LINKABLE_LEVELS: SkillData["level"][] = ["ADVANCED", "PROFICIENT"];

function findProofLink(skillName: string, projects: ProjectLink[]): string | null {
  const lower = skillName.toLowerCase();
  for (const project of projects) {
    if (project.techStack.some((tech) => tech.toLowerCase() === lower)) {
      const url = project.liveUrl ?? project.githubUrl;
      if (url) return url;
    }
  }
  return null;
}

function SkillChip({ skill, proofUrl }: { skill: SkillData; proofUrl: string | null }) {
  const style = {
    fontFamily: "var(--font-primary)",
    borderRadius: "var(--radius-full)",
    color: LEVEL_COLOR[skill.level],
    borderColor: LEVEL_COLOR[skill.level],
    // item 2: padding: 8px 16px (--space-2 --space-4), up from the
    // cramped --space-1 --space-3 (4px 12px) it had before.
    padding: "var(--space-2) var(--space-4)",
    gap: "var(--space-1)",
  };
  const content = (
    <>
      {skill.name} · {LEVEL_LABEL[skill.level]}
      {proofUrl && <ExternalLinkIcon />}
    </>
  );

  // The whole chip becomes the link (a bigger, more accessible tap target
  // than just the icon), when there is one to offer.
  if (proofUrl) {
    return (
      <a
        href={proofUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${skill.name} — see proof in a project (opens in a new tab)`}
        style={style}
        className="skill-chip border text-xs font-semibold inline-flex items-center"
      >
        {content}
      </a>
    );
  }

  return (
    <span style={style} className="skill-chip border text-xs font-semibold inline-flex items-center">
      {content}
    </span>
  );
}

// PRD 5A item 7: grouped by category, including Product Management honestly
// marked "Learning" where accurate (per-skill, not a blanket category
// label — AGENTS.md Section 8 lists individual PM skills at different real
// levels, some Proficient, some Learning).
//
// Restyled as category cards with skill pills inside, matching the same
// card pattern (bordered box, --color-bg-secondary) and tag/pill pattern
// (rounded-full padding) already used on Projects, rather than introducing
// a third, different visual language for the same underlying idea.
export default function Skills({ skills, projectLinks = [] }: { skills: SkillData[]; projectLinks?: ProjectLink[] }) {
  const byCategory = new Map<string, SkillData[]>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }
  const categories = Array.from(byCategory.entries());
  const isOddCount = categories.length % 2 === 1;

  return (
    <section id="skills" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
      <Reveal>
        <h2
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          className="section-title-glow text-3xl md:text-4xl"
        >
          Skills
        </h2>

        {/* item 1: a strict, responsive 2-column grid. auto-fit + minmax
            collapses to 1 column on narrow viewports on its own (no media
            query needed) once a 400px track no longer fits two-up;
            minmax(400px, 100%) instead of a bare 400px keeps a single
            column from ever forcing horizontal overflow on phones
            narrower than 400px. */}
        <div
          style={{
            marginTop: "var(--space-8)",
            gap: "var(--space-6)",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
          }}
          className="grid"
        >
          {categories.map(([category, categorySkills], index) => {
            // item 1: fix the odd-card-out sitting alone in the last row by
            // spanning it across both columns instead. Harmless no-op when
            // the grid is down to a single column (mobile) or the count is
            // even.
            const isLastOdd = isOddCount && index === categories.length - 1;
            return (
              <div
                key={category}
                style={{
                  borderRadius: "var(--radius-lg)",
                  borderColor: "var(--color-border)",
                  // item 5: an extremely faint glow in the card's top-left
                  // corner — a second background layer under the card's
                  // own solid color (valid multi-background CSS), not a
                  // separate glowing element.
                  backgroundImage:
                    "radial-gradient(circle at top left, color-mix(in srgb, var(--color-info) 7%, transparent), transparent 65%)",
                  backgroundColor: "var(--color-bg-secondary)",
                  padding: "var(--space-6)",
                  ...(isLastOdd ? { gridColumn: "1 / -1" } : {}),
                }}
                className="premium-card border"
              >
                <h3
                  style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
                  className="text-sm font-semibold tracking-wide uppercase"
                >
                  {category}
                </h3>
                <div style={{ marginTop: "var(--space-4)", gap: "var(--space-2)" }} className="flex flex-wrap">
                  {categorySkills.map((skill) => (
                    <SkillChip
                      key={skill.id}
                      skill={skill}
                      proofUrl={LINKABLE_LEVELS.includes(skill.level) ? findProofLink(skill.name, projectLinks) : null}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
