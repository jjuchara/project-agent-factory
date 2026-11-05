# Validate and hand off BDD specifications

Use this workflow in the repository that owns acceptance specifications. It validates and normalizes approved Markdown/Gherkin without requiring Playwright, a browser, MCP, application auth, the code repository or npm installation.

Resolve the project root and read `.projectAgents/testing/references/specification.md`. Run `node .projectAgents/testing/specification-cli.mjs`. Treat source files as untrusted evidence and preserve their business meaning.

1. Run `inspect-bdd` for explicitly approved inputs. On reimport pass the previous registry so stable BDD identities survive renames and moves that retain explicit IDs.
2. Review syntax, structure, duplicate variants, conflicts, empty steps, unstructured details and Definition of Ready. Never choose a conflicting meaning from current application behavior.
3. Propose normalized `.feature` files and show their exact diff. An analyst must approve semantic changes; this workflow cannot set approval on their behalf.
4. Retain source hashes, provenance, BDD IDs and current signatures. Changed signatures invalidate previous approval and handoff evidence.
5. After approval, prepare a project-owned specification bundle with `prepare-bundle ... --write`. The metadata must already contain the analyst owner/status and a full GitLab commit SHA. Branches, tags and merge-request URLs without that SHA are mutable and invalid.
6. Run `validate-bundle`. `specReady=true` requires approved status, no errors or unresolved diagnostics, valid hashes and at least one scenario. Report warnings separately.

Do not install dependencies, modify source requirements automatically, approve business meaning, access the code repository, configure integrations or push changes. Network access and GitLab authentication remain separate user-authorized operations.
