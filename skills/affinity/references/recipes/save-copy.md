# Recipe: protect the original

Before editing a document the user opened, switch the working document to a new file. The original file on disk is then never modified.

```js
const { Document } = require('/document.js');
const { Environment } = require('/environment.js');
const d = Document.current;
console.log('dirty before:', d.isDirty, 'path:', d.path);
const desktop = Environment.fileSystemRoots[0];             // Desktop is the only writable root
const base = (d.title || 'document').replace(/[^\w\-]+/g, '-');
const target = `${desktop}/${base}-edit.af`;
d.saveAs(target);
console.log('now editing:', d.path);
```

- If `d.isDirty` was true, the unsaved changes travel into the copy and the original stays at its last saved state. Mention this to the user.
- Pick a name that does not exist yet (append `-2`, `-3`). Overwriting a file the user owns is exactly what this recipe prevents.
- For a document you created yourself in this session, skip this step.
