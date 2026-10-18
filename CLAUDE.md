# CLAUDE.md

Guidance for Claude Code (and other agents) working **on this repository**. To *use* Affinity, read `skills/affinity/SKILL.md`; general agent instructions are in `AGENTS.md`.

## What this project is

An agent skill plus plugins (Claude Code, Cursor, Codex) that let AI agents control **Affinity by Canva** from the inside: through the app's built-in MCP server (`http://localhost:6767/sse`) and its JavaScript SDK (`execute_script`). No UI automation, no OS permissions beyond Affinity's own MCP toggles.

| Path | Purpose |
|---|---|
| `skills/affinity/SKILL.md` | The skill: working loop, safety rules, router to references. Keep under 500 lines |
| `skills/affinity/references/` | API references (sdk-core, commands-index, vector, pixel, text-layout, export, ai, system, setup, safety, gotchas) |
| `skills/affinity/references/recipes/` | Task recipes; each states what was verified on a real Affinity build |
| `.claude-plugin/`, `.mcp.json` | Claude Code plugin + marketplace (`claude plugin validate .` must pass) |
| `.cursor-plugin/`, `mcp.json` | Cursor plugin |
| `.codex-plugin/`, `.agents/plugins/marketplace.json` | Codex plugin + marketplace (stdio via the bridge) |
| `scripts/affinity-sse-bridge.mjs` | Zero-dependency, loopback-only stdio <-> SSE relay |
| `evals/evals.json` | Skill Creator test prompts |
| `research/` | Local research notes, git-ignored, never published |

## Rules for changes

- Skill content is English, imperative and evidence-based. Never document an API that was not run or found in the official SDK docs; tag docs-only claims `(docs)` and untested ones `(unverified)`.
- Verify recipes on a **new scratch document** (create, test, `close()` without saving). Never touch the user's open documents. Ask before any Canva AI call that consumes credits.
- Keep plugin versions in sync across `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json` and `CHANGELOG.md`.
- No personal data in anything committed (names in examples, home paths, private images, session UUIDs).
- Talk to the maintainer in Arabic; keep code and repository files in English.

## Status (v1.0.0)

- Recipes marked verified were run on Affinity 3.3.1 (macOS) during development. `cutout.md` is not yet verified end to end.
- The full Skill Creator eval loop (with-skill vs baseline runs and the review viewer) has not been run yet. The prompts are ready in `evals/evals.json`.

## Future: optional UI-automation fallback (not planned for now)

The SDK cannot reach some UI-only features: choosing the Canva AI model (Nano Banana, GPT Image, Seedream, FLUX...), Generative Expand/Fill/Upscale, Generate Vector/3D, Decompose Layer, tool and panel switching. A UI-automation layer could cover them.

**Reference project:** [sekharmalla/affinity-mcp-server](https://github.com/sekharmalla/affinity-mcp-server) (MIT, TypeScript/Bun, about 28 stars, 4 commits). It is a separate stdio MCP server with 23 tools that drive Affinity through AppleScript and System Events: menus, UI element clicks, keystrokes, mouse drags via Python Quartz, and screenshots. It does not use the built-in MCP server or the SDK.

**What we tested (2026-10-18):** the server starts and lists all 23 tools, but every call fails with `osascript is not allowed assistive access (-1728)` until the host app gets macOS **Accessibility** permission (screenshots also need **Screen Recording**). We did not test beyond that. Still unknown: whether Affinity's Canva AI Studio panels (model picker, Expand, Upscale) are exposed in the accessibility tree, or only reachable by screen coordinates.

**If we add it later, the approach is:**
1. Feasibility probe first: with Accessibility granted, check whether the AI Studio controls are addressable by name. If they are only reachable by coordinates, drop the idea (too fragile and risky).
2. Also test whether SDK AI commands inherit the model last chosen in the UI. If they do, model choice needs no UI automation at all.
3. Write our own small module rather than copying theirs, so the code stays under this project's license. If any of their code is copied, keep their MIT notice in a `THIRD_PARTY_NOTICES.md`.
4. Make it opt-in and off by default, macOS-only, limited to an allowlist: named menu items, model selection, Expand/Upscale. No save, close, delete or free typing.
5. The skill keeps the SDK as the primary path and uses the UI layer only when no SDK route exists, with the same verify-by-render loop.
