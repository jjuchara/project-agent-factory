# Project Agent Factory

Project Agent Factory is a project-agnostic meta-plugin for Codex and Claude Code. It interviews a
user, inspects a repository or document workspace, analyses user-approved evidence, and generates
autonomous platform plugins owned by that project.

It is not limited to software. Generated kits can support analysts, researchers, document-heavy
teams, legal work, audits, product work, operations, or mixed projects.

## Product boundary

The factory and its output are separate products:

```text
project-agent-factory            generated project kit
  interview and inspection        .projectAgents/context
  evidence/profile blueprint      .projectAgents/docs and memory
  schemas and safety checks        project-specific agents and workflows
  deterministic generator         autonomous Codex and Claude Code adapters
```

The generated kit has no runtime dependency on this factory. Running the factory again is an
explicit migration/update operation.

## Usage

For a first-time local installation from a downloaded GitHub checkout, follow the Russian guide
[Установка Project Agent Factory из GitHub](docs/installation.md).

Install the factory in Codex or Claude Code, open the target project, and invoke
`project-agents-init`. The skill runs a read-only discovery phase, asks for project documentation,
shows a sourced project card and blueprint, and waits for approval before writing anything. One
approved blueprint produces shared project knowledge plus separate Codex and Claude Code plugins.

For a substantial or unclear documentation corpus, invoke `project-docs-prepare` first. It builds a
read-only map of document metadata, Markdown headings, local links, exact-content duplicates,
possible orphans, and likely reading routes. It does not assign source authority or reorganize
files. Any proposed documentation changes remain a separate preview-and-approval operation.

The skill resolves its CLI from the installed skill locator; it does not depend on the target
project's working directory or on a globally exported `PLUGIN_ROOT` variable.

The deterministic CLI used by the skill is:

```bash
node scripts/project-agents.mjs inspect --root /path/to/project
node scripts/project-agents.mjs inspect-docs --root /path/to/project
node scripts/project-agents.mjs generate --root /path/to/project --blueprint /tmp/blueprint.json
node scripts/project-agents.mjs generate --root /path/to/project --blueprint /tmp/blueprint.json --write
node scripts/project-agents.mjs validate-kit --root /path/to/project
```

`inspect-docs` writes nothing and returns JSON conforming to
`assets/documentation-map.schema.json`. Authority remains `unknown` until the user confirms the
source register. `generate` is a dry-run unless `--write` is present. Existing `AGENTS.md` files require the explicit
`--merge-agents` flag. Modified managed files cause a conflict unless the user separately approves
`--force-managed`.

## Development

Canonical source repository: <https://github.com/jjuchara/project-agent-factory>.

```bash
npm test
npm run validate
npm run validate:claude
python3 /path/to/plugin-creator/scripts/validate_plugin.py .
```

The blueprint and logical catalogs remain vendor-neutral. Optional `codex` and `claude` sections
configure only their respective agent adapters. Plugin installation is never part of generation:
Codex and Claude Code bootstraps are separate approval boundaries.

Generated public skill names use the project slug, so multiple project plugins can coexist without
ambiguous commands: `project-help` becomes `<project-slug>-help` (for example,
`tflex-macros-help`). Logical workflow IDs in the shared catalog remain unchanged.

## Global PARA project bootstrap

The companion global skill `$create-para-project` creates a documentation-first project environment
from any directory: canonical Russian Obsidian notes, a Git development root under
`/Users/jjuchara/projects`, a repository `AGENTS.md`, and Herdr Plus template/live workspace.

Personal Codex marketplace symlink and installation are conditional and require separate approval;
ordinary projects do not receive plugin-specific setup.
