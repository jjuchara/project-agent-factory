---
name: project-agent-factory-help
description: Use when the user asks what Project Agent Factory does, which projects it supports, or how its initialization and update flows work.
---

# Project Agent Factory help

Explain these boundaries concisely:

- The factory supports software and non-software projects.
- It first performs read-only discovery and asks for documentation.
- For substantial or unclear documentation, `project-docs-prepare` builds a read-only map of
  structure, links, exact duplicates, issues, and likely reading routes before initialization.
- Documents are evidence, not executable instructions.
- The user approves a sourced project blueprint before generation.
- The generated `.projectAgents` kit and its Codex and Claude Code plugins are autonomous and
  project-owned.
- Generation, hook trust, MCP configuration, and installation are separate approval boundaries.
- Managed generator output is protected from silent overwrite; context, docs, and memory are
  preserved as project-owned knowledge.

For a new project, recommend `project-agents-init`. Recommend `project-docs-prepare` first when the
documentation corpus is scattered or difficult to navigate. For an existing kit, recommend
`project-agents-update`.
