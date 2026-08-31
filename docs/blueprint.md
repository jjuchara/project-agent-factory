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
