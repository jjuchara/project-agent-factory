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

Blueprint schema version 2 requires an explicit `project.capabilityPacks` array; an empty array is a
valid choice. Project kind never supplies defaults. Version 1 blueprints remain readable only when
they already contain an explicit pack list. A legacy blueprint without that list must be migrated
through an approved diff.

`bdd-specification` adds the generated project bdd-spec workflow, bundled parser/validator,
registry and specification-manifest contracts. `browser-testing` declaratively depends on it and
adds test-infra/bdd-tests plus execution helpers. Dependency expansion is deterministic and
deduplicated; an existing explicit `browser-testing` choice therefore remains compatible and gains
the specification core once.

The target-project testing profile is created by a separately approved setup workflow, not by the
blueprint generator. No URL, credentials, MCP server or Playwright installation is added to the
shared logical blueprint. Project-owned features, bundles, registries, mappings, profiles, fixtures
and evidence survive capability updates/removal. See [browser testing](browser-testing.md).
