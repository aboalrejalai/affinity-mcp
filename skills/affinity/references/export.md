# Export

Preset name and area are the whole export choice. `FileExportOptions` exposes `handle` and nothing else: no DPI, bleed, crop-mark, or password field (verified). Print output is a PDF preset. `Document` has no `print` method (docs).

Evidence: **(verified)** ran inside the app, **(docs)** wrapper or signature reference only, **(unverified)** not settled.

## Desktop only

`Environment.fileSystemRoots` is the Desktop (verified). `Application.userDesktopPath` is the path to use. The property `Application.getUserDesktopPath` is deprecated and prints a warning (docs).

Subfolders of the Desktop are allowed. Paths outside it, including `..` and a symlink that leaves the Desktop, raise `PERMISSION_DENIED` (verified). `NOT_ALLOWED` means that permission is switched off in Affinity settings.

```js
const { Application } = require('/application.js');
const { Environment } = require('/environment.js');
const { fs } = require('/fs.js');

const dir = Application.userDesktopPath + '/exports';
if (!fs.exists(dir)) fs.createDirectories(dir);
console.log(Environment.fileSystemRoots.join(','), dir);
```

`createDirectories` on a Desktop subfolder was used by a successful export (verified). Write a new file name; do not overwrite a file the user already has.

## FileExportOptions

From `/document.js`: `createWithPresetName(presetName)`, `createForCanvaExport(dpi)`, `enumeratePresetNames`, `allPresetNames` (verified). `createForCanvaExport(dpi)` builds export options for a Canva handoff (docs).

`FileExportOptions.allPresetNames` is these 62 strings (verified). Match them exactly. There is no preset named `JPEG` or `PDF` on its own. Quality words differ: JPEG says `quality`, WebP and JPEG XL say `Quality`.

| Group | Preset names |
|---|---|
| PNG | `PNG`, `PNG-8 (dithered)`, `PNG-HDR (PQ, Rec.2020, Full range)`, `PNG-HDR (PQ, Rec.2020, Narrow range)`, `PNG-HDR (HLG, Rec.2020, Full range)`, `PNG-HDR (HLG, Rec.2020, Narrow range)` |
| JPEG | `JPEG (Best quality)`, `JPEG (High quality)`, `JPEG (Medium quality)`, `JPEG (Low quality)` |
| GIF | `GIF RGB`, `GIF Grayscale` |
| TIFF | `TIFF RGB 8-bit`, `TIFF RGB 16-bit`, `TIFF Grayscale 8-bit`, `TIFF Grayscale 16-bit`, `TIFF CMYK`, `TIFF LAB 16-bit` |
| SVG | `SVG (for export)`, `SVG (digital - small size)`, `SVG (digital - high quality)`, `SVG (flatten)` |
| EPS | `EPS (for export)`, `EPS (digital - small size)`, `EPS (digital - high quality)`, `EPS (flatten)` |
| PDF | `PDF (for print)`, `PDF (press ready)`, `PDF (digital - small size)`, `PDF (digital - high quality)`, `PDF (for export)`, `PDF (flatten)` |
| PDF/X | `PDF/X-1a:2003`, `PDF/X-3:2003`, `PDF/X-4` |
| EPUB | `EPUB (document settings)`, `EPUB (small size)`, `EPUB (high quality)`, `EPUB (Reflowable)` |
| CAD | `DWG - preserve vectors`, `DWG - preserve visuals`, `DXF - preserve vectors`, `DXF - preserve visuals` |
| PSD | `PSD (preserve accuracy)`, `PSD (preserve editability)`, `PSD (Final Cut Pro X)` |
| HDR | `OpenEXR 32-bit linear`, `OpenEXR 32-bit linear (layered)`, `Radiance HDR 32-bit linear` |
| WebP | `WebP (Best Quality)`, `WebP (High Quality)`, `WebP (Medium Quality)`, `WebP (Low Quality)`, `WebP (Lossless, smallest)`, `WebP (Lossless, default)`, `WebP (Lossless, fastest)` |
| JPEG XL | `JPEG XL (Best Quality)`, `JPEG XL (High Quality)`, `JPEG XL (Medium Quality)`, `JPEG XL (Low Quality)` |
| Other | `TGA`, `Canva Design` |

### Print presets

Use one of `PDF (for print)`, `PDF (press ready)`, `PDF/X-1a:2003`, `PDF/X-3:2003`, `PDF/X-4`. Crop marks are not a preset flag. Draw them as curves (`references/text-layout.md`) before exporting. Bleed is a document `LTRB` (`DocumentProperties.bleed`), not an export option.

```js
const { FileExportOptions, FileExportArea } = require('/document.js');
const { Application } = require('/application.js');

const options = FileExportOptions.createWithPresetName('PDF (for print)');
const records = doc.export(
  Application.userDesktopPath + '/export.pdf',
  options,
  FileExportArea.createForWholeDocument()
);
console.log(records.count);
```

The preset name and `createForWholeDocument` are real (verified for PNG and JPEG; the PDF preset name is in `allPresetNames`, verified). This PDF call itself was not the one that was run (docs).

## FileExportArea

| Factory | Argument | Ran |
|---|---|---|
| `createForWholeDocument()` | none | yes: PNG and JPEG of the document |
| `createForCurrentSpread()` | none | yes: wrote `spread.png` |
| `createForCurrentPage()` | none | no |
| `createForSelection(selection)` | `Selection` | yes: PNG and JPEG |
| `createForSelectionArea(selection)` | `Selection` | no |
| `createForArtboard(artboardInterface)` | `ArtboardInterface`, not a node | no |
| `createForSpreads(pages)` | `String` | no |
| `createForPages(pages)` | `String` | no |

