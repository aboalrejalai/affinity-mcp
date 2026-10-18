# Gotchas

Traps that cost real debugging time on Affinity 3.3.1, with the fix for each.

| Trap | What happens | Fix |
|---|---|---|
| Layer order | `doc.layers` is bottom-first | `doc.layers.at(0)` is the lowest layer; the last entry is the top |
| `baseBox` after transforms | Stays at the pre-transform box | Read `node.spreadBaseBox` or `node.transform.data` |
| `Transform` methods | `translate/scale/rotate` mutate the instance | Create a fresh `new Transform()` per command |
| No output | Scripts return nothing by default | `console.log` everything you need to see |
| `Document.current` drifts | Creating a document or the user switching tabs changes it | Find your document by `sessionUuid` in `Document.all` |
| `setDocumentProperties` | Can invalidate cached state | Re-fetch `Document.current` afterwards |
| Canvas crop leaves big layers | `setSpreadSizeWithAnchor` clips the canvas, not the layer | `doc.rasteriseObjects(sel, false, true)` clips the raster to the spread |
| `setSpreadSizeWithAnchor` with artboards | Fails while an artboard exists | Use `setArtboardSizeWithAnchor` (it can shift the origin) |
| `generativeEditImage` scope | Ignores pixel selections and edits the whole selected layer | Isolate the area on its own layer, or describe exactly what to change and what to keep |
| Composition drift in AI edits | Words like "close-up", "portrait", "zoom" can reframe the whole image | Describe the existing scene, then the change, then "keep everything else unchanged" |
| `generateImage` result type | Creates a `PhysicalNode` (1024 px), as a child of an artboard if one exists | `doc.rasteriseObjects(null, false, false)` before pixel work such as `selectSubject` |
| `selectSubject` result | A pixel selection, no new layer | Follow with feather/invert/delete or a fill |
| `mergeVisible` | Adds a new merged layer on top; sources stay visible | Hide the sources with `hideSelection` |
| `showAll` | Does not reveal nodes hidden with `hideSelection` | Use `showSelection` on those nodes |
| Grouping | There is no group-creation command | Use `ContainerNode` |
| Arabic text | Renders disconnected and reversed with the default font | Set an Arabic-capable font on `GlyphAtts.font` (`recipes/arabic-text.md`) |
| Font names | `Font.create('Arial Unicode MS', ...)` fails | Use PostScript names: `ArialUnicodeMS`, `GeezaPro`, `DecoTypeNaskh` |
| Pixel writes | Assigning a `PixelBuffer` to a layer fails | Copy it into a `Bitmap` (see `pixel.md`) |
| RGBA8 colour fields | The alpha field is `alpha`, not `a` | `RGBA8(r, g, b, alpha)` |
| `vectorbrush.js` | Documented, but `require('/vectorbrush.js')` fails | Not available in 3.3.1 |
| `RasterBrush.createDefault()` | Throws "not implemented" | No scripted brush painting |
| `Dialog.runModal()` | Blocks until a human answers | Only with a present user |
| `close()` | Closes unsaved documents without prompting | Only close documents you created |
| SDK hints | `search_sdk_hints` returns crowd-sourced advice that can be wrong | Verify by running and rendering |
| Huge photos | 24000 x 16000 px documents make AI calls slow or fail | Crop and resample first (`recipes/resize.md`) |
| App Store process name | The macOS process is `Affinity Affinity Store` | Only matters for external automation, not for the MCP server |
