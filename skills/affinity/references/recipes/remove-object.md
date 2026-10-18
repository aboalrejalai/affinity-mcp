# Recipe: remove an object with generative edit

Uses Canva AI credits. Ask the user first.

Removes a person, a hand, a logo, a cable or a blemish and fills the area plausibly. `generativeEditImage` rewrites the **whole selected layer**, so the prompt must say what to keep.

## Steps

1. Work on a copy (`save-copy.md`). Crop and resample first if the image is very large (`crop.md`, `resize.md`); about 3000 px works well.
2. Make sure the target is a single `RasterNode` clipped to the canvas:

```js
const { Document } = require('/document.js');
const d = Document.current;
d.selection = [d.layers.at(0)];
d.rasteriseObjects(d.selection, false, true);
console.log([...d.layers].map(l => l.constructor.name + JSON.stringify(l.baseBox)).join(' | '));
```

3. Run the edit with a scene-preserving prompt:

```js
const d = require('/document.js').Document.current;
d.selection = [d.layers.at(d.layers.length - 1)];
d.generativeEditImage(
  "Portrait of a young man in a white thobe at a graduation ceremony. " +
  "Remove the other person's hand resting on his right shoulder at the bottom-left, " +
  "and fill that area with the same clean white thobe fabric and shoulder. " +
  "Keep his face, hair, expression, collar, lighting and everything else exactly unchanged.");
console.log('done:', d.undoDescription);
```

4. `render_spread` and compare against the previous render: the face, text and edges must be unchanged. If not, `d.undo()` and narrow the prompt.

## Prompt pattern

`<what the image is>. Remove <object> at <location>, and fill that area with <what should be there>. Keep <the important things> and everything else exactly unchanged.`

Avoid "close-up", "portrait shot", "zoom", "detail": they can re-frame the image.

## Protecting a region completely

Duplicate the layer before editing, run the edit on the lower copy, then delete the area to change from the upper copy (pixel selection, then `deleteSelection`) so the untouched original shows everywhere else.
