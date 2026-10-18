# SDK core

Affinity by Canva 3.3.1. Build string `Affinity 3.3.1.4940 MacOS (Oct  6 2026)`, `shortVersion` `3.3.1.4940`, `majorVersion` 3, `minorVersion` 3, `revisionVersion` 4940, `documentVersion` 33, `platformName` `MacOS`, `buildKind` `BuildKind.AffinityRetail` (0), `uiParadigm` `UiParadigm.Desktop` (0), primary extension `af` (verified). SDK `Environment.sdkVersionStr` is `0.1`, V8 is `11.5.150.4` (verified).

`execute_script` runs the script body directly. Log anything you need with `console.log` (docs). Prefer `require('/file.js')` wrappers. `require('affinity:name')` is the native module; native API functions take `self` first and do not show up as JavaScript properties (docs, verified empty `getOwnPropertyNames` on `DocumentApi`).

Every document edit is a `DocumentCommand` passed to `doc.executeCommand(command, preview)`.

Tags: **(verified)** ran inside the app, **(docs)** wrapper source or the module pages at <https://sdk.affinity.studio/latest/js/>, **(unverified)** stated but not run.

## Contents

1. [Modules and wrappers](#1-modules-and-wrappers)
2. [Application](#2-application)
3. [Environment](#3-environment)
4. [Document lifecycle](#4-document-lifecycle)
5. [Spreads, pages, artboards](#5-spreads-pages-artboards)
6. [Nodes and NodeDefinitions](#6-nodes-and-nodedefinitions)
7. [Selections](#7-selections)
8. [Commands](#8-commands)
9. [History and snapshots](#9-history-and-snapshots)
10. [Collection](#10-collection)
11. [HandleObject](#11-handleobject)
12. [Promises and async](#12-promises-and-async)
13. [Configuration, inspect, logging, timers](#13-configuration-inspect-logging-timers)
14. [Native export index](#14-native-export-index)

## 1. Modules and wrappers

Twenty native modules. Extra names that fail to load: `affinity:ai`, `dialog`, `export`, `history`, `image`, `macros`, `selection`, `text`, `vector`, `document` (verified). Enums expose `.keys`, `.values`, and `.entries` as properties. When a type has `create` or `createDefault`, call that; otherwise `new` (docs).

```js
const { Application } = require('/application.js');
const dom = require('affinity:dom');
console.log(Application.shortVersion, Object.keys(dom).length);
```

| Module | n | What it holds |
|---|---:|---|
| `affinity:application` | 7 | `ApplicationApi`, `ApplicationSettingsApi`, `BuildKind`, `EnvironmentApi`, `EnvironmentPermission`, `HeapStatistics`, `UiParadigm` |
| `affinity:brushes` | 7 | `BrushDynamicApi`, `BrushDynamicControllerType`, `CornerStrategy`, `PathBrushApi`, `PathBrushDynamicControllerType`, `RasterBrushApi`, `RasterBrushTextureMode` |
| `affinity:buffer` | 1 | `BufferApi` |
| `affinity:colours` | 18 | Channel structs (`RGBA8`, `CMYKA8`, `HSLAf`, …), `ColourApi`, `ColourProfileApi`, `ColourProfileSetApi`, `GradientApi`, `ColourStop`, `ColourSpaceType` |
| `affinity:commands` | 11 | `CommandApi`, `DocumentCommandApi`, `CompoundCommandBuilderApi`, `AddChildNodesCommandBuilderApi`, `SetHatchFillAttributesCommandBuilderApi`, `GroupTransformData`, `GroupTransformAnchor`, `GroupTransformOrder`, `GroupTransformType`, `InsertionMode`, `LineCommandDefaultsMode` |
| `affinity:common` | 15 | `BlendMode`, `ErrorCode`, `EnumerationResult`, `LogLevel`, `LogFileApi`, `UnitType`, `UnitCategory`, `UnitValue`, `UserUnitType`, `HorizontalAlignment`, `ConfigurationItemApi`, `ConfigurationValueType`, `RefControlApi`, `UnitValueApi`, `UnitValueConverterApi` |
| `affinity:dom` | 317 | Document, nodes, filters, adjustments, export, selection. Full list in [§14](#14-native-export-index) (verified) |
| `affinity:fills` | 18 | `FillApi`, `FillDescriptorApi`, `FillType`, `FillMask`, `SolidFillApi`, `GradientFillApi`, `GradientFillType`, `BitmapFillApi`, `NoFillApi`, `MeshFillApi`, `ColourMeshApi`, `HatchFillApi`, `DiffusionFillApi`, `DiffusionCurveSetApi`, `DiffusionCurveKind`, `DiffusionCurveSide`, `DiffusionCurveParametric`, `TransformInfo` |
| `affinity:fonts` | 11 | `FontApi`, `FontFamilyApi`, `FontCollectionApi`, `FontField`, `FontMatch`, `FontWeight`, `FontWidth`, `PanoseApi`, `PanoseType`, `VariableFontBold`, `VariableFontItalic` |
| `affinity:fs` | 10 | `FileSystemApi`, `FileApi`, `FileStatusApi`, `DirectoryIteratorApi`, `FileSystemSpace`, `FileOrigin`, `FilePermissions`, `PathType`, `CopyOptions`, `PermOptions` |
| `affinity:geometry` | 85 | `Transform`, `Point`, `Rectangle`, `Size`, curves, shapes, QR payloads. Names in [§14](#affinitygeometry) (docs; count verified) |
| `affinity:hatches` | 2 | `HatchLineApi`, `HatchPatternApi` |
| `affinity:layereffects` | 15 | One API per effect plus `LayerEffectApi`, `LayerEffectType`, `BevelEmbossType`, `PointLightApi`, `StrokeFillType`. Names in [§14](#affinitylayereffects) |
| `affinity:linestyles` | 9 | `LineStyleApi`, `LineStyleDescriptorApi`, `LineStyleMask`, `LineType`, `LineCap`, `LineJoin`, `StrokeAlignment`, `ArrowHeadApi`, `ArrowHeadStyle` |
| `affinity:network` | 5 | `HttpRequestApi`, `HttpResponseApi`, `HttpRequestResult`, `HttpStatusCode`, `RequestMethod` |
| `affinity:os` | 1 | `OSApi` |
| `affinity:raster` | 27 | `RasterFormat`, `RasterResamplerType`, `RasterIntent`, `RasterExtendType`, `RasterObjectApi`, `RasterObjectType`, `NodeRenderingEngineOptionsApi`, plus a reader and a reader/writer per pixel format. Names in [§14](#affinityraster) |
| `affinity:story` | 66 | `StoryApi`, `StoryBuilderApi`, `StoryDeltaApi`, glyphs, paragraph types. Names in [§14](#affinitystory) |
| `affinity:timers` | 2 | `TimerApi`, `sleep` (verified). The module page lists only `TimerApi` (docs) |
| `affinity:ui` | 26 | `UiApi` and the `Dialog*` APIs, plus `DialogItemType`, `DialogResult`. Names in [§14](#affinityui) |

Counts and the short rows above are the live `Object.getOwnPropertyNames` sets (verified). `affinity:geometry`, `layereffects`, `raster`, `story`, and `ui` were abbreviated in that dump; their name lists are the module pages, whose published counts match the live counts (docs).

`require('/vectorbrush.js')` throws; the module is not loaded, and `affinity:brushes` has no `VectorBrushApi` (verified). `affinity:timers` exports `sleep` as a function; `/timers.js` does not re-export it (verified). Calling `sleep` is unverified.

### Wrapper files

Wrappers are the names you construct and call. Roles are from the file headers (docs); the export names load (verified).

| File | Main exports | Role |
|---|---|---|
| `/application.js` | `Application`, `app`, `BuildKind`, `UiParadigm` | Identity, dialogs, settings |
| `/environment.js` | `Environment`, `EnvironmentPermission`, `LogLevel` | Permissions, heap, `postTask`, `quit` |
| `/document.js` | `Document`, `DocumentPreset`, `NewDocumentOptions`, `LoadDocumentOptions`, `DocumentHistory`, `DocumentSnapshot`, `DocumentPromises`, `FileExportOptions`, `FileExportArea` | Document lifecycle. Also re-exports `UnitType`, `RasterFormat`, `RasterResamplerType` |
| `/documentproperties.js` | `DocumentProperties`, `PageDocumentProperties`, `ArtboardDocumentProperties`, `SpreadDocumentProperties` | Size, colour, margins |
| `/commands.js` | `DocumentCommand`, `Command`, `CompoundCommandBuilder`, `AddChildNodesCommandBuilder`, `createCompoundCommand` | History commands. Index: `commands-index.md` |
| `/nodes.js` | Node classes, `*NodeDefinition`, `createTypedNode`, `NodeChildType` | Node tree |
| `/selections.js` | `Selection`, `SelectionItem`, `*SubSelection` | Selection |
| `/selectable.js` | `Selectable` | `isSelectable` base |
| `/handleobject.js` | `HandleObject`, `liveStruct`, `livePoint`, `liveStructArray` | Live native handle |
| `/collection.js` | `Collection`, `SpanCollection` | Lazy sequences |
| `/units.js` | `UnitType`, `UnitValue`, `UnitValueConverter` | Units |
| `/configuration.js` | `ConfigurationItem`, `ConfigurationValueType` | Native JSON |
| `/inspect.js` | `inspect`, `format`, `formatWithOptions`, `patchConsole` | Print handles |
| `/logging.js` | `LogFile`, `LogLevel` | Log file |
| `/timers.js` | `Timer`, `setTimeout`, `setInterval`, `setImmediate` | Timers. Delay is the first argument |
| `/colours.js` | `Colour`, `ColourProfile`, `Gradient`, channel structs | Colour |
| `/fills.js` | `FillDescriptor`, `SolidFill`, `GradientFill`, … | Fills. See `vector.md` |
| `/geometry.js` | `Transform`, `Rectangle`, `PolyCurve`, `Point` | Geometry wrapper |
| `/shapes.js` | `ShapeRectangle` and the other shapes, QR | Vector shapes. See `vector.md` |
| `/dialog.js` | `Dialog` and its controls | Dialog UI. See `system.md` |
| `/fs.js` | `fs`, `promises`, file functions | Desktop files. See `system.md` |
| `/network.js` | `HttpRequest` | HTTP. See `system.md` |
| `/os.js` | `OS` | OS |
| `/buffer.js` | `Buffer` | Buffer |
| `/fonts.js` | `Font`, `FontFamily` | Fonts. See `text-layout.md` |
| `/story.js`, `/storybuilder.js`, `/storydelta.js` | `Story`, `StoryBuilder`, `StoryDelta` | Text |
| `/glyphs.js`, `/glyphatts.js`, `/paragraphatts.js` | Glyphs and attributes | Text |
| `/rasterobject.js`, `/rasterselection.js`, `/rasterinterface.js`, `/pixelaccessor.js` | `PixelBuffer`, `RasterSelection`, pixel readers | Pixels. See `pixel.md` |
| `/layereffects.js`, `/layereffectsinterface.js` | Layer effects | FX |
| `/linestyle.js`, `/hatch.js`, `/pathbrush.js`, `/rasterbrush.js` | Stroke and brushes | Drawing |
| `/exportconfig.js` | `ExportConfig` | Slice export |
| `*interface.js` | `ArtboardInterface`, `BaseBoxInterface`, `BlendModeInterface`, `CurvesInterface`, `PhysicalRootInterface`, `PageBoxInterface`, `PictureFrameInterface`, `TextFrameInterface`, `VisibilityInterface`, … | Interfaces mixed onto nodes |

`examples/` and `tests/` topics exist in the documentation index. Treat tests as possibly stale (docs).

## 2. Application

`Application` (legacy alias `app`) is a singleton from `/application.js` (docs).

| Group | Members |
|---|---|
| Identity | `compileDate`, `platformName`, `shortVersion`, `version`, `buildVersion`, `majorVersion`, `minorVersion`, `revisionVersion`, `documentVersion`, `buildKind`, `productCopyrightMessage`, `productFullName`, `productLongName`, `productPrimaryFileExtension`, `productVersionName`, `productShortName`, `suiteFullName`, `uiParadigm`, `argC`, `argV` / `args` |
| Paths | `userDesktopPath` (current). `getUserDesktopPath` is `@deprecated` and warns. `resourcesPath` exists |
| Documents | `Application.documents.all`, `.current`, `.load(path)` forward to `Document` |
| Dialogs | `alert(message, title)`, `confirm`, `prompt(message, title, initialText)`, `chooseFile`, and `*Async(…, callback)` via `UiApi`. These block the UI (docs). Leave them for a present user |
| Settings | `undoLimit` read-only in the wrapper, observed `1024` (verified). `allowCodeGenerationFromStrings` read-only, observed `true` (verified). `loadPSDWithEditableText` read/write, observed `true` (verified) |

`BuildKind.keys`: `AffinityRetail`, `AppStoreRetail`, `InternalAlpha`, `CustomerBeta`, `PublicBeta` (verified). `UiParadigm.keys`: `Desktop`, `Tablet` (verified).

```js
const { Application, BuildKind, UiParadigm } = require('/application.js');
console.log(Application.version);
console.log(Application.userDesktopPath);
console.log(BuildKind.keys.join(','), UiParadigm.keys.join(','));
console.log(Application.settings.undoLimit);
```

## 3. Environment

From `/environment.js`, backed by `affinity:application` (docs).

| Member | Behaviour |
|---|---|
| `permissions` | Frozen object built once: `fileSystem`, `network`, `genAI` (verified) |
| `hasPermission(EnvironmentPermission.*)` | Same three permissions |
| `fileSystemRoots` | From `enumerateFileSystemRoots`. Live result is the Desktop only, `<Desktop>` (verified) |
| `sdkVersionStr`, `v8VersionStr` | Strings above |
| `logLevel` | Read/write `LogLevel` |
| `configuration` | `ConfigurationItem` from `EnvironmentApi.getConfiguration()`. The tree itself is unread (unverified) |
| `getHeapStatistics()` | Returns a native object. Documented fields (`totalHeapSize`, `usedHeapSize`, `heapSizeLimit`, …) read back `undefined`, and `inspect` returns `{}` (verified) |
| `postTask(func)` | Post a callback |
| `quit()` | Quits the app. Do not call it |

`EnvironmentPermission.keys`: `FileSystem`, `Network`, `GenAI` (verified). `LogLevel.keys`: `All`, `Trace`, `Debug`, `Info`, `Warn`, `Error`, `None` with values `-1, 0, 1, 2, 3, 4, 5` (verified). Observed `logLevel` was `LogLevel.All` (verified).

```js
const { Environment, EnvironmentPermission, LogLevel } = require('/environment.js');
console.log(JSON.stringify(Environment.permissions));
console.log(Environment.fileSystemRoots.join(','));
console.log(Environment.sdkVersionStr, Environment.v8VersionStr);
console.log(LogLevel.keys.join(','));
```

## 4. Document lifecycle

Source `/document.js` (docs). Create, save, close, and export only on documents you created (`safety.md`).

### Open documents

`Document.current` returns the open document only when `DocumentApi.isOpen`, otherwise `null`. `Document.all` enumerates `DocumentApi.enumerateOpen` (docs).

State: `sessionUuid`, `persistentUuid`, `isOpen`, `isEmbedded`, `isReadOnly`, `mustSaveAs`, `needsSaving`, `isDirty`, `title`, `path` (docs). Pass `sessionUuid` to `render_spread`. After you create a document or the user changes tab, find yours again in `Document.all`.

```js
const { Document } = require('/document.js');
const doc = Document.current;
if (doc) console.log(doc.sessionUuid, doc.title, doc.path, doc.isDirty);
for (const d of Document.all) console.log(d.sessionUuid, d.widthPixels, d.heightPixels);
```

### Create

| Call | Behaviour |
|---|---|
| `Document.create(options)` and `Document.createFromOptions(options)` | Both call `DocumentApi.createFromOptions` |
| `Document.createFromPreset(preset, isLandscape)` | When `isLandscape` is omitted, the wrapper uses `preset.width > preset.height` |
| `NewDocumentOptions.createDefault()`, `createFromPreset(preset)` | Option objects |
| `NewDocumentOptions.getMaxDpi(unit, dimension)`, `getMaxSize(unit, dpi)` | Limits |

`NewDocumentOptions` exposes setters only (no getters): `units`, `imagePlacement`, `isTransparentBackground`, `createArtboard`, `isFacing`, `isVerticalStack`, `isDoublePageStart`, `rasterFormat`, `colourProfile`, `width`, `height`, `dpi`, `viewDpi`, `margins`, `marginsEnabled`, `bleed`, `pageCount`, `createMaster`, `useDrawingScale`, `drawingScale`, `isMultiPage` (docs).

`DocumentPreset.all` returned 62 presets (verified). Readable fields: `name`, `units`, `width`, `height`, `dpi`, `rasterFormat`, `createArtboard`, `isMultiPage`, `isTransparentBackground`, `facing`. Further wrapper fields: `imagePlacement`, `isFavourite`, `verticalStack`, `doublePageStart`, `viewDpi`, `margins`, `marginsEnabled`, `bleed`, `useDrawingScale`, `drawingScale`, `colourProfileName`.

| Presets | Units | Size | dpi | Format | Artboard | Facing |
|---|---|---|---:|---|---|---|
| A3 / A4 / A5, each twice | Millimetre | 297×420 / 210×297 / 148×210 | 300 | `RGBA8` then `CMYKA8` | no | yes |
| Letter / Legal / Ledger | Inch | 8.5×11 / 8.5×14 / 11×17 | 300 | `RGBA8` then `CMYKA8` | no | yes |
| US Trade / Half Letter / Oversize Magazine | Inch | 6×9 / 5.5×8.5 / 9×12 | 300 | `RGBA8` then `CMYKA8` | no | yes |
| 4R … 24R | Inch | 6×4 through 31.5×24 | 300 | `RGBA8` | no | no |
| Study / Illustration / Master Canvas | Pixel | 3000×2000 / 4000×3000 / 6000×4000 | 300 | `RGBA8` | no | no |
| Medium/Large US Poster, A1, B1, Comic | Inch or mm | by name | 300 | `CMYKA8` | no | no |
| 1000 and 2000 pixel grid | Pixel | square | 300 | `RGBA8` | no | no |
| Social Portrait, 9:16, HD through 5K2K | Pixel | by name | 72 | `RGBA8` | no | no |
| iPhone / iPad | Point | by device | 216 or 144 | `RGBA8` | yes | no |
| Galaxy / Nothing | Pixel | by device | 216 or 144 | `RGBA8` | yes | no |

```js
const { Document, DocumentPreset, NewDocumentOptions, UnitType } = require('/document.js');
const preset = DocumentPreset.all.find(p => p.name === 'FHD 1080p');
const options = NewDocumentOptions.createFromPreset(preset);
options.dpi = 144;
options.isTransparentBackground = true;
const doc = Document.create(options);
console.log(doc.sessionUuid);
```

For an exact pixel canvas, set `units`, `width`, `height`, `dpi`, and `createArtboard` on `NewDocumentOptions.createDefault()` (`recipes/new-document.md`).

### Load, save, close, export

| Call | Behaviour |
|---|---|
| `Document.load(path)` | Returns `DocumentApi.load(path).document`. `DocumentLoadResult` has `document` and `description` (docs); the wrapper drops `description` |
| `LoadDocumentOptions.createDefault()` | Sets `dpi`, `hostDpi`, `password`, `colourSpace`, `format`, `loadMode` |
| `Document.load` / `loadAsync` | Pass `null` for options, so password and `loadMode` never reach the call (docs). Whether `DocumentApi.load` accepts options past the wrapper is unverified; native method names are not visible |
| `save()`, `saveAs(path)`, `saveAsPackage(path, policy)` | Save. Package policy keys below |
| `close()` | Wrapper calls `DocumentApi.close` (docs). A saved SDK hint says the result is `NOT_IMPLEMENTED` (unverified). Close only a document you created |
| `export(path, exportOptions, exportArea, size)` | Returns `DocumentExportRecords` |

`DocumentLoadMode.keys`: `Application`, `Spreads`, `Artboards` (verified). `DocumentLoadResult` is a class, not an enum (verified). `PackageResourcesPolicy.keys`: `None`, `IncludeImages`, `IncludeTexts`, `IncludeCSS`, `IncludeUnrestrictedFonts`, `IncludeRestrictedFonts` (verified).

`FileExportOptions.createWithPresetName(name)`, `createForCanvaExport(dpi)`, `allPresetNames` (docs). Live preset families: PNG (including PNG-8 and PNG-HDR), JPEG at four qualities, GIF, TIFF, SVG, EPS, PDF (including PDF/X-1a:2003, PDF/X-3:2003, PDF/X-4), EPUB, DWG, DXF, PSD, OpenEXR, Radiance HDR, TGA, Canva Design, WebP, JPEG XL (verified). One live name is `JPEG (Best quality)`.

`FileExportArea`: `createForWholeDocument`, `createForCurrentSpread`, `createForCurrentPage`, `createForArtboard(artboardInterface)`, `createForSpreads(strPages)`, `createForPages(strPages)`, `createForSelection`, `createForSelectionArea` (docs).

`DocumentExportRecord`: `path`, `hasWarnings`, `warningMessage`, `errorMessage`, `result`, `isSuccess` (`ErrorCode.OK` or `WARNINGS_ONLY`) (docs). `DocumentExportRecords`: `count`, `enumerate`, `all`. `all` builds an array and has no `toArray`. The callback inside `all` (and inside `DocumentHistory.items`) returns `false`; other enumerations return `EnumerationResult.Continue` (0) or `Stop` (1) (values verified, callback shape docs). What `false` does to enumeration is unverified. `ErrorCode` has 184 keys; the first are `OK`, `ERROR`, `INVALID_OP`, `NOT_ALLOWED`, `WARNINGS_ONLY` (verified).

```js
const { Application } = require('/application.js');
const { Document, FileExportOptions, FileExportArea } = require('/document.js');
const doc = Document.current;
const records = doc.export(
  Application.userDesktopPath + '/export.jpg',
  FileExportOptions.createWithPresetName('JPEG (Best quality)'),
  FileExportArea.createForWholeDocument());
for (const r of records.all) console.log(r.isSuccess, r.path);
```

Write exports to a new file under `<Desktop>`. Paths outside `fileSystemRoots` fail.

### Properties, units, DPI, colour

`DocumentProperties.create()` then `doc.setDocumentProperties(props)` runs `createSetDocumentProperties` (docs).

Live fields: `dimensions`, `widthPixels`, `heightPixels`, `colourFormat`, `colourProfile`, `setColourFormatAndProfile(rasterFormat, colourProfile)`, `units`, `dpi`, `drawingScale`, `bleed`, `bleedFill`, `isTransparent`, `isFacingPages`, `isFullSpreadStart`, `isVerticalStack`, `imageResourcePolicy`, `linkTextFiles`, `preserveTextStyles`, `assignColourProfile`, `resamplerType`, `shouldReflowPages` (docs).

These warn or never reach native code: `viewDpi` (stored on the wrapper only), `margin`, `marginFill`, `includeMargins`, `isRetina`, `isPortrait`, `saveHistory`, `pageWidth`, `pageHeight` (docs).

`Document.dpi` reads `getDpi` (read-only). `Document.viewdpi` (lowercase) reads `getViewDpi`. Change DPI by setting `DocumentProperties.dpi` and calling `setDocumentProperties`. `doc.units = UnitType.Pixel` calls `createSetDocumentUnits` when the value changes. `doc.format = …` calls `createConvertDocumentFormat`. `maskFormat` is read-only (docs).

`UnitType.keys` (27, verified): `Number`, `Percentage`, `Permille`, `Degree`, `Radian`, `Pixel`, `Inch`, `Point`, `Millimetre`, `Centimetre`, `Metre`, `Foot`, `Yard`, `Cat`, `Pica`, `Kilometre`, `Mile`, `Byte`, `Kilobyte`, `Megabyte`, `Gigabyte`, `Terabyte`, `Petabyte`, `Exabyte`, `Zettabyte`, `Yottabyte`, `Kelvin`. `UnitCategory`: `Distance`, `Angle`, `Relative`, `Data`, `Temperature`. `UserUnitType`: `Default`, `Text`, `Line`.

`RasterFormat.keys` (verified): `RGBA8`, `RGBA16`, `IA8`, `IA16`, `CMYKA8`, `LABA16`, `M8`, `M16`, `EMPTY`, `RGBAUF`, `MF`. `RasterResamplerType.keys`: `Default`, `BilinearMipmap`, `NearestNeighbourMipmap`, `NearestNeighbour`, `Bilinear`, `Bicubic`, `SeparableLanczos3`, `NonseparableLanczos3`, `AntialiasedNearestNeighbourMipmap`, `Mitchell`. `ColourSpaceType.keys`: `Unknown`, `Grey`, `RGB`, `CMYK`, `LAB`, `RGBU`. `ImagePlacement.keys`: `Embedded`, `Linked`.

`ColourProfile` (`/colours.js`): `find`, `getProfile`, `getAll`, `getDefaultForColourSpace`, `getDefaultForFormat`, `enumerateProfiles`, `enumerateProfilesForFormat`, `enumerateProfilesForColourSpace`, `getProfilesForFormat`, `getProfilesForColourSpace`. Instance: `name`, `isStandard`, `isLinear`, `colourSpace`, `colourSpaceStr`, `version`, `deviceClass`, `canApplyTo`, `approximateGamma` (docs).

`getAll()` returned 86 names (verified). `isStandard === true` for three: `sRGB IEC61966-2.1`, `Greyscale D50`, `CIELAB D50`. `colourSpaceStr` was `undefined` on all 86 (verified). `getDefaultForFormat`: `RGBA8`/`RGBA16` → sRGB, `IA8`/`IA16` → Greyscale D50, `CMYKA8` → `U.S. Web Coated (SWOP) v2`, `LABA16` → `CIELAB D50` (verified). `M8` throws `ERROR` (verified). `M16`, `EMPTY`, `RGBAUF`, and `MF` are unverified.

`UnitValueConverter.create(dpi, viewDpi = -1)` with `getConversionFactor(from, to)`. `Document.unitValueConverter` builds one from the document (docs).

`PageDocumentProperties`, `ArtboardDocumentProperties`, and `SpreadDocumentProperties` have `create()`, `clone()`, and margin / dimension / anchor fields (docs). `PageOriginDelta` is `{x, y}` (docs) and a native function with no `.keys` (verified). `SpatialAnchor.keys`: `None`, `TopLeft`, `CentreLeft`, `BottomLeft`, `TopCentre`, `Centre`, `BottomCentre`, `TopRight`, `CentreRight`, `BottomRight`, `FocalPoint` (verified).

```js
const { Document, UnitType, RasterFormat, RasterResamplerType } = require('/document.js');
const { DocumentProperties } = require('/documentproperties.js');
const { ColourProfile } = require('/colours.js');
const props = DocumentProperties.create();
props.units = UnitType.Pixel;
props.dimensions = { width: 1920, height: 1080 };
props.dpi = 144;
props.resamplerType = RasterResamplerType.Bicubic;
props.setColourFormatAndProfile(RasterFormat.RGBA8, ColourProfile.getDefaultForFormat(RasterFormat.RGBA8));
Document.current.setDocumentProperties(props);
```

## 5. Spreads, pages, artboards

Hierarchy from `/document.js` and `/nodes.js` (docs):

1. `doc.rootNode` is a `DocumentNode` (`LogicalNode`) with `pageCount` and `spreadCount`.
2. `doc.spreads` are the root's `NodeChildType.Main` children, each a `SpreadNode`.
3. `doc.layers` walks each spread's Main children, non-recursive. `doc.layers.all` walks recursively.
4. `doc.artboards` is `doc.spreads.first.artboards` only (the first spread). `doc.hasArtboards` reads `spreads.first.artboardCount`.
5. `doc.pageCount` and `doc.spreadCount` come from the root.

`SpreadNode` (`PhysicalNode`): `layers` (Main, `reversed` false), `pageCount` via `physicalRootProperties`, `artboardCount`, `getArtboard(index)`, `artboards` as an `ArtboardInterface` array, `firstPageIndex`, `lastPageIndex`, `isFirstPage`, `getPageIndexOfPoint`, `getPageIndexOfBox`, `getSpreadExtents({includeSpread, includeBleed, includeChildren})` (docs).

A page is an index on the spread. Change it with `setPageDocumentProperties(spreadNode, page, pageDocumentProperties)`. An artboard is an `ArtboardInterface` on the spread, and is also inserted as a shape through `addArtboard(shapeNodeDefinition, copyProperties, copyGuides)` or `addRectangularArtboard(rectangle, …)` (docs). There is no `Page` class and no `SpreadNodeDefinition`.

`NodeChildType.keys`: `Main`, `Enclosure`, `MasterSpread`, `WrapShape`, `StoryPin` (verified). `node.children` is Main. `node.enclosures` is Enclosure.

`doc.layers` and `SpreadNode.layers` walk `getFirstChild` toward `getNextSibling` because `reverse` is false (docs). Index 0 is the bottom layer (verified). Assigning the current spread clears the selection (docs). Command: `DocumentCommand.createSetCurrentSpread(spreadNode)`.

`setSpreadSizeWithAnchor` fails while an artboard exists; use `setArtboardSizeWithAnchor` (see `gotchas.md`).

```js
const { Document } = require('/document.js');
const { NodeChildType } = require('/nodes.js');
const doc = Document.current;
console.log(NodeChildType.keys.join(','));
console.log(doc.spreadCount, doc.pageCount, doc.spreads.length);
const spread = doc.currentSpread;
console.log(spread.pageCount, spread.artboardCount, spread.firstPageIndex, spread.lastPageIndex);
```

## 6. Nodes and NodeDefinitions

`Node` extends `Selectable` (docs). `createTypedNode(handle)` runs `NodeCast`: one handler per registered type, then `exec`. The registered types match this tree. Every exported node class has a handler, and every handler has a class.

| Node | Extends |
|---|---|
| `Node` | `Selectable` |
| `LogicalNode` | `Node` |
| `ColouredLogicalNode` | `LogicalNode` |
| `DocumentNode`, `GroupNode` | `LogicalNode` |
| `ContainerNode` | `ColouredLogicalNode` |
| `PhysicalNode` | `Node` |
| `DevelopNode`, `EmbeddedDocumentNode`, `RasterNode`, `SpreadNode` | `PhysicalNode` |
| `PatternRasterNode` | `RasterNode` |
| `EnclosureRasterNode` | `RasterNode` |
| `AdjustmentRasterNode`, `FilterRasterNode` | `EnclosureRasterNode` |
| Adjustments: BlackAndWhite, BrightnessContrast, ColourBalance, Curves, Exposure, HSLShift, Invert, Levels, Normals, Posterise, Recolour, SelectiveColour, ShadowsHighlights, SplitToning, Threshold, ToneCompression, ToneStretch, Vibrance, WhiteBalance | `AdjustmentRasterNode` |
| Filters: AddNoise, BilateralBlur, BoxBlur, Clarity, Defringe, Denoise, Diffuse, DiffuseGlow, DustAndScratch, DepthOfField, FieldBlur, GaussianBlur, ShadowsHighlights, HighPass, LensBlur, Bloom, Pixelate, Halftone, MaximumBlur, MedianBlur, MinimumBlur, MotionBlur, PinchPunch, RadialBlur, Ripple, Spherical, Twirl, UnsharpMask, Vignette, Voronoi | `FilterRasterNode` |
| `TextNode` | `PhysicalNode` |
| `ArtTextNode`, `FrameTextNode`, `CurvePathTextNode`, `PolyCurveTextNode`, `ShapePathTextNode`, `TableTextNode`, `ShapeTextNode` | `TextNode` |
| `VectorNode` | `PhysicalNode` |
| `MeasurementNode`, `ImageNode`, `PolyCurveNode`, `ShapeNode` | `VectorNode` |

`NodeDefinition` fields are `transform` and `userDescription`; helper setters return `this`. Definitions exist for almost every type. `DocumentNode`, `SpreadNode`, `DevelopNode`, and `EmbeddedDocumentNode` have none. `GroupNodeDefinition` has no `static create` or `createDefault`. There is no `createGroup` factory; `createGroupTransform` is a transform. Parent nodes with `ContainerNode` (docs).

| Factory | Signature |
|---|---|
| `ContainerNodeDefinition.create(name = null)`, `createDefault()` | Container |
| `RasterNodeDefinition.create(format)`, `ImageNodeDefinition.create(format)` | Raster / image |
| `PatternRasterNodeDefinition.createDefault(document)`, `create(bitmap, transform, mirror)` | Pattern |
| `PolyCurveNodeDefinition.create(curve, brushFill, lineFill, lineStyle, transparencyFill)`, `createDefault()` | Curve |
| `ShapeNodeDefinition.create(shape, rectangle, brushFill, lineFill, lineStyle, transparencyFill)`, `createDefault()` | Shape. A plain colour is wrapped with `FillDescriptor.createSolid` |
| Art, Frame, CurvePath, PolyCurve, ShapePath, Shape, Table text definitions | `createFromStoryBuilder(...)` |
| Adjustment and filter definitions | `create()` / `create(parameters)` and `createDefault()`; some take `document` or `colourSpace` |
| `MeasurementNodeDefinition.create(start, end, factor, unitType)` | Measurement |

`doc.addNode(nodeDefinition, targetNode = null, childList = NodeChildType.Main, preview)` builds an `AddChildNodesCommandBuilder`, adds the definition, then `createCommand(true, childList)` (docs).

On `Node`: `parent`, `nextSibling`, `previousSibling`, `firstChild` / `lastChild` (Main), `children`, `enclosures`, boxes (`spreadBaseBox`, `baseBox`, `lineBox`, `spreadVisibleBox`, …), and blend / description / editability / export / layerEffects / transform / visibility / tag interfaces. `spread` walks up to `isSpreadNode`. `delete()` goes through `deleteSelection`. `duplicate(transform)` runs `createTransform(..., {duplicateNodes: true})` and returns `cmd.newNodes[0]` (docs).

`userDescription` and `tagColour` execute a command immediately. `lock` / `unlock` do too. `Node.lock` passes `selection.handle` into `createSetEditable`, and that factory reads `.handle` again, so call `DocumentCommand.createSetEditable` with a `Selection` (docs). `NodeDescendents.reverse` reads `parentNodeHandle`, which is not the parameter name (`rootNodeHandle`); skip that helper (docs).

`moveToFirstChild`, `moveToLastChild`, `moveToNextSibling`, `moveToParent`, and `moveToPreviousSibling` call `NodeApi` directly, bypassing `DocumentCommand` (docs). Whether that writes history is unverified. Prefer `createMoveNodes`.

`baseBox` stays put across a move or rotate; read `spreadBaseBox` or `node.transform.data` (unverified; see `gotchas.md`). `Transform.translate`, `scale`, and `rotate` mutate the instance; use the instance you called the method on, and allocate a fresh `Transform` per command (unverified).

```js
const { Document } = require('/document.js');
const { ShapeNodeDefinition } = require('/nodes.js');
const { ShapeRectangle } = require('/shapes.js');
const { Rectangle } = require('/geometry.js');
const def = ShapeNodeDefinition.createDefault();
def.setShape(ShapeRectangle.create());
def.setBoundingRectangle(new Rectangle(0, 0, 200, 100));
const doc = Document.current;
doc.addNode(def, doc.currentSpread);
```

## 7. Selections

`Selectable` (`/selectable.js`) is the `isSelectable` flag (docs).

`Selection.create(document, items, removeNested)`, `createEmpty(document)`. `add` accepts a node, a `SelectionItem`, or a `Selectable`. Also `addNode`, `addItem`, `addSelectable`, `addSubSelectionForNode`. Members: `length`, `at(index)`, `items` (`SpanCollection`), `nodes`, `firstNode`, `hasKeyObject`, `removeNested`, `containsItem`, `clear`, `getFirstSubSelectionOfType` (docs).

`SelectionItem`: `node`, `subSelections`, `getSubSelection`, `getSubSelectionOfType`, `subSelectionCount`.

`doc.selection` wraps the current selection. Assigning a `Selection` runs `createSetSelection` immediately; any other value is wrapped with `Selection.create` and assigned. `null` clears. Document command helpers (`#ensureSelection`) wrap one node or an array (docs). Assigning `doc.selection` is a history command. Pixel selection is separate (`pixel.md`).

`SubSelectionType.keys` (verified): `CurveEdge`, `CurveNode`, `Text`, `Table`, `ExportFormat`, `Fill`, `LineFill`, `Transparency`, `FillMesh`, `LineFillMesh`, `TransparencyMesh`, `GeometryModifier`, `FillDiffusion`.

Classes: `CurveNodeSubSelection` and `CurveEdgeSubSelection` (`create(items)`, `clone`); `FillSubSelection`, `LineFillSubSelection`, `TransparencySubSelection` (index) and the matching Mesh types; `TableSubSelection` (`cells`, `getEdges`, `isRectangle`, `anchor`, `caret`); `TextSelection.create(ranges)` (docs).

`ContentType.keys`: `Main`, `Frame`, `Cell` (verified). Fill commands take `options.contentType`, `fillMask`, and `useTextSelection`.

```js
const { Document } = require('/document.js');
const { SubSelectionType } = require('/selections.js');
const doc = Document.current;
console.log(doc.selection.length, SubSelectionType.keys.join(','));
doc.selection = [doc.layers.at(0)];
```

## 8. Commands

Full catalogue: `commands-index.md`. Source `/commands.js` (docs).

`Command.description` / `DocumentCommand.description` come from `CommandApi.getDescription`. After `executeCommand`, `enumerateNewNodes` / `newNodes` are the nodes that command created (use this after a duplicate).

`doc.executeCommand(documentCommand, preview)` calls `DocumentApi.executeCommand(handle, command.handle, preview)`. `executeCommandAsync(command, callback, preview)` is the same order: callback, then the preview flag. The flag is forwarded as given. `createClearPreviews()` and `doc.clearPreviewsAsync(callback)` exist. Whether `preview` writes history is unverified. Pass `false` for an edit you want to keep.

Synchronous Document helpers put `preview` last (`selectAll`, `deleteSelection`, `setVisible`, …). The only async helpers, marked `TODO: asynchronous command helpers`, are `setLayerDescriptionAsync`, `setTagColourAsync`, `setShapeAsync`, `clearPreviewsAsync` (docs).

`CompoundCommandBuilder.create()`, then `addCommand(command, useAsDescription)`, then `createCommand()`. `createCompoundCommand(arrayOrCommand)` wraps an array.

`AddChildNodesCommandBuilder.create()`: `addNode` and specialised `add*Node`, `setInsertionTarget`, `setInsertionTargetSelection`, `setInsertionMode`, `autoName`, `forcePixelAlignment`, `clearCurrentSelection`, `appendCurrentSelection`, then `createCommand(andSelect = true, childListType = Main)` or `createCommandAndReset` (docs).

`InsertionMode` (verified): `Default=0`, `Inside_AtBack=1`, `Inside_AtFront=2`, `Behind=3`, `Top=4`.

`SetHatchFillAttributesCommandBuilder` declares `static create` twice, then `createBrushFillCommand` / `createPenFillCommand` / `createTransparencyFillCommand` (docs). Argument order: `createSetBrushHatchFillAttributes(selection, attr, options)` versus `createSetPenHatchFillAttributes(attr, selection, options)` and `createSetTransparencyHatchFillAttributes(attr, selection, options)`.

`AddNodeCommand` is `@deprecated`, empty, and extends `DocumentCommand`.

`createTransform` fills an empty `Transform` when `xf` is missing. Options that reach native code: `mergeable`, `cloneRaster`, `correctChildren`, `duplicateNodes` (docs).

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Transform } = require('/geometry.js');
const doc = Document.current;
const xf = new Transform();
xf.translate(10, 0);
const cmd = DocumentCommand.createTransform(doc.selection, xf, { duplicateNodes: true });
doc.executeCommand(cmd, false);
console.log(cmd.newNodes.length, doc.undoDescription);
```

## 9. History and snapshots

`Document.history` is a `DocumentHistory` stored on the document (docs). `canUndo`, `canRedo`, `undoDescription`, and `redoDescription` are also on `Document`.

| Member | Behaviour |
|---|---|
| `undo(preview)` / `redo(preview)`, `undoAsync` / `redoAsync` | Build `createUndo` / `createRedo` |
| `position` | Read is `getUndoPosition`. The setter calls `createSetHistoryIndexCommand(index - 1)`. `DocumentCommand.createSetHistoryIndex(index)` passes the index through. Which index matches `getItem` is unverified |
| `size`, `getItem(index)`, `items`, `enumerateItems` | History list. `items` callback returns `false` (docs) |
| `DocumentHistoryItem` | `description`, `command`, `thumbnail` (`PixelBuffer`), `hasAlternateFutures`, `dispose()` |

Snapshots: `doc.snapshots`, `snapshotCount`, `currentSnapshot`, `currentSnapshotIndex`, `currentSnapshotHistoryIndex`. `DocumentSnapshot`: `description`, `format`, `createDocument()` via `DocumentApi.createFromSnapshot`, `createDocumentAsync`. Commands: `createAddDocumentSnapshot(description)`, `createDeleteDocumentSnapshot`, `createRestoreDocumentSnapshot`, `createSetCurrentSnapshot`, `createSetCurrentSnapshotFromHistoryItem`, `createCycleAlternateFutures(index)` (docs). Snapshot commands are unverified.

```js
const { Document } = require('/document.js');
const doc = Document.current;
console.log(doc.canUndo, doc.undoDescription, doc.snapshotCount);
if (doc.canUndo) console.log('next undo:', doc.undoDescription);
```

Check `undoDescription` before `doc.undo()`.

## 10. Collection

`/collection.js` is a lazy sequence (docs). Factories: `empty`, `of(...)`, `over(seq)`, `range(start, count)`, `random`, `fibonacci`. Chainable: `map`, `filter`, `flat`, `take`, `skip`, `takeWhile`, `skipWhile`, `reverse`, `zip`, `leftZip`, `rightZip`, `append`, `repeat`, `repeatForever`, `lastN`, `notNull`. Values: `first`, `last`, `length`, `isEmpty`, `at`, `toArray`, `join`, `reduce`, `some`, `any`, `all`, `none`, `forEach`, `countIf`.

`SpanCollection` specialises an array (`Selection.items`). `RangeCollection` specialises `range`. `doc.layers` and `NodeChildren` extend `Collection`, so `.first`, `.filter`, and `.toArray` work on them.

```js
const { Collection } = require('/collection.js');
console.log(Collection.range(0, 5).map(n => n * 2).toArray().join(','));
```

Return `EnumerationResult.Continue` (`0`) from native enumeration callbacks so the walk finishes. `Stop` is `1` (verified).

## 11. HandleObject

`/handleobject.js` (docs). `#handle` is private; the public getter is `handle`. The constructor throws when the handle is `null`.

`liveStruct(fields, get, set)`, `livePoint`, and `liveStructArray` read from native storage on every access and write the whole struct back when one field is set. An out-of-range array index throws `RangeError`. Adjustment parameters use this (`channelParameters[i].gamma`).

```js
const { Document } = require('/document.js');
const doc = Document.current;
console.log(doc ? doc.handle != null : false);
```

## 12. Promises and async

`DocumentPromises` lives in `/document.js`. `doc.promises` wraps that document (docs).

Static `load`, `getCurrent`, `createFromPreset`, and `create` return a Promise of a new `DocumentPromises` (the document is `.document`) or `null`. The promise rejects when the error argument is truthy: `{error, desc}` for `load`, the error itself otherwise (docs). Whether native code passes `0` or an enum object is unverified. `ErrorCode` keys are in [§4](#load-save-close-export).

Instance methods: `export`, `executeCommand(command, preview)`, `save`, `saveAs`, `close`, `saveAsPackage`. The promise object has no `undo`; undo with `executeCommand(DocumentCommand.createUndo())` (docs).

Callback twins on `Document`: `getCurrentAsync`, `loadAsync`, `createFromPresetAsync`, `createAsync`, `saveAsync`, `saveAsAsync`, `saveAsPackageAsync`, `closeAsync`, `exportAsync`, `executeCommandAsync` (docs).

Shipped tests call `promises.save.bind(..., false)` even though `save()` takes no arguments. Treat those tests as stale (docs).

```js
const { DocumentPromises } = require('/document.js');
const wrapped = await DocumentPromises.getCurrent();
const doc = wrapped && wrapped.document;
console.log(doc ? doc.sessionUuid : null);
```

## 13. Configuration, inspect, logging, timers

### configuration.js

`ConfigurationItem.createFromJsonString(jsonStr, allowComments = false)` (docs). Tests: `isObject`, `isArray`, `isString`, `isNumber`, `isFloat`, `isUint`, `isInt`, `isBool`, `isNull`, `isBinary`, `isPrimitive`, `isStructured`. `value` unwraps the tree. Also `*OrDefault`, `getProperty*`, `enumerateProperties`, `propertyNames`, `items`. `ConfigurationValueType.keys`: `Object`, `Array`, `String`, `Float`, `Uint`, `Int`, `Bool`, `Null`, `Binary` (verified).

```js
const { ConfigurationItem, ConfigurationValueType } = require('/configuration.js');
const item = ConfigurationItem.createFromJsonString('{"dpi":144,"name":"sheet"}', true);
console.log(item.value.dpi, ConfigurationValueType.keys.join(','));
```

### inspect.js

`inspect(value, options)`, `format`, `formatWithOptions`, `patchConsole`, `unpatchConsole` (docs). Defaults: `depth: 2`, `enums: 'brief'` (`RGBA8`), `'full'` (`RasterFormat.RGBA8`), or `'raw'`. `expandNestedHandleObjects: false` folds nested handles to `[ClassName]`. Getters on the prototype run, and a throw is wrapped as `<error: …>`. A `Promise` prints `Promise { <state unknown> }`. Custom hook: `Symbol.for('affinity.inspect.custom')`.

```js
const { inspect } = require('/inspect.js');
const { RasterFormat } = require('/document.js');
console.log(inspect(RasterFormat.RGBA8, { enums: 'full' }));
```

### logging.js

`LogFile.create(path, logLevel, append = false)`, then `start`, `flush`, `stop`, and `logLevel` (docs). The path has to sit under `fileSystemRoots` (`<Desktop>`).

```js
const { LogFile, LogLevel } = require('/logging.js');
const { Application } = require('/application.js');
const log = LogFile.create(Application.userDesktopPath + '/affinity-sdk.log', LogLevel.Info, true);
log.start();
log.flush();
log.stop();
```

### timers.js

`Timer.create()`, `cancel()`, `Timer.cancelAll()`, `Timer.now`, `Timer.nowBigInt` (docs). `expiry` / `expiryFromNow` take a number or a `BigInt`. `waitAsync(callback)`. `setTimeout(delay, callback, ...args)`, `setInterval(delay, callback, ...args)`, `setImmediate(callback, ...args)`: the delay is the first argument. `setImmediate` sets `expiryFromNow = 0`. The `expiryBigInt` setter is deprecated. For `sleep`, `require('affinity:timers')` (verified export; behaviour unverified).

```js
const { setTimeout, Timer } = require('/timers.js');
const timer = setTimeout(0, (err) => { console.log('tick', String(err)); });
console.log(Timer.now, timer != null);
```

## 14. Native export index

Live `Object.getOwnPropertyNames` counts are verified. `affinity:dom` names are that live list (verified). `affinity:geometry`, `affinity:layereffects`, `affinity:raster`, `affinity:story`, and `affinity:ui` names are the matching module pages (docs); each published count equals the live count. Other modules in [§1](#1-modules-and-wrappers) were fully enumerated at runtime. Wrapper classes drop the `Api` suffix (`DocumentApi` → `Document`).

### affinity:geometry

Value types: `BoundingBox`, `CubicBezier`, `CubicBezierPair`, `CurveCornerData`, `CurveNode`, `CurvePair`, `Endpoints`, `MeshSize`, `Point`, `PointMinMax`, `Rectangle`, `ShapeTrapezoidPositions`, `Size`, `SplineFindPointResult`, `Transform`, `TransformData`, `Vector`.

APIs: `CubicBezierApi`, `CurveApi`, `CurveBuilderApi`, `MeshApi`, `PointApi`, `PolyCurveApi`, `PolyPolyCurveApi`, `PolygonApi`, `QRPayloadApi`, `QRPayloadDataMergeApi`, `QRPayloadEmailApi`, `QRPayloadFaceTimeApi`, `QRPayloadLocationApi`, `QRPayloadPhoneApi`, `QRPayloadSMSApi`, `QRPayloadTextApi`, `QRPayloadURLApi`, `QRPayloadVCardApi`, `QRPayloadWhatsAppApi`, `QRPayloadWifiApi`, `RectangleApi`, `ShapeApi`, `ShapeArrowApi`, `ShapeCalloutEllipseApi`, `ShapeCalloutRectangleApi`, `ShapeCat2Api`, `ShapeCat3Api`, `ShapeCat4Api`, `ShapeCatApi`, `ShapeCloudApi`, `ShapeCogApi`, `ShapeCrescentApi`, `ShapeDiamondApi`, `ShapeDoubleStarApi`, `ShapeEllipseApi`, `ShapeHeartApi`, `ShapePieApi`, `ShapePolygonApi`, `ShapeQRCodeApi`, `ShapeRectangleApi`, `ShapeSegmentApi`, `ShapeSpiralApi`, `ShapeSquareStarApi`, `ShapeStarApi`, `ShapeTearApi`, `ShapeTrapezoidApi`, `ShapeTriangleApi`, `SplineApi`, `TransformApi`, `VectorApi`.

Enums: `CurveCornerType`, `CurveNodeStyle`, `CurveNodeType`, `MeshDirection`, `QRPayloadType`, `ShapeArrowEndStyle`, `ShapeBoolParam`, `ShapeCornerIndex`, `ShapeCornerType`, `ShapeEnumParam`, `ShapeFloatParam`, `ShapeIntParam`, `ShapeMajorAxis`, `ShapeSpiralStyle`, `ShapeType`, `SplineProfile`, `WifiEncryptionType`, `WindingOrder`.

### affinity:layereffects

`BevelEmbossLayerEffectApi`, `ColourOverlayLayerEffectApi`, `GaussianBlurLayerEffectApi`, `GradientOverlayLayerEffectApi`, `InnerGlowLayerEffectApi`, `InnerShadowLayerEffectApi`, `LayerEffectApi`, `OuterGlowLayerEffectApi`, `OuterShadowLayerEffectApi`, `OutlineLayerEffectApi`, `PhongBevelLayerEffectApi`, `PointLightApi`, `BevelEmbossType`, `LayerEffectType`, `StrokeFillType`.

### affinity:raster

`NodeRenderingEngineOptionsApi`, `RasterObjectApi`, `RasterExtendType`, `RasterFormat`, `RasterIntent`, `RasterObjectType`, `RasterResamplerType`, `PixelReaderCMYKA8Api`, `PixelReaderIA16Api`, `PixelReaderIA8Api`, `PixelReaderLABA16Api`, `PixelReaderM16Api`, `PixelReaderM8Api`, `PixelReaderMfApi`, `PixelReaderRGBA16Api`, `PixelReaderRGBA8Api`, `PixelReaderRGBAufApi`, `PixelReaderWriterCMYKA8Api`, `PixelReaderWriterIA16Api`, `PixelReaderWriterIA8Api`, `PixelReaderWriterLABA16Api`, `PixelReaderWriterM16Api`, `PixelReaderWriterM8Api`, `PixelReaderWriterMfApi`, `PixelReaderWriterRGBA16Api`, `PixelReaderWriterRGBA8Api`, `PixelReaderWriterRGBAufApi`.

### affinity:story

APIs: `AnchorGlyphApi`, `CapturedDateTimeGlyphApi`, `CharGlyphApi`, `CrossReferenceGlyphApi`, `CrossReferenceSubGlyphApi`, `CustomFieldGlyphApi`, `DataMergeFieldGlyphApi`, `DataMergeGlyphApi`, `DataMergeSourceGlyphApi`, `DocumentFieldGlyphApi`, `FieldGlyphApi`, `FillerTextGlyphApi`, `FormattableFieldGlyphApi`, `GlyphApi`, `GlyphAttsApi`, `GlyphIndexGlyphApi`, `HardBreakGlyphApi`, `IndentToHereGlyphApi`, `IndexMarkGlyphApi`, `ListNumberGlyphApi`, `NoteNumberGlyphApi`, `PageNumberGlyphApi`, `ParagraphAttsApi`, `PinGlyphApi`, `RangenoteBodyGlyphApi`, `RangenoteEndGlyphApi`, `RangenoteReferenceGlyphApi`, `RightIndentTabGlyphApi`, `RunningHeaderGlyphApi`, `SectionNameGlyphApi`, `StoryApi`, `StoryBuilderApi`, `StoryDeltaApi`, `StoryRangeApi`, `StoryRange`.

Enums: `CapsType`, `CrossReferenceSubGlyphType`, `CrossReferenceTargetType`, `DataMergeSourceType`, `DocumentFieldType`, `FieldDataType`, `FillerTextType`, `GlyphAttDoubleType`, `GlyphAttStringType`, `GlyphType`, `HardBreakType`, `LeadingOverrideType`, `NotePosition`, `NoteType`, `OpticalAlignmentType`, `PageNumberType`, `ParagraphAlignXType`, `ParagraphAttDoubleType`, `ParagraphAttStringType`, `ParagraphLeadingType`, `ParagraphLineBreakModeType`, `ParagraphPDFExportTagType`, `ParagraphStartAtHardBreakType`, `ParagraphUseSpaceBeforeMode`, `SoftBreakType`, `StoryIoFormat`, `SuperSubType`, `TableAxis`, `TocRoleType`, `TypographicLineType`, `WordPartType`.

### affinity:ui

`UiApi`, `DialogApi`, `DialogBoolControlApi`, `DialogButtonApi`, `DialogButtonSetApi`, `DialogCheckBoxApi`, `DialogColourPickerApi`, `DialogColumnApi`, `DialogColumnStackApi`, `DialogComboBoxApi`, `DialogControlApi`, `DialogEnumControlApi`, `DialogFillEditorApi`, `DialogFontPickerApi`, `DialogGroupApi`, `DialogItemApi`, `DialogRadioGroupApi`, `DialogSpatialAnchorApi`, `DialogStaticTextApi`, `DialogStrokeEditorApi`, `DialogSwitchApi`, `DialogTextBoxApi`, `DialogTextControlApi`, `DialogUnitValueEditorApi`, `DialogItemType`, `DialogResult`.

### affinity:dom

```
AddNoiseFilterParametersApi, AddNoiseFilterRasterNodeApi, AddNoiseFilterRasterNodeDefinitionApi, AddNoiseType, AdjustmentRasterNodeApi, AdjustmentRasterNodeDefinitionApi, AntialiasingMode, ArtTextNodeApi, ArtTextNodeDefinitionApi, ArtboardDocumentPropertiesApi, ArtboardInterfaceApi, ArtboardPropertiesApi, BaseBoxInterfaceApi, BilateralBlurFilterParametersApi, BilateralBlurFilterRasterNodeApi, BilateralBlurFilterRasterNodeDefinitionApi, BlackAndWhiteAdjustmentParametersApi, BlackAndWhiteAdjustmentRasterNodeApi, BlackAndWhiteAdjustmentRasterNodeDefinitionApi, BlendModeInterfaceApi, BlendOptionsApi, BloomFilterParametersApi, BloomFilterRasterNodeApi, BloomFilterRasterNodeDefinitionApi, BloomMethod, BoxBlurFilterParametersApi, BoxBlurFilterRasterNodeApi, BoxBlurFilterRasterNodeDefinitionApi, BrightnessContrastAdjustmentParametersApi, BrightnessContrastAdjustmentRasterNodeApi, BrightnessContrastAdjustmentRasterNodeDefinitionApi, BrushFillInterfaceApi, ClarityFilterParametersApi, ClarityFilterRasterNodeApi, ClarityFilterRasterNodeDefinitionApi, ColourBalanceAdjustmentParametersApi, ColourBalanceAdjustmentRasterNodeApi, ColourBalanceAdjustmentRasterNodeDefinitionApi, ColourBalanceValues, ColouredLogicalNodeApi, ColouredLogicalNodeDefinitionApi, CompoundOperation, CompoundOperationInterfaceApi, ConstraintType, ContainerNodeApi, ContainerNodeDefinitionApi, ContentType, CurveEdgeSubSelectionApi, CurveEdgeSubSelectionItem, CurveNodeSubSelectionApi, CurveNodeSubSelectionItem, CurvePathTextNodeApi, CurvePathTextNodeDefinitionApi, CurvesAdjustmentParametersApi, CurvesAdjustmentRasterNodeApi, CurvesAdjustmentRasterNodeDefinitionApi, CurvesInterfaceApi, DefringeFilterParametersApi, DefringeFilterRasterNodeApi, DefringeFilterRasterNodeDefinitionApi, DenoiseFilterParametersApi, DenoiseFilterRasterNodeApi, DenoiseFilterRasterNodeDefinitionApi, DepthOfFieldFilterParametersApi, DepthOfFieldFilterRasterNodeApi, DepthOfFieldFilterRasterNodeDefinitionApi, DepthOfFieldMode, DescriptionInterfaceApi, DevelopDetailRefinementMethod, DevelopInvertMethod, DevelopNodeApi, DevelopParametersApi, DevelopToneCurveMethod, DiffuseFilterParametersApi, DiffuseFilterRasterNodeApi, DiffuseFilterRasterNodeDefinitionApi, DiffuseGlowFilterParametersApi, DiffuseGlowFilterRasterNodeApi, DiffuseGlowFilterRasterNodeDefinitionApi, DocumentApi, DocumentExportRecordApi, DocumentExportRecordsApi, DocumentHistoryApi, DocumentHistoryItemApi, DocumentLoadMode, DocumentLoadResult, DocumentNodeApi, DocumentPresetApi, DocumentPropertiesApi, DocumentSnapshotApi, DrawingScaleApi, DustAndScratchFilterParametersApi, DustAndScratchFilterRasterNodeApi, DustAndScratchFilterRasterNodeDefinitionApi, EditabilityInterfaceApi, EllipticalDepthOfFieldParameters, EmbeddedDocumentNodeApi, EnclosureRasterNodeApi, EnclosureRasterNodeDefinitionApi, ExportConfigApi, ExportFormatApi, ExportScaleApi, ExportScalePreset, ExportScaleSizeType, ExportSizeApi, ExportableInterfaceApi, ExposureAdjustmentParametersApi, ExposureAdjustmentRasterNodeApi, ExposureAdjustmentRasterNodeDefinitionApi, FieldBlurFilterParametersApi, FieldBlurFilterRasterNodeApi, FieldBlurFilterRasterNodeDefinitionApi, FieldBlurItemParameters, FileExportAreaApi, FileExportOptionsApi, FileType, FillMeshSubSelectionApi, FillSubSelectionApi, FilterRasterNodeApi, FilterRasterNodeDefinitionApi, FocalPoint, FrameTextNodeApi, FrameTextNodeDefinitionApi, GaussianBlurFilterParametersApi, GaussianBlurFilterRasterNodeApi, GaussianBlurFilterRasterNodeDefinitionApi, GroupNodeApi, HSLShiftAdjustmentChannelParameters, HSLShiftAdjustmentColourRange, HSLShiftAdjustmentParametersApi, HSLShiftAdjustmentRasterNodeApi, HSLShiftAdjustmentRasterNodeDefinitionApi, HalftoneDotType, HalftoneFilterParametersApi, HalftoneFilterRasterNodeApi, HalftoneFilterRasterNodeDefinitionApi, HalftoneScreenType, HighPassFilterParametersApi, HighPassFilterRasterNodeApi, HighPassFilterRasterNodeDefinitionApi, ImageNodeApi, ImageNodeDefinitionApi, ImagePlacement, ImageResourceInterfaceApi, ImportOptionsApi, InvertAdjustmentRasterNodeApi, InvertAdjustmentRasterNodeDefinitionApi, LTRB, LayerEffectsInterfaceApi, LensBlurFilterParametersApi, LensBlurFilterRasterNodeApi, LensBlurFilterRasterNodeDefinitionApi, LevelsAdjustmentChannelParameters, LevelsAdjustmentParametersApi, LevelsAdjustmentRasterNodeApi, LevelsAdjustmentRasterNodeDefinitionApi, LineDescriptors, LineFillMeshSubSelectionApi, LineFillSubSelectionApi, LineStyleInterfaceApi, LoadDocumentOptionsApi, LogicalNodeApi, LogicalNodeDefinitionApi, MarginsInterfaceApi, MaximumBlurFilterParametersApi, MaximumBlurFilterRasterNodeApi, MaximumBlurFilterRasterNodeDefinitionApi, MeasurementNodeApi, MeasurementNodeDefinitionApi, MedianBlurFilterParametersApi, MedianBlurFilterRasterNodeApi, MedianBlurFilterRasterNodeDefinitionApi, MeshSubSelectionItem, MinimumBlurFilterParametersApi, MinimumBlurFilterRasterNodeApi, MinimumBlurFilterRasterNodeDefinitionApi, MotionBlurFilterParametersApi, MotionBlurFilterRasterNodeApi, MotionBlurFilterRasterNodeDefinitionApi, NewDocumentOptionsApi, NodeApi, NodeCastApi, NodeChildType, NodeDefinitionApi, NodeMoveType, NormalsAdjustmentParametersApi, NormalsAdjustmentRasterNodeApi, NormalsAdjustmentRasterNodeDefinitionApi, PackageResourcesPolicy, PageBoundingBoxType, PageBoxInterfaceApi, PageDocumentPropertiesApi, PageOriginDelta, PatternRasterNodeApi, PatternRasterNodeDefinitionApi, PhysicalNodeApi, PhysicalNodeDefinitionApi, PhysicalRootInterfaceApi, PhysicalRootPropertiesInterfaceApi, PictureFrameInterfaceApi, PinchPunchFilterParametersApi, PinchPunchFilterRasterNodeApi, PinchPunchFilterRasterNodeDefinitionApi, PixelateFilterParametersApi, PixelateFilterRasterNodeApi, PixelateFilterRasterNodeDefinitionApi, PolyCurveNodeApi, PolyCurveNodeDefinitionApi, PolyCurveTextNodeApi, PolyCurveTextNodeDefinitionApi, PosteriseAdjustmentParametersApi, PosteriseAdjustmentRasterNodeApi, PosteriseAdjustmentRasterNodeDefinitionApi, PredefinedTagKey, RadialBlurFilterParametersApi, RadialBlurFilterRasterNodeApi, RadialBlurFilterRasterNodeDefinitionApi, RasterFillMode, RasterFloodFillSamplingSource, RasterInterfaceApi, RasterNodeApi, RasterNodeDefinitionApi, RasterSelectionApi, RasterSelectionLogicalOperation, RasterSelectionOutlineAlignment, RecolourAdjustmentParametersApi, RecolourAdjustmentRasterNodeApi, RecolourAdjustmentRasterNodeDefinitionApi, RippleFilterParametersApi, RippleFilterRasterNodeApi, RippleFilterRasterNodeDefinitionApi, SamplingSource, SelectableApi, SelectionApi, SelectionItemApi, SelectiveColour, SelectiveColourAdjustmentParametersApi, SelectiveColourAdjustmentRasterNodeApi, SelectiveColourAdjustmentRasterNodeDefinitionApi, SelectiveColourWeights, ShadowsHighlightsAdjustmentParametersApi, ShadowsHighlightsAdjustmentRasterNodeApi, ShadowsHighlightsAdjustmentRasterNodeDefinitionApi, ShadowsHighlightsFilterParametersApi, ShadowsHighlightsFilterRasterNodeApi, ShadowsHighlightsFilterRasterNodeDefinitionApi, ShadowsHighlightsVersion, ShapeInterfaceApi, ShapeNodeApi, ShapeNodeDefinitionApi, ShapePathTextNodeApi, ShapePathTextNodeDefinitionApi, ShapeTextNodeApi, ShapeTextNodeDefinitionApi, SpatialAnchor, SphericalFilterParametersApi, SphericalFilterRasterNodeApi, SphericalFilterRasterNodeDefinitionApi, SplitToningAdjustmentParametersApi, SplitToningAdjustmentRasterNodeApi, SplitToningAdjustmentRasterNodeDefinitionApi, SpreadDocumentPropertiesApi, SpreadNodeApi, StoryInterfaceApi, SubSelectionApi, SubSelectionType, TableEdgeSelector, TableSubSelectionApi, TableTextNodeApi, TableTextNodeDefinitionApi, TagInterfaceApi, TextDefaultType, TextFrameInterfaceApi, TextNodeApi, TextNodeDefinitionApi, TextSelectionApi, TextVisibilityOptionsApi, ThresholdAdjustmentParametersApi, ThresholdAdjustmentRasterNodeApi, ThresholdAdjustmentRasterNodeDefinitionApi, TiltShiftDepthOfFieldParameters, TonalRangeType, ToneCompressionAdjustmentParametersApi, ToneCompressionAdjustmentRasterNodeApi, ToneCompressionAdjustmentRasterNodeDefinitionApi, ToneCompressionMethod, ToneStretchAdjustmentParametersApi, ToneStretchAdjustmentRasterNodeApi, ToneStretchAdjustmentRasterNodeDefinitionApi, ToneStretchMethod, TransformInterfaceApi, TransparencyInterfaceApi, TransparencyMeshSubSelectionApi, TransparencySubSelectionApi, TwirlFilterParametersApi, TwirlFilterRasterNodeApi, TwirlFilterRasterNodeDefinitionApi, UnsharpMaskFilterParametersApi, UnsharpMaskFilterRasterNodeApi, UnsharpMaskFilterRasterNodeDefinitionApi, VectorNodeApi, VectorNodeDefinitionApi, VibranceAdjustmentParametersApi, VibranceAdjustmentRasterNodeApi, VibranceAdjustmentRasterNodeDefinitionApi, VignetteFilterParametersApi, VignetteFilterRasterNodeApi, VignetteFilterRasterNodeDefinitionApi, VisibilityInterfaceApi, VisibilityMode, VisibilityTestOptionsApi, VoronoiFilterParametersApi, VoronoiFilterRasterNodeApi, VoronoiFilterRasterNodeDefinitionApi, WhiteBalanceAdjustmentParametersApi, WhiteBalanceAdjustmentRasterNodeApi, WhiteBalanceAdjustmentRasterNodeDefinitionApi
```
