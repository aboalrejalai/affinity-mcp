# Recipe: crop the canvas to a rectangle

There is no single crop command. Shift every layer so the crop origin becomes (0, 0), then shrink the spread from the top-left. Works in pixel units on documents without artboards.

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { SpatialAnchor } = require('affinity:dom');
const { Transform } = require('affinity:geometry');
const d = Document.current;

const X = 926, Y = 300, W = 2074, H = 2074;   // crop rectangle in document pixels

for (const layer of [...d.layers]) {           // transform each layer on its own
  d.selection = [layer];
  const t = new Transform(); t.translate(-X, -Y);
  d.executeCommand(DocumentCommand.createTransform(d.selection, t));
}
d.selection = null;
d.setSpreadSizeWithAnchor(d.currentSpread, W, H, SpatialAnchor.TopLeft);
console.log('canvas', d.widthPixels, d.heightPixels);
```

Then `render_spread` and judge the framing.

## Choosing the rectangle from a render

`render_spread` returns at most 1024 px on the long side. Convert render coordinates with `scale = d.widthPixels / renderWidth`. For a portrait square centred on a face: centre X on the face centre, keep 8-15% headroom above the hair, and include the shoulders. If the face sits near an edge, a centred square may be too tight. Then either accept a tighter headshot or widen with `outpaint.md`.

## After cropping

- Layers keep their full original pixels outside the canvas. `d.rasteriseObjects([layer], false, true)` clips a raster layer to the canvas, which makes AI calls faster and files smaller.
- With artboards use `setArtboardSizeWithAnchor` instead (it can shift the origin; verify with a render).
