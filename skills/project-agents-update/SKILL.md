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
8. When migrating a legacy kit, remove unchanged managed Codex marketplace/plugin/bootstrap files
   through the normal generation-state plan and replace them with repository-local `.agents/skills`
   and `.codex/hooks.json`. Stop if any stale managed file was modified.
9. Validate the kit after generation. Codex requires a new project session and hook trust, not a
   generated plugin install. If the old Codex plugin is still installed in user configuration,
   report its exact ID and obtain separate approval before removing the plugin or marketplace.
10. For Claude Code, run the generated bootstrap with `--check` first. The bootstrap must execute
    from the target repository root, add a missing marketplace with `--scope local`, and always
    install the generated plugin with `--scope local`. Install or update it only if generated Claude
    content changed and the user separately authorizes that configuration update.
11. Inspect `claude plugin list --json` for older installations of the same plugin ID at `user` or
    `project` scope. A new local installation does not authorize or remove them. Report their exact
    scope and project path, then obtain separate approval before running an exact scoped uninstall.
