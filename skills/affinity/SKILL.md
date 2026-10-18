---
name: affinity
description: Control Affinity by Canva (the Photoshop/Illustrator/InDesign alternative, formerly Affinity Photo, Designer and Publisher) through its built-in MCP server and JavaScript SDK - edit photos, retouch, crop, resize, remove objects or backgrounds, blur backgrounds, outpaint, build vector graphics, logos, posters, social posts, layouts and multi-page documents, set Arabic or Latin typography, apply filters and adjustments, run Canva AI (generate image, generative edit, select subject), and export PNG/JPEG/PDF/SVG while keeping editable layers. Use this skill whenever the user mentions Affinity, Affinity by Canva, Affinity Photo/Designer/Publisher, .af/.afphoto/.afdesign files, the Affinity MCP or execute_script, or asks to design or edit an image "in Affinity" - including misspellings like "Infinity" and Arabic phrasing such as أفينيتي - even if they do not name the skill. Not for Affinity CRM (affinity.co).
---

# Affinity by Canva

You drive a real design application. Affinity by Canva runs a local MCP server; its `execute_script` tool runs JavaScript inside the app against the full SDK (vector, pixel, layout, text, filters, export and Canva AI). You write small scripts, the app does the work, and you look at the result with `render_spread` before moving on. The output is a genuine Affinity document with layers, so a human designer can continue where you stopped - that is a large part of the value, so keep work non-destructive and well layered when you can.

## 1. Make sure the connection exists

Look for the Affinity MCP tools (`execute_script`, `render_spread`, `read_sdk_documentation_topic`, ...). The server name varies by client (`affinity`, `Affinity`).

If they are missing or the connection is refused, the app is not serving MCP. Tell the user how to fix it instead of guessing:

1. Affinity > Settings > Model Context Protocol > enable **Enable Affinity MCP** (and the permissions they want).
2. Quit Affinity completely and reopen it - the server only starts on launch.
3. Connect the client to `http://localhost:6767/sse` (SSE). Per-client commands are in `references/setup.md`.

## 2. The working loop

Follow this loop for every task. Each step exists because skipping it has caused real failures.

1. **Orient once per session.** Read the `preamble` topic with `read_sdk_documentation_topic` - it carries the SDK conventions plus hints recorded on this machine. Then inspect what is open:

   ```js
   const { Document } = require('/document.js');
   for (const d of Document.all)
     console.log(d.sessionUuid, d.title, d.path, d.widthPixels + 'x' + d.heightPixels, 'dirty:', d.isDirty);
   const d = Document.current;
   for (const l of d.layers) console.log(l.constructor.name, l.description, JSON.stringify(l.baseBox));
   ```

2. **Protect the user's file before the first edit.** If the work targets a document the user cares about, `saveAs` a copy with a new name on the Desktop and work on the copy (`references/recipes/save-copy.md`). Ask before saving over, closing, or exporting over anything you did not create.

3. **Look things up instead of guessing APIs.** Use `search_sdk_hints` for the problem, then the matching reference file below, then `read_sdk_documentation_topic` for the exact wrapper source (`document.js`, `commands.js`, `nodes.js`, ...). Large topics come back as a saved file; grep it rather than reading it whole.

4. **Execute in small scripts.** One logical step per `execute_script` call, with `console.log` of what changed (sizes, layer counts, return values). Scripts return nothing unless you log it. Re-acquire the target document each time (by `sessionUuid` when more than one is open) instead of trusting `Document.current`.

5. **Verify visually after every visible change.** Call `render_spread(sessionUuid, 0)` (or `render_selection`) and actually judge the image: framing, centring, artefacts, halos, text direction. If it is wrong, `doc.undo()` (check `doc.undoDescription` first) and try again. Never report success you have not seen.

6. **Deliver.** Save the `.af` (layers intact) and export what the user needs (`references/export.md`). Report the file paths, the size, and anything that is not perfect.

7. **Optionally teach the next session.** After solving something by experiment, `add_sdk_hint` records it in this machine's preamble (it may be shared anonymously if the user enabled hint sharing).

## 3. Rules that protect the user

Read `references/safety.md` once; the short version:

