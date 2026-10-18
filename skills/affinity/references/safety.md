# Safety rules

`execute_script` runs arbitrary JavaScript inside the user's design app with whatever permissions they granted in Affinity > Settings > Model Context Protocol. These rules keep the user's work, money and machine safe. Each one exists because the failure it prevents is easy to cause and hard to undo.

## 1. The user's documents

- **Work on a copy.** Before the first edit to a document the user opened, `saveAs` a new file on the Desktop (`recipes/save-copy.md`). The original on disk then stays untouched no matter what happens.
- **Only touch what you created or were pointed at.** Identify documents by `sessionUuid` from `Document.all`; `Document.current` changes whenever a new document is created or the user clicks another tab.
- **Never call `save()`, `saveAs()` over an existing path, or `close()` on a document you did not create, unless the user asked.** `close()` on a document with no path discards it without any prompt.
- **Exports go to new file names.** Do not overwrite an existing file; add a suffix instead.
- **Prefer non-destructive edits** (duplicate layers, live filter and adjustment layers, separate layers for generated content) so a designer can still adjust the result.
- **Undo is your friend.** Every command lands in History; check `doc.undoDescription` and call `doc.undo()` to back out of a bad step.

## 2. Canva AI credits

- `generateImage(prompt)` and `generativeEditImage(prompt)` call Canva's cloud and consume the user's monthly Canva AI allowance (Premium/Ultra tiers consume more). **Ask before calling them**, say what you will generate, and do not retry in a loop.
- `selectSubject()` and `removeBackground()` are not counted against the monthly limit, but they still need a paid Canva plan and a connection.
- `detectDepth()` and `colourise()` run on local models.
- There is no API to read the remaining allowance. If a call fails, report it; do not hammer it.
- If the permission is off you get `NOT_ALLOWED` or `PERMISSION_DENIED`. Tell the user which setting controls it; never try to bypass it.

## 3. Files and network

- File access is limited to the Desktop (`Environment.fileSystemRoots`). Anything else, including `..` and symlinks that leave the Desktop, raises `PERMISSION_DENIED` (1036).
- `NOT_ALLOWED` (145) means the user switched that permission off. Respect it.
- Network requests (`GET`/`POST` only) leave the machine. Do not send document content or personal data anywhere the user did not ask for.

## 4. Code you did not write

- Community script collections and library scripts are untrusted code with the user's file and network permissions. Read them first; never auto-run a downloaded script.
- Do not save scripts to the user's library (`save_script_to_library`) or add hints (`add_sdk_hint`) without a reason the user would agree with. Saving a working script for reuse is a good reason; mention that you did it.

## 5. Interaction

- `Dialog.runModal()` and `alert`-style dialogs block the script until a human responds. Use them only when the user is present and asked for a UI.
- When something is impossible through the SDK (see `system.md`, "What the UI can do that scripts cannot"), say so and point to the UI control, rather than simulating clicks.
