# Browser acceptance testing

`browser-testing` is an optional capability pack for an approved project blueprint. Add it to
`project.capabilityPacks` alongside the project's existing packs, preview generation, and apply only
after project-kit approval. It is never selected implicitly from project kind.

The generated project receives `<slug>-test-infra` and `<slug>-bdd-tests` skills for repository-local
Codex and the project Claude plugin. Claude exposes skills using its installed plugin namespace;
Codex uses `$<slug>-bdd-tests` and `$<slug>-test-infra`. No duplicate command implementation is needed.
All shared instructions, helpers, schemas and references are included under `.projectAgents/testing`.
The generated runtime does not import or locate the factory checkout.

## Infrastructure workflow

Invoke the generated test-infra skill in the target project. It performs a static audit first,
then previews files and commands. Generation itself does not create package dependencies, test
files, a testing profile, MCP settings or CI jobs, and does not download browsers or trust hooks.

The autonomous helper has these commands (run from the owning project root):

```bash
node .projectAgents/testing/cli.mjs audit-infra
node .projectAgents/testing/cli.mjs plan-infra
node .projectAgents/testing/cli.mjs apply-infra --plan /path/to/reviewed-plan.json --write
```

Audit and plan emit JSON without writes or execution of project configs/scripts. A clean-project
plan includes pinned development dependencies, a standalone Playwright config, shared BDD fixtures,
an exploration seed, an infrastructure smoke feature, scripts, an environment example and ignore
rules. Apply verifies root, allowed paths and all prior file hashes before writing. It never runs
installation or shell commands. Files are individually atomic, not a multi-file transaction.

Existing Playwright configs, conflicting scripts, workspaces, custom profiles and modified scaffold
files produce blockers. The skill must explicitly adapt the existing setup and show its diff;
it must not clear blockers or force a competing scaffold. Dependencies/lockfiles, browser downloads,
MCP integration, CI and authentication/data setup remain separately authorized target-project work.
The workflow is idempotent and preserves unrelated settings. Test files and profile belong to the
project and are not managed or deleted by later factory generation.

The baseline is @playwright/test 1.64.1, playwright-bdd 9.2.1, @cucumber/gherkin 42.0.1,
@cucumber/messages 32.0.0 and Ajv 8.20.0. Existing versions require compatibility checks rather than
automatic upgrades. The first browser is Chromium. Test Agents use the specialized local
`playwright run-test-mcp-server`; setup merges project-local platform settings after approval.
The exploration seed lives outside `.features-gen` and shares the applicable fixtures with BDD.

CI setup follows the target provider and existing pipeline: frozen dependency installation,
Chromium/system dependencies, an approved running application and isolated data, generation,
execution and retained reports/traces. The deterministic helper does not guess a provider.

## BDD workflow

Pass Markdown paths, valid localized Gherkin `.feature` paths or requirement text to the generated
bdd-tests skill. Its modes are analyze, generate, run and diagnose. It can execute sequentially
without subagents. Original source documents remain unchanged.

```bash
node .projectAgents/testing/cli.mjs inspect-bdd --input /path/to/requirements.md
node .projectAgents/testing/cli.mjs inspect-bdd --input /path/to/requirements.md --previous /path/to/registry.json
```

Inputs are explicit and bounded to 1 MiB each. Rough Markdown supports English structural keywords
with original-language prose. It tolerates fences, whitespace and missing heading punctuation;
unsupported details, empty steps and credentials tables remain diagnostics. Valid localized
`.feature` uses the standard Gherkin parser. The agent must resolve free-form enumerations and
semantic questions, show exact feature diffs and obtain specification approval before implementation.
It cannot infer required behavior from the current application.

The registry records scenario identities, expected outcome identities, expected Examples counts,
source lines/hashes, duplicate variants and conflicts. Stable `@bdd-<12 hex digits>` scenario tags
preserve identity across renames; signatures invalidate approval/evidence when content changes.
Title-based matching cannot safely infer arbitrary renames; retain explicit provenance and review
identity changes. Conflicting sources require an authority decision, never automatic selection.

