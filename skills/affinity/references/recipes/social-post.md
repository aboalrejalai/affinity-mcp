# Recipe: a designed social post

Builds a complete layered post from nothing: a gradient background, a card with a shadow, an Arabic or English headline, then an export. Adapt the colours, copy and size.

## 1. Canvas

Use `new-document.md` with 1080 x 1080 px at 72 dpi. Keep the `sessionUuid`.

## 2. Shapes and fills

```js
const { Document } = require('/document.js');
const { ShapeRectangle, ShapeEllipse } = require('/shapes.js');
const { ShapeNodeDefinition } = require('/nodes.js');
const { Rectangle, Transform } = require('/geometry.js');
const { FillDescriptor, BlendMode, GradientFill, GradientFillType } = require('/fills.js');
const { RGBA8, Gradient } = require('/colours.js');
const { LineStyleDescriptor } = require('/linestyle.js');
const doc = Document.current;

function addShape(shape, x, y, w, h, fill, stroke, weight) {
  doc.addNode(ShapeNodeDefinition.create(shape, new Rectangle(x, y, w, h),
    FillDescriptor.createSolid(fill, BlendMode.Normal),
    stroke ? FillDescriptor.createSolid(stroke, BlendMode.Normal) : null,
    weight ? LineStyleDescriptor.createDefault(weight) : null, null));
  return doc.layers.at(doc.layers.length - 1);
}

// Background with a linear gradient. The fill transform must map to the shape box.
const bg = addShape(ShapeRectangle.create(), 0, 0, 1080, 1080, RGBA8(20, 40, 90));
const box = bg.baseBoxInterface.baseBox;
const grad = Gradient.create([
  { colour: RGBA8(16, 32, 80), position: 0, midpoint: 0.5 },
  { colour: RGBA8(0, 150, 136), position: 1, midpoint: 0.5 }]);
const xf = Transform.createTranslate(box.x, box.y).multiply(Transform.createScale(box.width, box.height));
doc.setBrushFillDescriptor(FillDescriptor.create(GradientFill.create(grad, GradientFillType.Linear), false, xf, BlendMode.Normal, true), bg);

// A card and an accent circle
const card = addShape(ShapeRectangle.create(), 90, 640, 900, 320, RGBA8(255, 255, 255));
addShape(ShapeEllipse.create(), 760, 80, 240, 240, RGBA8(255, 193, 7));
```

## 3. Shadow on the card

```js
const { OuterShadowLayerEffect } = require('/layereffects.js');
const s = OuterShadowLayerEffect.create();
s.radius = 24; s.offset = 12; s.angle = Math.PI / 2; s.opacity = 0.35; s.colour = RGBA8(0, 0, 0); s.intensity = 0;
doc.setOuterShadowLayerEffect(card, s, 0);
```

## 4. Headline

Use `arabic-text.md` for Arabic (set an Arabic font). For Latin text the same `StoryBuilder` code works with fonts such as `HelveticaNeue-Bold`.

## 5. Check and export

`render_spread`, then fix spacing and contrast, then follow `export.md` (PNG for graphics, JPEG for photos). Save the `.af` so the layers stay editable.

Design checks before delivering: the headline is readable at thumbnail size, the margins are at least 6% of the width, there are 2-3 colours, and nothing important sits in the outer 5% where apps crop.
