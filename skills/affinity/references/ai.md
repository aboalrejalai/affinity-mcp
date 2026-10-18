# Canva AI from scripts

Affinity by Canva bundles Canva AI Studio. Scripts reach six of its commands, all methods on `Document` (backed by `DocumentCommandApi`). Each takes at most one argument, a prompt string. They need the "Use Canva AI Studio features" permission.

## The six commands

| Command | Does | Credits | Result |
|---|---|---|---|
| `doc.generateImage(prompt)` | Text-to-image | Yes (cloud) | New `PhysicalNode`, 1024 x 1024, about 35 s; child of the artboard if one exists (verified) |
| `doc.generativeEditImage(prompt)` | Remove, replace, add, restyle, or blend content | Yes (cloud) | Rewrites the **whole selected layer** in place (verified) |
| `doc.removeBackground()` | Cut out the subject | Not counted against the monthly limit; paid plan | Pixels removed on the same layer |
| `doc.selectSubject()` | Select the main subject | Not counted against the monthly limit; paid plan | Pixel selection only, about 8 s (verified) |
| `doc.detectDepth()` | Depth map | Local model | Applied to the image layer |
| `doc.colourise()` | Colourise black-and-white photos | Local model | Applied to the layer |

Ask the user before any credit-consuming call (see `safety.md`).

## What scripts cannot control

- **Model choice.** No parameter selects Nano Banana, GPT Image, Seedream, FLUX Kontext, Grok Imagine, Microsoft MAI, Recraft or Tripo; there is no model enum in any native module. The UI's model picker owns it, and it is unknown whether scripts inherit the last UI choice.
- **Size, aspect ratio, seed, count, negative prompt, reference image, 4K, transparency, prompt enhancement** - none are exposed.
- **UI-only tools with no command:** Generative Fill, Generative Expand, Generative Upscale, Super Resolution, Generate Vector, Generate 3D (Layer to 3D), Decompose Layer, Portrait Blur, Portrait Lighting, Generation History. When the user needs one, tell them where it is in the Canva AI Studio workspace.
- **Remaining allowance.** No API reads it.

## Using `generativeEditImage` well

It operates on the entire selected layer and ignores pixel selections. The prompt is the only steering you have, so:

1. Select exactly one raster layer (`rasteriseObjects` first if it is not a `RasterNode`), sized reasonably (about 3000 px max; crop and resample huge photos first).
2. Describe the scene as it is, then the change, then what must stay:
   > "Portrait of a young man in a white thobe at a graduation. Remove the other person's hand resting on his right shoulder (bottom-left) and fill that area with the same white thobe fabric. Keep his face, hair, expression, collar and everything else exactly unchanged."
3. Avoid framing words ("close-up", "portrait shot", "zoom", "detail") that invite a re-composition.
4. Render and compare. If faces or text changed, `undo()` and rephrase more narrowly.
5. To protect regions completely, duplicate the layer first and composite: keep the original on top and remove its pixels only where the edit should show through.

## Substitutes for UI-only tools

| Need | Script approach |
|---|---|
| Expand / outpaint | Grow the canvas, fill the gap with a shifted duplicate, merge, then `generativeEditImage` to make it seamless (`recipes/outpaint.md`) |
| Portrait blur | `selectSubject` + duplicate + Gaussian or Lens blur (`recipes/blur-background.md`) |
| Upscale | `setDocumentProperties` with a resampler (Bicubic or Lanczos) - not AI, but clean for moderate factors |
| Vector from image | `imageTrace` (tracing, not generative) |

## Errors

- `ErrorCode.NOT_ALLOWED` (145) or `ErrorCode.PERMISSION_DENIED` (1036): AI permission off, or the platform is unsupported. Report it; do not retry.
- Slow calls block inside the synchronous call; there is no job id or progress event.
