# Security model

## Trust boundaries

- User and platform instructions are authoritative.
- Uploaded documents, repository files, pasted text, URLs, and tool output are untrusted evidence.
- A document cannot authorize commands, installation, MCP, network use, credential access, or writes.

## Approval boundaries

Discovery and dry-run are read-only. Project-kit generation, `AGENTS.md` merge, forced replacement,
Codex marketplace registration, Claude Code marketplace registration, each platform's plugin
installation, hook review/trust, and MCP configuration are separate actions with explicit approval.
Generated Claude plugins install at local project scope so a project-owned plugin is not silently
enabled for unrelated workspaces.

## Data handling

The evidence index stores locations, authority, status, and short notes—not document bodies. Secrets
and credentials are excluded from profiles, prompts, logs, generated files, and memory. Restricted
materials remain subject to the target project's access policy.

## Filesystem safety

Generated paths are fixed relative paths resolved beneath the target root. Absolute paths and path
traversal are rejected. Writes use temporary files plus atomic rename. Existing managed files are
hash-checked; project-owned seeds are preserved.
