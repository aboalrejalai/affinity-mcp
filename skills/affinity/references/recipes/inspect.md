# Recipe: inspect what is open

Use this first in every session and whenever you lose track of state.

```js
const { Document } = require('/document.js');
for (const d of Document.all) {
  console.log(`${d.sessionUuid} | ${d.title} | ${d.path || '(unsaved)'} | ${d.widthPixels}x${d.heightPixels} @${d.dpi}dpi | units ${d.units} | dirty ${d.isDirty}`);
}
const d = Document.current;
if (!d) { console.log('No document open'); }
else {
  console.log('current:', d.sessionUuid, 'spreads:', [...d.spreads].length, 'artboards:', d.hasArtboards);
  [...d.layers].forEach((l, i) =>
    console.log(i, l.constructor.name, l.description || '', JSON.stringify(l.spreadBaseBox || l.baseBox), 'visible:', l.isVisible));
  console.log('selected nodes:', d.selection ? d.selection.length : 0);
}
```

Then look at it: `render_spread(<sessionUuid>, 0)`.

Read the output before deciding anything: a 24000 x 16000 photo needs resampling before AI work; a document with artboards needs the artboard variants of size commands; an unsaved document (`path` empty) is lost if closed.
