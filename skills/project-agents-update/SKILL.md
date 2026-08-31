---
name: project-agents-update
description: Use when updating, reconfiguring, or migrating an existing .projectAgents kit without losing project-owned knowledge.
---

# Update an existing project kit

1. Resolve the factory root from this skill's source locator
   (`<factory-root>/skills/project-agents-update/SKILL.md`); do not rely on a `PLUGIN_ROOT` shell
   variable. Run `<factory-root>/scripts/project-agents.mjs validate-kit` before analysis and report
   modified or missing managed files.
2. Read `.projectAgents/project-profile.json`, `generation-state.json`, the evidence index, and the
   user's requested change. Do not repeat the entire initialization interview.
3. Inspect only evidence affected by the change. Keep facts classified as confirmed, observed,
   inferred, or unknown.
4. Show a blueprint diff: roles, workflows, permissions, sources, generated paths, migrations, and
   unresolved conflicts.
5. Require approval before writing. Run `generate` without `--write`, then apply the approved plan.
6. Seeded context, docs, and memory are project-owned and must be preserved. Never replace them with
   newer templates. Update them only as explicit project edits with provenance.
7. Do not use `--force-managed` unless the user has seen and approved every overwritten path.
8. Validate the kit after generation. Reinstall a platform plugin only if its generated content
   changed and the user separately authorizes that platform's configuration update. Codex approval
   never authorizes Claude Code changes or the reverse.
