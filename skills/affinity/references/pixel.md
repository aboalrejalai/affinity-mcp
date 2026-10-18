# Pixels

Destructive commands bake into the selected layer (`DocumentCommand.create*Filter`, `doc.raster*`). Live filters and adjustments stay editable: add them with `doc.addNode` (pass the raster layer as the parent so they become its children) and update them with `createSet*Parameters`. Raw bytes are edited on a `PixelBuffer` or `Bitmap`, then attached as a `Bitmap`.

Three gaps: `DocumentCommand` has no Sharpen (use `UnsharpMask` or edge detect). `RasterBrush.createDefault()` throws, so there is no scripted pixel stroke. There is no layer-mask node class.

Angles in these APIs are radians. `doc.layers` is bottom-first: `.at(0)` and `.first` are the lowest layer (verified). Re-read placement from `spreadBaseBox`; `baseBox` does not follow transforms.

| Require | What you use it for |
|---|---|
| `/document.js` | `Document` |
| `/nodes.js` | Raster, filter, and adjustment nodes, definitions, parameter objects |
| `/commands.js` | `DocumentCommand`, `NodeChildType`, selection and fill enums |
| `/rasterobject.js` | `PixelBuffer`, `Bitmap`, `RasterFormat` |
| `/pixelaccessor.js` | Readers and writers |
| `/selections.js` | `Selection` |
| `/geometry.js` | `Rectangle`, `Polygon`, `Transform`, `Spline` |
| `/colours.js` | `RGBA8`, `Colour`, `ColourSpaceType`, profiles |
| `/documentproperties.js` | `DocumentProperties`, `RasterResamplerType` |
| `/units.js` | `UnitType` |
| `affinity:common` | `BlendMode` |

## Contents

