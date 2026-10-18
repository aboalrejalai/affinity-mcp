# Recipe: export

```js
const { Document, FileExportOptions, FileExportArea } = require('/document.js');
const { Environment } = require('/environment.js');
const d = Document.current;
const out = `${Environment.fileSystemRoots[0]}/my-design.jpg`;   // Desktop only; pick a new name
const rec = d.export(out,
  FileExportOptions.createWithPresetName('JPEG (Best quality)'),
  FileExportArea.createForWholeDocument());
for (const r of rec.all) console.log(r.isSuccess, r.path);
```

- Preset names must match exactly. List them with `console.log(FileExportOptions.allPresetNames.join(' | '))`. Common ones: `PNG`, `JPEG (Best quality)`, `JPEG (High quality)`, `WebP`, `SVG`, `PDF (for print)`, `PDF (press ready)`, `TIFF`.
- Areas: `createForWholeDocument()`, `createForCurrentSpread()`, `createForSelection(selection)` (includes effects such as shadows in the bounds), plus artboard and spread variants (`export.md` in references).
- To make a folder: `const fsmod = require('/fs.js'); if (!fsmod.fs.exists(dir)) fsmod.fs.createDirectories(dir);`
- Confirm on disk (`sips -g pixelWidth -g pixelHeight file` on macOS) and tell the user the path and size.
- Also `d.save()` (or `saveAs` for a new document) so the layered `.af` is kept next to the export.

Format choice: JPEG for photos, PNG for graphics or transparency, SVG/PDF for vector, `PDF (press ready)` for print shops.
