# AGENTS.md

Instructions for any AI coding agent (Codex, Cursor, Claude Code, Gemini CLI, Copilot, ...) working with Affinity by Canva.

## If you are here to use Affinity

The skill lives in [`skills/affinity/SKILL.md`](skills/affinity/SKILL.md). Read it before calling Affinity's MCP tools, and load the files in `skills/affinity/references/` that it points you to. Connection details are in [`skills/affinity/references/setup.md`](skills/affinity/references/setup.md): the server is `http://localhost:6767/sse` (SSE), and stdio-only clients run `node scripts/affinity-sse-bridge.mjs`.

The non-negotiables, explained in `references/safety.md`: work on a copy of the user's document, ask before Canva AI calls that use credits, never save, close or overwrite documents you did not create, and verify every visible change with `render_spread`.

## If you are here to change this repository

- Skill content is English, imperative, and evidence-based. Do not document an API you have not run or found in the official SDK docs, and mark docs-only claims `(docs)`.
- Keep `skills/affinity/SKILL.md` under 500 lines. Detail belongs in `references/`.
- Plugin manifests: `.claude-plugin/` (plugin and marketplace), `.cursor-plugin/plugin.json` + `mcp.json`, `.codex-plugin/plugin.json` + `.codex-plugin/mcp.json`, and `.mcp.json` for Claude. Keep versions in sync with `CHANGELOG.md`.
- `scripts/affinity-sse-bridge.mjs` must stay dependency-free and loopback-only.
- No personal data in examples.
