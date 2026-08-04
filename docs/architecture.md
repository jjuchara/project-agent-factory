# Architecture

Project Agent Factory has three strict boundaries.

## Factory runtime

The installed Codex plugin contains the interview skill, schemas, safety rules, deterministic
renderer, validators, and update workflow. It contains no project-specific facts, models, commands,
MCP servers, industries, or coding assumptions.

## Approved blueprint

The conversational skill turns user answers, observed repository structure, and supplied documents
into a source register and project blueprint. Facts are classified as user-confirmed, observed,
inferred, or unknown. The user approves this layer before writes.

## Generated project kit

The generated `.projectAgents` directory contains the project profile, evidence index, context,
rules, memory, logical catalogs, Codex agents, skills, hooks, marketplace, and bootstrap. It is
autonomous and versioned with the target project.

## Ownership model

- `managed`: deterministic output; updated only if its current hash matches generation state.
- `seed`: initial context, docs, and memory; preserved after creation.
- `block`: a marked section inside root `AGENTS.md`; merged only with explicit approval.

This separation prevents template upgrades from erasing project knowledge.
