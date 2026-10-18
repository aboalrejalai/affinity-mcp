# Recipe: Arabic (right-to-left) text

Affinity shapes Arabic and lays it out right to left correctly when the glyph attributes carry an Arabic-capable font. With the default style font (`ArialMT`) the same string renders as disconnected, reversed letters. Always set the font.

```js
const { Document } = require('/document.js');
const { StoryBuilder } = require('/storybuilder.js');
const { ArtTextNodeDefinition } = require('/nodes.js');
const { Font, FontWeight, FontWidth } = require('/fonts.js');
const { FillDescriptor, BlendMode } = require('/fills.js');
const { RGBA8 } = require('/colours.js');
const { ParagraphAlignXType } = require('/paragraphatts.js');
const d = Document.current;

const sb = StoryBuilder.create();
sb.setToArtisticTextDefaultStyle(d.dpi, d.format);
const ga = sb.glyphAtts;
ga.font = Font.create('ArialUnicodeMS', FontWeight.Bold, false, FontWidth.Normal); // PostScript family name
ga.height = 96;                                   // point size
ga.brushFill = FillDescriptor.createSolid(RGBA8(255, 255, 255), BlendMode.Normal);
ga.openTypeScriptTag = 'arab';
sb.setGlyphAtts(ga);
const pa = sb.paragraphAtts;
pa.alignXType = ParagraphAlignXType.Right;
sb.setParagraphAtts(pa);
sb.addText('عرض خاص لفترة محدودة');
d.addNode(ArtTextNodeDefinition.createFromStoryBuilder({ x: 980, y: 300 }, sb));
```

- Fonts verified on macOS: `ArialUnicodeMS`, `GeezaPro`, `GeezaPro-Bold`, `DecoTypeNaskh`, `Baghdad`. List what is installed with `FontFamily.all` from `/fonts.js` and filter by name (Arabic families include Damascus, Beirut, Diwan Kufi, KufiStandardGK).
- With right alignment, the artistic-text position is the line origin, and the text extends to the left of it. Render and adjust x.
- There is no paragraph-direction API. Mixed Arabic and Latin on one line follows the bidi algorithm, so keep brand names on their own line if the order looks wrong.
- For frame text use `FrameTextNodeDefinition.createFromStoryBuilder(new Rectangle(x, y, w, h), sb)` with the same glyph attributes.
- Always verify with `render_spread`: letters must be joined and read right to left.
