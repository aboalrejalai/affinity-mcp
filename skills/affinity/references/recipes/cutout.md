# Recipe: cut out the subject for a transparent PNG

> Status: (unverified) end to end. `selectSubject` and pixel-selection deletion are verified; `removeBackground` and the transparent-export step are from the docs.

Two options. Both need a paid Canva plan; neither is counted against the monthly AI limit.

## A. One command

```js
const d = require('/document.js').Document.current;
d.selection = [d.layers.at(d.layers.length - 1)];
d.removeBackground();            // removes pixels on the same layer
```

## B. Controllable edge

```js
const d = require('/document.js').Document.current;
const layer = d.layers.at(d.layers.length - 1);
d.selection = [layer];
d.selectSubject();
d.growShrinkRasterSelection(-1, true);   // tighten by 1 px to drop background fringe
d.featherRasterSelection(1.5);
d.rasterInvertSelection();
d.selection = [layer];
d.deleteSelection(d.selection);
d.rasterDeselect();
```

## Export with transparency

The document background must be transparent and the format must support alpha:

```js
const { DocumentProperties } = require('/documentproperties.js');
const { FileExportOptions, FileExportArea, Document } = require('/document.js');
let d = Document.current;
const p = DocumentProperties.create();
p.dimensions = { width: d.widthPixels, height: d.heightPixels };
p.dpi = d.dpi;
p.isTransparent = true;
d.setDocumentProperties(p);
d = Document.current;
const rec = d.export(`${require('/environment.js').Environment.fileSystemRoots[0]}/cutout.png`,
  FileExportOptions.createWithPresetName('PNG'), FileExportArea.createForWholeDocument());
for (const r of rec.all) console.log(r.isSuccess, r.path);
```

Render first. Check for leftover background between arms or in hair, and for bitten edges.
