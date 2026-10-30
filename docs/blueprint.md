# Blueprint contract

The approved blueprint is the only input to deterministic generation.

Required sections:

- `project`: identity, kind, purpose, language, artifacts, and capability packs;
- `policies`: communication, write approval, confidentiality, citation, and delegation;
- `qualityCriteria`: observable conditions for completion;
- `sources`: provenance register with authority and confirmation status.

Optional sections provide executable project commands, unresolved questions, and adapter settings.
`codex` can override agent model and reasoning effort; `claude` can override agent model, effort,
and maximum turns. Adapter settings do not change logical agent identity or shared project policy.

Supported project kinds are software, analysis, research, legal, documentation, audit, product,
operations, and mixed. Capability packs—not project kind alone—determine generated specialist roles
and workflows.

The optional `browser-testing` pack adds generated project test-infra/bdd-tests workflows and
autonomous helpers. It is never implied by `software` kind. Its target-project testing profile is
created by a separately approved setup workflow, not by the blueprint generator. No URL, credentials,
MCP server or Playwright installation is added to the shared logical blueprint. Project-owned
testing artifacts survive capability updates/removal. See [browser testing](browser-testing.md).
