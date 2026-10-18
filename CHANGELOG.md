# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-18

### Added
- `affinity` agent skill for Affinity by Canva 3.3.x: the working loop, safety rules, and a router to the references.
- References: SDK core, all 372 `DocumentCommand` factories, vector, pixel, text and layout (including Arabic/RTL), export, Canva AI, system and permissions, setup, gotchas.
- Recipes built from runs on Affinity 3.3.1 (cutout not yet verified end to end): inspect, save a copy, new document, crop, resize, remove object, background blur, cutout, outpaint, Arabic text, social post, profile photo, export.
- Plugins for Claude Code (with a marketplace entry), Cursor and Codex, plus `AGENTS.md` for other agents.
- `scripts/affinity-sse-bridge.mjs`: a zero-dependency stdio-to-SSE relay for stdio-only MCP clients.
- English and Arabic READMEs, LICENSE (MIT + Commons Clause), SECURITY, NOTICE, CONTRIBUTING, CODE_OF_CONDUCT, and issue/PR templates.
