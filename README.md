# Project Agent Factory

Project Agent Factory is a project-agnostic meta-plugin for Codex and Claude Code. It interviews a
user, inspects a repository or document workspace, analyses user-approved evidence, and generates
autonomous platform adapters owned by that project.

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

To install or migrate generated capabilities in one specific repository, follow the Russian
[project-local installation guide](Install.md). It includes copy-paste commands for Windows
PowerShell, Linux, and macOS, plus a ready-to-use prompt for migrating legacy project kits.

For a first-time local installation from a downloaded GitHub checkout, follow the Russian guide
[Установка Project Agent Factory из GitHub](docs/installation.md). Immediately after its
requirements, the guide includes two copy-paste AI-assisted prompts: one installs the Factory
globally for the current Codex or Claude Code platform, and the other generates an autonomous
project kit/plugin from the target project. Both preserve explicit approval boundaries for project
files, user configuration, hook trust, and local-scope Claude plugin installation.

Install the factory in Codex or Claude Code, open the target project, and invoke
`project-agents-init`. The skill runs a read-only discovery phase, asks for project documentation,
shows a sourced project card and blueprint, and waits for approval before writing anything. One
approved blueprint produces shared project knowledge, a repository-local Codex adapter, and a
local-scope Claude Code plugin.

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
npm run build:spec-runtime
npm run validate
npm run validate:claude
python3 /path/to/plugin-creator/scripts/validate_plugin.py .
```

The blueprint and logical catalogs remain vendor-neutral. Optional `codex` and `claude` sections
configure only their respective agent adapters. Codex discovers generated skills, agents, and hooks
from `.agents/` and `.codex/` only while working in that repository; it requires no generated plugin
installation or user-level marketplace registration. Claude Code installation remains a separate
approval boundary and uses local project scope.

Generated public skill names use the project slug: `project-help` becomes `<project-slug>-help`
(for example, `tflex-macros-help`). Codex exposes these commands only inside the owning repository.
Logical workflow IDs in the shared catalog remain unchanged.

## Global PARA project bootstrap

The companion global skill `$create-para-project` creates a documentation-first project environment
from any directory: canonical Russian Obsidian notes, a Git development root under
`/Users/jjuchara/projects`, a repository `AGENTS.md`, and Herdr Plus template/live workspace.

Personal Codex marketplace symlink and installation are conditional and require separate approval;
ordinary projects do not receive plugin-specific setup.

## Optional BDD capabilities

Blueprint schema v2 requires an explicit capability-pack list; project kind never selects packs.
Add `bdd-specification` in an analyst-owned requirements repository to generate autonomous
`<slug>-bdd-spec`, a bundled no-install CLI, registry/diagnostic contracts and immutable GitLab
handoff. Add `browser-testing` in a code repository to include that specification core once and add
`<slug>-test-infra` plus `<slug>-bdd-tests` for Playwright execution and evidence. A previous
explicit `browser-testing` choice remains compatible through dependency expansion.

Generation does not install target-project dependencies, browsers, MCP or CI. Project-owned
features, bundles, registries, mappings, profiles, fixtures and evidence survive pack removal. See
[the browser testing contract](docs/browser-testing.md).

For development, run `npm ci` before `npm test`; `npm run test:browser` runs the explicit isolated
Chromium/BDD/Test Agents MCP smoke and requires an installed Chromium browser and local process/network permissions.