Pass `doc.artboards.at(0)` to `createForArtboard` when the artboard is on the first spread (`doc.artboards` only lists that spread). The page string accepted by `createForPages` and `createForSpreads` has no documented grammar (unverified). Export one known-good area first, then try a page string and read `isSuccess`.

`createForSelection` exports the selected objects, and the file's pixel box includes effects. A 280×200 rectangle with a shadow and an outline exported at 339×259 (verified). Objects that sit outside the spread export as a blank image of the spread (verified). Put content back on the spread before exporting.

The JS call may omit the final `Size`. The exports that ran did. The native signature includes `size` (docs). Pass a `Size` from `/geometry.js` only when you intend to supply one.

```js
const { FileExportOptions, FileExportArea } = require('/document.js');
const { Selection } = require('/selections.js');
const { Application } = require('/application.js');

const dir = Application.userDesktopPath + '/exports';
const png = FileExportOptions.createWithPresetName('PNG');
const jpg = FileExportOptions.createWithPresetName('JPEG (Best quality)');
doc.export(dir + '/whole.png', png, FileExportArea.createForWholeDocument());
doc.export(dir + '/whole.jpg', jpg, FileExportArea.createForWholeDocument());

const sel = Selection.create(doc, node);
doc.selection = sel;
doc.export(dir + '/selection.png', png, FileExportArea.createForSelection(sel));
doc.export(dir + '/spread.png', png, FileExportArea.createForCurrentSpread());
```

(verified).

## export, exportAsync, promises

`doc.export(path, exportOptions, exportArea, size)` returns `DocumentExportRecords` and blocks until the write finishes. This is the call that was run (verified).

`doc.exportAsync(path, exportOptions, exportArea, size, callback)` is the callback form (docs). The callback's parameters are not named in the wrapper.

`doc.promises` is a `DocumentPromises`. Its instance methods include `export`, `save`, `saveAs`, `saveAsPackage`, `close`, and `executeCommand(command, preview)` (docs). A truthy error argument rejects the promise (docs). The sync `export` is the one to use when you need `isSuccess` in the same script. `DocumentPromises.create` / `load` / `getCurrent` / `createFromPreset` are static and resolve to a wrapper whose document is `.document` (docs).

## DocumentExportRecords

`count`, `enumerate`, and `all` (docs). `all` builds an array (it has no `toArray`). Each `DocumentExportRecord` has `path`, `hasWarnings`, `warningMessage`, `errorMessage`, `result`, and `isSuccess`. `isSuccess` is true when `result` is `ErrorCode.OK` or `ErrorCode.WARNINGS_ONLY` (docs). A warning still counts as success, so read `hasWarnings` and `warningMessage` too.

```js
const records = doc.export(path, options, area);
for (const rec of records.all)
  console.log(rec.isSuccess, rec.path, rec.hasWarnings, rec.warningMessage, rec.errorMessage);
```

On the PNG and JPEG exports that ran, `isSuccess` was true and `path` was the path requested (verified). The enumeration callback used inside `all` returns `false` to stop, while other enumerations return `EnumerationResult.Continue` (0) or `Stop` (1). What `false` does to that walk was not measured (unverified). Prefer the array from `all`.

## Export slices

Per-object export slices are an `ExportConfig` already hanging off the node. `node.exportableInterface.exportConfig` is often `null`. `ExportConfig` can `appendFormat`, `deleteFormat`, `replaceFormat`, and list `formats`. It has no `create` (docs). The native `ExportConfigApi` is the same list: `appendFormat`, `deleteFormat`, `enumerateFormats`, `getFormatCount`, `replaceFormat`.

`ExportFormat.createWithFileExportOptions(fileExportOptions)`, then `appendSize`. `ExportSize.createWithExportScale(...)`. `ExportScale` factories: `createWithPreset`, `createWithMultiplier`, `createWithWidth`, `createWithHeight`, `createWithSquare`, `createWithMultiplierSquare`, `createWithWidthHeight` (docs). These types live in `/exportconfig.js`.

`ExportScalePreset`: `Standard` `Mult2x` `Mult3x` `Width100` `Height50` `Square64` `Square64Mult2x` `Width32Height32`. `ExportScaleSizeType`: `None` `Width` `Height` `Square` `WidthHeight` (verified). `VisibilityMode`: `Main`, `Export` (verified). `SubSelectionType` includes `ExportFormat` (docs).

```js
const { ExportFormat, ExportSize, ExportScale, ExportScalePreset } = require('/exportconfig.js');
const { FileExportOptions } = require('/document.js');

const format = ExportFormat.createWithFileExportOptions(
  FileExportOptions.createWithPresetName('PNG')
);
format.appendSize(ExportSize.createWithExportScale(
  ExportScale.createWithPreset(ExportScalePreset.Mult2x)
));
const config = node.exportableInterface.exportConfig;
if (config) config.appendFormat(format);
console.log(config === null ? 'no slice config' : 'appended');
```

(docs). `DocumentCommand.createSetExportConfig(selection, exportConfig)` requires an existing `ExportConfig`. Nothing in the wrapper builds the first config when `exportConfig` is `null` (unverified). When the read is `null`, export the document or the selection with `doc.export` instead of inventing a slice.
