# Recipe: resample the document

Scales every layer with the canvas, like Document > Resize Document with resampling on.

```js
const { Document } = require('/document.js');
const { DocumentProperties, RasterResamplerType, UnitType } = require('/documentproperties.js');
let d = Document.current;
const p = DocumentProperties.create();
p.dimensions = { width: 3000, height: 3000 };   // keep the aspect ratio yourself
p.units = UnitType.Pixel;
p.dpi = d.dpi;
p.resamplerType = RasterResamplerType.Bicubic;  // Bicubic, SeparableLanczos3, Mitchell, Bilinear, NearestNeighbour...
d.setDocumentProperties(p);
d = Document.current;                            // re-fetch after property changes
console.log(d.widthPixels, d.heightPixels);
```

To clip raster layers to the new canvas afterwards:

```js
d.selection = [d.layers.at(0)];
d.rasteriseObjects(d.selection, false, true);
```

Guidance:
- Downsample huge camera files (for example 24000 x 16000) to about 3000 px before AI commands; they become faster and more reliable.
- Profile pictures: 1024-3000 px square is plenty. Print: keep 300 dpi at the physical size.
- Upscaling with a resampler is not AI super-resolution; for large factors, tell the user that the UI's Super Resolution or Generative Upscale tools do better.
