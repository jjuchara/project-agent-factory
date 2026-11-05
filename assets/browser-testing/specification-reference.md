# BDD specification contract

The specification runtime is bundled and uses only the target Node.js runtime. It imports bounded Markdown/Gherkin, preserves source provenance and stable BDD IDs, detects conflicts, and validates a project-owned handoff bundle.

Definition of Ready requires syntactically valid scenarios, explicit observable outcomes, resolved conflicts, no empty or unstructured steps, confirmed source authority, current signatures and analyst approval. The workflow may report or normalize these conditions but never grant approval or invent business meaning.

A bundle contains `manifest.json`, `registry.json`, `diagnostics.json` and normalized files under `features/`. Every artifact hash is checked. The manifest pins `gitlab.projectPath`, a full 40-character `commitSha` and an exact `bundlePath`; merge-request metadata is informative and never replaces the immutable SHA.

The bundle is project-owned. Factory updates and capability removal must preserve it, along with source documents, mappings, profiles, fixtures and evidence.
