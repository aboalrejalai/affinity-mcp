# Vector

Affinity 3.3.1. Shapes stay parametric (`ShapeNode`); converted outlines are Bézier curves (`PolyCurveNode`). Both are `VectorNode`. Snippets are the script body. Log with `console.log`. When more than one document is open, take yours from `Document.all`.

Snippets that name `doc` already ran `const { Document } = require('/document.js'); const doc = Document.current`. `node`, `rect`, `star`, `green`, and `magenta` are nodes already on that document.

Tags: **(verified)** ran in 3.3.1, **(docs)** SDK wrappers or the signature reference, **(unverified)** not established.

## Contents

- [Add a shape](#add-a-shape)
- [Add a curve](#add-a-curve)
- [Shape types and parameters](#shape-types-and-parameters)
- [Geometry](#geometry)
- [Path editing](#path-editing)
- [Boolean operations](#boolean-operations)
- [Fills](#fills)
- [Strokes and arrowheads](#strokes-and-arrowheads)
- [Layer effects](#layer-effects)
- [Transform, order, and groups](#transform-order-and-groups)
- [Image trace, guides, drawing scale](#image-trace-guides-drawing-scale)
- [SDK examples](#sdk-examples)
- [Absent from the wrapper](#absent-from-the-wrapper)

## Add a shape

`ShapeNodeDefinition.create(shape, rectangle, brushFill, lineFill, lineStyle, transparencyFill)`. `brushFill` and `lineFill` take a `Colour` or a `FillDescriptor`. `lineStyle` is a `LineStyleDescriptor`. The rectangle is the shape's box in document units. A further transform goes on `def.transform` **(docs)**.

```js
const { Document } = require('/document.js');
const { ShapeRectangle, ShapeEllipse, ShapeStar } = require('/shapes.js');
const { ShapeNodeDefinition } = require('/nodes.js');
const { Rectangle } = require('/geometry.js');
const { FillDescriptor, BlendMode } = require('/fills.js');
const { RGBA8 } = require('/colours.js');
const { LineStyleDescriptor } = require('/linestyle.js');

const doc = Document.current;
function addShape(shape, x, y, w, h, fill, stroke, weight) {
    doc.addNode(ShapeNodeDefinition.create(
        shape,
        new Rectangle(x, y, w, h),
        FillDescriptor.createSolid(fill, BlendMode.Normal),
        stroke ? FillDescriptor.createSolid(stroke, BlendMode.Normal) : null,
        weight ? LineStyleDescriptor.createDefault(weight) : null,
        null
    ));
}
const star = ShapeStar.create();
star.points = 5;
star.innerRadius = 0.42;
addShape(ShapeRectangle.create(), 40, 40, 280, 200, RGBA8(220, 40, 40), RGBA8(20, 20, 20), 8);
addShape(ShapeEllipse.create(), 360, 40, 260, 200, RGBA8(40, 90, 220), RGBA8(255, 255, 255), 12);
addShape(star, 680, 20, 220, 220, RGBA8(240, 190, 30), RGBA8(90, 40, 0), 6);
```

Rectangle, ellipse, and star render with those fills and strokes **(verified)**. A white stroke on a white canvas is accepted and invisible **(verified)**. A zero-width or zero-height rectangle is rejected **(docs)**.

`doc.addNode` inserts relative to the current selection **(verified)**. `doc.layers` is bottom-first **(verified)**.

For several nodes in one command, or to choose where they land, use `AddChildNodesCommandBuilder` (`addNode`, `addShapeNode`, `addPolyCurveNode`, `addContainerNode`) then `createCommand(andSelect = true, childListType)` with `NodeChildType.Main` **(docs)**. `setInsertionTarget(node)` and `setInsertionMode(InsertionMode)`: `Default`, `Inside_AtBack`, `Inside_AtFront`, `Behind`, `Top` **(verified)**.

`Shape.create(ShapeType.Rectangle)` returns the specialised class (`ShapeRectangle`, …) **(docs)**. `PolyCurveNodeDefinition.create(polyCurve, brushFill, lineFill, lineStyle, transparencyFill)` and `createDefault()` **(docs)**. The first argument is a `PolyCurve`. That argument order is the wrapper order (brush fill, then line fill, then line style). The native signature lists line style before line fill; call the wrapper order **(docs)**.

## Add a curve

```js
const { Document } = require('/document.js');
const { AddChildNodesCommandBuilder, NodeChildType } = require('/commands.js');
const { CurveBuilder, PolyCurve } = require('/geometry.js');
const { PolyCurveNodeDefinition } = require('/nodes.js');
const { RGBA8 } = require('/colours.js');

const doc = Document.current;
const curve = CurveBuilder.create()
    .beginXY(0, 0)
    .lineToXY(200, 0)
    .bulgeToXY(200, 120, 0.5)
    .addBezierXY(160, 180, 40, 180, 0, 120)
    .close()
    .createCurve();
const poly = PolyCurve.create();
poly.addCurve(curve);
const builder = AddChildNodesCommandBuilder.create();
builder.addPolyCurveNode(PolyCurveNodeDefinition.create(poly, RGBA8(20, 20, 20), null, null, null));
doc.executeCommand(builder.createCommand(true, NodeChildType.Main));
```

**(docs)** for this path. `CurveBuilder`: `begin`/`beginXY`, `lineTo`/`lineToXY`, `lineRelative`/`lineRelativeXY`, `bulgeTo`/`bulgeRelative` and `XY` forms, `versineTo`/`versineRelative` and `XY` forms, `addArc(startAngle, endAngle, radius, reverse)`, `addEllipse(startAngle, endAngle, majorRadius, minorRadius, rotation, reverse)`, `addBezier`/`addBezierXY`, `setCorner(pointID, cornerData, force)`, `close`, `createCurve`, `transform`/`translate`/`rotate`/`scale`.

Text bound to vector geometry **(docs)** — typography is in `text-layout.md`:

- `CurvePathTextNodeDefinition.createFromStoryBuilder(polyCurve, storyBuilder)`
- `PolyCurveTextNodeDefinition.createFromStoryBuilder(polyCurve, storyBuilder)`
- `ShapePathTextNodeDefinition.createFromStoryBuilder(shape, bounds, storyBuilder)`
- `ShapeTextNodeDefinition.createFromStoryBuilder(shape, bounds, storyBuilder)`

## Shape types and parameters

Defaults below were read by `Shape.create` in memory **(verified)**. Angles are radians. Lengths are fractions of the box (`0..1`) while `absoluteSizes === false` **(docs)**. `param_ranges` publishes no maximum for shape parameters **(docs)**.

| ShapeType | Class | Writable | Default |
|---|---|---|---|
| `Rectangle` | `ShapeRectangle` | corners, `useSingleRadius`, `setAbsoluteSizes(value, width, height)` | radius `0.25`, corner `None`, single radius, relative sizes, `isPlainRectangle === false` |
| `Ellipse` | `ShapeEllipse` | none | — |
| `Triangle` | `ShapeTriangle` | `position` | `0.5` |
| `Diamond` | `ShapeDiamond` | `position` | `0.5` |
| `Trapezoid` | `ShapeTrapezoid` | `left`, `right`, or `setPositions` | `0.25` / `0.75` |
| `Polygon` | `ShapePolygon` | `sides`, `curve`, `smoothPoints` | 5 sides, `curve = 0`, not smooth. `minCurve` is read-only (`-1`) |
| `Star` | `ShapeStar` | `points`, `innerRadius`, `leftCurve`, `rightCurve`, `circleInnerRadius`, `circleOuterRadius`, `curvedEdges` | 5 points, `innerRadius ≈ 0.382`, curves `0`. `maxInnerRadius ≈ 0.809` is read-only |
| `DoubleStar` | `ShapeDoubleStar` | `points`, `innerRadius`, `pointRadius` | 5, `≈ 0.526`, `≈ 0.809` |
| `Arrow` | `ShapeArrow` | `thickness`; each end `style`, `setLength`, `setInnerOffset`, `setIsProportional` | thickness `≈ 0.35`, both ends `Arrow`, length `0.5`, offset `0`, proportional |
| `Pie` | `ShapePie` | `innerRadius`, `startAngle`, `endAngle`, `sweep`, `closePie()` | inner `0`, start `π/2`, end `0`, sweep `3π/2`, open. `isClosed` is read-only |
| `Cog` | `ShapeCog` | `teeth`, `innerRadius`, `holeRadius`, `toothSize`, `notchSize`, `curvature` | 12, `0.85`, `0.2`, `0.37`, `0.42`, `0` |
| `Cloud` | `ShapeCloud` | `bubbles`, `innerRadius` | 12, `≈ 0.816` |
| `CalloutRectangle` | `ShapeCalloutRectangle` | `setCornerRadius(cornerIndex, radius, boundsWidth, boundsHeight)`, `useSingleRadius`, `setAbsoluteSizes(value, width, height)`; tail `startPosition`, `endPosition`, `width`, `height` | single radius, tail `0.4 / 0.2 / 0.15 / 0.3` |
| `CalloutEllipse` | `ShapeCalloutEllipse` | `setAbsoluteSizes(value, boundsWidth, boundsHeight)`; tail `angle`, `endPosition`, `height` | angle `≈ 0.349` rad, end `0.15`, height `0.2` |
| `Crescent` | `ShapeCrescent` | `leftArc`, `rightArc` | `-1` / `-0.3` |
| `Segment` | `ShapeSegment` | `angle`, `lowerLine`, `upperLine` | `π/2`, `0.25`, `1` |
| `SquareStar` | `ShapeSquareStar` | `sides`, `cutout` | 5, `0.5` |
| `Tear` | `ShapeTear` | `curve`, `bend`, `tailPosition`; ball `size`, `fixedSize` | curve `0.3`, bend `0`, tail `0.5`, size `0.25`, not fixed |
| `Heart` | `ShapeHeart` | `spread` | `0.2` |
| `Cat` `Cat2` `Cat3` `Cat4` | same class names | none | `Shape.getTypeDisplayName` is `Cat` for all four |
| `QRCode` | `ShapeQRCode` | `payload` | `https://affinity.studio` |
| `Spiral` | `ShapeSpiral` | see below | `SegmentedLinear`, 5 turns, `decay = 0.5`, `divisions = 12`, segment angle `π/2`, `choke = 0.01`, `capChoke = true` |
| `Style` | — | no extra properties | `Shape.create` succeeds. What it draws is undocumented **(unverified)** |

There is no `corner.radius = …`. Write `rect.topLeft.setRadius(value, width, height)` or `rect.setTopLeft({ radius, cornerType }, width, height)`. `setAbsoluteSizes` also takes the box width and height **(docs)**.

`ShapeCornerType` **(verified):** `Round`, `Straight`, `RoundInverse`, `Cutout`, `None`. `ShapeCornerIndex` **(verified):** `TopLeft`, `TopRight`, `BottomRight`, `BottomLeft`. Path corners use `CurveCornerType` (`Inverse`, `CutOut`), under Geometry.

`ShapeArrowEndStyle` **(docs):** `None`, `Arrow`, `TailTriangular`, `TailSquare`, `Circle`, `HalfCircleInner`, `HalfCircleOuter`, `Diamond`, `Box`, `Barb`, `Chevron`. `style` is assigned directly. `setLength`, `setInnerOffset`, and `setIsProportional` also take `width, height` **(docs)**.

### Spiral

Writable on `ShapeSpiral`: `style`, `flip`, `turns`, `partTurn`, `decay`, `segmentAngle`, `divisions`, `innerRadius`, `decayPerSegment`, `cusped`, `choke`, `capChoke`, `bias` **(docs)**. `ShapeSpiralStyle`: `SemiCircle`, `CounterSemiCircle`, `Fibonacci`, `SegmentedLogarithmic`, `SegmentedLinear`, `Plotted` **(docs)**. These properties are absent from `ShapeFloatParam`, `ShapeIntParam`, and `ShapeBoolParam` **(verified)**. Edit an existing spiral with `doc.setShape(spiral, node)` **(docs)**.

### QR code

`QRPayloadType` **(verified):** `Text`, `URL`, `Phone`, `SMS`, `Email`, `WhatsApp`, `FaceTime`, `Location`, `Wifi`, `VEvent`, `VCard`, `DataMerge`. `WifiEncryptionType` **(verified):** `None`, `WEP`, `WPA_WPA2`.

`QRPayload.parse(string)` and `QRPayload.create(type)` **(docs)**. Then: `QRPayloadURL.url`, `QRPayloadText.text`, `QRPayloadEmail` (`address`, `subject`, `body`), `QRPayloadPhone.number`, `QRPayloadSMS` (`number`, `content`), `QRPayloadLocation` (`latitude`, `longitude`, `elevation`), `QRPayloadWifi` (`ssid`, `password`, `encryption`, `hidden`), `QRPayloadFaceTime.recipient`, `QRPayloadWhatsApp`, `QRPayloadVCard` (name, company, address, email, website — read the property names in `/shapes.js` before assigning). `VEvent` and `DataMerge` have enum keys and no JS class in the wrapper **(docs)**.

### Change a shape that is already on the canvas

```js
const { ShapeStar, ShapeIntParam, ShapeFloatParam } = require('/shapes.js');
const node = doc.selection.nodes.first;
const star = ShapeStar.create();
star.points = 8;
star.innerRadius = 0.45;
doc.setShape(star, node, { allowReplaceLikeShapes: true });
doc.setShapeIntParam(ShapeIntParam.Star_PointCount, 7, node);
doc.setShapeFloatParam(ShapeFloatParam.Star_InnerRadius, 0.3, node, { constrained: false, symmetrical: false });
```

**(docs)**. `setShape` passes only `allowReplaceLikeShapes`. `setShapeFloatParam` also passes `options.constrained` and `options.symmetrical`; what those two do is **(unverified)**. Same family: `setShapeBoolParam`, `setShapeEnumParam`. `node.shapeInterface.setShape(shape)` is the same call from the node. Read `node.shape`, `node.shapeType`, `node.shapeBoundingBox`. `Shape.getCurves(bounds, transform)` and `getTransformedBounds(bounds, xf)` turn the parametric shape into geometry. `ShapeMajorAxis`: `Y`, `X`.

`ShapeFloatParam` **(verified):** `Arrow_LeftLength`, `Arrow_LeftInnerOffset`, `Arrow_RightLength`, `Arrow_RightInnerOffset`, `Arrow_Thickness`, `CalloutEllipse_TailAngle`, `CalloutEllipse_TailEndPosition`, `CalloutEllipse_TailHeight`, `CalloutRectangle_BottomLeftRadius`, `CalloutRectangle_BottomRightRadius`, `CalloutRectangle_TopLeftRadius`, `CalloutRectangle_TopRightRadius`, `CalloutRectangle_TailEndPosition`, `CalloutRectangle_TailHeight`, `CalloutRectangle_TailPosition`, `CalloutRectangle_TailWidth`, `Cloud_InnerRadius`, `Cog_Curve`, `Cog_HoleRadius`, `Cog_InnerRadius`, `Cog_NotchSize`, `Cog_ToothSize`, `Crescent_ArcLeft`, `Crescent_ArcRight`, `Diamond_Position`, `DoubleStar_InnerRadius`, `DoubleStar_PointRadius`, `Heart_Spread`, `Pie_InnerRadius`, `Pie_StartAngle`, `Pie_EndAngle`, `Pie_Sweep`, `Polygon_Curve`, `Rectangle_BottomLeftRadius`, `Rectangle_BottomRightRadius`, `Rectangle_TopLeftRadius`, `Rectangle_TopRightRadius`, `Segment_Angle`, `Segment_LowerLine`, `Segment_UpperLine`, `SquareStar_Cutout`, `Star_CircleOuterRadius`, `Star_CircleInnerRadius`, `Star_InnerRadius`, `Star_LeftCurve`, `Star_RightCurve`, `Trapezoid_LeftPosition`, `Trapezoid_RightPosition`, `Triangle_Position`, `Tear_BallSize`, `Tear_Curve`, `Tear_Bend`, `Tear_TailPosition`.

`ShapeIntParam` **(verified):** `Cloud_BubbleCount`, `Cog_ToothCount`, `DoubleStar_PointCount`, `Polygon_SideCount`, `SquareStar_SideCount`, `Star_PointCount`.

`ShapeBoolParam` **(verified):** `Arrow_LeftIsProportional`, `Arrow_RightIsProportional`, `CalloutEllipse_AbsoluteSizes`, `CalloutRectangle_SingleRadius`, `CalloutRectangle_AbsoluteSizes`, `Polygon_SmoothPoints`, `Rectangle_SingleRadius`, `Tear_FixedBallSize`.

`ShapeEnumParam` **(docs):** `Rectangle_BottomLeftCornerType`, `Rectangle_BottomRightCornerType`, `Rectangle_TopLeftCornerType`, `Rectangle_TopRightCornerType`, `Arrow_LeftEndStyle`, `Arrow_RightEndStyle`.

## Geometry

Require `/geometry.js`. Fields below are the live objects **(verified)**.

| Type | Create | Use |
|---|---|---|
| `Point` | `new Point(x, y)` | `x`, `y`, `distance`, `interpolate`, `transform`, `vectorTo`. `Point.zero` |
| `Vector` | `new Vector(x, y)` | `dot`, `cross`, `normalise`, `rotate`, `length`, `angle` (radians), `angleDeg` |
| `Rectangle` | `new Rectangle(x, y, width, height)` | `centre`, `topLeft` … `bottomRight`, `area`, `offset`, `moveTo`, `centreOn` |
| `Size` | `new Size(width, height)` | `width`, `height` |
| `Transform` | `new Transform()` identity, or `new Transform(a, b, tx, c, d, ty)` | `data` length 6: `[a, b, tx, c, d, ty]`. `xAxis = (a, c)`, `yAxis = (b, d)`, `origin = (tx, ty)` |

`translate`, `rotate`, and `scale` mutate the instance and return `this` **(verified)**. `shear` and `invert` do the same **(docs)**. Copies that leave the original alone: `translated`, `rotated`, `scaled`, `clone` **(docs)**. `around(x, y)` moves the pivot. `about` is the old name and warns **(docs)**. `decompose()` returns `TransformData`. Helpers: `unionRects`, `intersectRects`, `rectsIntersect`, `pointInRect` **(docs)**.

`new BoundingBox()` throws `InvalidArgs` **(verified)**. Take the box from `curve.getBoundingBox()` and the other getters **(docs)**.

`Curve.createLine`, `createLineXY`, `createRectangle(rc)`, `createEllipse(rc)`, `createDiamond(rc)`, `createLozenge`, `createPrecisionUnitCircle` **(docs)**. Read: `pointCount`, `length`, `isClosed`, `isClockwise`, `isEmpty`, `isRectangle`, `isEllipse`, `isStraightLine`, `isPolyline` (and `*Tolerance` forms), `getPoint`/`setPoint`/`setPointXY`, `getCubicBezier`, `beziers`, `nodes`, `getCorner`/`setCorner`, `cut(isParametric, distance)`, `makeClosed`, `generatePolygon(tolerance)`, `getBoundingBox(transform)`.

`CubicBezier`: `start`, `c1`, `c2`, `end`, `evaluate(t)`, `split(t)`, `getTangent`, `getNormal`, `getCurvature`, `getParamAtLength`. `t` is `[0, 1]` **(docs)**.

A new `CurveNode` is `type = OnCurve`, `style = Cusp`, `position = (0, 0)` **(verified)**. `CurveNodeType`: `OnCurve`, `Cubic1`, `Cubic2`. `CurveNodeStyle`: `None`, `Cusp`, `Smooth`, `Smart`. `CurveCornerType`: `None`, `Round`, `Inverse`, `Straight`, `CutOut` **(verified)**. `new CurveCornerData()` with no arguments throws `InvalidArgs` **(verified)**. Its fields are **(unverified)**.

`PolyCurve`: `addCurve`, `curveCount`, `at(i)`, `curves`, `clear`, `removeEmptyCurves`, `transform`, `getApproxBoundingBox`, `getExactBoundingBox`, `getControlBoundingBox` **(docs)**.

`PolyPolyCurve`: several `PolyCurve`s, each with a transform. `containsPoint(point, allowUnclosed, windingOrder, performBoundsCheck)`, `intersectsRectangle`, `isNearPoint`, `isNearRectangle`, `addRectangle`, `addPolyCurve`, `addPolyPolyCurve`. `WindingOrder`: `OddEven`, `NonZero` **(docs)**.

`Polygon` is the straight-segment polygon, a different type from `ShapePolygon`: `createLine`, `createTriangle`, `createRectangle`, `addPoint`, `insertPoint`, `close`, `reverse` **(docs)**.

`Spline.create()`, `createFromProfile(SplineProfile)`, `createFromPoints(points)`. `SplineProfile`: `Linear`, `SCurve`, `SmoothIn`, `SmoothOut`, `Squared`, `SquareRoot`. `insertPoint`, `replaceOrInsertPoint`, `findPoint`, `removePoint`, `isLinear`. Used as a brush pressure curve and as a bevel profile **(docs)**.

`Mesh`: `size` (`MeshSize`), `getNodePosition`/`setNodePosition`, `getNodeStyle`/`setNodeStyle`, `insertSpline(isVertical, index, param)`, `deleteSpline`, `getCurveNodePosition`/`setCurveNodePosition` with `MeshDirection`: `Left`, `Right`, `Up`, `Down` **(docs)**.

## Path editing

On the whole selection **(docs)**:

```js
const doc = Document.current;
const sel = doc.selection;
doc.convertToCurves(sel);
doc.smoothCurves(sel);
doc.breakCurves(sel);
doc.joinCurves(sel, false);
doc.reverseCurves(sel);
doc.mergeCurves(sel);
doc.separateCurves(sel);
```

`joinCurves(selection, isJoinStraight, preview)`: `true` joins with a straight segment. The command default is `false`.

These exist on `DocumentCommand` and run through `doc.executeCommand` **(docs)**:

| Command | Signature |
|---|---|
| `createSetCurves` | `(curvesInterface, polyCurve)` replaces a `PolyCurveNode` |
| `createAddCurve` | `(curvesInterface, curve, select, preserveExistingSubSelection)` |
| `createAddCurveNode` | `(curvesInterface, curveHandle, parametricDistance)` |
| `createSplitCurve` | `(selection, parametricDistance)` |
| `createKnifeCut` | `(cutCurve, selection)` |
| `createScissorCut` | `(node, polyCurveIndex, curveIndex, isParametric, distance)` |
| `createSetWindingMode` | `(selection, windingOrder)` — no `doc.setWindingMode` |
| `createSetCurveNodeStyle` | `(selection, style)` — wrapper `doc.setCurveNodeStyle` |
| `createDeleteCurveNodes` | `(selection)` — wrapper `doc.deleteCurveNodes` |

```js
const { DocumentCommand } = require('/commands.js');
const { Curve, PolyCurve, Rectangle, CurveNodeStyle } = require('/geometry.js');
const { CurveNodeSubSelection, CurveNodeSubSelectionItem, Selection } = require('/selections.js');

const node = doc.selection.nodes.first;
const poly = PolyCurve.create();
poly.addCurve(Curve.createRectangle(new Rectangle(0, 0, 100, 80)));
doc.executeCommand(DocumentCommand.createSetCurves(node.curvesInterface, poly));
const sub = CurveNodeSubSelection.create([new CurveNodeSubSelectionItem()]);
const sel = Selection.createEmpty(doc);
sel.addSubSelectionForNode(node, sub);
doc.setCurveNodeStyle(CurveNodeStyle.Smooth, sel);
```

**(docs)**. `new CurveNodeSubSelectionItem()` then set fields. `curveID` and `nodeID` default to `0, 0` **(verified)**. `CurveEdgeSubSelectionItem` has `curveID` and `edgeID` **(docs)**. Whether `nodeID` equals the index in `curve.nodes` is **(unverified)**.

`CurvesInterface` reads: `polyCurve`, `corneredPolyCurve`, `polyPolyCurves`, `windingOrder`, `isMutable`, `getSubSelectionCount(SubSelectionType)`, `getSubSelection`. Path-related `SubSelectionType`: `CurveEdge`, `CurveNode`, `Fill`, `LineFill`, `Transparency`, `FillMesh`, `LineFillMesh`, `TransparencyMesh`, `GeometryModifier`, `FillDiffusion` **(docs)**.

`VectorNode` also exposes `brushFillInterface` / `brushFillDescriptor`, `lineStyleInterface` / `lineStyle` / `penFillDescriptor`, `transparencyInterface` / `transparencyFillDescriptor`, `curvesInterface` / `polyCurve` (computed even on shapes), `compoundOperation` (read-only), `pictureFrameInterface` / `pictureFrameEnabled` **(docs)**. `ShapeNode` adds `shapeInterface` and `isArtboardEnabled`. Before insert, `VectorNodeDefinition` can `add`/`insert`/`set`/`remove` brush-fill descriptors, the same for line descriptors, `setTransparencyDescriptor`, and `setPictureFrameEnabled`, and it can set `currentBrushFillIndex` / `currentLineDescriptorsIndex` **(docs)**.

## Boolean operations

`CompoundOperation` **(verified):** `Union`, `Intersect`, `Subtract`, `Xor`. The two nodes must be siblings. Pass `Selection.create(doc, [a, b])` from `/selections.js`.

```js
const { Selection } = require('/selections.js');
doc.boolOpUnion(Selection.create(doc, [doc.layers.at(0), doc.layers.at(1)]));
```

Two overlapping sibling ellipses, green `RGBA8(0, 170, 90)` and red `RGBA8(190, 30, 90)`, became one `PolyCurveNode` painted green **(verified)**. `boolOpSubtract`, `boolOpIntersect`, `boolOpXor`, and `divideShapes` are on `Document` **(docs)**. `divideShapes` is separate from `CompoundOperation`. Read `node.compoundOperation` afterwards. The wrapper has no `setCompoundOperation`. Which operand `boolOpSubtract` removes is **(unverified)**.

## Fills

`FillType` **(verified):** `Unknown`, `None`, `Solid`, `Gradient`, `Bitmap`, `Mesh`, `Hatch`, `Diffusion`.

`makeFillDescriptor(null)` is no fill. A `Colour` or `SolidFill` becomes a solid `FillDescriptor`. Anything else is returned unchanged, so it must already be a `FillDescriptor` **(docs)**. Shared `Fill` fields `alpha`, `intensity`, `noise`, `tint` are `[0, 1]` on `ColourApi`. `RGBA8` alpha is `0..255`; `RGBAuf` alpha is `0..1` **(docs)**.

`BlendMode` **(verified):** `Normal`, `Pigment`, `Darken`, `DarkerColour`, `Multiply`, `ColourBurn`, `LinearBurn`, `Lighten`, `LighterColour`, `Screen`, `ColourDodge`, `Add`, `Overlay`, `SoftLight`, `HardLight`, `VividLight`, `PinLight`, `LinearLight`, `HardMix`, `Difference`, `Exclusion`, `Subtract`, `Divide`, `Hue`, `Saturation`, `Luminosity`, `Colour`, `Average`, `Negation`, `Reflect`, `Glow`, `ContrastInvert`, `Erase`. Import it from `/fills.js` (the shape recipe did) or from `affinity:common` **(docs)**.

### Solid

```js
const { RGBA8, SVG11 } = require('/colours.js');
const { FillDescriptor, BlendMode } = require('/fills.js');

doc.setBrushFillDescriptor(RGBA8(220, 40, 40), node);
doc.setPenFillDescriptor(FillDescriptor.createSolid(SVG11.black, BlendMode.Normal), node);
doc.setTransparencyFillDescriptor(RGBA8(0, 0, 0, 128), node);
```

**(docs)**. Fill-command options: `contentType` (default `ContentType.Main`), `fillMask` (default `FillMask.All`; also `None`, `Alpha`, `Noise`, `Intensity`), `copyTransform` (default `true`), `useTextSelection`, `maintainBlendMode`, `restoreAspectRatio`.

`node.brushFillInterface.descriptorCount` and `getDescriptor(index)` are the fill stack. `currentIndex` is read-only. The current index is chosen with `VectorNodeDefinition.currentBrushFillIndex` before insert; the wrapper has no later switch **(docs)**. `TransparencyInterface` is one descriptor, not a list **(docs)**.

Pin a fill to the page **(docs)**:

```js
node.brushFillInterface.isAnchoredToSpread = true;
doc.setPenFillIsAnchoredToSpread(true, node, { applyToAllFills: true });
doc.setTransparencyFillIsAnchoredToSpread(false, node);
```

### Gradient

`GradientFillType` **(verified):** `Linear`, `Elliptical`, `Radial`, `Conical`. Only `Linear` was painted.

An identity `new Transform()` with `scaleWithObject: true` paints as a solid **(verified)**. Map the gradient's unit square onto the box, with `scaleWithObject` false and `anchoredToSpread` true:

```js
const { GradientFill, GradientFillType, FillDescriptor, BlendMode } = require('/fills.js');
const { Gradient, RGBA8 } = require('/colours.js');
const { Transform } = require('/geometry.js');

const box = node.baseBoxInterface.baseBox;
const gradient = Gradient.create([
    { colour: RGBA8(255, 90, 0), position: 0, midpoint: 0.5 },
    { colour: RGBA8(20, 40, 200), position: 1, midpoint: 0.5 }
]);
const gfill = GradientFill.create(gradient, GradientFillType.Linear);
const xf = Transform.createTranslate(box.x, box.y).multiply(Transform.createScale(box.width, box.height));
doc.setBrushFillDescriptor(FillDescriptor.create(gfill, false, xf, BlendMode.Normal, true), node);
```

That orange-to-blue linear gradient rendered left to right **(verified)**. `FillDescriptor.create(fill, scaleWithObject, transform, blendMode, anchoredToSpread)`. After a transform, `baseBox` stays at the pre-transform box **(verified)** — map from `spreadBaseBox` when the node has moved.

`Gradient.create()` with no arguments is the default two stops. `stops` is read-only; build a new `Gradient` to change them. `ColourStop` `position`, `midpoint`, and `smoothness` are `[0, 1]`; a missing `midpoint` becomes `0.5`. `gradient.alpha` / `noise` / `intensity` / `tint` are `[0, 1]` **(docs)**. `cloneWithNewTransform`, `cloneWithNewIsAnchoredToSpread`, `cloneWithNewIsScaleWithObject` **(docs)**.

### Bitmap, mesh, diffusion

`BitmapFill.create(bitmap, extendType, resamplerType, ignoreAlpha)`. `bitmap` is a `RasterObject`. `fills.js` has no file loader. The shortest path from a Desktop file to a `RasterObject` is **(unverified)**. `RasterExtendType`: `Zero`, `Repeat`, `Wrap`, `Mirror`. `RasterResamplerType`: `Default`, `BilinearMipmap`, `NearestNeighbourMipmap`, `NearestNeighbour`, `Bilinear`, `Bicubic`, `SeparableLanczos3`, `NonseparableLanczos3`, `AntialiasedNearestNeighbourMipmap`, `Mitchell` **(docs)**.

`ColourMesh.createFromColour(colour, size)`, `createFromGradient(gradient, isRadial)`, `createDefaultWhite`, `createDefaultNone`. `setNodeColour(x, y, colour)` then `MeshFill.create(mesh)`. A 15×15 bubble mesh with `MeshDirection` tangents is `examples/meshBubble.js` **(docs)**.

`DiffusionFill.create(curveSet)`. `DiffusionCurveSet.createDefault(colourA, colourB)` then `addCurve(points, left, right)`, `addEllipse`, `addArc`, or `addLine`. `DiffusionCurveKind`: `Bezier`, `Ellipse`, `Arc`, `Line`. `DiffusionCurveSide`: `Left`, `Right`. Per curve: `setCurveBlur` `[0, 1]`, `setCurveStrength` `[0, 2]`, `setCurvePressure(index, curve)`, and `setCurveNodeSmooth` on Bézier curves only. Setting explicit points on a parametric curve turns it into a Bézier chain. `backgroundStrength` is `[0, 1]` **(docs)**.

### Hatch

```js
const { HatchPattern } = require('/hatch.js');
const { HatchFill, FillDescriptor } = require('/fills.js');
const { UnitType } = require('/units.js');
const { RGBA8 } = require('/colours.js');
const { Transform } = require('/geometry.js');

const pattern = HatchPattern.createEmpty();
pattern.appendHatchLineData({ x: 0, y: 0 }, Math.PI / 4, 12, [4, 2]);
const fill = HatchFill.create(pattern, UnitType.Pixel, RGBA8(0, 0, 0), RGBA8(255, 255, 255), 1);
doc.setBrushFillDescriptor(FillDescriptor.create(fill, true, new Transform(), undefined, false), node);
```

**(docs)**. `HatchLine.create(origin, rotation, step, pattern)`: `pattern` is a dash array, and `null` is a solid line (`isSolid`). `HatchPattern.createDefault()` / `createEmpty()`, then `appendHatchLine`, `insertHatchLine`, `eraseHatchLine`, `clearHatchLines`. `HatchFill.create(pattern, units, penColour, brushColour = null, lineWeight = 1)`. Those fields are writable on the fill.

Edit a hatch that is already applied with the `Document` wrappers. Pen order is `setPenHatchFillAttributes(attr, selection, options)`. Brush order is `setBrushHatchFillAttributes(selection, attr, options)`. Keys in `attr`, and omitted keys stay as they are: `pattern`, `penColour`, `brushColour`, `scale`, `rotation`, `lineWeight`, `fixScale`, `useRelativeTransform`, `useCurrentItemOriginForRelativeTransform`. `options`: `applyToAllFills`, `contentType`, `useTextSelection`. `setTransparencyHatchFillAttributes` takes the same kind of arguments. Only the pen and brush orders are specified.

## Strokes and arrowheads

Weight is in pixels. `node.lineWeightPts` converts with `72 / dpi`. Stroke colour is `penFillDescriptor`. `LineStyle` holds weight, cap, join, dash, and arrows. `node.lineStyleInterface.descriptorCount` is the stroke stack **(docs)**.

```js
const { LineStyle, LineStyleDescriptor, LineCap, LineJoin, LineType, StrokeAlignment, ArrowHead, ArrowHeadStyle } = require('/linestyle.js');

const style = LineStyle.create({
    cap: LineCap.Round,
    join: LineJoin.Miter,
    type: LineType.Dash,
    weight: 4,
    miterLimit: 4,
    dashPhase: 0,
    dashPattern: [8, 4, 2, 4],
    balancedDashes: true
});
const arrow = ArrowHead.create(ArrowHeadStyle.Triangle, { scaleX: 1.5, scaleY: 1.5, solidLine: true });
const descriptor = LineStyleDescriptor.create(style, {
    frontArrow: arrow,
    backArrow: null,
    strokeAlignment: StrokeAlignment.Centre
});
doc.setLineStyleDescriptor(descriptor, node);
```

**(docs)** for the call. Enum values **(verified)**:

| Enum | Values |
|---|---|
| `LineCap` | `Butt`, `Square`, `Round` |
| `LineJoin` | `MiterLegacy`, `Miter`, `Round`, `Bevel` |
| `LineType` | `None`, `Solid`, `Dash`, `Texture` |
| `StrokeAlignment` | `Centre`, `Inside`, `Outside` — also exported from `/layereffects.js` |
| `ArrowHeadStyle` | `Triangle`, `TriangleTall`, `TriangleWide`, `Curved`, `Barbed`, `Simple`, `SimpleTall`, `SimpleWide`, `SimpleClosed`, `SimpleClosedTall`, `SimpleClosedWide`, `Circle`, `CircleSolid`, `Square`, `SquareSolid`, `Bar`, `Oblique`, `Oblique_Alternate`, `Origin`, `Origin_Alternate`, `Datum_60_Blank`, `Datum_60_Filled`, `Datum_45_Blank`, `Datum_45_Filled`, `Affinity` |

`LineStyle.createDefault()` and `createDefaultWithWeight(weight)`. `LineStyleDescriptor.createDefault(weight)` is what the shape recipe used **(verified)**. `miterLimit` is `[1, 100]`. Arrow `scaleX` / `scaleY` are `[0.25, 5]` **(docs)**. `ArrowHead.create(style, { internalAnchor, externalAnchor, solidLine, scaleX, scaleY })`. `isFilled` and `isOutlined` are read-only. Pass `null` through `descriptor.cloneWithNewArrowHeads(front, back)` to clear a head (`examples/arrowheads.js`) **(docs)**.

`LineStyleDescriptor.create(lineStyle, { frontArrow, backArrow, pressure, isBehind, isScale, strokeAlignment })`. `pressure` is a `Curve`. How those points are interpreted is **(unverified)**. `isBehind` paints the stroke behind the fill. `isScale` scales the stroke with the object. `effectiveWeight(localTransform, worldTransform)` is read-only **(docs)**.

Single-field wrappers pass a `LineStyleMask`, so they leave the other fields alone: `doc.setLineWeight`, `setLineWeightPts`, `setLineCap`, `setLineJoin`, `setLineType`, `setDashPattern`, `setDashPhase`, `setBalancedDashes`, `setStrokeAlignment`. `LineStyleMask` **(verified):** `Type`, `ScaledWeight`, `Brush`, `Cap`, `Join`, `Miter`, `DashPattern`, `DashPhase`, `Weight`, `BalancedDashes`, `Order`, `Scale`, `ArrowHeadFront`, `ArrowHeadBack`, `ArrowHeadPlacement`, `ArrowHeadFrontScale`, `ArrowHeadBackScale`, `Pressure`, `All`. `setLineStyle` without a mask can replace the whole style **(docs)**. `LineCommandDefaultsMode`: `None`, `Line`, `Brush`, `ArtText`, `FrameText` **(docs)**.

### Vector brushes

`VectorBrush.createDefault()` and `PathBrush.createDefault()` throw `not yet implemented in C++ API` **(verified)**. Those files have no other factory. Clone a brush that is already on a stroke: `lineStyle.pathBrush.clone()`, then `LineStyle.create({ pathBrush })` or `lineStyle.pathBrush = brush` **(docs)**. Brush fields: `brushWidth`, `sizeVariance`, `sizeControllerType`, `sizeSpline` (`Spline`), `opacityVariance`, `tailOffset`, `headOffset`, `isRepeat`, `cornerStrategy`. `CornerStrategy` **(verified):** `Pull`, `Fold`, `Overlap`. `PathBrushDynamicControllerType` **(docs):** `None`, `Pressure`, `Velocity`, `VelocityInverse`.

`vectorbrush.js` re-exports `VectorBrushDynamicControllerType`, and that name is not a key of `affinity:brushes`. Require the real enum **(verified)**:

```js
const { BrushDynamicControllerType } = require('affinity:brushes');
```

`BrushDynamicControllerType`: `None`, `Random`, `Pressure`, `Angle`, `Tilt`, `Rotation`, `Cyclic`, `Velocity`, `VelocityInverse`, `Direction`, `Wheel`, `Distance`.

## Layer effects

`LayerEffectType` **(verified):** `BevelEmboss`, `Outline`, `PhongBevel`, `InnerShadow`, `InnerGlow`, `ColourOverlay`, `GradientOverlay`, `OuterGlow`, `OuterShadow`, `GaussianBlur`. This is a layer effect. It is separate from the destructive `GaussianBlurFilter`.

Build the effect, set its fields, and pass the whole object. `enableIfDisabled` on the partial commands creates the effect when it is missing **(docs)**. Every effect has `enabled`, `opacity` `[0, 1]`, `blendMode`, `scaleWithObject` **(docs)**.

```js
const { OuterShadowLayerEffect, OutlineLayerEffect, StrokeAlignment } = require('/layereffects.js');
const { RGBA8 } = require('/colours.js');

const shadow = OuterShadowLayerEffect.create();
shadow.radius = 16;
shadow.offset = 14;
shadow.angle = Math.PI / 4;
shadow.opacity = 0.65;
shadow.colour = RGBA8(0, 0, 0);
shadow.intensity = 0;
doc.setOuterShadowLayerEffect(rect, shadow, 0);

const outline = OutlineLayerEffect.create();
outline.radius = 8;
outline.colour = RGBA8(255, 255, 255);
outline.alignment = StrokeAlignment.Outside;
doc.setOutlineLayerEffect(rect, outline, 0);
```

A soft shadow down-right and a white outline outside the stroke rendered **(verified)**. `angle` is radians (`π/4` matched 45°). Index `0` is the first slot. `intensity` `0` still drew that shadow when radius and opacity were set. `StrokeAlignment` here is `Centre`, `Inside`, `Outside` **(verified)**.

| Effect | Extra fields | Document method | Count |
|---|---|---|---|
| `OuterShadowLayerEffect` | `radius`, `colour`, `offset`, `angle`, `intensity` `[0, 1]`, `fillKnocksOut` | `setOuterShadowLayerEffect(selection, effect, index)` plus colour, offset, angle, and knockout commands | many, by `index` |
| `InnerShadowLayerEffect` | `radius`, `colour`, `offset`, `angle`, `intensity` `[0, 1]` | `setInnerShadowLayerEffect(selection, effect, index)` | many |
| `OuterGlowLayerEffect` | `radius`, `colour`, `intensity` `[0, 1]` | `setOuterGlowLayerEffect(selection, effect)` | one |
| `InnerGlowLayerEffect` | `radius`, `colour`, `intensity` `[0, 1]`, `centre` | `setInnerGlowLayerEffect(selection, effect)`. No separate `centre` command | one |
| `OutlineLayerEffect` | `radius`, `colour`, `alignment` (`StrokeAlignment`), `fillType` (`StrokeFillType`: `Solid`, `Contour`, `Gradient`), `fillDescriptor` | `setOutlineLayerEffect(selection, effect, index)` | many |
| `ColourOverlayLayerEffect` | `colour` | `setColourOverlayLayerEffect(selection, effect, index)` | many |
| `GradientOverlayLayerEffect` | `fillDescriptor`. Static `calculateTransform(scaleX, scaleY, transformX, transformY)` | `setGradientOverlayLayerEffect`, `setGradientOverlayLayerEffectFill`, `setGradientOverlayLayerEffectFillTransform` | many |
| `GaussianBlurLayerEffect` | `radius`, `preserveAlpha` | `setGaussianBlurLayerEffect(selection, effect)` | one. No published `radius` range |
| `BevelEmbossLayerEffect` | `radius`, `depth`, `soften` `[0, 1]`, `bevelProfile` (`Spline`) or `setStandardBevelProfile(SplineProfile)`, `bevelEmbossType`, `azimuth`, `elevation`, `invert`, `shadowColour`, `highlightColour`, `shadowBlendMode`, `shadowOpacity` | `setBevelEmbossLayerEffect(selection, effect)`, then partial commands for direction, depth, soften, and type | one |
| `PhongBevelLayerEffect` | `radius`, `linkDepth`, `depth`, `soften`, `bevelProfile`, `ambient`, `diffuse`, `specular`, `shininess` (published ranges `[0, 1]`), `ambientColour`, `specularColour`, `PointLight`s | `setPhongBevelLayerEffect(selection, effect)`, `setPhongBevelLayerEffectLights(selection, lights)` | one |

**(docs)** except the shadow and outline call above. `BevelEmbossType`: `Inner`, `Outer`, `Emboss`, `Pillow`.

`PointLight` has `azimuth`, `elevation`, `colour`, and `clone()`. The wrapper has no `PointLight.create`. Read lights with `getLight(index)` / `enumerateLights`, then `insertLight` / `appendLight` / `removeLight` **(docs)**.

`doc.removeAllLayerEffects(selection)` and `doc.setAllLayerEffectsScaleWithObject(selection, bool)`. Multi-effect slots also have `duplicate…(selection, index)`, `move…(selection, from, to)`, and `remove…(selection, index)`. Read `node.quickFX` and `layerEffectsInterface.effects`. `hasAnyVisibleEffects`, `hasActiveEffects` **(docs)**.

`Document.setBevelEmbossLayerEffectParam` calls `DocumentCommand.createSetBevelEmbossLayerEffectParam`, and that factory is missing. `setBevelEmbossLayerEffectColour` calls a missing factory too **(verified)**. Set the effect object, or call `createSetBevelEmbossLayerEffectHighlightColour` and `createSetBevelEmbossLayerEffectShadowColour`.

## Transform, order, and groups

`translate` / `scale` / `rotate` mutate, so build each matrix with `createTranslate`, `createRotate`, and `createScale`, and combine with `multiply`. Rotation or scale about a centre is `T(cx, cy) * R * T(-cx, -cy)`. `doc.applyTransform(transform, selection, options)` calls `DocumentCommand.createTransform`. `duplicateNodes: true` copies instead of moving **(verified)**. Other options: `mergeable`, `cloneRaster`, `correctChildren` **(docs)**.

```js
const { Transform } = require('/geometry.js');
const { Selection } = require('/selections.js');

const sel = Selection.create(doc, star);
doc.applyTransform(Transform.createTranslate(0, 40), sel);

const box = star.spreadBaseBox;
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
const rot = Transform.createTranslate(cx, cy)
    .multiply(Transform.createRotate(Math.PI / 8))
    .multiply(Transform.createTranslate(-cx, -cy));
doc.applyTransform(rot, Selection.create(doc, star));

const box2 = star.spreadBaseBox;
const scx = box2.x + box2.width / 2;
const scy = box2.y + box2.height / 2;
const sc = Transform.createTranslate(scx, scy)
    .multiply(Transform.createScale(0.75, 0.75))
    .multiply(Transform.createTranslate(-scx, -scy));
doc.applyTransform(sc, Selection.create(doc, star));

doc.applyTransform(Transform.createTranslate(40, 160), Selection.create(doc, star), { duplicateNodes: true });
```

After that, `baseBox` was still the original box. `transform.data` was about `[0.693, -0.287, tx, 0.287, 0.693, ty]` (`cos(π/8) * 0.75`), and the copy's translation was `+40, +160` **(verified)**. Read `node.spreadBaseBox` or `node.transform.data`. `node.getSpreadBaseBox()` is the form used in the SDK examples **(docs)**.

`TransformInterface` is read-only: `transform`, `getTransform(forceConstraints)`, `unconstrainedTransform`, `focalPoint`, `domainTransform`, `prefersAspectRatioLockedResize` **(docs)**.

Align a selection with `doc.applyGroupTransform(xDataOrNull, yDataOrNull, selection)`. `GroupTransformData` fields **(verified):** `type`, `anchor`, `order`, `spacing`, `isAutoSpacing`, `reorderSpaces`. `GroupTransformType`: `None`, `Min`, `Mid`, `Max`, `DistributeMin`, `DistributeMid`, `DistributeMax`, `Space`, `Reorder`, `SpaceKeyObject`. `GroupTransformAnchor`: `LogicalEdge`, `Spread`, `SpreadMargins`, `FirstSelected`, `LastSelected`, `Page`, `PageMargins`. `GroupTransformOrder`: `Min`, `Mid`, `Max`. `examples/alignToPage.js` sets `type` to `Min`/`Mid`/`Max` and `anchor` to `Page` or `PageMargins` on each axis **(docs)**.

### Z-order

`NodeMoveType` **(verified):** `Before`, `After`, `Inside`. `Before` puts the node behind the target (lower index; the target paints on top). Re-fetch both handles from `doc.layers` first. A move in the same script, using the objects just returned by `addNode`, threw `COMMAND_FAILED`; handles read back from `doc.layers` succeeded **(verified)**. Each walk of `doc.layers` wraps a new handle, so `===` across two loops is false **(verified)**.

```js
const { DocumentCommand, NodeMoveType, NodeChildType } = require('/commands.js');
const { Selection } = require('/selections.js');

doc.executeCommand(DocumentCommand.createMoveNodes(
    Selection.create(doc, magenta),
    green,
    NodeMoveType.Before,
    NodeChildType.Main
));
```

`createMoveMappedNodes(selection, sources, targets, moveType)` moves paired nodes **(docs)**.

### Groups

`GroupNode` can be read. `GroupNodeDefinition` is not exported from `/nodes.js`, `affinity:dom` has no `GroupNodeDefinitionApi`, and `DocumentCommand` has no `createGroup` **(verified)**. Group by adding a `ContainerNode` and moving the children inside. `container.isGroupNode === false` **(verified)**.

```js
const { ContainerNodeDefinition } = require('/nodes.js');
const { AddChildNodesCommandBuilder, DocumentCommand, NodeMoveType, NodeChildType } = require('/commands.js');
const { Selection } = require('/selections.js');

const builder = AddChildNodesCommandBuilder.create();
builder.addContainerNode(ContainerNodeDefinition.create('pair'));
doc.executeCommand(builder.createCommand(true, NodeChildType.Main));

let container = null;
for (const n of doc.layers) {
    if (n.isContainerNode && n.descriptionInterface.userDescription === 'pair') container = n;
}
doc.executeCommand(DocumentCommand.createMoveNodes(
    Selection.create(doc, [green, magenta]),
    container,
    NodeMoveType.Inside,
    NodeChildType.Main
));
```

`children.length === 2` **(verified)**. To ungroup, move each child to `NodeMoveType.After` the container, then `doc.deleteSelection(container)` **(verified)**. This is a container layer in the Layers panel.

## Image trace, guides, drawing scale

### Image trace

```js
doc.imageTrace(0.5, 0.2, doc.selection);
```

`imageTrace(edgeThreshold, curveFittingTolerance, selection, preview)`. Both arguments are `[0, 1]` **(docs)**. It targets a selected image. The resulting node type and where it lands in the stack are **(unverified)**.

### Guides

```js
const { RGBA8 } = require('/colours.js');
doc.addGuide(true, 200);
doc.addGuide(false, 120);
doc.moveGuide(true, 0, 240);
doc.removeGuide(false, 0);
doc.setGuidesColour(RGBA8(0, 180, 255));
```

`horizontal === true` is a horizontal guide. The coordinate is document pixels from the page edge (the wrapper parameter is named `pixels96`) **(docs)**. Shortcuts: `createAddHorizontalGuide(pixels)`, `createAddVerticalGuide`, `createMoveHorizontalGuide(index, pixels)`, `createRemoveHorizontalGuide(index)`. `document.js`, `nodes.js`, and the `affinity:dom` keys expose no list of guides and no colour read, so keep the index yourself **(docs)**. Another unnamed read interface is **(unverified)**. `addArtboard(..., copyGuides)` copies guides when it creates an artboard **(docs)**.

### Drawing scale

Set it on `NewDocumentOptions` before `Document.create`. An open `Document` has no `drawingScale` setter in the wrapper **(docs)**. `DocumentPreset` reads `useDrawingScale` and `drawingScale`.

```js
const { DrawingScale } = require('/drawingscale.js');
const { NewDocumentOptions } = require('/document.js');

const scale = DrawingScale.createFromString('1:50', true, 2, true);
const options = NewDocumentOptions.createDefault();
options.useDrawingScale = true;
options.drawingScale = scale;
```

Factories **(docs):** `create(leftUnitValue, rightUnitValue)`, `createFromIntegers(left, right, simplifyFraction)`, `createFromString(str, simplifyFraction, simplifyDecimalPlaces, allowOneToOne)`, `identity` (`1:1`), `getDefaults(units)`, `toString(useTightFormat, showUnits, indicateApproximations)`.

## SDK examples

Files in `examples/`. Each ends with `module.exports.main`; an `execute_script` body omits that line. Read one with `read_sdk_documentation_topic` **(docs)**.

| File | What it demonstrates |
|---|---|
| `addPoints.js` | Splits every Bézier at half its length, rebuilds the `PolyCurve`, `createSetCurves` |
| `arrowheads.js` | Dialog that sets a start and end `ArrowHead` with scale, via `cloneWithNewArrowHeads`, with preview |
| `cornerEffects.js` | Rebuilds corners in that file's Rounded, Inverse, Bevel, Inset, and Fancy styles, on a `PolyCurveNode` only |
| `roundAnyCorner.js` | Rounds sharp corners by a radius, skips smooth points, and caps the offset at half the shorter side |
| `pathEffects.js` | Punk, Bloat, Twirl, handle pull, or replace the box with a rectangle or ellipse. The copy option builds a new `PolyCurveNodeDefinition` and keeps fill and stroke |
| `meshBubble.js` | New document, a circle, a 15×15 `ColourMesh` with bubble colours and Catmull-Rom tangents, then `createSetBrushFill` |
| `bulgedPolyline.js` | Dialog that accumulates absolute or relative `bulgeToXY` segments into a `PolyCurveNodeDefinition`, no fill, blue stroke |
| `bulgeVersinePlayground.js` | Compares `bulge*` and `versine*` on one chord, reads radius and sweep, optional guide lines |
| `makeGrid.js` | Rows and columns, either by `createTransform(..., { duplicateNodes: true })` or by creating a rectangle, text frame, or picture frame. Can delete the original |
| `stepAndRepeat.js` | Copies with cumulative offset, rotation, and scale about the selection centre |
| `swapObjects.js` | Swaps two centres with two translations inside a `CompoundCommandBuilder` |
| `randomise.js` | Scatters position, rotation, scale, and opacity inside a range, with a `Reshuffle` seed |
| `alignToPage.js` | `applyGroupTransform` to the page or its margins |
| `addGuides.js` | Guides on the selection bounds or on each object, absolute offset or inflate |
| `strokesWeightUp.js` / `strokesWeightDown.js` | ±1 pt on `lineWeight` for `isVectorNode` or `isTextNode`, mask `LineStyleMask.Weight` |
| `textOnCurvesAndShapes.js` | New landscape A4: text on a Bézier, text inside a polycurve, text on a heart outline, text inside a star |

`boldItalics`, `tableFromJson`, `cropMarks`, and `flexibleLayout` are in the same folder and are not shape or path edits.

## Absent from the wrapper

- Group factory. Use a `ContainerNode` **(verified)**.
- Guide list and guide-colour read **(docs)**.
- `drawingScale` on an already open document **(docs)**.
- A factory for a new vector brush. `createDefault()` throws **(verified)**.
- `Document.setBevelEmbossLayerEffectParam` and `setBevelEmbossLayerEffectColour` **(verified)**. Use the effect object or the highlight and shadow factories.
- `PointLight.create` **(docs)**.
- `setCompoundOperation`, and any expand-stroke command in the `DocumentCommand` factories that were listed **(docs)**.
- A later edit of `Gradient.stops` **(docs)**. Pass the stops to `Gradient.create([...])`.
- Shape-parameter ranges, and layer-effect radii other than `intensity`, `opacity`, and `soften`, in `param_ranges` **(docs)**.
