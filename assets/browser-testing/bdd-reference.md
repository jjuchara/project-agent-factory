# BDD contracts

The registry schema is `../schemas/bdd-registry.schema.json`; mapping schema is `../schemas/bdd-coverage.schema.json`. Run `inspect-bdd` with explicit paths only. It emits normalized drafts, stable scenario identities, variants, source lines/hashes and diagnostics. It never writes, approves scenarios or generates implementations. 1 MiB per input; Markdown importer supports English structural keywords and Russian prose; valid localized `.feature` uses the standard Gherkin parser. Unsupported rough syntax is a visible diagnostic for agent-assisted normalization, not an executable scenario.

Draft normalization may move punctuation/structure, but never changes quoted business expectations. Credential tables are omitted and flagged; inspect all other source material for sensitive values before persisting. The registry intentionally contains scenario text: it is restricted project test evidence, not the factory's general metadata-only evidence index. Keep confidential drafts in approved local locations; avoid automatic publication.

Original-to-approved provenance must survive normalization. Original-source registry and approved execution registry may differ; retain the explicit mapping and never count one as approval of the other. `@bdd-...` scenario tags override title-derived identity for approved Gherkin. If a source scenario is renamed without a stable tag, review the proposed identity rather than guessing it is the same scenario. Identical names with distinct explicit tags are distinct scenarios. Examples/tags/Background changes invalidate signatures.

Each expected result needs an implementation location. Generated code requires actual assertions: a click is not proof of deletion, a notification is not proof of persistence, absence of a card is not proof that its linked object survives. Unstructured source details remain unresolved until converted and approved. Additional discovered cases are proposals, not replacements for supplied intermediate-state tests.

Execution evidence uses Playwright JSON reports imported with `import-results --registry <file> --input <report> --root <root>`; tag every executable scenario with its registry ID. Import rejects reports older than test inputs and computes a test-input fingerprint; coverage rechecks this fingerprint. Only all reported instances passing can be passed; failures, skipped cases and retries stay visible. The registry records expected example counts; mapping.projects declares the full expected browser-project scope. Missing/duplicate instance IDs or filtered Examples cannot produce passed. Review semantic correctness of assertions separately. Local relative imports are fingerprinted recursively. Declare additionalInputs in the profile for aliased/dynamic helpers and external test-data roots; review these roots before accepting run evidence. Application build/environment identity still requires project evidence.

Use `check-coverage --registry <file> --mapping <file> [--run <file>] --root <root>`. Exit status is nonzero until every scenario is approved, fully mapped and freshly passing. Project maintainers review exact assertion locations and run scope; a hand-written mapping or report cannot establish behavior by itself.

Upstream references (consult the installed version):
- https://playwright.dev/docs/test-agents
- https://github.com/vitalets/playwright-bdd/blob/main/docs/cli.md
- https://github.com/vitalets/playwright-bdd/blob/main/docs/writing-steps/scoped.md
- https://github.com/vitalets/playwright-bdd/blob/main/docs/getting-started/add-fixtures.md

Do not copy upstream instructions to modify production code, minimize supplied scenarios, change expected values or mark broken behavior fixme. Those are outside this acceptance-test workflow.
