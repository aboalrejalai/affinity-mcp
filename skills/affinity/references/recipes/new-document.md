# Recipe: create a new document

```js
const { Document, NewDocumentOptions, UnitType } = require('/document.js');
const o = NewDocumentOptions.createDefault();
o.units = UnitType.Pixel;
o.width = 1080;              // pixels
o.height = 1080;
o.dpi = 72;                  // 72 for screen, 300 for print
o.isTransparentBackground = false;
o.createArtboard = false;    // artboards change how canvas-size commands behave
o.pageCount = 1;
const doc = Document.create(o);
console.log('created', doc.sessionUuid, doc.widthPixels, doc.heightPixels);
```

Keep the `sessionUuid`; use it for `render_spread` and to find this document again:

```js
const doc = Document.all.find(d => d.sessionUuid === '<uuid>');
```

`NewDocumentOptions` fields are write-only (they read back as defaults). Check the created document instead. Common sizes: Instagram post 1080 x 1080, story 1080 x 1920, LinkedIn banner 1584 x 396, X header 1500 x 500, A4 at 300 dpi 2480 x 3508.
