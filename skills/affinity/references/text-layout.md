# Text and layout

Affinity 3.3.1 JavaScript, run through `execute_script`. Log with `console.log`. Sizes below are pixels at the document DPI unless a preset says otherwise. Point size converts as `px = pt * doc.dpi / 72` (docs).

Evidence: **(verified)** ran inside the app, **(docs)** wrapper or signature reference only, **(unverified)** not settled.

## Contents

- [Imports](#imports)
- [Story, StoryBuilder, StoryDelta](#story-storybuilder-storydelta)
- [GlyphAtts and ParagraphAtts](#glyphatts-and-paragraphatts)
- [Fonts and Arabic](#fonts-and-arabic)
- [Artistic, frame, path, and shape text](#artistic-frame-path-and-shape-text)
- [setText, formatText, insertGlyph](#settext-formattext-insertglyph)
- [Linked frames](#linked-frames)
- [Tables](#tables)
- [Pages, masters, margins, bleed](#pages-masters-margins-bleed)
- [Artboards](#artboards)
- [Picture frames and placed images](#picture-frames-and-placed-images)
- [Crop marks](#crop-marks)

## Imports

| Need | Require |
|---|---|
| Document, presets, export, pages | `/document.js`, `/documentproperties.js` |
| Commands | `/commands.js` |
| Text, shape, and image nodes | `/nodes.js` |
| Story | `/story.js`, `/storybuilder.js`, `/storydelta.js` |
| Attributes | `/glyphatts.js`, `/paragraphatts.js` |
| Fonts | `/fonts.js` |
| Geometry | `/geometry.js` (also `affinity:geometry`) |
| `LTRB` | `affinity:dom` (re-exported by `/documentproperties.js`) |
| Fills and `RGBA8` | `/fills.js`, `/colours.js` |
| Glyphs, selections, bitmaps | `/glyphs.js`, `/selections.js`, `/rasterobject.js` |

Native modules behind the wrappers: `affinity:story`, `affinity:fonts`, `affinity:dom` (docs).

```js
const { Rectangle } = require('/geometry.js');
const { LTRB } = require('affinity:dom');
console.log(JSON.stringify(new Rectangle(10, 20, 100, 50)));
console.log(JSON.stringify(new LTRB(3, 3, 3, 3)));
```

`Rectangle` is `(x, y, width, height)`. `LTRB` is `(left, top, right, bottom)` (verified). `UnitType` from `affinity:common` (also `/document.js`): `Pixel=5`, `Inch=6`, `Point=7`, `Millimetre=8`, `Centimetre=9` (verified).

`NewDocumentOptions` fields are write-only; reading one returns `undefined` (verified).

## Story, StoryBuilder, StoryDelta

`textNode.story` is a read-only `Story` (docs). Useful reads: `length`, `isEmpty`, `text`, `getText(startPos, maxLength, format)`, `glyphs`, `paragraphRanges`, `wordRanges`, `findWordBegin`, `findWordEnd`, `getWordRange`, `getParagraphRange`, `glyphAttRuns`, `paragraphAttRuns`, `isTable`, `containsToc`, `containsIndex`. A missing position is `-1`. An empty `StoryRange` is `(-1, -1)` (docs).

`getText` defaults to `StoryIoFormat.ClipboardDescriptions`. Other values: `Raw`, `UserDescriptions`, `InternalDescriptions`, `MenuDescriptions`, `CppDescriptions`, `Debug`, `Returns`, `Newlines`, `CrLf`, `Tabs`, `HideStoryTerminator`, `CommandDescriptions`, `ReplaceCrLfTabWithSpace`, `ReplaceTypographicQuotes`, `TokenDescriptions`, `FieldDescriptions` (verified).

`StoryApi.isCellBegin` and `isCellEnd` exist on the native API and are not wrapped on `Story` (docs).

`node.text` returns the logical string, including `\n` between frame paragraphs (verified).

### StoryBuilder

Build the story, then pass it to a text-node definition. The builder returns `this` (docs). Set attributes, then `setGlyphAtts` / `setParagraphAtts`, then `addText`. The next `addText` uses whatever attributes are current, so a second run is a second `setGlyphAtts` before the next `addText` (verified).

`setToFrameTextDefaultStyle(dpi, format)` for frame text. `setToArtisticTextDefaultStyle(dpi, format)` for artistic text. Pass `doc.dpi` and `doc.format` (verified). Also: `clearText()`, `glyphAtts`, `paragraphAtts`, `applyGlyphDelta`, `applyParagraphDelta` (docs). The only break the builder can insert is `addParagraphBreak()` (docs).

```js
const { StoryBuilder } = require('/storybuilder.js');
const { StoryDelta } = require('/storydelta.js');
const { GlyphAttDoubleType } = require('/glyphatts.js');
const { FontWeight } = require('/fonts.js');
const { ParagraphAlignXType } = require('/paragraphatts.js');

const sb = StoryBuilder.create();
sb.setToFrameTextDefaultStyle(doc.dpi, doc.format);
const px = 14 * doc.dpi / 72;
sb.applyGlyphDelta(StoryDelta.createGlyphDouble(GlyphAttDoubleType.Height, px));
sb.applyGlyphDelta(StoryDelta.createWeight(FontWeight.Bold));
sb.addText('Title');
sb.applyParagraphDelta(StoryDelta.createAlignX(ParagraphAlignXType.Right));
sb.addParagraphBreak();
sb.addText('Body');
```

That chain is the wrapper's own pattern (docs). The frame and artistic examples further down were run.

### StoryDelta

`doc.formatText(delta, selection, preview)` applies a delta to a range. `preview` is forwarded to `executeCommand` (docs). Omitting the selection uses the current selection (docs).

Named factories:

| Factory | Role |
|---|---|
| `createGlyphDouble(GlyphAttDoubleType, n)` | A numeric glyph field |
| `createWeight(FontWeight)` | Weight |
| `createItalic` / `createWidth` / `createPostscriptName` / `createFamilyName` | Other font fields |
| `createFont(fontField, font)` | One `FontField`, not a bit mask |
| `createAlignX(ParagraphAlignXType)` | Horizontal alignment |
| `createBrushFill(fillDescriptor)` | Glyph fill |
| `createComposite([delta, ...])` | Several deltas at once |
| `createFromGlyphAtts` / `createFromParagraphAtts` / `createFromAtts` | Stamp a full attribute state |

(docs). The same module also factories underline, strikeout, caps, super/sub, leading, optical alignment, TOC role, no-break, OpenType tags, pen fill, transparency, highlight, line style, indents, spacing, hard-break start, PDF tag, line-break mode, keep options, widows and orphans, baseline grid, and hyphenation. Read `/storydelta.js` with `read_sdk_documentation_topic` for those names rather than guessing them.

`FontField`: `PostscriptName`, `FamilyName`, `Weight`, `IsItalic`, `Width`, `Panose`, `VarParams`, `RibbiFamily`, `WwsFamily` (docs).

## GlyphAtts and ParagraphAtts

`GlyphAtts.create()`, or read `story.getGlyphAtts(pos)`. Runs: `story.glyphAttRuns`, `getGlyphAttsRunEnd` (docs).

| Enum | Values |
|---|---|
| `CapsType` | `None` `CapsToSmallCaps` `SmallCaps` `AllCaps` `AllSmallCaps` `CapsToPetiteCaps` `PetiteCaps` `AllPetiteCaps` `Titling` `Unicase` |
| `SuperSubType` | `None` `Superscript` `Subscript` |
| `TypographicLineType` | `None` `Single` `Double` (underline and strikeout) |
| `LeadingOverrideType` | `None` `AtLeast` |
| `OpticalAlignmentType` | `None` `Manual` `Font` |
| `TocRoleType` | `None` `PageNumber` |
| `GlyphAttDoubleType` | `Height` `CharacterSpacing` `BaselineAdvance` `AutoKernMinHeight` `OffsetX` `OffsetY` `ManualKerning` `ScaleX` `ScaleY` `ShearX` `AbsoluteLeading` |
| `GlyphAttStringType` | `SpellingLanguageId` `StyleName` `HyphenationLanguageId` |

(verified). Object fields: `isNoBreak`, `openTypeScriptTag`, `openTypeLanguageTag`, `font`, `brushFill`, `penFill`, `transparency`, `highlightFill`, `underlineFill`, `strikeoutFill`, `lineStyleDescriptor` (docs). `styleName` is a string. There is no API here to create or list text styles (docs).

`CharacterSpacing`'s unit (em versus thousandths) is unpublished (unverified).

`ga.underlineType = TypographicLineType.Single` and `ga.brushFill = FillDescriptor.createSolid(RGBA8(r, g, b), BlendMode.Normal)` both render (verified). `FillDescriptor` and `BlendMode` come from `/fills.js`, `RGBA8` from `/colours.js`.

```js
const { FillDescriptor, BlendMode } = require('/fills.js');
const { RGBA8 } = require('/colours.js');
const { StoryDelta } = require('/storydelta.js');
const fill = FillDescriptor.createSolid(RGBA8(0, 0, 0), BlendMode.Normal);
doc.formatText(StoryDelta.createBrushFill(fill), selection);
```

`createSolid` and `createBrushFill` are wrapper calls; this pair was not run on text (docs).

### ParagraphAtts

`ParagraphAtts.create()`, `story.paragraphAttRuns` (docs).

| Enum | Values |
|---|---|
| `ParagraphAlignXType` | `Left` `Centre` `Right` `JustifyLeft` `JustifyCentre` `JustifyRight` `JustifyAll` `AwayFromSpine` `TowardsSpine` |
| `ParagraphLeadingType` | `RelativeToIdeal` `RelativeToHeight` `ExactlyAbsolute` `AtLeastAbsolute` `RelativeToIdealAbsolute` |
| `ParagraphStartAtHardBreakType` | `None` `Column` `Frame` `Page` `EvenPage` `OddPage` |
| `ParagraphUseSpaceBeforeMode` | `OnlyBetweenParagraphs` `OnlyAtColumnTop` `Always` |
| `ParagraphPDFExportTagType` | `P` `H1` `H2` `H3` `H4` `H5` `H6` |
| `ParagraphLineBreakModeType` | `Auto` `Western` `International` |
| `ParagraphAttStringType` | `StyleName` |

(verified). Numbers: `relativeLeading`, `absoluteLeading`, `leftIndent`, `rightIndent`, `firstLineIndent`, `spaceBefore`, `spaceAfter`, `defaultTabStops`, word and letter spacing min/desired/max, hyphenation zones, `lastLineOutdent`, `spaceBetweenSameStyles` (docs). Booleans include `isKeepWithPrevious`, `isKeepTogether`, `isPreventWidows`, `isPreventOrphans`, `alignToBaselineGrid`, `isAutoHyphenate`, `keepWithNext`, `useModernLeading` (docs).

`ParagraphStartAtHardBreakType` is a paragraph mode. It does not insert a break glyph. `HardBreakGlyph` has no `create` (docs).

`AwayFromSpine` and `TowardsSpine` follow the spine of facing pages (verified names). `ParagraphLineBreakModeType.International` has no documented Arabic effect (unverified). `spellingLanguageId` and `hyphenationLanguageId` are strings with no id list (docs).

There is no paragraph-direction or story-direction property. `Right` is alignment, not a direction flag (verified).

### Glyphs

`story.getGlyph(pos)` returns a typed glyph (docs). `GlyphType`: `Anchor`, `Char`, `CrossReference`, `CrossReferenceSub`, `FillerText`, `CapturedDateTime`, `CustomField`, `DataMergeField`, `DataMergeSource`, `DocumentField`, `RunningHeader`, `PageNumber`, `RangenoteBody`, `RangenoteReference`, `SectionName`, `GlyphIndex`, `HardBreak`, `IndentToHere`, `IndexMark`, `ListNumber`, `NoteNumber`, `Pin`, `RangenoteEnd`, `RightIndentTab` (verified).

Factories that exist: `CharGlyph.create(char32)`, `CrossReferenceGlyph.create()`, `CrossReferenceSubGlyph.create(type)`, `FillerTextGlyph.create(fillerTextType, sourceBegin)`. Other types are read and `clone()`d, then passed to `insertGlyph` when a story already contains one. No `create` for `PageNumberGlyph`, `SectionNameGlyph`, or `HardBreakGlyph` (docs).

`HardBreakType`: `None` `Line` `Paragraph` `Column` `TableCell` `Frame` `Page` `OddPage` `EvenPage` `Story` (verified). `PageNumberGlyph.pageNumberType`: `Current` `Next` `Previous` `SectionTotal` `RunLast`. `FillerTextType`: `Lorem` `Alice`. `NoteType`: `None` `Footnote` `Endnote` `Sidenote`. `DataMergeSourceType`: `RecordIndex` `OriginalRecordIndex` `SourceName` (verified). `TextDefaultType`: `Art` `Frame` `Unknown` `Measurement`, read from `storyInterface.textDefaultType` (verified).

`SoftBreakType`: `Normal` `Space` `Never` `WithoutHyphen` `SoftHyphen` `Ideographic` `Punctuation` `OpenPunctuation` `ClosePunctuation` `CloseParenthesis` `Solidus` `InfixNumeric`. `WordPartType`: `Word` `Punctuation` `Space` (verified).

## Fonts and Arabic

`Font.create(name, weight, isItalic, width)` from `/fonts.js`. The string that succeeds is the **PostScript** name. `Font.create('Arial', ...)`, `'Geeza Pro'`, and `'Damascus'` throw `INVALID_ARGS` (verified).

```js
const { Font, FontFamily, FontWeight, FontWidth } = require('/fonts.js');
const families = FontFamily.all;
console.log(families.length, Font.createDefault().postscriptName);
const font = Font.create('ArialMT', FontWeight.Bold, false, FontWidth.Normal);
console.log(font.postscriptName, font.weight);
```

`FontFamily.all` and `Font.createDefault()` were run. `createDefault()` is Arial / `ArialMT`, weight 400, width `Normal` (verified). `Font.create('ArialMT', FontWeight.Bold, false, FontWidth.Normal)` returns weight `700` (verified). The family count is whatever is installed for Affinity on this machine, not a fixed product list.

`FontWeight`: `Thin=100` through `Black=900` in steps of 100, `Normal=400`, `Bold=700`. `FontWidth`: `UltraCondensed=1` through `UltraExpanded=9`, `Normal=5` (verified).

Reads: `postscriptName`, `familyName`, `ribbiFamily`, `wwsFamily`, `traitsName`, `weight`, `width`, `panose` (`isSerif`, `isSansSerif`, `isMonospaced`), `isVariableBold`, `isVariableItalic`, `FontFamily.hasVariations`, `hasFixed`. Also `Font.enumerate`, `Font.all`, `FontCollection.all`, `createEmpty`, `createDefaultMonospaced`, `createDefaultSymbol` (docs). `doc.getFontNames()` lists fonts used by the document and keeps the name (docs). `doc.enumerateFontNames()` on a scratch document that had only default-styled text returned `ArialMT` with `installed: true` (verified).

`VariableFontBold` and `VariableFontItalic` are exported, and `.keys` on them fails. There is no setter for variable-font axes on `Font` (verified). `FontField.VarParams` names the axis slot and does not build one (docs).

OpenType feature toggles (`liga`, `tnum`, kashida, and the rest) are absent from `affinity:story` and `FontApi` (verified). The native `setOpenTypeScriptTag(self, tag)` takes a `Number` (docs). On the JS object, assign the four-letter string (verified):

```js
ga.openTypeScriptTag = 'arab';
```

### Arabic

Arabic shapes and renders right-to-left when `GlyphAtts.font` is an Arabic-capable font, set before `addText` (verified with `ArialUnicodeMS`, `GeezaPro`, `DecoTypeNaskh`, `Baghdad`). With the default style font `ArialMT`, the same string is stored in logical order and draws disconnected and reversed.

```js
const { Font, FontWeight, FontWidth } = require('/fonts.js');
const { StoryBuilder } = require('/storybuilder.js');
const { FrameTextNodeDefinition } = require('/nodes.js');
const { Rectangle } = require('/geometry.js');

const sb = StoryBuilder.create();
sb.setToFrameTextDefaultStyle(doc.dpi, doc.format);
const ga = sb.glyphAtts;
ga.font = Font.create('ArialUnicodeMS', FontWeight.Normal, false, FontWidth.Normal);
ga.openTypeScriptTag = 'arab';
ga.height = 18 * doc.dpi / 72;
sb.setGlyphAtts(ga);
sb.addText('مرحبا بالعالم');
doc.addNode(FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(80, 80, 420, 140), sb));
```

Discover other faces with `FontFamily.all`, then pass that face's `postscriptName` to `Font.create`. Family names with spaces are not accepted.

## Artistic, frame, path, and shape text

| Node definition | Factory | Meaning |
|---|---|---|
| `FrameTextNodeDefinition` | `createFromStoryBuilder(rectangle, storyBuilder)` | Text inside a rectangle |
| `ArtTextNodeDefinition` | `createFromStoryBuilder(point, storyBuilder)` | Artistic text at a point |
| `CurvePathTextNodeDefinition` | `createFromStoryBuilder(polyCurve, storyBuilder)` | Text on a curve |
| `ShapePathTextNodeDefinition` | `createFromStoryBuilder(shape, rectangle, storyBuilder)` | Text on a shape's outline |
| `PolyCurveTextNodeDefinition` | `createFromStoryBuilder(polyCurve, storyBuilder)` | Text inside a polygon |
| `ShapeTextNodeDefinition` | `createFromStoryBuilder(shape, rectangle, storyBuilder)` | Text inside a shape |
| `TableTextNodeDefinition` | `create(rectangle, size)` | Table. `Size.width` is columns, `Size.height` is rows |

(docs). Path and shape text in the SDK example use `setToFrameTextDefaultStyle`, not the artistic style (docs).

Every `TextNode` has `story`, `storyRange`, `storyInterface`, `textFrameInterface`, `text`, and `setText` (docs).

`doc.addNode(definition, targetNode = null, childList = NodeChildType.Main, preview)` (docs). `doc.layers` is bottom-first, and `addNode` inserts relative to the current selection, so the new node is not always the last entry (verified). On an empty document the first `addNode` is `doc.layers.first` (docs). Re-read `doc.layers` after the call and match the node you just added.

### Artistic and frame

The point passed to artistic text is the line origin, not the top-left of the bounds. `ParagraphAlignXType.Right` extends the line to the left of that point. Underline and per-run fills render (verified).

```js
const { StoryBuilder } = require('/storybuilder.js');
const { ArtTextNodeDefinition, FrameTextNodeDefinition } = require('/nodes.js');
const { FillDescriptor, BlendMode } = require('/fills.js');
const { RGBA8 } = require('/colours.js');
const { ParagraphAlignXType } = require('/paragraphatts.js');
const { TypographicLineType } = require('/glyphatts.js');
const { Rectangle } = require('/geometry.js');

const art = StoryBuilder.create();
art.setToArtisticTextDefaultStyle(doc.dpi, doc.format);
const ga = art.glyphAtts;
ga.height = 54;
ga.brushFill = FillDescriptor.createSolid(RGBA8(20, 40, 90), BlendMode.Normal);
ga.underlineType = TypographicLineType.Single;
art.setGlyphAtts(ga);
art.paragraphAtts.alignXType = ParagraphAlignXType.Right;
art.setParagraphAtts(art.paragraphAtts);
art.addText('Hello');
doc.addNode(ArtTextNodeDefinition.createFromStoryBuilder({ x: 760, y: 500 }, art));

const frame = StoryBuilder.create();
frame.setToFrameTextDefaultStyle(doc.dpi, doc.format);
const fg = frame.glyphAtts;
fg.height = 36;
fg.brushFill = FillDescriptor.createSolid(RGBA8(120, 20, 20), BlendMode.Normal);
frame.setGlyphAtts(fg);
frame.addText('First paragraph');
frame.addParagraphBreak();
const fg2 = frame.glyphAtts;
fg2.height = 28;
fg2.brushFill = FillDescriptor.createSolid(RGBA8(0, 90, 70), BlendMode.Normal);
frame.setGlyphAtts(fg2);
frame.addText('Second paragraph');
doc.addNode(FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(80, 80, 420, 180), frame));
```

For Arabic, set `ga.font` as in [Fonts and Arabic](#fonts-and-arabic) before `addText`. The default style font is `ArialMT`.

### On a path or in a shape

```js
const { Curve, PolyCurve, Rectangle } = require('/geometry.js');
const { CurvePathTextNodeDefinition, ShapeTextNodeDefinition } = require('/nodes.js');
const { ShapeStar } = require('/shapes.js');
const { StoryBuilder } = require('/storybuilder.js');

const poly = PolyCurve.create();
poly.addCurve(Curve.createEllipse(new Rectangle(0, 0, 300, 180)));
const onPath = StoryBuilder.create().setToFrameTextDefaultStyle(doc.dpi, doc.format);
onPath.addText('Along the curve');
doc.addNode(CurvePathTextNodeDefinition.createFromStoryBuilder(poly, onPath));

const star = ShapeStar.create();
const inside = StoryBuilder.create().setToFrameTextDefaultStyle(doc.dpi, doc.format);
inside.addText('Inside');
doc.addNode(ShapeTextNodeDefinition.createFromStoryBuilder(star, new Rectangle(40, 40, 220, 220), inside));
```

`Curve.createEllipse`, `PolyCurve.create`, and `ShapeStar.create` are real constructors (docs for the ellipse helper, verified for `ShapeStar.create`). The text-node factories were not run (docs).

## setText, formatText, insertGlyph

Wrapper methods, names confirmed in the running app (verified): `doc.setText(text, selection, preview)`, `doc.formatText(delta, selection, preview)`, `doc.insertGlyph(glyph, selection, preview)`, `doc.insertGlyphAt(glyph, textNode, position, preview)`.

`textNode.setText(str)` replaces that node's whole story range. `textNode.getText(startPos, maxLength, format)` reads through `storyInterface` (docs).

```js
const { Selection, TextSelection } = require('/selections.js');
const { StoryDelta } = require('/storydelta.js');
const { FontWeight } = require('/fonts.js');

const selection = Selection.create(doc, textNode);
selection.addSubSelectionForNode(textNode, TextSelection.create([{ begin: 0, end: 4 }]));
doc.formatText(StoryDelta.createWeight(FontWeight.Bold), selection);
```

(docs). `createComposite` is what the unlink examples use when they restamp formatting onto a range (docs).

## Linked frames

```js
const { DocumentCommand } = require('/commands.js');
doc.executeCommand(DocumentCommand.createLinkTextFrame(sourceFrame, destFrame));
doc.executeCommand(DocumentCommand.createUnlinkTextFrame(frame));
```

(docs). `unlink` cuts the flow **before** that frame: earlier frames keep the story, and the frame onward starts a new empty flow. A frame's visible range runs from its `textBegin` to the next frame's `textBegin`; the last frame runs to `story.length`. The split example unlinks from the last frame back toward the first, then moves glyphs with `insertGlyph` and restamps formatting with `formatText` (docs).

`TextFrameInterface` reads: `isMultiFrameTextFlow`, `isTextFlowBack`, `isTextFlowFront`, `textBegin`, `textFlowIndex`, `textFlowNodes`, `canHideOverflow`, `canUseBaselineGrid`, `canUseTextWraps`, `ignoreBaselineGrid`, `ignoreTextWraps`, `isWrappingText`, `hasScaledText` (docs).

```js
const { DocumentCommand } = require('/commands.js');
doc.executeCommand(DocumentCommand.createSetTextFrameIgnoreTextWraps(selection, true));
doc.executeCommand(DocumentCommand.createSetTextFrameIgnoreBaselineGrid(selection, true));
```

There is no `createSetTextWrap`. Wrap state is readable, and a wrap outline is a child of type `NodeChildType.WrapShape`. Baseline-grid spacing is not settable; the levers are `alignToBaselineGrid` on the paragraph and the ignore command on the frame (docs).

Make the node's spread current before editing it. `DocumentCommand.createSetCurrentSpread(spreadNode)` (docs). Changing the current spread clears the selection (docs).

## Tables

```js
const { Rectangle, Size } = require('/geometry.js');
const { TableTextNodeDefinition } = require('/nodes.js');

doc.addNode(TableTextNodeDefinition.create(new Rectangle(40, 40, 700, 400), new Size(3, 4)));
```

`Size` is `(columns, rows)` (docs). Cells are separated by `HardBreakType.TableCell`. The last cell has no terminator and runs to `story.length`. A new table starts at a 1px body height, so set glyph height on the whole story after filling. Fill from the last cell toward the first so earlier inserts do not shift later positions (docs).

`TableTextNode` adds no row, column, or insert methods. Nothing in `DocumentCommand.create*` sets column width, row height, or inserts a row (docs).

`TableSubSelection` reads an existing selection: `isEmpty`, `isRectangle`, `anchor`, `caret`, `boundingBox`, `enumerateCells`, `enumerateEdges(tableAxis, tableEdgeSelector)`, `cells`, `getEdges`. `fromSubSelection` does not create a selection (docs). `TableAxis`: `Columns` `Rows`. `TableEdgeSelector`: `None` `Left` `Right` `OuterColumns` `InnerColumns` `Columns` `Top` `Bottom` `OuterRows` `Border` `InnerRows` `Inner` `Rows` `All` (verified).

## Pages, masters, margins, bleed

`Document.create(options)` and `Document.createFromPreset(preset, isLandscape)` (verified). `NewDocumentOptions.createDefault()` and `createFromPreset(preset)` (verified). `getMaxDpi()` with no arguments throws `INVALID_OP` (verified). The documented call is `getMaxDpi(unit, dimension)`; `getMaxSize(unit, dpi)` was not completed (docs). `DocumentPreset.doublePageStart` throws `NOT_IMPLEMENTED` on every preset (verified).

Write-only option fields: `width`, `height`, `dpi`, `units`, `rasterFormat`, `isMultiPage`, `pageCount`, `isFacing`, `isDoublePageStart`, `isVerticalStack`, `createMaster`, `margins`, `marginsEnabled`, `bleed`, `createArtboard`, `isTransparentBackground`, `imagePlacement` (`ImagePlacement.Embedded` or `Linked`), `colourProfile`, `drawingScale`, `useDrawingScale`, `viewDpi` (verified as fields; `viewDpi` is deprecated on `DocumentProperties`, docs).

```js
const { Document, NewDocumentOptions, DocumentPreset } = require('/document.js');
const { LTRB } = require('/documentproperties.js');

const preset = DocumentPreset.all.filter(p => p.name === 'A4' && p.marginsEnabled)[0];
const options = NewDocumentOptions.createFromPreset(preset);
options.isMultiPage = true;
options.pageCount = 4;
options.isFacing = true;
options.isDoublePageStart = false;
options.createMaster = true;
options.marginsEnabled = true;
options.margins = new LTRB(12, 12, 12, 14);
options.bleed = new LTRB(3, 3, 3, 3);
const doc = Document.create(options);
console.log(doc.sessionUuid, doc.pageCount, doc.spreadCount);
```

`Document.create` itself was run for a single-page pixel document (verified). This multi-page combination was not (docs). Set `isMultiPage = true` before `pageCount`, or the page count is ignored; with `isDoublePageStart = false` the first page is single and odd pages sit on the right (unverified).

`pageCount` on an existing document is read-only. No wrapper command adds or deletes a page. Set the count at creation (docs).

### Presets

`DocumentPreset.all` is 62 presets, every one `isMultiPage = false` (verified). Paper names (`A3` through `Oversize Magazine`) appear twice and have `facing = true`. The first copy of each size has zero margins, zero bleed, and `marginsEnabled = false`. The second copy has margins on. `filter(p => p.name.includes('A4'))[0]` is the copy **without** margins (verified). Screen and video presets are 72 DPI, unit `Pixel`. `createArtboard = true` only on device presets (iPhone, iPad, Nothing Phone, Galaxy), DPI 216 for phones and 144 for tablets (verified).

Margined paper copies, 300 DPI (verified):

| Name | Size | Unit | Bleed | Margins L, T, R, B |
|---|---|---|---|---|
| A3 | 297×420 | mm | 3 | 25, 25, 25, 30 |
| A4 | 210×297 | mm | 3 | 25, 25, 25, 30 |
| A5 | 148×210 | mm | 3 | 17, 17, 17, 18 |
| Letter (ANSI A) | 8.5×11 | inch | 0.125 | 1, 1, 1, 1.25 |
| Legal | 8.5×14 | inch | 0.125 | 1, 1, 1, 1.25 |
| Ledger (ANSI B) | 11×17 | inch | 0.125 | 1, 1, 1, 1.25 |
| US Trade Paperback | 6×9 | inch | 0.125 | 1, 1, 1, 1.25 |
| Half Letter | 5.5×8.5 | inch | 0.125 | 1, 1, 1, 1.25 |
| Oversize Magazine | 9×12 | inch | 0.125 | 1, 1, 1, 1.25 |

### After creation

`doc.pageCount`, `doc.spreadCount`, `doc.spreads`, `doc.currentSpread` (docs). `doc.spreads` lists root children of type `NodeChildType.Main` only (docs). `SpreadNode`: `pageCount`, `firstPageIndex`, `lastPageIndex`, `isFirstPage`, `getPageIndexOfPoint(pt, relativeToSpread)`, `getPageIndexOfBox`, `getSpreadExtents`, `artboardCount`, `artboards`, `getArtboard` (docs). `doc.hasArtboards` and `doc.artboards` read **the first spread only** (docs).

Apply properties as one object. `setDocumentProperties` can invalidate a cached document; re-fetch it afterwards. Whether unset fields replace the whole document is unknown: `DocumentProperties.create()` is a blank object and there is no `fromDocument` (unverified).

```js
const { DocumentProperties, PageDocumentProperties } = require('/documentproperties.js');
const { LTRB } = require('/documentproperties.js');

const props = DocumentProperties.create();
props.bleed = new LTRB(3, 3, 3, 3);
props.isFacingPages = true;
props.isFullSpreadStart = false;
props.isVerticalStack = false;
doc.setDocumentProperties(props);

const pageProps = PageDocumentProperties.create();
pageProps.useMargin = true;
pageProps.useMasterMargin = false;
pageProps.margin = new LTRB(12, 12, 12, 14);
pageProps.moveFollowingPages = true;
doc.setPageDocumentProperties(doc.currentSpread, 0, pageProps);
```

(docs). The `page` index passed to `setPageDocumentProperties(spread, page, props)` is undocumented beyond being forwarded (unverified).

Live `DocumentProperties`: `dimensions`, `dpi`, `units`, `bleed`, `bleedFill`, `isFacingPages`, `isFullSpreadStart`, `isVerticalStack`, `shouldReflowPages`, `isTransparent`, `imageResourcePolicy` (`ImagePlacement`), `linkTextFiles`, `preserveTextStyles`, `resamplerType` (docs). Deprecated and not the live margin path: `margin`, `marginFill`, `includeMargins`, `pageWidth`, `pageHeight`, `viewDpi`, `isPortrait`, `isRetina`, `saveHistory` (docs).

`PageDocumentProperties`: `margin`, `useMargin`, `useMasterMargin`, `marginFill`, `dimensions`, `anchorType`, `pageOriginDelta`, `moveFollowingPages` (docs). `SpreadDocumentProperties` adds `useMasterMargin`, `useMasterDrawingScale`, `reflowPages`, `resamplerType`, applied with `doc.setSpreadDocumentProperties(spread, props)` (docs). Bleed is an `LTRB`, not one number (docs).

`MarginsInterface` is read-only (`margins`, `marginFill`, `useMargins`, `hasMargins`), from `artboardProperties.marginsInterface`. `ArtboardInterface.marginBox` is the artboard inside the margins when `useMargins` is on (docs).

```js
const { PageBoundingBoxType } = require('/pageboxinterface.js');
const box = doc.currentSpread.physicalRootProperties.pageBoxInterface.getPageBoundingBox(PageBoundingBoxType.BleedBox);
console.log(box.x, box.y, box.width, box.height);
```

`PageBoundingBoxType`: `MediaBox`, `CropBox`, `TrimBox`, `ArtBox`, `BleedBox`, `MinimumContent`, `MinimumVisibleContent`, `MaximumContent`, `MaximumVisibleContent` (verified). The call above was not run on a document (docs).

### Master pages

`NewDocumentOptions.createMaster = true` requests masters at creation (docs). `NodeChildType`: `Main`, `Enclosure`, `MasterSpread`, `WrapShape`, `StoryPin` (verified). There is no `doc.masterSpreads`. The derived read, not run, is:

```js
const { NodeChildType, NodeChildrenOnly } = require('/nodes.js');
const masters = new NodeChildrenOnly(doc.rootNode.handle, NodeChildType.MasterSpread, false);
console.log(masters.length);
```

Whether `createMaster = true` fills that list is unsettled, and no `create*` command applies a master to a spread or edits master content (unverified for the fill, docs for the missing command). `ImageResourceInterface.masterPage` is a property of a placed image resource, not a document master (docs).

## Artboards

```js
const { Rectangle } = require('/geometry.js');
doc.addRectangularArtboard(new Rectangle(760, 980, 240, 140), false, false);
```

`addRectangularArtboard(rectangle, copyProperties, copyGuides)` was run: `hasArtboards` becomes true, `doc.artboards.at(0)` is an `ArtboardInterface` with that box, and the layers panel shows a `ShapeNode` described `Artboard1` (verified). `addArtboard(definition, copyProperties, copyGuides, preview)` is the underlying call; the rectangular helper builds a rectangle `ShapeNodeDefinition` first (docs).

`doc.setArtboardEnabled`, `doc.setArtboardSizeWithAnchor`, `doc.setArtboardDocumentProperties(artboardInterface, props)`. The flag is `artboardInterface.isArtboardEnabled` (docs). Older tests say `enabled`; that name is stale (docs).

`ArtboardInterface`: `description`, `baseBox`, `spreadBaseBox`, `marginBox`, `topOfPageMargin`, `artboardProperties`, `physicalRootProperties`, `pageCount` (docs). `ArtboardDocumentProperties`: `margin`, `useMargin`, `marginFill`, `dimensions`, `anchorType`, `drawingScale`, `useDrawingScale` (docs).

While an artboard exists, `doc.setSpreadSizeWithAnchor(...)` returns `COMMAND_FAILED`. `doc.setArtboardSizeWithAnchor(board, width, height, SpatialAnchor.TopLeft)` resizes and can move the spread origin, which shifts existing `spreadBaseBox` values (verified). Move content back with `applyTransform` if that happens. `doc.artboards` still only lists the first spread (docs).

## Picture frames and placed images

`VectorNodeDefinition.pictureFrameEnabled` is writable while building the node. On an existing `ImageNode`, read `pictureFrameInterface.enabled` (docs).

```js
const { Application } = require('/application.js');
const { Bitmap, RasterFormat } = require('/rasterobject.js');
const { ImageNodeDefinition } = require('/nodes.js');
const { Transform } = require('/geometry.js');

const bitmap = Bitmap.loadFromFile(Application.userDesktopPath + '/photo.png', RasterFormat.RGBA8);
const def = ImageNodeDefinition.create(RasterFormat.RGBA8);
def.setBitmap(bitmap);
def.setPictureFrameEnabled(true);
def.setTransform(Transform.createTranslate(40, 40));
doc.addNode(def);
```

`Bitmap.loadFromFile(path, format = RasterFormat.RGBA8)`, `loadFromFileAsync(path, format, callback)`, and `Bitmap.create(width, height, format)` exist (verified names). The load itself was not run (docs). The path has to sit under the Desktop (`Application.userDesktopPath`). `DocumentCommand.createPopulatePictureFrame(contentNode, selection)` fills an existing frame (docs).

`ImagePlacement`: `Embedded`, `Linked` (verified). Set it with `NewDocumentOptions.imagePlacement` or `DocumentProperties.imageResourcePolicy` (docs). Whether `loadFromFile` follows that policy or always embeds is unsettled (unverified).

`PictureFrameInterface` reads: `enabled`, `description`, `hasFrameContents`, `frameContents`, `anchor`, `isClearFillOnPopulate`, `originalContentRectangle`, `dataMergeFieldId`, `calculateAnchor(node, hint)`, `calculateConstraints(node, hint)` (docs). Older test names (`pictureFrameAnchor`, `clearFillOnPopulate`, `originalContentsRect`) are stale (docs).

`ImageResourceInterface` on a placed image: `imageFilePath`, `imageFileSize`, `modifiedTime`, `fileType`, `fileTypeName`, `page`, `artboard`, `isOnArtboard`, `originalDPI`, `iccProfile`, `placedSize`, `originalSize`, `imagePlacement`, `masterPage`, `getColourFormat(allowRemote)`, `getSmallThumbnail`, `getLargeThumbnail`, `canEditOriginalImage`, `saveOriginalFile(filename)` (docs). `saveOriginalFile` writes a file.

`FileType`: `JPEG` `PNG` `TIFF` `WEBP` `HDPhoto` `RAW` `GIF` `JPEG2000` `BMP` `TGA` `OpenEXR` `HDR` `Unknown` `Affinity` `HEIF` `FITS` `Plugin` (verified).

## Crop marks

`FileExportOptions` has no crop-mark, bleed, or printer-mark field. Marks are drawn geometry. The SDK example `examples/cropMarks.js` builds a layer named `Printers Marks`: eight lines outside the selection's visible box (an offset, then the mark length) and registration circles with a cross at the side midpoints. Running that example opens a dialog, so draw the marks yourself from `node.spreadBaseBox` (or the spread box) with ordinary curves (`references/vector.md`) instead of calling it (docs).

Export the PDF with a print preset after the marks exist (`references/export.md`).
