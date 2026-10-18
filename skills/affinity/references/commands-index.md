# DocumentCommand index

All 372 `DocumentCommand.create*` factories, from the `static create*` methods on `DocumentCommand` in `/commands.js` (docs). Call `doc.executeCommand(DocumentCommand.createX(...), false)`. A `selection` argument is a `Selection`; Document helpers wrap a node or an array for you. Argument lists in full are the `commands.js` documentation topic.

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const doc = Document.current;
doc.executeCommand(DocumentCommand.createSetOpacity(doc.selection, 0.5), false);
console.log(doc.undoDescription);
```

## Contents

- [Selection, visibility, and lock](#selection-visibility-and-lock) (9)
- [Transform and arrange](#transform-and-arrange) (5)
- [History and snapshots](#history-and-snapshots) (10)
- [Fill, stroke, and transparency](#fill-stroke-and-transparency) (19)
- [Shapes, curves, and booleans](#shapes-curves-and-booleans) (26)
- [Text](#text) (7)
- [Guides](#guides) (10)
- [Pixel selection](#pixel-selection) (21)
- [Pixel operations](#pixel-operations) (12)
- [Destructive filters](#destructive-filters) (30)
- [Live filter parameters](#live-filter-parameters) (30)
- [Adjustments and Develop](#adjustments-and-develop) (21)
- [Document, page, artboard, and merge](#document-page-artboard-and-merge) (17)
- [Embedded documents](#embedded-documents) (6)
- [Macros](#macros) (6)
- [Tags and description](#tags-and-description) (4)
- [Measurement and picture frames](#measurement-and-picture-frames) (5)
- [Canva AI](#canva-ai) (6)
- [Layer effects, shared](#layer-effects-shared) (2)
- [Outer shadow](#outer-shadow) (13)
- [Inner shadow](#inner-shadow) (12)
- [Outer glow](#outer-glow) (10)
- [Inner glow](#inner-glow) (10)
- [Bevel and emboss](#bevel-and-emboss) (22)
- [Phong bevel](#phong-bevel) (17)
- [Outline](#outline) (14)
- [Colour overlay](#colour-overlay) (9)
- [Gradient overlay](#gradient-overlay) (10)
- [Layer Gaussian blur](#layer-gaussian-blur) (9)

## Selection, visibility, and lock

`createShowAll` leaves nodes hidden by `createHideSelection` hidden. Show those with `createSetVisibility` (see `gotchas.md`).

- `createSetSelection` — Replace the document selection.
- `createDeleteSelection` — Delete the selection. `ignoreRasterSelection` keeps any pixel selection.
- `createHideSelection` — Hide the selected nodes.
- `createSetVisibility` — Set visibility on the selection.
- `createShowAll` — Show hidden nodes. Skips nodes hidden with `createHideSelection`.
- `createUnlockAll` — Unlock every locked node.
- `createSelectAll` — Select all objects. `selectOnCurrentLayerOnly` limits it to the current layer.
- `createSetEditable` — Lock or unlock the selection (`editable`). Prefer this over `Node.lock`.
- `createSetArtboardEnabled` — Enable or disable the selected artboard.

## Transform and arrange

`createTransform` options that reach native code: `mergeable`, `cloneRaster`, `correctChildren`, `duplicateNodes`. A missing transform becomes an empty `Transform`. `translate`, `scale`, and `rotate` mutate the instance (unverified).

- `createTransform` — Transform the selection. `{duplicateNodes: true}` duplicates instead of moving.
- `createMoveNodes` — Reparent or reorder nodes (`moveType`, `childListType`).
- `createMoveMappedNodes` — Move each source node onto a mapped target.
- `createGroupTransform` — Apply `GroupTransformData` on X and Y. Parenting nodes is a `ContainerNode`.
- `createFlipCanvas` — Flip the canvas. `isHorizontal` chooses the axis.

## History and snapshots

Assigning `Document.history.position` calls `createSetHistoryIndex` with `index - 1`. This factory passes `index` through. Which value lines up with `getItem` is unverified.

- `createUndo` — Undo one history step.
- `createRedo` — Redo one history step.
- `createSetHistoryIndex` — Jump to a history index, passed through unchanged.
- `createCycleAlternateFutures` — Cycle alternate futures at an index.
- `createClearPreviews` — Clear command previews.
- `createAddDocumentSnapshot` — Store a named document snapshot.
- `createDeleteDocumentSnapshot` — Delete a snapshot.
- `createRestoreDocumentSnapshot` — Restore a snapshot.
- `createSetCurrentSnapshot` — Make a snapshot current.
- `createSetCurrentSnapshotFromHistoryItem` — Make a snapshot current from a history item.

## Fill, stroke, and transparency

`createSetBrushHatchFillAttributes(selection, attr, options)`. Pen and transparency hatch setters swap that: `(attr, selection, options)`.

- `createSetBrushFill` — Set the brush (fill) on the selection. A colour is accepted as well as a fill descriptor.
- `createSetPenFill` — Set the pen (stroke) fill.
- `createSetTransparencyFill` — Set the transparency fill.
- `createSetLineStyle` — Set the line style.
- `createSetLineStyleDescriptor` — Set the line style from a descriptor.
- `createSetStrokeAlignment` — Set stroke alignment.
- `createSetBrushFillIsAnchoredToSpread` — Anchor or unanchor the brush fill to the spread.
- `createSetPenFillIsAnchoredToSpread` — Anchor or unanchor the pen fill to the spread.
- `createSetTransparencyFillIsAnchoredToSpread` — Anchor or unanchor the transparency fill to the spread.
- `createSetBrushHatchFillAttributes` — Set brush hatch attributes. Order is `(selection, attr, options)`.
- `createSetPenHatchFillAttributes` — Set pen hatch attributes. Order is `(attr, selection, options)`.
- `createSetTransparencyHatchFillAttributes` — Set transparency hatch attributes. Order is `(attr, selection, options)`.
- `createSetBlendGamma` — Set blend gamma.
- `createSetBlendRanges` — Set blend ranges from blend options.
- `createSetBlendMode` — Set the blend mode. `setPassthrough` defaults to false.
- `createSetAntialiasingMode` — Set the antialiasing mode.
- `createSetOpacity` — Set layer opacity.
- `createSetBrushFillOpacity` — Set brush-fill opacity.
- `createSetLineFillOpacity` — Set stroke-fill opacity.

## Shapes, curves, and booleans

`createGroupTransform` applies grouped transform data. To parent nodes, add a `ContainerNode` (`GroupNodeDefinition` has no `create`).

- `createSetShape` — Replace the shape on the selection.
- `createSetShapeFloatParam` — Set a shape float parameter by key.
- `createSetShapeIntParam` — Set a shape int parameter by key.
- `createSetShapeBoolParam` — Set a shape bool parameter by key.
- `createSetShapeEnumParam` — Set a shape enum parameter by key.
- `createSetCurveNodeStyle` — Set the style of selected curve nodes.
- `createDeleteCurveNodes` — Delete the selected curve nodes.
- `createAddCurveNode` — Insert a curve node at a parametric distance.
- `createAddCurve` — Add a curve to a curves interface.
- `createKnifeCut` — Knife-cut. The cut curve argument comes before the selection.
- `createScissorCut` — Scissor-cut one curve at a distance.
- `createSplitCurve` — Split the selected curve at a parametric distance.
- `createConvertToCurves` — Convert the selection to curves.
- `createSmoothCurves` — Smooth the selected curves.
- `createBreakCurves` — Break the selected curves.
- `createJoinCurves` — Join the selected curves. `isJoinStraight` defaults to false.
- `createReverseCurves` — Reverse curve direction.
- `createMergeCurves` — Merge the selected curves.
- `createSeparateCurves` — Separate the selected curves.
- `createSetCurves` — Replace the curves on a curves interface.
- `createSetWindingMode` — Set the winding order.
- `createBoolOpUnion` — Boolean union.
- `createBoolOpSubtract` — Boolean subtract.
- `createBoolOpIntersect` — Boolean intersect.
- `createBoolOpXor` — Boolean xor.
- `createDivideShapes` — Divide the selected shapes.

## Text

- `createSetText` — Replace the text on the selection.
- `createInsertGlyph` — Insert one glyph.
- `createFormatText` — Apply a story delta to the text selection.
- `createSetTextFrameIgnoreTextWraps` — Ignore text wraps on the frame.
- `createSetTextFrameIgnoreBaselineGrid` — Ignore the baseline grid on the frame.
- `createLinkTextFrame` — Link text flow from `srcNode` to `destNode`.
- `createUnlinkTextFrame` — Unlink a text frame.

## Guides

- `createAddGuide` — Add a guide. `horizontal` picks the axis, `at` is the position.
- `createAddHorizontalGuide` — Add a horizontal guide at a pixel position.
- `createAddVerticalGuide` — Add a vertical guide at a pixel position.
- `createMoveGuide` — Move a guide. `horizontal` picks the axis.
- `createMoveHorizontalGuide` — Move the horizontal guide at `index`.
- `createMoveVerticalGuide` — Move the vertical guide at `index`.
- `createRemoveGuide` — Remove a guide. `horizontal` picks the axis.
- `createRemoveHorizontalGuide` — Remove the horizontal guide at `index`.
- `createRemoveVerticalGuide` — Remove the vertical guide at `index`.
- `createSetGuidesColour` — Set the guides colour.

## Pixel selection

These edit the pixel selection. Object selection is the first group.

- `createRasterSelectAll` — Select every pixel.
- `createRasterSelectReds` — Select red pixels.
- `createRasterSelectGreens` — Select green pixels.
- `createRasterSelectBlues` — Select blue pixels.
- `createRasterSelectMidtones` — Select midtone pixels.
- `createRasterSelectShadows` — Select shadow pixels.
- `createRasterSelectHighlights` — Select highlight pixels.
- `createRasterSelectTransparent` — Select fully transparent pixels.
- `createRasterSelectPartiallyTransparent` — Select partially transparent pixels.
- `createRasterSelectOpaque` — Select opaque pixels.
- `createRasterDeselect` — Clear the pixel selection.
- `createRasterInvertSelection` — Invert the pixel selection.
- `createRasterReselect` — Restore the previous pixel selection.
- `createSetRasterSelectionFromPolygon` — Set the pixel selection from a polygon.
- `createSetRasterSelectionFromObject` — Build a pixel selection from a node (`useIntensity` uses the node's intensity).
- `createRasterSelectPolygon` — Select a polygon into the pixel selection (`operation` combines it).
- `createGrowShrinkRasterSelection` — Grow or shrink the pixel selection (`radius`, `circular`).
- `createFeatherRasterSelection` — Feather the pixel selection.
- `createSmoothRasterSelection` — Smooth the pixel selection.
- `createOutlineRasterSelection` — Turn the pixel selection into an outline.
- `createRasterFloodSelect` — Flood-select pixels from a point.

## Pixel operations

- `createRasterAutoColours` — Auto-colour the selected raster.
- `createRasterAutoContrast` — Auto-contrast the selected raster.
- `createRasterAutoLevels` — Auto-levels the selected raster.
- `createRasterAutoWhiteBalance` — Auto white-balance the selected raster.
- `createRasterPolarToRectangular` — Convert the selected raster from polar to rectangular.
- `createRasterRectangularToPolar` — Convert the selected raster from rectangular to polar.
- `createRasterEdgeDetect` — Detect edges on the selected raster.
- `createRasterHorizontalEdgeDetect` — Detect horizontal edges.
- `createRasterVerticalEdgeDetect` — Detect vertical edges.
- `createRasterFill` — Fill the raster selection with a colour, opacity, and blend mode.
- `createRasterFloodFill` — Flood-fill the raster from a point.
- `createRasteriseObjects` — Rasterise objects. `clipToSpread` clips them to the spread.

## Destructive filters

These bake into the pixels. The next group writes the same filters as live filter layers.

- `createGaussianBlurFilter` — Apply a destructive Gaussian blur to the selected pixels.
- `createBoxBlurFilter` — Apply a destructive box blur to the selected pixels.
- `createBilateralBlurFilter` — Apply a destructive bilateral blur to the selected pixels.
- `createMedianBlurFilter` — Apply a destructive median blur to the selected pixels.
- `createDiffuseGlowFilter` — Apply a destructive diffuse glow to the selected pixels.
- `createFieldBlurFilter` — Apply a destructive field blur to the selected pixels.
- `createDepthOfFieldFilter` — Apply a destructive depth of field to the selected pixels.
- `createLensBlurFilter` — Apply a destructive lens blur to the selected pixels.
- `createMaximumBlurFilter` — Apply a destructive maximum blur to the selected pixels.
- `createMinimumBlurFilter` — Apply a destructive minimum blur to the selected pixels.
- `createMotionBlurFilter` — Apply a destructive motion blur to the selected pixels.
- `createShadowsHighlightsFilter` — Apply a destructive shadows and highlights to the selected pixels.
- `createRadialBlurFilter` — Apply a destructive radial blur to the selected pixels.
- `createClarityFilter` — Apply a destructive clarity to the selected pixels.
- `createUnsharpMaskFilter` — Apply a destructive unsharp mask to the selected pixels.
- `createHighPassFilter` — Apply a destructive high pass to the selected pixels.
- `createDenoiseFilter` — Apply a destructive denoise to the selected pixels.
- `createDiffuseFilter` — Apply a destructive diffuse to the selected pixels.
- `createDustAndScratchFilter` — Apply a destructive dust and scratch to the selected pixels.
- `createAddNoiseFilter` — Apply a destructive add noise to the selected pixels.
- `createBloomFilter` — Apply a destructive bloom to the selected pixels.
- `createPixelateFilter` — Apply a destructive pixelate to the selected pixels.
- `createHalftoneFilter` — Apply a destructive halftone to the selected pixels.
- `createRippleFilter` — Apply a destructive ripple to the selected pixels.
- `createTwirlFilter` — Apply a destructive twirl to the selected pixels.
- `createSphericalFilter` — Apply a destructive spherical to the selected pixels.
- `createPinchPunchFilter` — Apply a destructive pinch/punch to the selected pixels.
- `createVignetteFilter` — Apply a destructive vignette to the selected pixels.
- `createDefringeFilter` — Apply a destructive defringe to the selected pixels.
- `createVoronoiFilter` — Apply a destructive Voronoi to the selected pixels.

## Live filter parameters

Pass the filter parameters object for that live filter layer. Ranges are in `pixel.md`.

- `createSetGaussianBlurFilterParameters` — Set parameters on a live Gaussian blur filter layer.
- `createSetBilateralBlurFilterParameters` — Set parameters on a live bilateral blur filter layer.
- `createSetBoxBlurFilterParameters` — Set parameters on a live box blur filter layer.
- `createSetMedianBlurFilterParameters` — Set parameters on a live median blur filter layer.
- `createSetDiffuseGlowFilterParameters` — Set parameters on a live diffuse glow filter layer.
- `createSetFieldBlurFilterParameters` — Set parameters on a live field blur filter layer.
- `createSetDepthOfFieldFilterParameters` — Set parameters on a live depth of field filter layer.
- `createSetLensBlurFilterParameters` — Set parameters on a live lens blur filter layer.
- `createSetMaximumBlurFilterParameters` — Set parameters on a live maximum blur filter layer.
- `createSetMinimumBlurFilterParameters` — Set parameters on a live minimum blur filter layer.
- `createSetMotionBlurFilterParameters` — Set parameters on a live motion blur filter layer.
- `createSetShadowsHighlightsFilterParameters` — Set parameters on a live shadows and highlights filter layer.
- `createSetRadialBlurFilterParameters` — Set parameters on a live radial blur filter layer.
- `createSetClarityFilterParameters` — Set parameters on a live clarity filter layer.
- `createSetUnsharpMaskFilterParameters` — Set parameters on a live unsharp mask filter layer.
- `createSetHighPassFilterParameters` — Set parameters on a live high pass filter layer.
- `createSetDenoiseFilterParameters` — Set parameters on a live denoise filter layer.
- `createSetDiffuseFilterParameters` — Set parameters on a live diffuse filter layer.
- `createSetDustAndScratchFilterParameters` — Set parameters on a live dust and scratch filter layer.
- `createSetAddNoiseFilterParameters` — Set parameters on a live add noise filter layer.
- `createSetBloomFilterParameters` — Set parameters on a live bloom filter layer.
- `createSetPixelateFilterParameters` — Set parameters on a live pixelate filter layer.
- `createSetHalftoneFilterParameters` — Set parameters on a live halftone filter layer.
- `createSetRippleFilterParameters` — Set parameters on a live ripple filter layer.
- `createSetTwirlFilterParameters` — Set parameters on a live twirl filter layer.
- `createSetSphericalFilterParameters` — Set parameters on a live spherical filter layer.
- `createSetPinchPunchFilterParameters` — Set parameters on a live pinch/punch filter layer.
- `createSetVignetteFilterParameters` — Set parameters on a live vignette filter layer.
- `createSetDefringeFilterParameters` — Set parameters on a live defringe filter layer.
- `createSetVoronoiFilterParameters` — Set parameters on a live Voronoi filter layer.

## Adjustments and Develop

Adjustments are live layers. Parameter fields are in `pixel.md`.

- `createSetExposureAdjustmentParameters` — Set exposure adjustment parameters.
- `createSetLevelsAdjustmentParameters` — Set Levels adjustment parameters.
- `createSetLevelsAdjustmentColourSpace` — Set the colour space of a Levels adjustment.
- `createSetBrightnessContrastAdjustmentParameters` — Set brightness and contrast adjustment parameters.
- `createSetShadowsHighlightsAdjustmentParameters` — Set shadows and highlights adjustment parameters.
- `createSetBlackAndWhiteAdjustmentParameters` — Set black and white adjustment parameters.
- `createSetRecolourAdjustmentParameters` — Set recolour adjustment parameters.
- `createSetPosteriseAdjustmentParameters` — Set posterise adjustment parameters.
- `createSetSplitToningAdjustmentParameters` — Set split toning adjustment parameters.
- `createSetThresholdAdjustmentParameters` — Set threshold adjustment parameters.
- `createSetWhiteBalanceAdjustmentParameters` — Set white balance adjustment parameters.
- `createSetColourBalanceAdjustmentParameters` — Set colour balance adjustment parameters.
- `createSetVibranceAdjustmentParameters` — Set vibrance adjustment parameters.
- `createSetNormalsAdjustmentParameters` — Set normals adjustment parameters.
- `createSetSelectiveColourAdjustmentParameters` — Set selective colour adjustment parameters.
- `createSetHSLShiftAdjustmentParameters` — Set HSL shift adjustment parameters.
- `createSetCurvesAdjustmentParameters` — Set curves adjustment parameters.
- `createSetCurvesAdjustmentColourSpace` — Set the colour space of a curves adjustment.
- `createSetDevelopParameters` — Set Develop parameters on the selected Develop node.
- `createSetToneCompressionAdjustmentParameters` — Set tone compression adjustment parameters.
- `createSetToneStretchAdjustmentParameters` — Set tone stretch adjustment parameters.

## Document, page, artboard, and merge

`createSetCurrentSpread` clears the selection. `createMergeVisible` adds a merged layer and leaves the sources visible (see `gotchas.md`).

- `createSetDocumentUnits` — Set the document unit type.
- `createReplaceBitmap` — Replace the bitmap on the selection.
- `createFlatten` — Flatten the document.
- `createMergeDown` — Merge down.
- `createMergeSelected` — Merge the selected layers.
- `createMergeVisible` — Merge visible layers into a new layer. Sources stay visible.
- `createConvertDocumentFormat` — Convert the document pixel format.
- `createSetCurrentSpread` — Set the current spread. Clears the selection.
- `createImageTrace` — Trace the selection to curves (`edgeThreshold`, `curveFittingTolerance`).
- `createSetDocumentProperties` — Apply a `DocumentProperties` object (size, dpi, colour, resampler).
- `createSetExportConfig` — Set slice export config on the selection.
- `createAddArtboard` — Add an artboard from a definition, optionally copying properties and guides.
- `createSetSpreadSizeWithAnchor` — Resize a spread from a `SpatialAnchor`. Fails while an artboard exists; use the artboard factory.
- `createSetArtboardSizeWithAnchor` — Resize an artboard from a `SpatialAnchor`. Can shift the origin.
- `createSetSpreadDocumentProperties` — Apply spread document properties.
- `createSetArtboardDocumentProperties` — Apply artboard document properties.
- `createSetPageDocumentProperties` — Apply one page's document properties (`page` is an index).

## Embedded documents

- `createSetEmbeddedDocumentLayerVisibility` — Set one layer's visibility inside an embedded document.
- `createSetEmbeddedDocumentAllLayersVisibility` — Set visibility for every layer of an embedded document.
- `createSetEmbeddedDocumentSelectedArtboardID` — Choose the artboard shown by an embedded document.
- `createSetEmbeddedDocumentSelectedSpreadID` — Choose the spread shown by an embedded document.
- `createSetEmbeddedDocumentPageBoundingBoxType` — Set the page box used by an embedded document.
- `createSetEmbeddedDocumentPDFPassthrough` — Set PDF passthrough on an embedded document.

## Macros

- `createImportMacro` — Import a macro from a path.
- `createExportMacro` — Export the macro to a path.
- `createReplayMacro` — Replay the current macro.
- `createClearMacro` — Clear the current macro.
- `createStartRecordingMacro` — Start recording a macro.
- `createStopRecordingMacro` — Stop recording a macro.

## Tags and description

- `createSetTagColour` — Set the layer tag colour.
- `createSetDescription` — Set the layer description.
- `createSetTagValueForKey` — Set a tag value for a custom key.
- `createSetTagValueForPredefinedKey` — Set a tag value for a `PredefinedTagKey`.

## Measurement and picture frames

- `createSetMeasurementAnnotationOffset` — Set the annotation offset on a measurement node.
- `createSetMeasurementShowEndpointMarkers` — Show or hide measurement endpoint markers. No selection argument.
- `createSetMeasurementUnits` — Set measurement units.
- `createSetMeasurementPrecision` — Set measurement precision (`useDocumentPrecision`, `decimalPlaces`).
- `createPopulatePictureFrame` — Place `contentNode` into the selected picture frame. Content node comes first.

## Canva AI

Read `ai.md` before `createGenerateImage` or `createGenerativeEditImage`. Those two spend Canva AI credits.

- `createGenerateImage` — Generate an image from a prompt. Spends Canva AI credits.
- `createDetectDepth` — Build a depth map. Local model.
- `createColourise` — Colourise a black-and-white layer. Local model.
- `createGenerativeEditImage` — Generative edit from a prompt. Rewrites the whole selected layer. Spends credits.
- `createRemoveBackground` — Remove the background on the selected layer.
- `createSelectSubject` — Select the main subject as a pixel selection.

## Layer effects, shared

Later groups are one effect type each. `index` picks one copy where the effect can stack.

- `createSetAllLayerEffectsScaleWithObject` — Set scale-with-object on every layer effect.
- `createRemoveAllLayerEffects` — Remove every layer effect from the selection.

## Outer shadow

- `createSetOuterShadowLayerEffectBlendMode` — Set the outer shadow blend mode at `index`.
- `createDuplicateOuterShadowLayerEffect` — Duplicate an outer shadow effect at `index`.
- `createSetOuterShadowLayerEffectEnabled` — Set the outer shadow enabled state at `index`.
- `createMoveOuterShadowLayerEffect` — Move an outer-shadow effect from `fromIndex` to `toIndex`.
- `createSetOuterShadowLayerEffectOpacity` — Set the outer shadow opacity at `index`.
- `createSetOuterShadowLayerEffectRadius` — Set the outer shadow radius at `index`.
- `createRemoveOuterShadowLayerEffect` — Remove an outer shadow effect at `index`.
- `createSetOuterShadowLayerEffectScaleWithObject` — Set the outer shadow scale-with-object flag at `index`.
- `createSetOuterShadowLayerEffect` — Replace the outer shadow effect object at `index`.
- `createSetOuterShadowLayerEffectColour` — Set the outer shadow colour at `index`.
- `createSetOuterShadowLayerEffectIntensity` — Set the outer shadow intensity at `index`.
- `createSetOuterShadowLayerEffectKnocksOut` — Set whether the outer shadow knocks out. No per-effect index.
- `createSetOuterShadowLayerEffectOffsetAngle` — Set the outer shadow offset and angle at `index`.

## Inner shadow

- `createSetInnerShadowLayerEffectBlendMode` — Set the inner shadow blend mode at `index`.
- `createDuplicateInnerShadowLayerEffect` — Duplicate an inner shadow effect at `index`.
- `createSetInnerShadowLayerEffectEnabled` — Set the inner shadow enabled state at `index`.
- `createMoveInnerShadowLayerEffect` — Move an inner-shadow effect from `fromIndex` to `toIndex`.
- `createSetInnerShadowLayerEffectOpacity` — Set the inner shadow opacity at `index`.
- `createSetInnerShadowLayerEffectRadius` — Set the inner shadow radius at `index`.
- `createRemoveInnerShadowLayerEffect` — Remove an inner shadow effect at `index`.
- `createSetInnerShadowLayerEffectScaleWithObject` — Set the inner shadow scale-with-object flag at `index`.
- `createSetInnerShadowLayerEffect` — Replace the inner shadow effect object at `index`.
- `createSetInnerShadowLayerEffectColour` — Set the inner shadow colour at `index`.
- `createSetInnerShadowLayerEffectIntensity` — Set the inner shadow intensity at `index`.
- `createSetInnerShadowLayerEffectOffsetAngle` — Set the inner shadow offset and angle at `index`.

## Outer glow

- `createSetOuterGlowLayerEffectBlendMode` — Set the outer glow blend mode.
- `createDuplicateOuterGlowLayerEffect` — Duplicate an outer glow effect.
- `createSetOuterGlowLayerEffectEnabled` — Set the outer glow enabled state.
- `createSetOuterGlowLayerEffectOpacity` — Set the outer glow opacity.
- `createSetOuterGlowLayerEffectRadius` — Set the outer glow radius.
- `createRemoveOuterGlowLayerEffect` — Remove an outer glow effect.
- `createSetOuterGlowLayerEffectScaleWithObject` — Set the outer glow scale-with-object flag.
- `createSetOuterGlowLayerEffect` — Replace the outer glow effect object.
- `createSetOuterGlowLayerEffectColour` — Set the outer glow colour.
- `createSetOuterGlowLayerEffectIntensity` — Set the outer glow intensity.

## Inner glow

- `createSetInnerGlowLayerEffectBlendMode` — Set the inner glow blend mode.
- `createDuplicateInnerGlowLayerEffect` — Duplicate an inner glow effect.
- `createSetInnerGlowLayerEffectEnabled` — Set the inner glow enabled state.
- `createSetInnerGlowLayerEffectOpacity` — Set the inner glow opacity.
- `createSetInnerGlowLayerEffectRadius` — Set the inner glow radius.
- `createRemoveInnerGlowLayerEffect` — Remove an inner glow effect.
- `createSetInnerGlowLayerEffectScaleWithObject` — Set the inner glow scale-with-object flag.
- `createSetInnerGlowLayerEffect` — Replace the inner glow effect object.
- `createSetInnerGlowLayerEffectColour` — Set the inner glow colour.
- `createSetInnerGlowLayerEffectIntensity` — Set the inner glow intensity.

## Bevel and emboss

- `createSetBevelEmbossLayerEffectBlendMode` — Set the bevel and emboss blend mode.
- `createDuplicateBevelEmbossLayerEffect` — Duplicate a bevel and emboss effect.
- `createSetBevelEmbossLayerEffectEnabled` — Set the bevel and emboss enabled state.
- `createSetBevelEmbossLayerEffectOpacity` — Set the bevel and emboss opacity.
- `createSetBevelEmbossLayerEffectRadius` — Set the bevel and emboss radius.
- `createRemoveBevelEmbossLayerEffect` — Remove a bevel and emboss effect.
- `createSetBevelEmbossLayerEffectScaleWithObject` — Set the bevel and emboss scale-with-object flag.
- `createSetBevelEmbossLayerEffect` — Replace the bevel and emboss effect object.
- `createSetBevelEmbossLayerEffectHighlightColour` — Set the bevel and emboss highlight colour.
- `createSetBevelEmbossLayerEffectHighlightBlendMode` — Set the bevel and emboss highlight blend mode.
- `createSetBevelEmbossLayerEffectHighlightOpacity` — Set the bevel and emboss highlight opacity.
- `createSetBevelEmbossLayerEffectShadowColour` — Set the bevel and emboss shadow colour.
- `createSetBevelEmbossLayerEffectDirection` — Set the bevel and emboss light direction (azimuth and elevation).
- `createSetBevelEmbossLayerEffectInverted` — Set the bevel and emboss inverted flag.
- `createSetBevelEmbossLayerEffectLinkDepth` — Set the bevel and emboss link-depth flag.
- `createSetBevelEmbossLayerEffectAzimuth` — Set the bevel and emboss azimuth.
- `createSetBevelEmbossLayerEffectDepth` — Set the bevel and emboss depth.
- `createSetBevelEmbossLayerEffectElevation` — Set the bevel and emboss elevation.
- `createSetBevelEmbossLayerEffectShadowOpacity` — Set the bevel and emboss shadow opacity.
- `createSetBevelEmbossLayerEffectSoften` — Set the bevel and emboss soften amount.
- `createSetBevelEmbossLayerEffectShadowBlendMode` — Set the bevel and emboss shadow blend mode.
- `createSetBevelEmbossLayerEffectType` — Set the bevel type (`bevelType`).

## Phong bevel

- `createDuplicatePhongBevelLayerEffect` — Duplicate a Phong bevel effect.
- `createSetPhongBevelLayerEffectEnabled` — Set the Phong bevel enabled state.
- `createSetPhongBevelLayerEffectOpacity` — Set the Phong bevel opacity.
- `createSetPhongBevelLayerEffectRadius` — Set the Phong bevel radius.
- `createRemovePhongBevelLayerEffect` — Remove a Phong bevel effect.
- `createSetPhongBevelLayerEffectScaleWithObject` — Set the Phong bevel scale-with-object flag.
- `createSetPhongBevelLayerEffect` — Replace the Phong bevel effect object.
- `createSetPhongBevelLayerEffectAmbient` — Set the Phong bevel ambient level.
- `createSetPhongBevelLayerEffectAmbientColour` — Set the Phong bevel ambient colour.
- `createSetPhongBevelLayerEffectDepth` — Set the Phong bevel depth.
- `createSetPhongBevelLayerEffectDiffuse` — Set the Phong bevel diffuse level.
- `createSetPhongBevelLayerEffectLinkDepth` — Set the Phong bevel link-depth flag.
- `createSetPhongBevelLayerEffectShininess` — Set the Phong bevel shininess.
- `createSetPhongBevelLayerEffectSoften` — Set the Phong bevel soften amount.
- `createSetPhongBevelLayerEffectSpecular` — Set the Phong bevel specular level.
- `createSetPhongBevelLayerEffectSpecularColour` — Set the Phong bevel specular colour.
- `createSetPhongBevelLayerEffectLights` — Set the Phong bevel point lights.

## Outline

- `createSetOutlineLayerEffectBlendMode` — Set the outline blend mode at `index`.
- `createDuplicateOutlineLayerEffect` — Duplicate an outline effect at `index`.
- `createSetOutlineLayerEffectEnabled` — Set the outline enabled state at `index`.
- `createMoveOutlineLayerEffect` — Move an outline effect from `fromIndex` to `toIndex`.
- `createSetOutlineLayerEffectOpacity` — Set the outline opacity at `index`.
- `createSetOutlineLayerEffectRadius` — Set the outline radius at `index`.
- `createRemoveOutlineLayerEffect` — Remove an outline effect at `index`.
- `createSetOutlineLayerEffectScaleWithObject` — Set the outline scale-with-object flag at `index`.
- `createSetOutlineLayerEffect` — Replace the outline effect object at `index`.
- `createSetOutlineLayerEffectAlignment` — Set outline alignment. No per-effect index.
- `createSetOutlineLayerEffectColour` — Set the outline colour at `index`.
- `createSetOutlineLayerEffectFill` — Set the outline fill from a gradient fill. No per-effect index.
- `createSetOutlineLayerEffectFillTransform` — Set the outline fill transform from a fill descriptor. No per-effect index.
- `createSetOutlineLayerEffectFillType` — Set the outline fill type. No per-effect index.

## Colour overlay

- `createSetColourOverlayLayerEffectBlendMode` — Set the colour overlay blend mode at `index`.
- `createDuplicateColourOverlayLayerEffect` — Duplicate a colour overlay effect at `index`.
- `createSetColourOverlayLayerEffectEnabled` — Set the colour overlay enabled state at `index`.
- `createMoveColourOverlayLayerEffect` — Move a colour-overlay effect from `fromIndex` to `toIndex`.
- `createSetColourOverlayLayerEffectOpacity` — Set the colour overlay opacity at `index`.
- `createRemoveColourOverlayLayerEffect` — Remove a colour overlay effect at `index`.
- `createSetColourOverlayLayerEffectScaleWithObject` — Set the colour overlay scale-with-object flag at `index`.
- `createSetColourOverlayLayerEffect` — Replace the colour overlay effect object at `index`.
- `createSetColourOverlayLayerEffectColour` — Set the colour overlay colour at `index`.

## Gradient overlay

- `createSetGradientOverlayLayerEffectBlendMode` — Set the gradient overlay blend mode at `index`.
- `createDuplicateGradientOverlayLayerEffect` — Duplicate a gradient overlay effect at `index`.
- `createSetGradientOverlayLayerEffectEnabled` — Set the gradient overlay enabled state at `index`.
- `createMoveGradientOverlayLayerEffect` — Move a gradient-overlay effect from `fromIndex` to `toIndex`.
- `createSetGradientOverlayLayerEffectOpacity` — Set the gradient overlay opacity at `index`.
- `createRemoveGradientOverlayLayerEffect` — Remove a gradient overlay effect at `index`.
- `createSetGradientOverlayLayerEffectScaleWithObject` — Set the gradient overlay scale-with-object flag at `index`.
- `createSetGradientOverlayLayerEffect` — Replace the gradient overlay effect object at `index`.
- `createSetGradientOverlayLayerEffectFill` — Set the gradient-overlay fill. No per-effect index.
- `createSetGradientOverlayLayerEffectFillTransform` — Set the gradient-overlay fill transform from a Transform. No per-effect index.

## Layer Gaussian blur

This is the layer-effect blur. Pixel-filter blur is `createGaussianBlurFilter` and `createSetGaussianBlurFilterParameters`.

- `createSetGaussianBlurLayerEffectBlendMode` — Set the layer Gaussian blur blend mode.
- `createDuplicateGaussianBlurLayerEffect` — Duplicate a layer Gaussian blur effect.
- `createSetGaussianBlurLayerEffectEnabled` — Set the layer Gaussian blur enabled state.
- `createSetGaussianBlurLayerEffectOpacity` — Set the layer Gaussian blur opacity.
- `createSetGaussianBlurLayerEffectRadius` — Set the layer Gaussian blur radius.
- `createRemoveGaussianBlurLayerEffect` — Remove a layer Gaussian blur effect.
- `createSetGaussianBlurLayerEffectScaleWithObject` — Set the layer Gaussian blur scale-with-object flag.
- `createSetGaussianBlurLayerEffect` — Replace the layer Gaussian blur effect object.
- `createSetGaussianBlurLayerEffectPreserveAlpha` — Set the layer Gaussian blur preserve-alpha flag.
