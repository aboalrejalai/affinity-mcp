# Recipe: extend the canvas (outpaint) to re-centre or widen

Uses Canva AI credits. Ask first.

Scripts have no Generative Expand command. This substitute worked seamlessly on a real portrait: pre-fill the new area with nearby content, then let `generativeEditImage` blend it.

Example: a 3000 x 3000 photo whose face centre is at x = 1963. Goal: a 2800 x 2800 square centred on the face. That needs 363 px more on the right than the photo has.

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { SpatialAnchor } = require('affinity:dom');
const { Transform } = require('affinity:geometry');
const d = Document.current;

// 1. Flatten what is visible into one layer, and hide the sources (mergeVisible does not)
d.selection = null;
d.mergeVisible();
let L = [...d.layers];
const merged = L[L.length - 1];
d.selection = L.slice(0, -1); d.hideSelection(d.selection);

// 2. Move the merged layer so the new crop origin is (0, 0); this one ends up on the bottom
const X = 563, Y = 100, S = 2800, srcW = 3000;
d.selection = [merged];
let t = new Transform(); t.translate(-X, -Y);
d.executeCommand(DocumentCommand.createTransform(d.selection, t));

// 3. A duplicate shifted right fills the empty strip; it is created on top, so swap positions
d.selection = [merged];
t = new Transform(); t.translate(S - (srcW - X), 0);
d.executeCommand(DocumentCommand.createTransform(d.selection, t, { duplicateNodes: true }));
L = [...d.layers];
t = new Transform(); t.translate(S - (srcW - X), 0); d.selection = [L[L.length - 2]];
d.executeCommand(DocumentCommand.createTransform(d.selection, t));     // lower copy goes right
t = new Transform(); t.translate(-(S - (srcW - X)), 0); d.selection = [L[L.length - 1]];
d.executeCommand(DocumentCommand.createTransform(d.selection, t));     // upper copy back in place
d.selection = null;
d.setSpreadSizeWithAnchor(d.currentSpread, S, S, SpatialAnchor.TopLeft);
```

Render now. The framing should be right, with a visible seam where the repeated strip starts. Then blend it:

```js
const d = require('/document.js').Document.current;
d.selection = null;
d.mergeVisible();
let L = [...d.layers];
const top = L[L.length - 1];
d.selection = L.slice(0, -1); d.hideSelection(d.selection);
d.selection = [top];
d.rasteriseObjects(d.selection, false, true);
L = [...d.layers];
d.selection = [L[L.length - 1]];
d.generativeEditImage(
  "Portrait photo of a young man in a white thobe with a softly blurred background. " +
  "The vertical strip on the far right repeats part of the background and shoulder with a visible seam; " +
  "replace that strip with a natural, seamless continuation of the blurred background and the white shoulder. " +
  "Keep the face, hair, expression, collar and the rest of the image exactly unchanged.");
```

Render again and check the seam and the face. If it is wrong, `undo()`. The hidden source layers remain in the file, so a designer can redo this by hand.