- **Canva AI costs the user's Canva credits.** Ask before `generateImage` or `generativeEditImage`, and say what you are about to generate. `selectSubject` and `removeBackground` are not counted against the monthly limit but still need a paid Canva plan.
- **Only touch documents you created or the user pointed you at.** Never `save()`, `close()` or overwrite an export the user did not ask for. `close()` on an unsaved document discards it silently.
- **Files are limited to the Desktop** (`Environment.fileSystemRoots`). Paths elsewhere fail with `PERMISSION_DENIED`; `NOT_ALLOWED` means the user disabled that permission in Affinity settings - tell them, do not work around it.
- **Never run community scripts blindly.** They execute with the user's file and network permissions.
- **`Dialog.runModal()` blocks** until a human answers; do not use it in unattended work.

## 4. Core patterns you will use constantly

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Transform } = require('affinity:geometry');
const d = Document.current;

// Layers are ordered bottom-first: d.layers.at(0) is the lowest layer.
const layer = d.layers.at(0);
d.selection = [layer];                       // select nodes (raster pixel selection is separate)

// Every edit is a command; most have Document shortcuts (d.mergeVisible(), d.boolOpUnion(sel), ...).
const t = new Transform(); t.translate(100, 0);            // translate() mutates in place
d.executeCommand(DocumentCommand.createTransform(d.selection, t));
d.executeCommand(DocumentCommand.createTransform(d.selection, new Transform(), { duplicateNodes: true })); // duplicate

console.log(d.undoDescription); d.undo();    // everything lands in History; the user can undo too
```

Creating things follows `XxxNodeDefinition.create(...)` then `d.addNode(def)`. Read positions from `node.spreadBaseBox` or `node.transform.data` after a transform - `baseBox` does not move. More traps: `references/gotchas.md`.

## 5. Where to look

| Task | Read |
|---|---|
| Modules, documents, nodes, selections, commands, history | `references/sdk-core.md` |
| Find the right command among all 372 `DocumentCommand.create*` | `references/commands-index.md` |
| Shapes, curves, booleans, fills, strokes, effects, transforms, QR codes | `references/vector.md` |
| Pixels, selections, filters (destructive and live), adjustments, resampling | `references/pixel.md` |
| Text, fonts, Arabic/RTL, tables, pages, artboards, picture frames | `references/text-layout.md` |
| Export formats and areas, the 62 presets | `references/export.md` |
| Canva AI commands, credits, prompting, what only the UI can do | `references/ai.md` |
| MCP tools, permissions, files, network, dialogs, macros, limits | `references/system.md` |
| Connecting Claude Code, Claude Desktop, Cursor, Codex | `references/setup.md` |
| Known traps and their fixes | `references/gotchas.md` |

## 6. Proven recipes

Recipes in `references/recipes/` come from runs on Affinity 3.3.1; `cutout.md` is not yet verified end to end, and `social-post.md` combines individually verified steps. Start from the closest one and adapt it:

| Recipe | Use it for |
|---|---|
| `inspect.md` | Report what is open: documents, layers, sizes, selection |
| `save-copy.md` | Protect the original before editing |
| `new-document.md` | Create a canvas with exact pixel size and DPI |
| `crop.md` | Crop the canvas to any rectangle (e.g. a square around a face) |
| `resize.md` | Resample the whole document up or down |
| `remove-object.md` | Remove a person, hand, logo or blemish with generative edit (credits) |
| `blur-background.md` | Portrait look: sharp subject, blurred background |
| `cutout.md` | Remove the background for a transparent PNG |
| `outpaint.md` | Extend the canvas (re-centre a subject, widen a photo) |
| `arabic-text.md` | Correctly shaped right-to-left Arabic typography |
| `social-post.md` | A complete designed post: background, shapes, headline, export |
| `profile-photo.md` | The full chain: crop, clean up, blur, centre, export for LinkedIn/X/WhatsApp |
| `export.md` | Export PNG/JPEG/PDF of a document, page or selection |

## 7. Know the limits before promising

- Scripts cannot choose the AI model (Nano Banana, GPT Image, Seedream, FLUX...), size, seed or count - the app UI owns those. Generative Fill/Expand/Upscale, Generate Vector, Generate 3D and Decompose Layer have no script command; `outpaint.md` shows a working substitute for Expand.
- `generativeEditImage` edits the whole selected layer and ignores pixel selections, so describe precisely what to change and what to keep.
- No clipboard, no tool or panel switching, no mouse/keyboard events, no painting brush strokes, no files outside the Desktop.

When a request hits a limit, say so plainly and offer the nearest thing the SDK can do, or tell the user which UI button to press.