For an approved feature, export existing steps with the local `bddgen export`, explore through
Test Agents MCP, reuse domain steps and generate missing step definitions, fixtures and minimal
page objects. Scoped steps and DataTables are supported. Prepare/clean each scenario's own data;
linked-object and negative side-effect assertions require appropriate project oracles. Only the
behavior under test must use UI; approved setup/oracles may use project APIs.

`bddgen` compiles features and steps into derivative Playwright specs; never edit those generated
specs or generate a second ordinary acceptance suite with the upstream generator. Generation and
execution use the same config. The upstream healer is not installed unchanged: repairs are bounded,
may preserve locator/wait/data behavior, and cannot weaken assertions, alter expectations or mark
broken functionality skip/fixme. Production fixes require a separate authorized task.

## Coverage and evidence

A coverage mapping declares `projects` (baseline `["bdd-chromium"]`) and, per scenario, its ID,
`approvedSignature` and assertion locations (`expectationId`, project-relative `file`, `symbol`).
Every expected result needs its own mapping. Review that mapped code actually proves the outcome;
string/location checks cannot prove semantics.

```bash
node .projectAgents/testing/cli.mjs import-results --registry registry.json --input test-results/results.json
node .projectAgents/testing/cli.mjs check-coverage --registry registry.json --mapping mapping.json --run run.json
node .projectAgents/testing/cli.mjs validate-data --type bdd-registry --input registry.json
```

Persist outputs only in an authorized project location. `import-results` consumes fresh Playwright
JSON and scenario tags, binds it to test-input fingerprints, and retains failed/skipped/retried
outcomes. `check-coverage` rejects missing assertion locations or stale fingerprints and returns
nonzero until each scenario is approved, every outcome is mapped, and every expected instance in
every declared project passes. Partial Outline runs cannot count as complete. Unresolved import diagnostics block the overall gate, even when the remaining scenarios pass. Missing evidence
stays `not-run`; partial scope/skips stay blocked. The independent dimensions are specification,
coverage and execution.

Fingerprinting includes configured test roots, config/profile, manifests/lockfiles and recursively
resolved literal relative imports. Declare `additionalInputs` in the profile for aliases, computed
imports and external test-data roots. Review that declaration: static import discovery is not a
complete JavaScript dependency graph. Test fingerprints do not establish backend/build identity,
authorization, semantic correctness or production readiness.

The schemas are distributed with the kit: testing-profile, bdd-registry, bdd-coverage and bdd-run.
BDD registries/drafts contain scenario text and are confidential project test artifacts when source
material is restricted; they are separate from the factory's metadata-only evidence index. No
source document can authorize code execution, credential access, integration or writes.

## Verification

```bash
npm ci
npm test
npm run test:browser
npm run validate
npm run validate:claude
```

Browser smoke requires installed Chromium, a local listening port and browser process permissions.
It generates a separate kit, installs its own dependencies from the local npm cache, runs real BDD
checks against a controlled application, verifies an intentional linked-record deletion defect
fails, checks coverage results, and exercises Test Agents MCP initialize/tools/seed/snapshot.
It does not install a plugin into user configuration or run full conversational platform sessions.

Fresh evidence on 2026-10-30: 37 unit/regression tests and the macOS Chromium/BDD/MCP smoke passed;
local user-source import produced 17 scenarios with one source conflict. Full Codex/Claude skill
sessions, Windows/Linux execution and real provider CI remain unrun. The official Codex plugin
validator from OpenAI release `rust-v0.150.0` was retrieved and passed before commit; see its
[versioned source](https://github.com/openai/codex/blob/rust-v0.150.0/codex-rs/skills/src/assets/samples/plugin-creator/scripts/validate_plugin.py).
It was run with its accompanying `identifier_validation.py` from a temporary directory; neither
script was installed into user configuration. Internal and skill checks remain separate checks.

The factory passes `npm run validate:claude` (the directory profile emits advisory icon/OS-metadata
messages). An additional generated-plugin `--strict` check reports the pre-existing
`<slug>-claude-plugin` naming warning; changing that naming/installation contract is not part of
this capability. Normal manifest validation succeeds with the warning. Public directory submission
also has separate README/license/icon requirements, unrelated to local project activation.
