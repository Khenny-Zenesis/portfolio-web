# git-conventions.md

## Purpose
Governs how work is committed to this repository. Kept deliberately simple — this is a solo-developer project, and enterprise branching strategy would be needless complexity, not rigor.

## Rules

- **Single `main` branch.** No feature-branch workflow required for a solo project at this scale.
- **`.env` is never committed, from the very first commit.** `.env.example` (placeholders only) is committed instead.
- **Commit messages describe what actually changed**, in plain language — "Add project CRUD to admin dashboard," not "updates" or "wip."
- **Commit history shows real, incremental work — not one giant commit at the end of a build session.** This is the same discipline used across every assessment in this portfolio, and it matters here too: a reviewer (or future Kehinde) should be able to read the commit history and understand how the project actually came together.
- **Before any push, confirm in a private/incognito browser window that `.env` genuinely isn't visible in the repository** — don't rely on memory that `.gitignore` is doing its job.