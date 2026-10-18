<div align="center">

# Affinity MCP: AI Agent Skill for Affinity by Canva

**Let Claude, Cursor and Codex edit photos, design graphics and lay out documents in Affinity by Canva, through Affinity's built-in MCP server and JavaScript SDK.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Affinity by Canva 3.3](https://img.shields.io/badge/Affinity%20by%20Canva-3.3.x-1f8f7a.svg)](https://www.affinity.studio/)
[![MCP](https://img.shields.io/badge/MCP-built--in%20server-6f42c1.svg)](https://modelcontextprotocol.io/)
[![Claude Code plugin](https://img.shields.io/badge/Claude%20Code-plugin-d97757.svg)](#claude-code)
[![Cursor plugin](https://img.shields.io/badge/Cursor-plugin-000000.svg)](#cursor)
[![Codex plugin](https://img.shields.io/badge/Codex-plugin-10a37f.svg)](#codex)

[English](README.md) · [العربية](README.ar.md)

</div>

---

Affinity by Canva (the free successor to Affinity Photo, Designer and Publisher) ships a local **Model Context Protocol (MCP) server**. Its `execute_script` tool runs JavaScript inside the app with access to the full SDK: 20 native modules, 372 document commands, vector, pixel, layout, typography, filters, export and Canva AI.

The server gives an agent raw power but no know-how. This project adds the know-how: a tested **agent skill** that teaches an AI how to use that power correctly and safely. It is packaged as plugins for **Claude Code, Cursor and Codex**.

> "Crop this event photo to a square around me, remove the hand on my shoulder, blur the people behind me and centre my face for LinkedIn."
>
> An agent with this skill does exactly that inside Affinity. It checks each step visually and hands back the exported JPEG plus a layered `.af` file that a designer can keep editing.

## Contents

- [Why this project](#why-this-project)
- [What an agent can do](#what-an-agent-can-do)
- [Quick start](#quick-start)
- [Example prompts](#example-prompts)
- [What is inside](#what-is-inside)
- [Limits](#limits)
- [Safety](#safety)
- [FAQ](#faq)
- [Contributing](#contributing) · [License](#license)

## Why this project

| | UI automation (AppleScript, clicks, screenshots) | **Affinity MCP (this project)** |
|---|---|---|
| How it controls Affinity | Simulates mouse, keyboard and menus | Official built-in MCP server + JavaScript SDK |
| Precision | Depends on screen layout and timing | Direct access to documents, layers, pixels and nodes |
| Canva AI (generative edit, select subject...) | Not available | Supported, with explicit credit consent |
| Platforms | Usually macOS only | macOS and Windows (the server is part of Affinity) |
| OS permissions needed | Accessibility, Screen Recording | None beyond Affinity's own MCP toggles |
| Result | Pixels on screen | A layered `.af` document plus exports |
| Agent guidance | Thin | Working loop, safety rules, 13 recipes built from real runs, full API references |

## What an agent can do

| Area | Examples |
|---|---|
| **Photo editing** | Crop, resample, remove objects, cut out subjects, blur backgrounds, outpaint, 30 filters (blur family, unsharp mask, clarity, denoise, halftone...), live adjustments (levels, curves, HSL, white balance, vibrance...) |
| **Vector design** | Shapes, star/polygon/arrow/QR codes, curves and path editing, boolean operations, gradients, mesh and hatch fills, strokes and arrowheads, shadows/glows/outlines, image trace |
| **Typography and layout** | Artistic and frame text, text on a path, **correct Arabic/RTL text**, fonts and OpenType, tables, multi-page documents, master pages, artboards, picture frames |
| **Canva AI** | `generateImage`, `generativeEditImage`, `removeBackground`, `selectSubject`, `detectDepth`, `colourise` |
| **Export** | 62 presets: PNG, JPEG, WebP, TIFF, SVG, EPS, PDF, PDF/X, `PDF (press ready)`... for a document, page, artboard or selection |
| **Automation** | File I/O on the Desktop, HTTP GET/POST, dialogs, macros, a reusable script library |

## Quick start

### 1. Enable the server in Affinity

Affinity by Canva (April 2026 release or newer) > **Settings > Model Context Protocol > Enable Affinity MCP**. Choose the permissions you want, then **quit and reopen Affinity**. The server runs at `http://localhost:6767/sse` while the app is open.

### 2. Install the plugin for your agent

#### Claude Code

```bash
claude plugin marketplace add aboalrejalai/affinity-mcp
```

```bash
claude plugin install affinity@affinity-mcp
```

The plugin adds the skill and the MCP server entry. To add only the server: `claude mcp add --scope user --transport sse affinity http://localhost:6767/sse`.

**Claude Desktop:** install Canva's official Affinity connector (Settings > Connectors), then add this skill as a custom skill (`skills/affinity`).

#### Cursor

Open **Settings > Plugins**, paste `https://github.com/aboalrejalai/affinity-mcp`, and install. The plugin bundles the skill and `mcp.json`.

#### Codex

```bash
codex plugin marketplace add aboalrejalai/affinity-mcp
```

```bash
codex plugin add affinity@affinity-mcp
```

Codex speaks stdio, so the plugin starts [`scripts/affinity-sse-bridge.mjs`](scripts/affinity-sse-bridge.mjs). It is a dependency-free, loopback-only relay to Affinity's SSE server (Node 18+).

#### Any other agent

Point an SSE-capable MCP client at `http://localhost:6767/sse` (stdio clients: `node scripts/affinity-sse-bridge.mjs`), and give it [`AGENTS.md`](AGENTS.md) and [`skills/affinity/`](skills/affinity/).

### 3. Ask

Open a document in Affinity and ask your agent. Check the connection with: *"Can you see the Affinity MCP server? What documents are open?"*

## Example prompts

- "Remove the background from the open photo and export a transparent PNG to my Desktop."
- "Make this group photo a centred square profile picture with a soft blurred background."
- "Design a 1080x1080 Instagram post with a teal gradient, a white card and the Arabic headline «عرض خاص»."
- "Resize every image in this document to 2048 px wide and export them as WebP."
- "Create an A5 flyer with a QR code linking to my site, and export it as `PDF (press ready)`."
- "Colourise this old black-and-white photo, add a light vignette, and save a copy."

## What is inside

```text
skills/affinity/
├── SKILL.md                    # Working loop, safety rules, router to references
└── references/
    ├── sdk-core.md             # Modules, documents, nodes, selections, commands, history
    ├── commands-index.md       # All 372 DocumentCommand factories, categorised
    ├── vector.md · pixel.md · text-layout.md · export.md
    ├── ai.md                   # Canva AI commands, credits, prompting, UI-only tools
    ├── system.md               # MCP tools, permissions, files, network, dialogs, macros
    ├── setup.md · safety.md · gotchas.md
    └── recipes/                # 13 recipes built from runs on Affinity 3.3.1
.claude-plugin/  .cursor-plugin/  .codex-plugin/  .agents/plugins/   # Plugin and marketplace manifests
.mcp.json  mcp.json                                                  # MCP server entries
scripts/affinity-sse-bridge.mjs                                      # stdio <-> SSE relay
AGENTS.md                                                            # Instructions for any agent
```

**Recipes:** inspect · save a copy · new document · crop · resize · remove object · blur background · cutout · outpaint · Arabic text · social post · profile photo · export.

## Limits

These limits come from Affinity's SDK, not from this project:

- Scripts cannot pick the AI model (Nano Banana, GPT Image, Seedream, FLUX...), size, seed or count. The app's UI controls those.
- Generative Fill, Expand, Upscale, Generate Vector/3D and Decompose Layer have no script command. The skill uses a proven outpaint substitute for Expand.
- No clipboard, no tool switching, no mouse/keyboard events, no scripted brush strokes. File access is limited to the Desktop.

## Safety

The skill makes agents:

- work on a **copy** of your document,
- **ask before spending Canva AI credits**,
- never save, close or overwrite files they did not create,
- verify every visible change with a render.

Affinity's own permission toggles always apply. See [SECURITY.md](SECURITY.md) and [`references/safety.md`](skills/affinity/references/safety.md).

## FAQ

**Can Claude control Affinity by Canva?**
Yes. Affinity by Canva includes an MCP server, and Claude Code, Claude Desktop, Cursor and Codex can connect to it. This skill teaches them how to use it well.

**Is this the official Canva connector?**
No. Canva publishes the official Claude Desktop connector, which gives an agent the raw tools. This independent project adds the expertise, plus plugins for Cursor and Codex. They work together.

**Does it work on Windows?**
The MCP server is part of Affinity on macOS and Windows. The recipes were verified on macOS; Windows reports are welcome.

**Does it use my Canva AI credits?**
Only `generateImage` and `generativeEditImage` do, and the skill asks first. `selectSubject` and `removeBackground` are not counted against the monthly limit (they need a paid Canva plan).

**Does it write Arabic correctly?**
Yes, when an Arabic-capable font is set. The skill does this automatically ([recipe](skills/affinity/references/recipes/arabic-text.md)).

**Is this Affinity CRM?**
No. Affinity CRM (affinity.co) is an unrelated product with its own MCP server.

## Contributing

New recipes, corrections and client support are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2026 Mohammed Abo Alrejal. Free and open source: use it, modify it and share it, privately or commercially, as long as the copyright notice stays. See [NOTICE.md](NOTICE.md) for trademarks.

<sub>Keywords: Affinity by Canva MCP, Affinity MCP server, Affinity AI automation, Claude Affinity, Cursor Affinity plugin, Codex Affinity plugin, Affinity scripting, Affinity JavaScript SDK, AI photo editing, AI graphic design, Model Context Protocol, agent skill.</sub>
