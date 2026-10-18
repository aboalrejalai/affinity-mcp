# Recipe: professional profile photo from a group or event photo

A complete chain that turned an event photo (the subject next to another person, with a crowd behind) into a centred, square profile picture with a blurred background. It used 1-2 Canva AI calls.

| Step | Recipe | Notes |
|---|---|---|
| 1. Protect | `save-copy.md` | The original stays untouched |
| 2. Find the face | `inspect.md` + `render_spread` | Convert render coordinates using `widthPixels / renderWidth` |
| 3. Rough crop | `crop.md` | A square around the subject that excludes the other person where possible |
| 4. Downsample | `resize.md` | About 3000 px, then `rasteriseObjects(sel, false, true)` |
| 5. Remove leftovers | `remove-object.md` | For example the other person's hand on the shoulder (credits) |
| 6. Blur the crowd | `blur-background.md` | Gaussian radius about 1.5% of the width |
| 7. Centre the face | `crop.md`, or `outpaint.md` if the face is near an edge | Face centre on the vertical midline, eyes at about 40-45% of the height, shoulders visible |
| 8. Export | `export.md` | JPEG best quality; 2000-3000 px square |

Framing rules for circular avatars (LinkedIn, X, WhatsApp crop to a circle):
- The face must be horizontally centred. An off-centre face is the most common complaint.
- Leave 8-15% headroom above the hair. The ears and hair must sit inside the inscribed circle.
- The face should be about 45-55% of the image width. Tighter looks cramped; looser makes the face tiny in a 48 px avatar.

Render after every step and show the user the final render before declaring it done. Keep the `.af` with its layers for later adjustments.
