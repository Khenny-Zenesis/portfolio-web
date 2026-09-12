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
const LEVEL_COLOR: Record<SkillData["level"], string> = {
  LEARNING: "var(--color-info)",
  PROFICIENT: "var(--color-secondary)",
  ADVANCED: "var(--color-primary)",
};

// PRD 5A item 7: grouped by category, including Product Management honestly
// marked "Learning" where accurate (per-skill, not a blanket category
// label — AGENTS.md Section 8 lists individual PM skills at different real
// levels, some Proficient, some Learning).
export default function Skills({ skills }: { skills: SkillData[] }) {
  const byCategory = new Map<string, SkillData[]>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-16">
      <h2
        style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        className="text-3xl md:text-4xl"
      >
        Skills
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from(byCategory.entries()).map(([category, categorySkills]) => (
          <div key={category}>
            <h3
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm font-semibold tracking-wide uppercase"
            >
              {category}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {categorySkills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between gap-4">
                  <span
                    style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-primary)" }}
                    className="text-base"
                  >
                    {skill.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      borderRadius: "var(--radius-full)",
                      color: LEVEL_COLOR[skill.level],
                      borderColor: LEVEL_COLOR[skill.level],
                    }}
                    className="shrink-0 border px-3 py-1 text-xs font-semibold"
                  >
                    {LEVEL_LABEL[skill.level]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
