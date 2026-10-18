# Recipe: blur the background, keep the subject sharp

Portrait-mode look. `selectSubject` is not counted against the monthly Canva AI limit but needs a paid plan.

The technique uses two copies of the photo. The bottom copy is blurred. The top copy keeps only the subject.

```js
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { GaussianBlurFilterParameters } = require('/nodes.js');
const { Transform } = require('affinity:geometry');
const d = Document.current;

// 1. Duplicate the photo layer
const orig = d.layers.at(0);
d.selection = [orig];
d.executeCommand(DocumentCommand.createTransform(d.selection, new Transform(), { duplicateNodes: true }));

// 2. Blur the bottom copy (layers are bottom-first)
const p = new GaussianBlurFilterParameters();
p.radius = 45;                                   // scale with image size: about 1.5% of the width
d.selection = [d.layers.at(0)];
d.executeCommand(DocumentCommand.createGaussianBlurFilter(d.selection, p));

// 3. Keep only the subject on the top copy
const top = d.layers.at(1);
d.selection = [top];
d.selectSubject();               // pixel selection of the person
d.featherRasterSelection(2);     // soften the cut edge
d.rasterInvertSelection();       // now the background is selected
d.selection = [top];
d.deleteSelection(d.selection);  // remove the background from the sharp copy
d.rasterDeselect();
console.log('layers:', d.layers.length);
```

Render and check the hair and shoulders. A faint soft halo around hair is normal at large zoom; reduce `radius`, or blur a copy from which the subject was removed first, if it is visible at the target size.

Variations:
- Lens blur or field blur give a more optical look (`pixel.md`, blur family).
- For a live, adjustable blur, add a `GaussianBlurFilterRasterNode` child instead of the destructive command (`pixel.md`).
- To replace the background instead, delete the bottom copy and add a gradient rectangle below the subject.
