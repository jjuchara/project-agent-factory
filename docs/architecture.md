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
rules, memory, and logical catalogs. Codex and Claude Code adapters render separate manifests,
agent definitions, skills, hooks, marketplaces, and installation bootstraps from that shared model.
The kit is autonomous and versioned with the target project.

Lifecycle hooks are Node.js modules invoked with `node`, rather than shell scripts. This keeps
generated Codex and Claude Code startup hooks portable across Windows, macOS, and Linux. The Codex
adapter also generates a guarded `Stop` hook that blocks completion once to require the explicit
`project-learn` workflow; the workflow itself retains its existing evidence and write approvals.

Generated plugin versions use deterministic SemVer build metadata derived from the approved
blueprint. A material blueprint change therefore produces a new cache identity for both adapters
without inventing a release version.

Claude subagents receive an explicit tool list derived from logical capabilities. Read-only roles
have only `Read`, `Grep`, and `Glob`; write and shell tools are added only when declared. Nested
delegation is disabled inside Claude plugin subagents because its plugin contract has no equivalent
project-specific child-agent allowlist.

## Ownership model

- `managed`: deterministic output; updated only if its current hash matches generation state.
- `seed`: initial context, docs, and memory; preserved after creation.
- `block`: a marked section inside root `AGENTS.md`; merged only with explicit approval.

This separation prevents template upgrades from erasing project knowledge.
