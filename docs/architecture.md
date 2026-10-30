# Architecture

Project Agent Factory has three strict boundaries.

## Factory runtime

The factory can be installed as a Codex or Claude Code plugin. It contains the interview skill,
schemas, safety rules, deterministic renderer, validators, and update workflow. It contains no
project-specific facts, commands, MCP servers, industries, or coding assumptions. Optional model
settings are isolated in platform adapters.

## Approved blueprint

The conversational skill turns user answers, observed repository structure, and supplied documents
into a source register and project blueprint. Facts are classified as user-confirmed, observed,
inferred, or unknown. The user approves this layer before writes.

## Documentation preflight

`project-docs-prepare` and the deterministic `inspect-docs` command sit between lightweight project
inspection and the approved blueprint. The command emits a bounded read-only map containing paths,
formats, sizes, modification times, hashes, Markdown headings and links, exact duplicate groups,
possible orphans, issues, and scored reading routes. Document bodies are omitted. Non-Markdown,
binary, and oversized files remain metadata-only.

Routes and scores are discovery hints, not authority decisions. The map is not persisted in the
target project automatically and does not replace the user-approved source register. Moving,
renaming, merging, indexing, archiving, or deleting source documents belongs to a separate
project-scoped apply operation with an exact preview and explicit approval.

## Generated project kit

The generated `.projectAgents` directory contains the project profile, evidence index, context,
rules, memory, logical catalogs, shared hook scripts, and the Claude Code plugin. The Codex adapter
renders repository-local skills under `.agents/skills`, agent definitions under `.codex/agents`, and
lifecycle configuration in `.codex/hooks.json`. It does not render or install a Codex marketplace
plugin because Codex plugin installation is user-scoped. The Claude Code adapter retains its
manifest, local marketplace, plugin skills and agents, and local-scope installation bootstrap.
The kit is autonomous and versioned with the target project.

The generated Claude bootstrap pins every Claude CLI subprocess to the target repository root. A
missing marketplace is added with `--scope local`, and the generated plugin is always installed in
that local scope even when the bootstrap is invoked by absolute path from another directory. An
older installation of the same plugin at user or project scope is reported and removed only as a
separately approved migration action.

Lifecycle hooks are Node.js modules invoked with `node`, rather than shell scripts. The Codex hook
command walks upward from the session working directory to find `.projectAgents`, so it also works
when Codex starts in a nested project directory. This keeps generated Codex and Claude Code startup
hooks portable across Windows, macOS, and Linux. The Codex adapter also generates a guarded `Stop`
hook that blocks completion once to require the explicit `project-learn` workflow; the workflow
itself retains its existing evidence and write approvals.

The generated Claude plugin version uses deterministic SemVer build metadata derived from the
approved blueprint. A material blueprint change therefore produces a new Claude cache identity
without inventing a release version. Codex consumes repository files directly and has no generated
plugin cache identity.

When `.codex/hooks.json` already exists before generation, the factory preserves its description
and non-factory hook groups while adding the generated `SessionStart` and `Stop` groups. After the
file enters generation state, later manual changes are reported as managed-file conflicts.

Claude subagents receive an explicit tool list derived from logical capabilities. Read-only roles
have only `Read`, `Grep`, and `Glob`; write and shell tools are added only when declared. Nested
delegation is disabled inside Claude plugin subagents because its plugin contract has no equivalent
project-specific child-agent allowlist.

## Ownership model

- `managed`: deterministic output; updated only if its current hash matches generation state.
- `seed`: initial context, docs, and memory; preserved after creation.
- `block`: a marked section inside root `AGENTS.md`; merged only with explicit approval.

This separation prevents template upgrades from erasing project knowledge.

## Optional browser-testing capability

`browser-testing` is opt-in; its stack-specific templates and runtime are isolated under
`assets/browser-testing` and `scripts/testing`. The logical factory core only selects the capability
and renders shared workflows/adapters. It does not inspect live applications or install dependencies
during kit generation. Non-browser kits have no new runtime dependency.

The generated kit contains autonomous helpers, contracts and references under `.projectAgents/testing`.
The separate test-infra workflow creates project-owned profile/test infrastructure only after a
concrete preview and approval. Test specs, fixtures and evidence are outside managed factory output.
Markdown import and approved Gherkin remain separate evidence layers; playwright-bdd compiles
project-owned features/steps into derivative Playwright specs. Test Agents support exploration and
diagnosis through specialized MCP, without adopting the upstream healer's skip/fixme policy.
See [browser testing](browser-testing.md) for ownership, execution and verification boundaries.
