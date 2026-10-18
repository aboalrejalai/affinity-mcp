# Security Policy

Affinity MCP gives AI agents the ability to run JavaScript inside Affinity by Canva. That is powerful, so security reports are taken seriously.

## Supported versions

| Version | Supported |
|---|---|
| 1.x (latest) | Yes |
| Older | No. Please upgrade |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub: open the **Security** tab of this repository and choose **Report a vulnerability** (GitHub Private Vulnerability Reporting). Include:

- what is affected (skill instructions, a recipe, the stdio bridge, a plugin manifest),
- steps to reproduce, and the Affinity, client and OS versions,
- the impact you observed or expect.

You will get an acknowledgement within 7 days and a status update at least every 14 days until the report is resolved. Valid reports are credited in the release notes unless you prefer otherwise.

## Scope

In scope:
- Instructions in `skills/affinity/` that could lead an agent to destroy, leak or overwrite user data, spend Canva AI credits without consent, or bypass Affinity's permission settings.
- `scripts/affinity-sse-bridge.mjs` (it must only connect to loopback and only relay JSON-RPC).
- Plugin manifests (`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.mcp.json`, `mcp.json`).

Out of scope, so please report them to their owners:
- Affinity by Canva itself and its MCP server: Canva / Affinity support.
- Claude, Cursor, Codex or other MCP clients: their vendors.

## Security model in brief

- Affinity's MCP server listens on `localhost:6767` only, and Affinity enforces its own permission toggles (Desktop files, network, Canva AI, script library, hints). This project never disables or works around them.
- File access from scripts is limited by Affinity to the user's Desktop.
- The skill instructs agents to work on copies, ask before consuming Canva AI credits, never close or overwrite user documents without consent, and never auto-run untrusted community scripts.
- The stdio bridge has zero dependencies, refuses non-loopback URLs, and sends no telemetry.
