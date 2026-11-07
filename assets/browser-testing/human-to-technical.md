# Human-to-technical BDD converter

The agent translates analyst language into a testable technical specification BEFORE the deterministic Gherkin importer. Do not ask analysts to supply selectors, implementation code, fixture code or account secrets. Ask for business facts and an observable result; engineers later choose locators, APIs and implementation. Project-approved fixture/data policies may supply technical details; cite them instead of repeating questions.

## Review every category

- `source-authority`: canonical source, owner, version, current/target/defect/deprecated status, stable analyst scenario IDs and conflicts. Missing GitLab SHA may permit local draft review, but prevents final handoff.
- `roles-and-state`: logical role/rights, initial page/state, entities, relationships and applicable environment class.
- `data-and-variants`: concrete values or agreed generation rules, field types/requiredness, finite variants and comparison mode. A placeholder needs a binding. Relative dates need the agreed clock/timezone/calendar rule. “At least one” is acceptable only with an agreed deterministic fixture/equivalence policy.
- `actions-and-outcomes`: distinguish user actions from system outcomes. An action written as And after Then becomes When (and subsequent actions And), preserving the intervening Then checkpoints and order. Do not add or drop assertions to make parsing easier.
- `observable-oracles`: each independent result has an observable business oracle, including persistence, absence and side effects. Expand “according to a rule” only from an explicitly identified rule contract; otherwise ask for the exact expected fields/values.
- `isolation-and-cleanup`: unique test data, allowed changes and guaranteed cleanup from approved policies or clarified requirements.
- `terminology-and-ui`: distinguish linked record, view/card placement and entity; exact labels versus semantic states, scope of repeated controls, exact/contains/ordered lists.
- `traceability`: every meaningful source fact is retained, and every generated step maps to an original source line. Preserve analytical tags; never invent extra business behavior.

Uncertainty MUST produce questions, not inferred product decisions. Group related questions; attach source/line and reason. Suggestions must be labelled as options for analyst approval. Do not treat current application behavior as requirements authority. Once answers arrive, retain them as confirmed decisions; apply them to the next draft and repeat the review. If answers introduce new requirements, show them explicitly in the diff. A report is an agent's recorded review, not proof that its business reasoning is correct.

## Conversion report

Validate against `.projectAgents/testing/schemas/bdd-conversion.schema.json` using validate-data --type bdd-conversion. Shape:

- schemaVersion: 1; status: needs-clarification or ready.
- sources: [{path, sha256}], SHA-256 of exact original UTF-8 text. Include supplied guides/conventions/answer files when they affect conversion. Paths must match --input exactly.
- checks: every category above exactly once, with status confirmed/not-applicable/unresolved and nonempty evidence (source references or agreed decisions, not a generic “OK”).
- questions: [{id, source, line, question, reason}]. Needs-clarification requires questions and an EMPTY technicalDraft; ready requires no questions and no unresolved checks.
- decisions: [{questionId, answer, confirmedBy}] for resolved questions. Never fabricate analyst confirmation. Keep earlier Q&A in project-owned review history; include its file in sources so changes invalidate the report.
- technicalDraft: [{path, content, traceability: [{source, line, technicalLine}]}]. Ready requires at least one strict English-keyword Gherkin feature with Russian or project-language prose. Paths are features/<basename>.feature. Every Given/When/Then/And/But step needs a mapping. Tables/DocStrings/Examples and supplied context must also be mapped where they carry requirements.

Do not overwrite the original source. Show the exact draft and analyst decisions for semantic review. Correct punctuation outside quoted literals and classify steps only where meaning is clear. If an action/outcome distinction itself is ambiguous, ask first. Do not add CSS attributes, notifications or default values absent from requirements or approved conventions.

## Approval and summary

check-bdd returns needs-clarification/blocked, needs-approval or ready-for-handoff. An approval object has status: approved, owner, approvedAt (ISO timestamp), conversionHash and scenarios (the exact [{id, signature}] returned by check-bdd). It is evidence of a REAL analyst decision; the agent may record that decision only after receiving it. check-bdd never grants approval. prepare-bundle and validate-bundle bind these artifacts to the handoff. Legacy bundles without conversion evidence are readable for compatibility, not evidence of a new semantic review.

Persist report, answers, draft, approval and bundles as project-owned artifacts outside managed generation. Their source text has the project's confidentiality. For partial checks keep affected scenarios blocked and scope the conclusion explicitly. For successful handoff summarize: checked count, blockers 0, current approval and bundle path; readiness says nothing about an application's test results.
