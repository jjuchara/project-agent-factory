# Infrastructure adapter

Tested baseline to verify during release: @playwright/test 1.64.1, playwright-bdd 9.2.1, @cucumber/gherkin 42.0.1, @cucumber/messages 32.0.0, Ajv 8.20.0. These are optional target-project development dependencies, not requirements for non-browser kits. Dependencies need Node versions supported by their exact package manifests; use Node 22+ for the baseline and verify existing project engines. The factory's own deterministic generation requires Node 20.10+.

`audit-infra` inspects root-level metadata only; select a package in a monorepo. It deliberately does not execute JS configs, read environment files or check live auth/network. Existing Playwright configurations require an explicit adaptation rather than a second competing suite. `plan-infra` creates an additive standalone scaffold only when it can preserve files. `apply-infra` takes a reviewed temporary JSON plan plus --write, verifies root/path/hash preconditions and runs no shell. Review package scripts and content as code. No filesystem transaction spans all files; partial filesystem failures must be inspected.

The starter configuration has independent `exploration` and `bdd-chromium` projects and requires E2E_BASE_URL. Seed smoke validates HTTP readiness and BDD smoke validates visible document; neither is a product acceptance test. Authentication and data fixtures must be supplied by the project. Do not use production data for destructive flows.

## Test Agents MCP

This is the specialized server launched by the installed `playwright run-test-mcp-server`, not `@playwright/mcp`. Use the target project's local CLI and root/config. Resolve `<root>/node_modules/playwright/cli.js` using the package manager; if the dependency is not directly addressable, resolve the installed CLI explicitly rather than downloading through npx.

Claude: merge a `playwright-test` entry into project `.mcp.json` with command `node` and args `[<resolved-local-playwright-cli>, "run-test-mcp-server", "-c", <absolute-config>]`. Preserve other servers. For Codex, add an equivalent project-local `[mcp_servers.playwright-test]` entry in `.codex/config.toml` through a TOML-aware edit after reading existing config. Keep absolute machine paths out of committed portable templates; resolve them at setup time or use the project's package-manager exec mechanism pinned to cwd. On Windows, prefer node plus the resolved JS CLI instead of shell invocation of npx.cmd. Verify flags using the installed CLI help before applying; if config flags differ, use its supported config discovery from the root.

The parent workflow can use MCP tools directly. Delegation is optional. Discover installed tools and require planner_setup_page/generator_setup_page before browser interaction. Restrict exposed tools by task where supported; don't enable unsafe tools or install upstream agents automatically. Server configuration and tool availability must be verified in a fresh actual platform session.

## CI

Use existing provider conventions. A job needs: runtime setup, frozen lockfile installation, `playwright install --with-deps chromium` using the local binary on supported Linux runners, confirmed service/application startup or E2E_BASE_URL, `bddgen -c <config>`, `playwright test -c <config> --project=bdd-chromium`, and always-retained JSON/HTML/traces. Use the same config for generation/run. Pin reviewed action/dependency versions per project policy. Report CI as unverified until a real job runs. The helper does not guess a provider or overwrite workflows.