- [Raster nodes](#raster-nodes)
- [Reading and writing pixels](#reading-and-writing-pixels)
- [Raster selections](#raster-selections)
- [Filters](#filters)
- [Adjustments](#adjustments)
- [Auto colour, edges, and polar](#auto-colour-edges-and-polar)
- [Fills](#fills)
- [Brushes](#brushes)
- [Blend modes](#blend-modes)
- [Masks](#masks)
- [Merge, flatten, rasterise](#merge-flatten-rasterise)
- [Colour](#colour)
- [Resampling](#resampling)

## Raster nodes

| Type | Role |
|---|---|
| `RasterNode` | Pixel layer. Size is `rasterWidth` / `rasterHeight`, not `width` / `height` (docs) |
| `RasterNodeDefinition` | `create(format)`, then set `bitmap` to a `Bitmap` |
| `ImageNode` | Embedded image; also has `rasterInterface`. Rasterise before a destructive filter. Blur was run on a `RasterNode` (verified); `ImageNode` was not checked (unverified) |
| `PatternRasterNode` | Repeating pattern. `mirror`, and `create(bitmap, transform, mirror)` (docs) |
| `EnclosureRasterNode` | Base of live filters and adjustments. No extra properties (docs) |
| `FilterRasterNode` | Live filter. `preserveAlpha` is read-only on the node |
| `AdjustmentRasterNode` | Live adjustment. No general destructive twin |
| `DevelopNode` | RAW pipeline (`DevelopParameters`), not a pixel filter (docs) |

`RasterInterface` (`rasterinterface.js`, native `affinity:dom`): `width`, `height`, `format`, `pixelSize`, `createCompatibleBitmap(copyContents)`, `createCompatibleBuffer(copyContents)`, `copyTo(dest, destRect, srcX, srcY)`, `node` (docs). `destRect` is a `Rectangle`. `pixelSize` is bytes per pixel, not the size on the canvas (verified). Byte counts are in the format table below.

`NodeChildType`: `Main`, `Enclosure`, `MasterSpread`, `WrapShape`, `StoryPin` (verified). `doc.addNode(def)` selects the new node. Pass the parent when the new node must be a child. `AddChildNodesCommandBuilder.createCommand(false, NodeChildType.Main)` adds without changing the selection (docs).

```js
const { Document } = require('/document.js');
const doc = Document.current;
const node = doc.layers.at(0);
console.log(node.isRasterNode, node.constructor.name, node.rasterWidth, node.rasterHeight, node.rasterFormat.key, node.pixelSize);
```

On a 1200×1200 document, a new raster layer's local box was at (2048, 2048) with a transform already placing it at the origin. A further `applyTransform(translate(40, 900))` composed with that transform and the layer appeared at (40, 900) (verified). Position with `applyTransform`, then read `spreadBaseBox`.

## Reading and writing pixels

Create with width first: `PixelBuffer.create(width, height, format)` and `Bitmap.create(width, height, format)`. `Bitmap.loadFromFile(path, format = RasterFormat.RGBA8)` and `loadFromFileAsync` read a file; the path has to be on the Desktop (docs). `PixelBuffer.buffer` is a live `ArrayBuffer` (verified). For a solid block, write a `Uint8Array` on that buffer. `buffer.createCompatibleBitmap(true)` copies the bytes into a `Bitmap` that `readPixel` can read (verified).

`PixelReaderWriterRGBA8.create(bitmap)` writes a `Bitmap`. The same call on a `PixelBuffer` raises `INVALID_ARGS` (verified). `createPixelReader(bitmap)` and `createPixelReaderWriter(bitmap)` pick the class from `bitmap.format`. `RasterFormat.EMPTY` throws `No pixel accessor available` (docs). Call `dispose()` when finished. `readPixel(x, y)` and `writePixel(x, y, pixel)`. The wrapper names the `writePixel` argument `rgba8` for every format; the object's fields follow the format, and the alpha field is `alpha` (docs). Pass a plain object. `RGBA8(...)` from `/colours.js` is a `Colour`, and `writePixel` does not take it (verified).

`RasterNodeDefinition.bitmap = pixelBuffer` raises `INVALID_OP` (verified). Copy into a `Bitmap`, then assign that.

| `RasterFormat` | value | Bytes | `Uint8Array` order | `readPixel` fields |
|---|---|---|---|---|
| `RGBA8` | 0 | 4 | R, G, B, A | `r`, `g`, `b`, `alpha` |
| `RGBA16` | 1 | 8 | uint16 little-endian per channel | `r`, `g`, `b`, `alpha` |
| `IA8` | 2 | 2 | I, A | `i`, `alpha` |
| `IA16` | 3 | 4 | uint16 LE | `i`, `alpha` |
| `CMYKA8` | 4 | 5 | C, M, Y, K, A | `c`, `m`, `y`, `k`, `alpha` |
| `LABA16` | 5 | 8 | uint16 LE | `l`, `a`, `b`, `alpha` |
| `M8` | 6 | 1 | one channel | `alpha` only |
| `M16` | 7 | 2 | uint16 LE | `alpha` only |
| `EMPTY` | 8 | — | no accessor | — |
| `RGBAUF` | 9 | 16 | float32 LE | `r`, `g`, `b`, `alpha` |
| `MF` | 10 | 4 | float32 LE | `alpha` only |

Byte counts for RGBA8, RGBA16, CMYKA8, IA8, M8, RGBAUF, and MF were measured (verified). The other widths are the documented layout (docs). Writing `[1,2,3,4]` and reading pixel (0,0) returned `{"r":1,"g":2,"b":3,"alpha":4}` (verified). RGBA16 bytes `01 02` read as `r = 513` (`0x0201`), so the channels are little-endian (verified). M8, M16, and MF expose their only channel as `alpha` (verified).

Create a layer from bytes (verified):

```js
const { Document } = require('/document.js');
const { PixelBuffer, Bitmap, RasterFormat } = require('/rasterobject.js');
const { RasterNodeDefinition } = require('/nodes.js');
const { Rectangle, Transform } = require('/geometry.js');
const { Selection } = require('/selections.js');

const doc = Document.current;
const W = 8, H = 8;
const buf = PixelBuffer.create(W, H, RasterFormat.RGBA8);
const u8 = new Uint8Array(buf.buffer);
for (let i = 0; i < u8.length; i += 4) {
  u8[i] = 210; u8[i + 1] = 20; u8[i + 2] = 20; u8[i + 3] = 255;
}
const bm = Bitmap.create(W, H, RasterFormat.RGBA8);
buf.copyTo(bm, new Rectangle(0, 0, W, H), 0, 0);
const def = RasterNodeDefinition.create(RasterFormat.RGBA8);
def.bitmap = bm;
doc.addNode(def);
const raster = doc.selection.firstNode;
doc.applyTransform(Transform.createTranslate(40, 40), Selection.create(doc, raster));
console.log(raster.constructor.name, raster.rasterWidth, raster.rasterHeight);
```

Write a `Bitmap` directly when you do not need a `PixelBuffer` (verified):

```js
const { PixelReaderWriterRGBA8 } = require('/pixelaccessor.js');
const { Bitmap, RasterFormat } = require('/rasterobject.js');
const bm = Bitmap.create(8, 8, RasterFormat.RGBA8);
const rw = PixelReaderWriterRGBA8.create(bm);
rw.writePixel(0, 0, { r: 10, g: 20, b: 30, alpha: 255 });
rw.dispose();
```

Replace an existing layer's pixels with `DocumentCommand.createReplaceBitmap(Selection.create(doc, node), bitmap)` (docs). Build `bitmap` from the layer via `node.createCompatibleBitmap(true)`, or from the buffer path above. This command was not run on a document (unverified).

## Raster selections

`doc.rasterSelection` is read-only: `isCurrentPixelSelection`, `isSelectAllOrNone`, `isSelectNone`. These are properties. There is no bounds, mask, or pixel count (docs). `selectSubject()` (see `ai.md`) sets this selection and adds no layer (verified).

The last argument `preview` on the wrappers is optional (docs). Ranges are the published bounds (docs).

| Call | Arguments and bounds |
|---|---|
| `rasterSelectAll()` | |
| `rasterSelectReds()` / `Greens` / `Blues` / `Midtones` / `Shadows` / `Highlights` | On an empty page these stay `isSelectNone` (docs) |
| `rasterSelectTransparent()` / `PartiallyTransparent` / `Opaque` | |
| `rasterDeselect()` | |
| `rasterInvertSelection()` | Ran successfully (verified) |
| `rasterReselect()` | Restores the previous selection |
| `setRasterSelectionFromPolygon(polygon, operation, isAntialias, featherRadius)` | `rasterSelectPolygon` is deprecated and forwards here. Coordinates are spread coordinates, not the layer's local box (verified) |
| `setRasterSelectionFromObject(node, useIntensity, operation)` | The node's intensity becomes the selection |
| `growShrinkRasterSelection(radius, circular)` | Positive grows, negative shrinks. `radius` [-1024, 1024] |
| `featherRasterSelection(radius)` | [0, 1024]. Ran successfully (verified) |
| `smoothRasterSelection(radius)` | [0, 1024] |
| `outlineRasterSelection(radius, alignment, circular)` | `radius` [0, 1024] |
| `rasterFloodSelect(point, tolerance, isContiguous, antialias, operation, samplingSource)` | `point` [-1e6, 1e6], `tolerance` [0, 1]. `samplingSource` is `SamplingSource` |

Enums (verified):

- `RasterSelectionLogicalOperation`: `New`, `Add`, `Subtract`, `Intersect`
- `RasterSelectionOutlineAlignment`: `Outside`, `Centre`, `Inside`
- `SamplingSource` (flood select only): `CurrentLayer`, `AllLayers`

`new Polygon()` throws `Invalid handle`. Use `Polygon.create()` or `Polygon.createRectangle(rect)` (verified). `curve.generatePolygon(0.1)` is the documented polygon source (docs).

`doc.deleteSelection(selection)` deletes the pixels inside the current raster selection and leaves the node in place (verified). The wrapper calls `createDeleteNodesCommand(selection, ignoreRasterSelection)` without the second argument, so it stays `undefined`. To delete the node and ignore the marching ants, call `DocumentCommand.createDeleteSelection(selection, true)` (docs).

Whether a destructive filter is clipped to the marching ants is unconfirmed (unverified).

```js
const { Document } = require('/document.js');
const { Polygon, Rectangle } = require('/geometry.js');
const { RasterSelectionLogicalOperation } = require('/commands.js');
const { Selection } = require('/selections.js');

const doc = Document.current;
const layer = doc.selection.firstNode;
const poly = Polygon.createRectangle(new Rectangle(40, 40, 80, 60));
doc.setRasterSelectionFromPolygon(poly, RasterSelectionLogicalOperation.New, false, 0);
doc.deleteSelection(Selection.create(doc, layer));
console.log(doc.rasterSelection.isSelectNone, layer.constructor.name);
```

A live blur that is a child of that layer softens the edge of the hole (verified).

## Filters

Every `DocumentCommand.create{Stem}Filter(selection, parameters)` below has a live layer:

1. `{Stem}FilterParameters.create()` from `/nodes.js`, then set fields. `create().radius` is 0 for Gaussian, so set it (verified).
2. `{Stem}FilterRasterNodeDefinition.create(parameters)` (or `createDefault()`, sometimes `createDefault(document)`).
3. `doc.addNode(def, rasterLayer, NodeChildType.Main)`. The live filter is a child of the raster layer (verified).
4. Later, `DocumentCommand.createSet{Stem}FilterParameters(selection, parameters)`.

Set `def.preserveAlpha` before `addNode`. The live node exposes it read-only, and there is no `createSetPreserveAlpha` (docs). The builder form is `AddChildNodesCommandBuilder.add{Stem}FilterRasterNode(def)` (docs).

There is no `createSharpenFilter` and no Sharpen name on `DocumentCommand`. Sharpen with `UnsharpMask`. Oil Paint, Emboss, and Crystallize have no command; the stylise tools that do exist are Pixelate, Halftone, Voronoi, and the three edge-detect commands (docs).

Ranges below are the published bounds (docs). A field with no bound has none published.

| Stem | Fields |
|---|---|
| `GaussianBlur` | `radius` [0, 1024] |
| `BoxBlur` | `radius` [0, 1024] |
| `BilateralBlur` | `radius` [0, 1024], `tolerance` [0.01, 1] |
| `MedianBlur` | `radius` [0, 1024] |
| `MaximumBlur`, `MinimumBlur` | `radius` [0, 1024], `isCircular` |
| `MotionBlur` | `radius` [0, 1024], `angle` [0, 2π] |
| `RadialBlur` | `angle` [0, π], `position` [-1e6, 1e6] |
| `DiffuseGlow` | `radius` [0, 1024]; `intensity`, `threshold`, `opacity` [0, 1] |
| `FieldBlur` | `globalRadius` [0, 1024], plus items |
| `DepthOfField` | `radius` and `clarity` [0, 1024], `vibrance` [0, 1], plus the structs below |
| `LensBlur` | `radius` [0, 1024], `numberOfBlades` [3, 9], `bladeCurvature` [0, 1], `bloomThreshold` [0, 1], `bloomFactor` [0, 10], `bloomColour` [0, 1] |
| `UnsharpMask` | `radius` [0, 1024], `threshold` [0, 1], `factor` [0, 4] |
| `HighPass` | `radius` [0, 1024], `isMonochrome` |
| `Clarity` | `strength` [-1, 1] |
| `Denoise` | `luminance`, `luminanceDetail`, `luminanceContribution`, `colours`, `coloursContribution`, each [0, 1] |
| `AddNoise` | `intensity` [0, 1], `noiseType`, `isMonochromatic`. `AddNoiseType`: `Gaussian`, `Uniform` |
| `Diffuse` | `intensity` [0, 1] |
| `DustAndScratch` | `radius` [0, 1024], `tolerance` [0, 1], `isChannelTolerance` |
| `Defringe` | `hue` [0, 2π], `radius` [0, 256], `tolerance` and `edgeBrightnessThreshold` [0, 1], `removeComplementary` |
| `PinchPunch` | `intensity` [-100, 100], `radius` [1, 1024] (minimum is 1), `position` [-1e6, 1e6] |
| `Twirl` | `angle` [-4π, 4π], `radius` [0, 1024], `position` |
| `Spherical` | `intensity` [-1, 1], `radius` [0, 1024], `position` |
| `Ripple` | `intensity` [0, 500], `position` |
| `Vignette` | `exposure` [-4, 4], `hardness` and `shape` [0, 1], `scale` [0.25, 4] |
| `Pixelate` | `quantisation` [0, 1000] |
| `Halftone` | See below |
| `Voronoi` | `cellSize` [2, 500], `lineWidth` [0, 50] |
| `Bloom` | See below |
| `ShadowsHighlights` | See below. This is the filter, not `ShadowsHighlightsAdjustment` |

`FieldBlurItemParameters` is constructed with `new`, not `create`. Fields: `position`, `level` [0, 1], `power` [0.5, 5]. `params.addBlurItem(item)`, `getBlurItem(index)`, `deleteBlurItem(index)`, `blurItemCount`. A fresh filter has 0 items (docs) and `globalRadius` 0 (verified).

`DepthOfFieldFilterParameters.mode` is read-only. Assigning `ellipticalParams` sets `mode.value` to 0 (`DepthOfFieldMode.Elliptical`); assigning `tiltShiftParams` sets it to 1 (`TiltShift`) (verified). Compare `.value`; the getter's object may have no `.key`. `EllipticalDepthOfFieldParameters`: `position` [-1e6, 1e6], `inFocus` [0, 1], `radiusX`, `radiusY`, `rotation` (no published range). `TiltShiftDepthOfFieldParameters`: `position`, `rotation`, `top` [-1e6, -0.002], `inFocusTop` [-1e6, -0.001], `inFocusBottom` [0.001, 1e6], `bottom` [0.002, 1e6]. A fresh tilt struct is all zeros, which is outside those ranges, so set the four edges before use.

`HalftoneFilterParameters`: `cellSize` [2, 500], `screenAngle` [0, 2π], `contrast` [0, 100], `greyComponentReplacement` [0, 100], `underColourRemoval` [0, 100], `screenType`, `dotType`. `HalftoneScreenType`: `Mono`, `Colour`, `Line`, `Circular`. `HalftoneDotType`: `Cosine`, `Round`, `Line` (verified).

`BloomFilterParameters`: `shadowBlend`, `midtoneBlend`, `highlightBlend`, `colour`, each [0, 1], plus `isStrong` and `method`. `BloomMethod`: `Contrast`, `Bright` (docs).

`ShadowsHighlightsFilterParameters`: `version`, `shadowsStrength`, `shadowsRange`, `shadowsRadius`, `highlightsStrength`, `highlightsRange`, `highlightsRadius`. `ShadowsHighlightsVersion`: `Default` = 0, `V16` = 1. After `create()`, version is 0, strength and radius are 0, and `shadowsRange` is 0.5 (verified). Strength and radius have no published range.

Destructive Gaussian blur. The layer stays a `RasterNode` (verified):

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Selection } = require('/selections.js');
const { GaussianBlurFilterParameters } = require('/nodes.js');

const doc = Document.current;
const layer = doc.selection.firstNode;
const p = GaussianBlurFilterParameters.create();
p.radius = 8;
doc.executeCommand(DocumentCommand.createGaussianBlurFilter(Selection.create(doc, layer), p));
console.log(layer.constructor.name);
```

The same blur as a live child (verified):

```js
const { Document } = require('/document.js');
const { NodeChildType } = require('/commands.js');
const { GaussianBlurFilterParameters, GaussianBlurFilterRasterNodeDefinition } = require('/nodes.js');

const doc = Document.current;
const layer = doc.selection.firstNode;
const p = GaussianBlurFilterParameters.create();
p.radius = 6;
const def = GaussianBlurFilterRasterNodeDefinition.create(p);
doc.addNode(def, layer, NodeChildType.Main);
for (const child of layer.children) console.log(child.constructor.name);
```

## Adjustments

Adjustments are live layers only. There is no destructive `create*Adjustment`. The pattern is `{Name}AdjustmentParameters.create()`, `{Name}AdjustmentRasterNodeDefinition.create(...)`, `doc.addNode(def, layer, NodeChildType.Main)`, then `DocumentCommand.createSet{Name}AdjustmentParameters(selection, parameters)`.

`Levels` and `Curves` take a colour space: `create(params, colourSpace)` and `createDefault(document)`. `colourSpace` is a `ColourSpaceType` (`doc.colourProfile.colourSpace`). Separate updates: `createSetLevelsAdjustmentColourSpace` and `createSetCurvesAdjustmentColourSpace` (docs). `InvertAdjustmentRasterNodeDefinition.create()` takes no parameters and has no `createDefault` (docs).

`curvesinterface.js` is the vector `PolyCurve` interface. Colour curves are `CurvesAdjustmentParameters` in `/nodes.js`.

Ranges are published bounds (docs).

| Stem | Fields |
|---|---|
| `Exposure` | `exposure` [-20, 20] |
| `BrightnessContrast` | `brightness` and `contrast` [-1, 1], `isLinear` |
| `Levels` | `masterParameters` and `channelParameters[i]` |
| `Curves` | `masterSpline`, `setChannelSpline(channel, spline)`, `min` and `max` [-100, 100] |
| `HSLShift` | Master, per-channel shifts, and a colour range |
| `WhiteBalance` | `whiteBalance` and `tint` [-1, 1] |
| `ColourBalance` | `values[TonalRangeType]`, `preserveLuminosity` |
| `Vibrance` | `vibrance` and `saturation` [-1, 1] |
| `BlackAndWhite` | `red`, `green`, `blue`, `cyan`, `magenta`, `yellow`, each [-2, 3] |
| `Recolour` | `hue` [0, 2π], `saturation` [0, 1], `lightness` [-1, 1] |
| `Posterise` | `levels` integer [2, 256] |
| `SplitToning` | `highlightsHue`, `shadowsHue` [0, 2π]; `highlightsSaturation`, `shadowsSaturation`, `balance` [0, 1] |
| `Threshold` | `threshold` [0, 1] |
| `SelectiveColour` | `weights[SelectiveColour]`, `isRelative`. Each weight [-1, 1] |
| `ShadowsHighlights` | `shadows` and `highlights` [-2, 2] |
| `Normals` | `rotation` [-π, π], `scale` [0, 2], `flipX`, `flipY` |
| `ToneCompression` | `method`, `exposure` and `gamma` [0, 2], `colour` [0, 1] |
| `ToneStretch` | `method`, `gamma` [0, 2], `stretchFactor` and `compression` [0, 1] |
| `Invert` | No fields |

Defaults after `create()` (verified): Levels master is `{blackLevel:0, whiteLevel:1, gamma:1, outputBlackLevel:0, outputWhiteLevel:1}` and `channelParametersCount` is 5. Curves `channelSplineCount` is 5, `min` is 0, `max` is 1 (the legal range is wider). HSL `channelCount` is 6, `useHSV` is false, shifts are 0. Colour balance `valuesCount` is 3 and `preserveLuminosity` is false. Selective colour `weightsCount` is 9 and `isRelative` is true. White balance is 0, 0.

`LevelsAdjustmentChannelParameters`: `blackLevel`, `whiteLevel`, `outputBlackLevel`, `outputWhiteLevel` in [0, 1], `gamma` in [0, 2]. Assign with `params.masterParameters.gamma = 1.2` and `params.channelParameters[i] = {...}` (docs). The five indexes have no names in the SDK.

`CurvesAdjustmentParameters` uses `Spline` from `/geometry.js`: `Spline.createFromProfile(SplineProfile.Linear)`, `insertPoint({x, y})`, then `setChannelSpline(1, spline)` (docs). Channel names for the five indexes are not in the SDK.

`HSLShiftAdjustmentChannelParameters`: `hueShift` [-π, π], `saturationShift` [-1, 1], `luminosityShift` [-1, 1]. `setChannelColourRange(channel, {rampUpBegin, rampUpEnd, rampDownBegin, rampDownEnd})` takes radians (docs). The four ramp fields have no published range. The six channels have no names in the SDK. Set an index only after checking which channel it moves.

`TonalRangeType`: `Shadows`, `Midtones`, `Highlights`. `ColourBalanceValues`: `cyanRed`, `magentaGreen`, `yellowBlue`, each [-1, 1] (docs).

`SelectiveColour`: `Reds`, `Yellows`, `Greens`, `Cyans`, `Blues`, `Magentas`, `Whites`, `Neutrals`, `Blacks`. Weight fields: `cyanWeight`, `magentaWeight`, `yellowWeight`, `blackWeight` (docs).

`ToneCompressionMethod`: `Basic`, `Natural`, `Bright`, `Contrast`, `Filmic`, `Punchy`, `PBRNeutral`, `Log`. `ToneStretchMethod`: `Basic`, `Arcsinh`, `Logarithmic`, `Structural`, `ColourPreserving` (docs).

Brightness and contrast as a child of the layer (verified). `parameters.brightness` read back `0.4`.

```js
const { Document } = require('/document.js');
const { NodeChildType } = require('/commands.js');
const { BrightnessContrastAdjustmentParameters, BrightnessContrastAdjustmentRasterNodeDefinition } = require('/nodes.js');

const doc = Document.current;
const layer = doc.selection.firstNode;
const params = BrightnessContrastAdjustmentParameters.create();
params.brightness = 0.4;
params.contrast = 0.25;
doc.addNode(BrightnessContrastAdjustmentRasterNodeDefinition.create(params), layer, NodeChildType.Main);
for (const child of layer.children) console.log(child.constructor.name);
```

Levels, passing the document colour space (docs):

```js
const { Document } = require('/document.js');
const { LevelsAdjustmentParameters, LevelsAdjustmentRasterNodeDefinition } = require('/nodes.js');
const doc = Document.current;
const params = LevelsAdjustmentParameters.create();
params.masterParameters.blackLevel = 0.05;
params.masterParameters.gamma = 1.1;
doc.addNode(LevelsAdjustmentRasterNodeDefinition.create(params, doc.colourProfile.colourSpace));
```

## Auto colour, edges, and polar

These are destructive, take a node `Selection` rather than a pixel selection on its own, and have no live layer (docs). None of them was run on a document (unverified). The live white-balance layer is `WhiteBalanceAdjustment`, which is a manual shift, not `rasterAutoWhiteBalance`.

```js
const { Document } = require('/document.js');
const { Selection } = require('/selections.js');
const doc = Document.current;
const sel = Selection.create(doc, doc.selection.firstNode);
doc.rasterAutoLevels(sel);
doc.rasterAutoContrast(sel);
doc.rasterAutoColours(sel);
doc.rasterAutoWhiteBalance(sel);
```

Parameterless destructive commands, also with no live layer: `rasterEdgeDetect`, `rasterHorizontalEdgeDetect`, `rasterVerticalEdgeDetect`, `rasterPolarToRectangular`, `rasterRectangularToPolar` (docs).

## Fills

`doc.rasterFill(selection, mode, colour, opacity, blendMode)` and `DocumentCommand.createRasterFill` with the same arguments. `opacity` is [0, 1] (docs). `RasterFillMode`: `Colour`, `Foreground`, `Background`, `Inpainting`, `History` (verified). `Inpainting` and `History` have no documented behaviour; leave `Inpainting` unused until you know whether it spends Canva AI credits (unverified).

`doc.rasterFloodFill(selection, point, tolerance, isContiguous, antialias, samplingSource, blendMode, colour)`. `point` is [-1e6, 1e6] as `{x, y}`, `tolerance` is [0, 1] (docs). `samplingSource` is `RasterFloodFillSamplingSource`: `CurrentLayer`, `CurrentLayerAndBelow`, `LayersBeneath` (verified). That enum is not `SamplingSource` (flood select).

`RGBA8(r, g, b, alpha)` builds a `Colour` with `alpha` defaulting to 255 (docs). This pair of calls is documented and was not run on a document (unverified).

```js
const { Document } = require('/document.js');
const { Selection } = require('/selections.js');
const { RGBA8 } = require('/colours.js');
const { BlendMode } = require('affinity:common');
const { RasterFillMode, RasterFloodFillSamplingSource } = require('/commands.js');

const doc = Document.current;
const sel = Selection.create(doc, doc.selection.firstNode);
doc.rasterFill(sel, RasterFillMode.Colour, RGBA8(20, 40, 80), 1, BlendMode.Normal);
doc.rasterFloodFill(sel, {x: 10, y: 10}, 0.15, true, true, RasterFloodFillSamplingSource.CurrentLayer, BlendMode.Normal, RGBA8(255, 0, 0));
```

## Brushes

`RasterBrush.createDefault()` in `rasterbrush.js` throws `not yet implemented in C++ API` (verified). `DocumentCommand` has no paint, dab, or stroke command. `Document.setBrushFillDescriptor` and `createSetBrushFill` set a vector brush fill. `PathBrush` is for paths.

A brush handle, if one already exists, exposes `size`, `accumulation`, `flow`, `angle`, `scatterX`, `scatterY`, `hardness`, `shape`, `hueShift`, `satShift`, `lumShift` (each a `BrushDynamic`), plus `spacing` [0, 2], `opacity` [0, 1], `blendMode`, `wetEdges`, `shouldApplyWetEdges`, `shouldInterpolateTips`, `maskTextureMode`, `maskTextureScale`, and `clone()` (docs). None of those draw a stroke. `BrushDynamic` fields are `value`, `variance`, `controllerType`, `dynamicMin`, `dynamicMax`, `spline`. `BrushDynamicControllerType`: `None`, `Random`, `Pressure`, `Angle`, `Tilt`, `Rotation`, `Cyclic`, `Velocity`, `VelocityInverse`, `Direction`, `Wheel`, `Distance`. `RasterBrushTextureMode`: `None`, `Nozzle`, `Final` (docs).

## Blend modes

`BlendMode` from `affinity:common` (verified): `Normal`, `Pigment`, `Darken`, `DarkerColour`, `Multiply`, `ColourBurn`, `LinearBurn`, `Lighten`, `LighterColour`, `Screen`, `ColourDodge`, `Add`, `Overlay`, `SoftLight`, `HardLight`, `VividLight`, `PinLight`, `LinearLight`, `HardMix`, `Difference`, `Exclusion`, `Subtract`, `Divide`, `Hue`, `Saturation`, `Luminosity`, `Colour`, `Average`, `Negation`, `Reflect`, `Glow`, `ContrastInvert`, `Erase`.

Every node exposes `blendMode`, `blendOptions`, `antialiasingMode`, and `blendModeInterface`. Write the mode through the command. `doc.setBlendMode(blendMode, setPassthrough, selection)` argument order differs from `DocumentCommand.createSetBlendMode(selection, blendMode, setPassthrough = false)` (docs). What `setPassthrough` does on groups is undocumented (unverified).

```js
const { Document } = require('/document.js');
const { Selection } = require('/selections.js');
const { BlendMode } = require('affinity:common');
const doc = Document.current;
doc.setBlendMode(BlendMode.Multiply, false, Selection.create(doc, doc.selection.firstNode));
```

`BlendOptions` (`blendmodeinterface.js`): `gamma` [1, 3], `masterSourceLayerRanges` and `masterUnderlyingCompositionRanges` (`Spline`), plus `getChannelSourceLayerRanges(channel)` and `setChannelSourceLayerRanges`. Apply with `DocumentCommand.createSetBlendGamma(selection, gamma)` and `createSetBlendRanges(selection, blendOptions)`. There is no `Document` wrapper (docs). `AntialiasingMode`: `Inherit`, `ForceOn`, `ForceOff` (docs).

`setOpacity(opacity, selection)` is separate from the blend mode. Node opacity is not in the published ranges. Layer-effect and brush opacity are [0, 1] (docs).

## Masks

`nodes.js`, `commands.js`, and `document.js` have no `MaskNode` and no `createMask` (docs). What exists instead:

- `LogicalNode.hasNonMaskChildren` and `hasNonMaskOrAdjustmentChildren` show the engine distinguishes mask children. There is no create API.
- `Node.enclosures` lists `NodeChildType.Enclosure` children. Live filters and adjustments subclass `EnclosureRasterNode`. Add them with `NodeChildType.Main` (verified).
- `Document.maskFormat` is readable. Its value on a live document was not read (unverified). `M8`, `M16`, and `MF` are the single-channel formats; how they relate to `maskFormat` is unconfirmed (unverified).
- `BlendMode.Erase` removes by compositing.
- `setRasterSelectionFromObject(node, useIntensity, operation)` turns intensity into a pixel selection, which is the closest documented stand-in for a luminosity mask.
- `FillMask` and `LineStyleMask` mask fill and stroke fields, not a layer.

There is no API that returns the current pixel selection as a `Bitmap` or a rectangle (docs).

## Merge, flatten, rasterise

| Call | What it does |
|---|---|
| `doc.mergeVisible()` | No selection argument. Adds a new top `RasterNode` the size of the visible content's union. Sources stay visible (verified) |
| `doc.mergeDown()` | `createMergeDown()`. No arguments (docs) |
| `doc.mergeSelected()` | `createMergeSelected()`. No arguments (docs) |
| `doc.flatten()` | `createFlatten()`. No arguments (docs) |
| `doc.rasteriseObjects(selection, rasteriseContentsOnly, clipToSpread)` | `rasteriseObjects(sel, false, true)` clips the raster to the spread (verified) |
| `doc.mergeCurves(selection)` | Joins vector curves, not pixels |

Hide sources with `hideSelection` when the merge should replace them. `showAll` records a history step and leaves nodes hidden by `hideSelection` still hidden (`isVisible` stays false). Reveal each one with `setVisible(true, node)` (verified).

```js
const { Document } = require('/document.js');
const doc = Document.current;
doc.mergeVisible();
let merged = null;
for (const layer of doc.layers) merged = layer;
console.log(merged.constructor.name, merged.rasterWidth, merged.rasterHeight);
```

```js
const { Document } = require('/document.js');
const { Selection } = require('/selections.js');
const doc = Document.current;
doc.rasteriseObjects(Selection.create(doc, doc.selection.firstNode), false, true);
```

## Colour

`ColourSpaceType`: `Unknown`, `Grey`, `RGB`, `CMYK`, `LAB`, `RGBU` (verified). `RasterFormat` is the table in [Reading and writing pixels](#reading-and-writing-pixels).

`Colour` factories: `createRGBA8`, `createRGBA16`, `createRGBAuf`, `createIA8`, `createIA16`, `createCMYKA8`, `createCMYKAf`, `createLABA16`, `createHSLAf`, `createDefault`, plus helpers such as `RGBA8(r, g, b, alpha)`. Read with `colour.rgba8` and `getRGBA8(applyTint, colourProfileSet)` and the matching getters. On `ColourApi`, `alpha`, `intensity`, `noise`, and `tint` are [0, 1]. `RGBA8` values passed to `createRGBA8` are 0–255. Keep the two scales apart (docs).

In `/colours.js`, the helpers `I16` and `IA16` call `Colour.createIA8`. Call `Colour.createIA16` yourself (docs).

`Colour.convertProfile(srcProfile, destProfile, intent, blackPointCompensation)`. `RasterIntent`: `Perceptual`, `RelativeColourimetric`, `Saturation`, `AbsoluteColourimetric` (docs).

`ColourProfile.find(name)`, `getDefaultForFormat(format)`, `getDefaultForColourSpace(colourSpace)`, `enumerateProfiles`, `canApplyTo(format)`. A `ColourProfileSet` binds a format or space to a profile, with `intent` and `blackPointCompensation` (docs).

On the document: `doc.colourProfile` and `doc.format` (assigning `format` runs `createConvertDocumentFormat`). `DocumentProperties.setColourFormatAndProfile(rasterFormat, colourProfile)` then `doc.setDocumentProperties(props)`. `NewDocumentOptions` sets `rasterFormat` and `colourProfile` only while creating a document (docs).

```js
const { Document } = require('/document.js');
const { DocumentProperties } = require('/documentproperties.js');
const { RasterFormat } = require('/rasterobject.js');
const doc = Document.current;
const props = DocumentProperties.create();
props.setColourFormatAndProfile(RasterFormat.RGBA8, doc.colourProfile);
doc.setDocumentProperties(props);
```

## Resampling

`RasterResamplerType` (verified): `Default`, `BilinearMipmap`, `NearestNeighbourMipmap`, `NearestNeighbour`, `Bilinear`, `Bicubic`, `SeparableLanczos3`, `NonseparableLanczos3`, `AntialiasedNearestNeighbourMipmap`, `Mitchell`.

`DocumentProperties.resamplerType` resamples when the document size changes. `SpreadDocumentProperties.resamplerType` is the separate control for a spread resize (docs). Resizing through `setDocumentProperties` has been run (verified); the property names below are the documented set (docs).

```js
const { Document } = require('/document.js');
const { DocumentProperties, RasterResamplerType } = require('/documentproperties.js');
const { UnitType } = require('/units.js');
const doc = Document.current;
const props = DocumentProperties.create();
props.dimensions = {width: 2000, height: 2000};
props.units = UnitType.Pixel;
props.dpi = 300;
props.resamplerType = RasterResamplerType.SeparableLanczos3;
doc.setDocumentProperties(props);
```

`ImageNode.upsamplerType` and `extendType` (`RasterExtendType`: `Zero`, `Repeat`, `Wrap`, `Mirror`) apply when an embedded image is drawn (docs). `NodeRenderingEngine.create(node, format, options)` and `createDefault(node, format)` render a node to a `Bitmap`; the options split `downResamplerType` from `upResamplerType` (docs).

`setSpreadSizeWithAnchor` changes the canvas and does not resample the layer. The layer's `baseBox` keeps its original pixel size. `rasteriseObjects(sel, false, true)` then clips that raster to the spread (verified).
