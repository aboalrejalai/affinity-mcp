# System, files, network, and UI

Affinity by Canva 3.3.1 (build `3.3.1.4940`) runs a local MCP server inside the desktop app. `execute_script` evaluates JavaScript in the app. The host wraps that source in a plain function named `main`, and the only output the client sees is `console.*`.

Tags: **(verified)** ran in the app, **(docs)** SDK wrapper or official help, **(unverified)** not run. Client install steps are in `setup.md`.

## Contents

- [Where the server runs](#where-the-server-runs)
- [MCP tools](#mcp-tools)
- [Script contract](#script-contract)
- [Permissions](#permissions)
- [Application](#application)
- [Operating system](#operating-system)
- [Files](#files)
- [Buffer](#buffer)
- [Network](#network)
- [Dialogs](#dialogs)
- [Script library](#script-library)
- [Macros](#macros)
- [Hints and issue reports](#hints-and-issue-reports)
- [Logging](#logging)
- [Timers and async work](#timers-and-async-work)
- [JSON configuration](#json-configuration)
- [What the UI can do that the SDK cannot](#what-the-ui-can-do-that-the-sdk-cannot)

## Where the server runs

- Desktop Affinity by Canva, April 2026 or newer, macOS or Windows. Mobile is out of support. MCP is unavailable in Affinity China (docs).
- Settings path: Affinity menu (macOS) or Edit (Windows) > Settings > **Model Context Protocol**. The official control label is **Enable MCP server**; quit and reopen so the server starts (docs). The category string `Model Context Protocol` is in the app (verified).
- The server is local and is up only while that app is open. Official help does not publish a port or transport (docs). Address, SSE, and per-client setup: `setup.md`.
- The official Claude connector authenticates through the desktop app when the user is signed in to Canva. There is no API key (docs).
- The design app's server is not the affinity.co CRM server (docs).
- Using MCP spends Canva AI allowance only when **Use Canva AI Studio features** is on and a Premium or Ultra feature runs. Claude's own usage follows the Claude plan (docs). Command details are in `ai.md`.

In-app scripting is a separate settings page: Settings > Scripting > **Enable Affinity Scripting**, off by default, with its own file, network, and Canva AI permissions plus extra allowed folders (docs). Those folders do not widen MCP access. MCP files stay on the Desktop.

## MCP tools

Eleven tools. Argument names below are the tool schema (verified). The official connector lists the same eleven names and does not publish arguments (docs). `render_spread` and `render_selection` were not called; the 1024 px cap is the schema text.

| Tool | Arguments | Use when |
|---|---|---|
| `execute_script` | `script` (string, required) | Run JavaScript. The client gets no return value; log through `console` |
| `render_spread` | `document_session_uuid`, `spread_index` (zero-based) | Look at one spread. JPEG, base64, longest side 1024 px, possibly downscaled |
| `render_selection` | `document_session_uuid` | Look at the current selection. Same 1024 px cap |
| `list_sdk_documentation` | none | List documentation topic filenames |
| `read_sdk_documentation_topic` | `filename` | Read one topic. Read `preamble` before the others |
| `list_library_scripts` | none | Names in the Scripts panel. An empty library returns an empty result |
| `read_library_script` | `title` | Source of one saved script. A missing title returns `Script not found` |
| `save_script_to_library` | `title`, `description`, `code` | Keep a finished script in the Scripts panel |
| `search_sdk_hints` | `prompt` | Search crowd-sourced hints before a long experiment |
| `add_sdk_hint` | `hint` | Store a lesson in this machine's `preamble` for later sessions |
| `report_sdk_issue` | `description` (required), `code` (optional) | Report a real SDK defect to Affinity |

`Document` exposes `sessionUuid` and `persistentUuid` (verified names). Pass `sessionUuid` to the render tools.

## Script contract

- A syntax error is reported as `SyntaxError … at main:<line>` (verified). Top-level `await` is a syntax error because `main` is not `async` (verified).
- Paste straight-line script. `execute_script` does not use `module.exports.main` (docs). `Environment.configuration` during a run is `{ asModule: false, code: <this script> }` (verified), so `import` / `export` are not the MCP path. The Script Editor's **Run as module** option is the in-app ES module switch (docs).
- JavaScript SDK files: `require('/document.js')`. Native modules: `require('affinity:fs')` and the same `affinity:` form (docs).
- Read the `preamble` topic first, then the topic closest to the task (docs). After `search_sdk_hints`, still check the wrapper or a run; hints contradict the API (see [Hints](#hints-and-issue-reports)).
- Output with `console.log`, `info`, `warn`, `error`, `debug`, `dir`, `table`, `trace`, `assert`, or `time` (those names exist). Anything you need back in the client has to be logged.
- The `tests/` tree is sketches. `tests/filetests.js` still calls `require('/file.js')` and `FileAsyncs`; the live module is `/fs.js` (docs).
- Numeric ranges live in `param_ranges.min.json`, `struct_ranges.min.json`, and `struct_array_sizes.min.json` (docs).
- Signature pages, without prose: `https://sdk.affinity.studio/latest/js/` under `apis/<Api>/index.html`, `apis/<Api>/<method>.html`, `enums/<Enum>.html`, `classes/<Class>.html`, plus `objects.inv` (docs).

## Permissions

Three permissions are visible to a script. Enum keys `FileSystem`, `Network`, `GenAI` are `0`, `1`, `2`. `Environment.permissions` is `{ fileSystem, network, genAI }` with booleans, and it freezes after the first read (verified). `Environment.hasPermission(EnvironmentPermission.FileSystem)` is the native check (docs).

```javascript
const { Environment, EnvironmentPermission } = require('/environment.js');
console.log(JSON.stringify(EnvironmentPermission.keys));
console.log(JSON.stringify(Environment.permissions));
console.log(JSON.stringify(Environment.fileSystemRoots));
```

`fileSystemRoots` is a one-element array: the Desktop, the same path as `Application.userDesktopPath` (verified). Subfolders of the Desktop are inside the root.

No script API flips these toggles. `Application.settings` does not contain them (verified key list; docs for `application.js`).

### The seven settings toggles

Official help lists these seven under Model Context Protocol (docs). The three confirmation dialogs `Confirm Desktop Access`, `Confirm Network Access`, and `Confirm Canva AI Access` are app strings (verified).

| Toggle | What it grants |
|---|---|
| Access files on your Desktop | Open, edit, and save files on the Desktop |
| Access networks | Local network and internet from scripts |
| Use saved scripts | Read scripts in the Scripts panel |
| Save scripts to your scripting panel | `save_script_to_library` |
| Use Canva AI Studio features | Generative commands. Premium and Ultra use the Canva AI allowance |
| Save task hints to your device's local memory | `add_sdk_hint` writes this machine's preamble |
| Share task hints with Affinity | Anonymous hint sharing |

### `NOT_ALLOWED` (145) and `PERMISSION_DENIED` (1036)

Both are `ErrorCode` values (`require('affinity:common')`). `NOT_ALLOWED.value` is `145` and `PERMISSION_DENIED.value` is `1036` (verified). An `ErrorCode` object stringifies to its name and has a `value` field.

| Code | When it surfaces |
|---|---|
| `NOT_ALLOWED` (145) | The preamble says a command returns this when the user has turned off AI, files, or network (docs). A live throw with a toggle off was not captured |
| `PERMISSION_DENIED` (1036) | File access is on, and the path is outside the Desktop, contains `..` that leaves it, or is a symlink aimed outside. This is a normal `Error`, not `NOT_ALLOWED` (verified) |

On that file error, `message === "PERMISSION_DENIED"`, `errorCode` is an object whose only field is `value`, and there is no `code` property (verified).

```javascript
const { ErrorCode } = require('affinity:common');
const { FileSystemApi } = require('/fs.js');
try {
  FileSystemApi.exists('/tmp');
} catch (error) {
  console.log(error.message, error.errorCode.value, error.code);
  console.log(error.errorCode.value === ErrorCode.PERMISSION_DENIED.value);
}
```

MCP tool gates return English sentences, not the code name. These strings are in the app; the tools were not called while the toggles were off (verified text):

| Tool | Text when that setting is off |
|---|---|
| Read the library | `Reading library scripts has been disabled in Affinity settings.` |
| Save to the library | `Saving to the scripts library has been disabled in Affinity settings.` |
| `add_sdk_hint` | `Adding hints to the preamble has been disabled in Affinity settings.` |
| `report_sdk_issue` | `Reporting SDK issues has been disabled in Affinity settings.` |

`report_sdk_issue` has its own sentence. It is not one of the seven help-page labels. Whether search is gated by **Share task hints with Affinity** is (unverified): no "search disabled" sentence was found.

Tell the user which toggle is off. There is no script workaround.

## Application

`require('/application.js')` wraps `affinity:application`. `require('/environment.js')` is the script environment.

```javascript
const { Application } = require('/application.js');
const { Environment } = require('/environment.js');
console.log(Application.version);
console.log(Application.shortVersion, Application.platformName, Application.userDesktopPath);
console.log(Environment.sdkVersionStr, Environment.v8VersionStr, String(Environment.logLevel));
```

Product identity on the 3.3.1.4940 desktop build (verified):

| Property | Value |
|---|---|
| `version` | `Affinity 3.3.1.4940 MacOS (Oct  6 2026)` |
| `shortVersion` | `3.3.1.4940` |
| `majorVersion`, `minorVersion`, `revisionVersion`, `buildVersion` | `3`, `3`, `4940`, `1` |
| `documentVersion` | `33` |
| `platformName` | `MacOS` |
| `buildKind` | `AffinityRetail` |
| `uiParadigm` | `Desktop` |
| `productShortName`, `productFullName`, `productPrimaryFileExtension` | `Affinity`, `Affinity 3`, `af` |
| `compileDate` | `Oct  6 2026` |
| `Environment.sdkVersionStr` | `0.1` |
| `Environment.v8VersionStr` | `11.5.150.4` |

`BuildKind.keys`: `AffinityRetail`, `AppStoreRetail`, `InternalAlpha`, `CustomerBeta`, `PublicBeta`. `UiParadigm.keys`: `Desktop`, `Tablet` (verified).

`Application.userDesktopPath` is the Desktop. `Application.resourcesPath` is inside the app bundle and outside that root, so `fs` reads of it raise `PERMISSION_DENIED` (verified rule). `Application.documents.all`, `.current`, and `.load(path)` forward to `Document` (docs). `load` was not called.

`ApplicationApi` keys are the version, `getUserDesktopPath`, `getResourcesPath`, `getArgC`, and `getArgV`. There is no tool, studio, clipboard, or general-preferences API on it (verified).

`Application.settings` has three properties (verified reads; docs for the shape):

| Property | Observed | Write |
|---|---|---|
| `loadPSDWithEditableText` | `true` | Has a setter. Leave it unless the user asked |
| `undoLimit` | `1024` | Getter only |
| `allowCodeGenerationFromStrings` | `true` | Getter only |

`allowCodeGenerationFromStrings` matches Settings > Scripting > Dynamic Code Generation > **Allow code generation from strings**, which official help ties to `eval` (docs). `eval` and `new Function` were not tested (unverified).

`Environment.logLevel` is writable through `setLogLevel`. `LogLevel.keys` are `All`, `Trace`, `Debug`, `Info`, `Warn`, `Error`, `None` at `-1, 0, 1, 2, 3, 4, 5`. The observed level was `All` (verified). Leave it; file logging takes its own level.

`Environment.quit()` takes no arguments (docs). Its effect was not tested. Leave it uncalled.

`Environment.getHeapStatistics()` returns an object that stringifies as `[object HeapStatistics]`. Reading `usedHeapSize` and the other documented fields (`totalHeapSize`, `heapSizeLimit`, `externalMemory`, `doesZapGarbage`, and the rest) yields `undefined`, and calling them on the class throws `expected this to be HeapStatistics` (verified failure; field names are docs). It does not give a heap reading.

`Environment.postTask` and `Environment.configuration` are under [Timers](#timers-and-async-work) and [JSON configuration](#json-configuration).

## Operating system

`require('/os.js')` wraps `affinity:os` (`OSApi`).

```javascript
const { OS } = require('/os.js');
console.log(JSON.stringify({
  arch: OS.arch,
  platform: OS.platform,
  release: OS.release,
  osName: OS.osName,
  osVersion: OS.osVersion,
  machine: OS.machine,
  eol: OS.Eol
}));
```

The properties report the host. `OS.Eol` is `"\n"` (verified). On one macOS Apple Silicon host, `arch` and `machine` were `arm64`, `platform` was `Darwin`, `osName` was `macOS` (verified).

`OSApi` is only `getArchitecture`, `getEol`, `getMachine`, `getOSName`, `getOSVersion`, `getPlatform`, and `getRelease`. There is no process spawn, home directory, or environment-variable API (verified).

## Files

`require('/fs.js')` wraps `require('affinity:fs')`. Exports: `File`, `Directory`, `DirectoryIterator`, `FileStatus`, `FileSystemApi` (alias `fs`), `FileSystemPromises` (alias `promises`), enums `FileOrigin`, `FilePermissions`, `PathType`, `CopyOptions`, `PermOptions`, and `FileSystemSpace` (docs).

The root is the Desktop, including folders under it. These calls were run (verified):

| Call | Result |
|---|---|
| `exists`, `isDirectory`, `getCanonical`, `getAbsolute` on the Desktop | Success. Canonical path is the Desktop |
| `exists` on a folder under the Desktop | `true` for a real folder |
| `exists` on a missing path under the Desktop | `false`, no throw |
| `File.create` of a missing file with mode `rb` | `NO_SUCH_FILE_OR_DIRECTORY` |
| `exists` / `isDirectory` / `getCanonical` on `/tmp`, the home directory, `Documents`, or `/etc/hosts` | `PERMISSION_DENIED` |
| A Desktop path whose `..` segments leave the Desktop | `PERMISSION_DENIED` |
| `createSymlink` from a Desktop path to `/tmp` | `PERMISSION_DENIED`, and no link is left behind |
| `DirectoryIterator` of the Desktop | Success |
| `DirectoryIterator` of `/tmp` | `PERMISSION_DENIED` |
| `createDirectory` then `remove` of a test folder on the Desktop | Success, including the delete |
| `File.create(path, 'wb')`, `writeString`, `readAll`, `remove` | The bytes round-trip, then the file is gone |

Crowd hints that subfolders are rejected, or that macOS Desktop writes fail, are false (verified).

```javascript
const { Application } = require('/application.js');
const { File, FileSystemApi } = require('/fs.js');
const path = Application.userDesktopPath + '/affinity-probe.txt';
const file = File.create(path, 'wb');
file.writeString('probe');
file.close();
const text = File.readAll(path).toString();
FileSystemApi.remove(path);
console.log(text, FileSystemApi.exists(path));
```

`File.create(path, mode)` is the constructor. `new File(path, mode)` warns that it is deprecated (docs). If `mode` is omitted, `open` uses `'r'` (docs). `'wb'` is the mode that was written (verified). `'w'`, `'a'`, and `'r+'` were not tried (unverified). The native `open` page does not define mode letters (docs).

`FileOrigin.keys`: `Begin`, `Current`, `End` at `0`, `1`, `2` (verified).

`read` writes into a `Buffer` and returns the byte count. `writeString` encodes UTF-8. `writeStringAsUtf16` is the UTF-16 writer. `position` reads `tell()` and writes `seek(value, FileOrigin.Begin)`. Also present: `length`, `size`, `isEof`, `isOpen`, `flush`, `close` (docs). Native `FileApi`: `create`, `open`, `seek`, `read`, `write`, `tell`, `isEof`, `isOpen`, `flush`, `getLength`, `close`, plus a `*Async` form of each (docs).

`File.readAll` returns a `Buffer` (verified). HTTP bodies are not the same type; see [Network](#network).

List a folder:

```javascript
const { Application } = require('/application.js');
const { Directory } = require('/fs.js');
const dir = new Directory(Application.userDesktopPath);
console.log(dir.entries.filePaths.toArray().length);
```

Non-recursive Desktop listing works (verified). `Directory.entries` wraps `DirectoryIterator.at(path)` (`done`, `next()`, `path`, `fileSize`, `fileStatus`, `symlinkStatus`). `entries.all` walks recursively. `entries.files` keeps `PathType.File` (docs). Log a count, or a path the user named, when the Desktop is large.

`PathType.keys`: `None`, `NotFound`, `File`, `Directory`, `Symlink`, `Block`, `Character`, `Fifo`, `Socket`, `Unknown` (verified). `FileStatus.statusString` builds an `ls -l` style string from the type and `FilePermissions` (docs).

`FileSystemApi` also has `copy`, `copyFile`, `rename`, `remove`, `removeAll`, `resizeFile`, `setFilePermissions`, `createDirectory`, `createDirectories`, `createSymlink`, `createDirectorySymlink`, `readSymlink`, `isRegularFile`, `isDirectory`, `isSymlink`, `isEmpty`, and the other existence checks, with `*Async` forms where the key list has them (verified names). `remove` on the probe file succeeded. `removeAll`, `copy`, `rename`, `resizeFile`, and `setFilePermissions` were not called.

`CopyOptions.keys`: `None`, `SkipExisting`, `OverwriteExisting`, `UpdateExisting`, `Recursive`, `CopySymlinks`, `SkipSymlinks`, `DirectoriesOnly`, `CreateSymlinks`, `CreateHardLinks`. `PermOptions.keys`: `Replace`, `Add`, `Remove`, `NoFollow` (verified names). How flags combine (bitwise OR or an array) is (unverified). `FilePermissions` has owner, group, and other flags plus `SetUid`, `SetGid`, `StickyBit`, `Mask`, and `Unknown` (verified names).

`getSpace(desktopPath)` returns `FileSystemSpace` with `capacity`, `free`, and `available` (verified).

Nearly every synchronous call has `*Async(…, callback)` and a `FileSystemPromises` method that returns a `Promise`. The callback is err-first on both success and failure (docs). `closeAsync(cancelOps, callback)` is the file-level cancel (docs).

## Buffer

`require('/buffer.js')` wraps `affinity:buffer`.

```javascript
const { Buffer } = require('/buffer.js');
const buf = Buffer.utf8('أهلا');
console.log(buf.length, buf.toString(), buf.toString('utf8'));
```

That string is length `8` and both `toString` calls return it (verified).

Also on the wrapper: `Buffer.create(size)`, `utf16(str)`, `clone`, `span(start, end)`, `slice(start, end)`, `equals`, `compare`, `compareSome`, `concat`, `reverse`. `array` is a `Uint8Array` on `arrayBuffer`. `span` calls `createSpan` and `slice` calls `createSlice` (docs). Whether those two share memory was not measured (unverified).

## Network

`require('/network.js')` wraps `affinity:network`. `RequestMethod.keys` are `Get` and `Post` only (verified). There is no PUT, DELETE, or HEAD.

`HttpRequestApi` methods: `create`, `do`, `doAsync`, `getHeaderValue`, `setHeaderValue`, `setTimeoutInSec`, `setSuppressUserAgentHeader`, `setEncodeHeaderValuesAsRfc2047`, `setUseExpensiveNetwork`, `setUseConstrainedNetwork`, `setAvoidChunkedTransferEncoding` (verified). There is no request-body method, so a POST has nowhere to put a payload. `doAsync` and `Post` were not run. `doAsync(callback)` is documented as `(state, response, reason)` (docs). `tests/networkTests.js` posts to `https://httpbin.org/post` with no body; the preamble treats `tests/` as stale, and that file was not run (docs).

Needs the network permission. Send only what the user asked to send.

```javascript
const { HttpRequest, RequestMethod } = require('/network.js');
const req = HttpRequest.create('https://example.com/', RequestMethod.Get);
req.setTimeoutInSec(20);
req.setHeaderValue('accept', 'text/html');
const result = req.do();
console.log(String(result.state), result.state.value, result.reason);
console.log(String(result.response.statusCode), result.response.statusCode.value);
console.log(result.response.getHeaderValue('content-type'));
console.log(typeof result.response.content, result.response.content.length);
```

A GET of `https://example.com/` returned state `OK` (`0`), `reason` `""`, status `Ok` (`200`), header `text/html; charset=utf-8`, and `content` as a string (verified). `HttpRequestResult` fields are `state` (`ErrorCode`), `response`, and `reason`; the wrapper turns `response` into `HttpResponse` (docs).

`HttpStatusCode.keys` run from `Continue` through `NetworkAuthenticationRequired` and include the non-standard names `Invalid`, `Unauthorized`, `Throttled`, and `UnknownError`. `Ok` is `200` (verified). Other numeric values were not printed.

Binary content (an image, for example) may not stay a usable string. A binary response was not fetched (unverified). Branch on `typeof result.response.content` before treating it as text. `File.readAll` returns a `Buffer`; this field returned a string (verified).

## Dialogs

Custom UI is `require('/dialog.js')` (`affinity:ui`). Call `runModal` when a person is present and expects a dialog. `runModal()` blocks until they answer, and `execute_script` waits with it, so an unattended run stalls on this call. The same is true of `Application.alert`, `confirm`, `prompt`, and `chooseFile` (docs). They were not opened.

`DialogApi.runModal(self)` returns a `DialogResult` (docs). `DialogResult.keys` are `Cancel` then `Ok`, values `0` and `1` (verified). The live return shape was not executed (unverified). On the first real dialog, log `String(result)` and `result.value`. When `result` is an enum object, Ok is `result.value === DialogResult.Ok.value`. `show()` is deprecated and calls `runModal` (docs).

```javascript
const { Dialog, DialogResult, UnitType } = require('/dialog.js');
const dialog = Dialog.create('Rename');
dialog.isResizable = true;
const group = dialog.addColumn().addGroup('Layer');
const box = group.addTextBox('Name', 'background');
const size = group.addUnitValueEditor('Size', UnitType.Pixel, UnitType.Pixel, 100, 1, 4000);
const result = dialog.runModal();
if (result && result.value === DialogResult.Ok.value) {
  console.log(box.text, size.value);
}
```

The control construction matches the wrapper (docs). The `runModal` line was not executed.

Every control is added on a `DialogGroup`. A column is `dialog.addColumn()`, a group is `column.addGroup(name)`.

| Method | Class | Value after close |
|---|---|---|
| `addStaticText(label, text)` | `DialogStaticText` | `text` |
| `addTextBox(label, text)` | `DialogTextBox` | `text`. Also `isMultiLine`, `rowSpan` |
| `addCheckBox(label, initialValue)` | `DialogCheckBox` | boolean `value` |
| `addSwitch(label, initialValue)` | `DialogSwitch` | boolean `value` |
| `addComboBox(label, items, initialItem)` | `DialogComboBox` | `selectedIndex` |
| `addRadioGroup(label, items, initialItem)` | `DialogRadioGroup` | `selectedIndex` |
| `addButtonSet(label, items, initialItem)` | `DialogButtonSet` | `selectedIndex` |
| `addButton(label)` | `DialogButton` | `onClickHandler` |
| `addUnitValueEditor(label, units, displayUnits, initialValue, minValue, maxValue)` | `DialogUnitValueEditor` | `value` and `units`. `null` for a bound clears that bound |
| `addUserUnitValueEditor(...)` | `DialogUnitValueEditor` | Same class, bounds are `UserUnitType` |
| `addSpatialAnchor(label, initialValue)` | `DialogSpatialAnchor` | `value`. Default `SpatialAnchor.None` |
| `addColourPicker(label, colour)` | `DialogColourPicker` | `value` is a `Colour` or `null`. Also `allowPickNone`, `allowNoise` |
| `addFontPicker(label)` | `DialogFontPicker` | `text`, `font`, `fontFamily`, `fontCollection` |
| `addFillEditor(label, fillOrColour)` | `DialogFillEditor` | `fill`. A plain colour is wrapped as `SolidFill` |
| `addStrokeEditor(label, lineStyle)` | `DialogStrokeEditor` | `stroke`, a `LineStyleDescriptor` |
| `addColumnStack()` | `DialogColumnStack` | Side-by-side columns via `addColumn()` |

`DialogItemType.keys`: `Unknown`, `Separator`, `Switch`, `ComboBox`, `ButtonSet`, `RadioGroup`, `StaticText`, `UnitValueEditor`, `CheckBox`, `SpatialAnchor`, `ColourPicker`, `TextBox`, `FontPicker`, `FillEditor`, `StrokeEditor`, `Group`, `Column`, `ColumnStack`, `Button` (verified). `Separator` has no `addSeparator` on the wrapper (docs).

`UnitType` names used by the unit editor include `Pixel`, `Inch`, `Point`, `Millimetre`, `Centimetre`, `Percentage`, and `Degree`; the enum has further members (verified for the names listed). Spelling is British: `Millimetre`, `Centre`. `UserUnitType.keys`: `Default`, `Text`, `Line`. `HorizontalAlignment.keys`: `Left`, `Centre`, `Right`, `Fill` (verified). `SpatialAnchor` comes from `affinity:dom`: `None`, `TopLeft`, `CentreLeft`, `BottomLeft`, `TopCentre`, `Centre`, `BottomCentre`, `TopRight`, `CentreRight`, `BottomRight`, `FocalPoint` (verified).

Shared control fields: `isVisible`, `isEnabled`, `label`, `description`, `isFullWidth` on many items, `controlID` looked up with `dialog.findControl(id)`. Dialog-level: `setItemsVisibility(showIDs, hideIDs)`, `initialWidth`, `isResizable`, `isRunningModal`. Column: `widthProportion`, `paddingFactor` (docs).

`setIsEnabledBy`, `setIsDisabledBy`, and the related helpers are deprecated and do nothing (docs). Toggle `isEnabled` inside the change handler:

```javascript
box.setOnValueChangedHandler(() => {
  other.isEnabled = box.text.length > 0;
});
```

`DialogButton.onClickHandler` sets `onValueChangedHandler`. The dialog accepts `onControlValueChangedHandler`. The handler argument was not executed (docs; argument shape unverified).

There is no free-form file list, standalone slider, image, tab strip, or drawing surface (docs).

### System dialogs

`Application.alert`, `confirm`, `prompt`, `chooseFile`, and the `*Async` forms forward to `UiApi` (docs). They block the app the same way `runModal` does.

| Method | Arguments | Documented return |
|---|---|---|
| `UiApi.alert(message, title)` | two strings | none |
| `UiApi.confirm(message, title)` | two strings | `Boolean` |
| `UiApi.prompt(message, title, initialText)` | three strings | `String` |
| `UiApi.chooseFile()` | none | `String` |
| `alertAsync`, `confirmAsync`, `promptAsync`, `chooseFileAsync` | the same arguments, then `callback` | the function exists on `UiApi` |

`UiApi` keys are exactly those eight. There is no `chooseFolder` and no save panel (verified). Whether a path from `chooseFile` can lie outside the Desktop was not tested (unverified). Stay on `fileSystemRoots` for anything you open afterwards.

## Script library

Listing and reading are MCP tools, not script APIs. There is no `affinity:script` module (verified).

- `list_library_scripts` takes no arguments. With nothing saved, the result is empty (verified).
- `read_library_script` takes `title`. An unknown title returns `Script not found` (verified).
- `save_script_to_library` takes `title`, `description`, and `code`. It was not called. App text for the outcomes: `SUCCESS: Script saved to library`, `Script could not be saved to library`, `A script with that title already exists`, `Unsupported script type` (verified text). Confirm the success string before reporting that the script was saved.
- Official help: a saved script is not replaced in place; the next version is stored under a new name (docs). Pick a new `title` when `A script with that title already exists`.
- Manual run from the panel: Window > General > Scripts (docs). The scripting workspace itself is Window > Scripting, or Scripting Studio in Studio Manager, with Script Editor, Running Scripts, Scripts Library, and Log Console (docs).

Code sent to `execute_script` is already inside `main`. Code saved for the panel follows the in-app shape: a `main` function that the file calls (docs). Whether the panel runs a file that never calls `main` is (unverified).

Read a library script before running it. It executes with the user's file and network permissions (`safety.md`).

## Macros

There is no `affinity:macro` module. Recording, import, export, and clear are methods on the document; replay is a command. The wrappers below were read with `toString` (verified). None of them was executed, so the effect on the Macros panel is (unverified). Call them when the user asked to record or replay. They change the open document's macro state.

| Wrapper | Native command |
|---|---|
| `doc.importMacro(path)` | `DocumentCommand.createImportMacro(path)` then `executeCommand` |
| `doc.exportMacro(path)` | `createExportMacro(path)` |
| `doc.clearMacro()` | `createClearMacro()` |
| `doc.startRecordingMacro()` | `createStartRecordingMacro()` |
| `doc.stopRecordingMacro()` | `createStopRecordingMacro()` |
| no `doc.replayMacro` | `DocumentCommand.createReplayMacro()` with no path, then `doc.executeCommand(cmd)` |

```javascript
const { Document } = require('/document.js');
const { DocumentCommand } = require('/commands.js');
const { Application } = require('/application.js');
const doc = Document.current;
doc.importMacro(Application.userDesktopPath + '/recorded.afmacro');
doc.executeCommand(DocumentCommand.createReplayMacro());
```

`startRecordingMacro` exists on the wrapper. Hints that say it does not are wrong (verified). The native parameter name is `macroPath` and the expected type is `Path` (`expected parameter macroPath to be Path`, verified text). The wrapper forwards the JavaScript value. Whether a string is accepted was not tested (unverified). The file suffix is not named in `document.js` or the scripting library (no `.afmacro` and no `afmacros` string there), so the `.afmacro` suffix in the sample is (unverified). Confirm it from a file the user exported. Whether a second `importMacro` replaces the loaded macro is (unverified).

There is no command that lists panel macros by name. Import from a path, then replay the loaded macro (verified by the command list).

`createUndo`, `createRedo`, and `createSetHistoryIndex` are history commands, not the macro panel (verified names).

## Hints and issue reports

### `search_sdk_hints`

The tool text describes a global pool built from other MCP sessions (verified). Call it before a long experiment (docs), then check the result against `require` source or a run. Returned hints have contradicted this app, including "no `startRecordingMacro`" and "macOS Desktop writes fail" (verified that those claims are false).

The app links this path to `Learning::RemoteInference::InferTextToMCPHints` (verified symbol). Treat `prompt` as leaving the machine. Keep private paths and document content out of it. No packet was captured, and no "search disabled" sentence was found (unverified whether **Share task hints with Affinity** gates search).

### `add_sdk_hint`

One argument, `hint`. It is added to the `preamble` topic for later sessions. That topic has a section `Hints you recorded from previous sessions` (verified). Success text in the app: `SUCCESS: Hint added to preamble for future sessions`. The off switch is **Save task hints to your device's local memory** (docs; disable sentence verified). The tool was not called.

**Share task hints with Affinity** is the official anonymous-sharing toggle (docs). Whether `add_sdk_hint` also uploads through `RecordMCPHint` is (unverified); the symbol exists. Write a short technical lesson, not paths or document content. Record one after a real experiment when the user would want it kept (`safety.md`).

### `report_sdk_issue`

`description` is required, `code` is optional. The tool's purpose is a real SDK defect sent to Affinity (docs). It was not called. What you put in the two arguments is what leaves the machine. The off sentence is the one in the permissions table.

## Logging

`require('/logging.js')` wraps `LogFileApi` from `affinity:common`. The log folder has to be one the script may write, which for MCP means the Desktop (docs). `flush` does not wait for a record still in the queue (docs).

```javascript
const { Application } = require('/application.js');
const { LogFile, LogLevel } = require('/logging.js');
const { File, FileSystemApi } = require('/fs.js');
const path = Application.userDesktopPath + '/affinity-script.log';
const logFile = LogFile.create(path, LogLevel.Info, false);
logFile.start();
console.info('probe-log-line');
logFile.flush();
logFile.stop();
const body = File.readAll(path).toString();
FileSystemApi.remove(path);
console.log(body);
```

The file line was `[00:46:24.394] [INFO] [MCP] probe-log-line`. `console.info` also appeared in the `execute_script` output. The file was removed (verified). The third argument of `create` was `false` in that call; its meaning is the wrapper's, and it was not varied.

The official `examples/logToFile.js` says level `Info` drops `console.debug` and keeps `info`, `warn`, and `error`, and raising the level to `Error` drops `warn` (docs). That ladder was not remeasured. An `info` line does land in the file (verified).

## Timers and async work

`require('/timers.js')` wraps `affinity:timers`.

`Timer.now` is a monotonic clock. Set `expiryFromNow` in milliseconds: a value of `200` fired about `239` ms later (verified). Precision is coarser than 1 ms. `sleep` is the native function on `affinity:timers`; `sleep(10)` returned after about `79` ms, so it is not ten seconds (verified).

In the wrapper, `setTimeout`, `setInterval`, and `setImmediate` are `(delay, callback, ...args)`: the delay comes first, unlike the browser (docs). `setInterval` reschedules itself from the callback unless that callback hits an error (docs). Also present: `Timer.cancel()`, `Timer.cancelAll()`, `dispose()`, `moveExpiry`, `expiry`, `expiryFromNow`, `nowBigInt` (docs). `cancelAll` was not called.

```javascript
const { Timer } = require('/timers.js');
const timer = Timer.create();
timer.expiryFromNow = 200;
timer.waitAsync((err) => console.log('timer', String(err), Timer.now));
```

The callback ran before `execute_script` returned. `err` was `undefined`, not `ErrorCode.OK` (verified). `Environment.postTask` behaves the same way, and the `console.log` after `postTask(...)` runs before the task (verified):

```javascript
const { Environment } = require('/environment.js');
Environment.postTask(() => console.log('posted'));
console.log('first');
```

Returning a `Promise` from the script is not what makes the tool wait. The host pumps the event loop, so queued timers finish before the tool returns (verified).

Top-level `await` throws. Sequence waits inside a function and call it. `waitAsync` was the call that ran; this wrapper is the same pump (docs for the `async` shape):

```javascript
async function run() {
  const { Timer } = require('/timers.js');
  const timer = Timer.create();
  timer.expiryFromNow = 200;
  await new Promise((resolve) => timer.waitAsync(() => resolve()));
  console.log('after', Timer.now);
}
run();
```

`File.prototype.promises`, `FileSystemPromises`, and `HttpRequest.doAsync` use the same callback shapes: `(err, …)` or `(state, response, reason)` (docs).

A long call with no timer and no `postTask` stays on the synchronous stack and holds the script thread. There is no general progress or cancel channel; cancel is whatever that API offers, such as `closeAsync(cancelOps, callback)` on a file (docs).

## JSON configuration

`require('/configuration.js')` wraps `ConfigurationItemApi` (`affinity:common`). It parses JSON. It is not Affinity's preferences and it is not `Environment.configuration`.

```javascript
const { ConfigurationItem } = require('/configuration.js');
const item = ConfigurationItem.createFromJsonString('{"count":2,"name":"layer"}', false);
console.log(item.getPropertyInt('count'), item.value.name);
```

`createFromJsonString(jsonStr, allowComments)` was not executed; the shape is the wrapper (docs). `valueType` is a `ConfigurationValueType`: `Object`, `Array`, `String`, `Float`, `Uint`, `Int`, `Bool`, `Null`, `Binary`. `value` turns objects and arrays into JavaScript values. `enumerateProperties` uses `EnumerationResult.Continue` or `Stop` (docs).

## What the UI can do that the SDK cannot

Checked against `Document.prototype`, the `DocumentCommand` list, and the `affinity:*` modules (verified). When a request needs one of these, say so and name the UI control.

| In the app | In the SDK |
|---|---|
| Copy, cut, and paste | No `affinity:clipboard` module. No command whose name contains `Copy`, `Paste`, `Clipboard`, or `Cut` |
| Choose a tool, studio, or panel | No `affinity:tools` or `affinity:studio`. `*.afstudio` files in the bundle, including `11 Scripting.afstudio`, are UI layouts. A Preferences category named `Tools` is UI text only |
| Change MCP toggles or allowed folders | Not on `Application.settings`, and no script function writes them |
| Save panel or folder chooser | `UiApi` exposes `chooseFile` only |
| HTTP methods other than GET and POST, or a request body | `RequestMethod` is `Get` and `Post`. `HttpRequestApi` has no body method |
| Files outside the Desktop, including `..` and outward symlinks | `PERMISSION_DENIED` (1036) |
| Click menus, drag, or send keystrokes | No general UI-event API. The commands that exist are `DocumentCommand` |
| List macros in the panel by name | No such function. Import from a path, then replay |
| Read heap figures | `getHeapStatistics()` returns an object whose fields do not read |
| Add a tool, change the core UI, keep running in the background, intercept input, replace a built-in tool, or react to events as they happen | Stated limits of scripting (docs). A script runs when launched, then ends |

Saving, closing, and exporting a document are on `Document` (`saveAsync`, `closeAsync`, `exportAsync`). They are outside this system surface; the rules for them are in `safety.md`.
