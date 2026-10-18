# Setup

Affinity by Canva (April 2026 release or newer, desktop, macOS or Windows) ships a local MCP server. It speaks SSE at `http://localhost:6767/sse` and only runs while the app is open with MCP enabled.

## 1. Enable the server in Affinity

1. Affinity > Settings (macOS) or Edit > Settings (Windows) > **Model Context Protocol**.
2. Turn on **Enable Affinity MCP**, then choose permissions:

| Toggle | Grants |
|---|---|
| Access files on your Desktop | Open, edit and save files on the Desktop |
| Access networks | HTTP requests from scripts |
| Use saved scripts | Read scripts in the Scripts panel |
| Save scripts to your scripting panel | Save finished scripts for reuse |
| Use Canva AI Studio features | Generative commands; Premium/Ultra use the Canva AI allowance |
| Save task hints to your device's local memory | `add_sdk_hint` |
| Share task hints with Affinity | Anonymous hint sharing |

3. **Quit and reopen Affinity.** The server starts only at launch.

Check: `lsof -iTCP:6767 -sTCP:LISTEN` (macOS) shows the Affinity process.

## 2. Connect a client

| Client | How |
|---|---|
| Claude Code | `claude mcp add --scope user --transport sse affinity http://localhost:6767/sse`, or install this repo as a plugin (it bundles the server entry) |
| Claude Desktop | Settings > Connectors > Browse connectors > Affinity (official Canva connector) |
| Cursor | Install this repo as a Cursor plugin, or add `"affinity": { "url": "http://localhost:6767/sse" }` to `~/.cursor/mcp.json` |
| Codex | Install this repo as a Codex plugin. Codex needs stdio, so the plugin starts `scripts/affinity-sse-bridge.mjs` (Node 18+, no dependencies), which relays to the SSE server |
| Other MCP clients | SSE: point at the URL. Stdio only: run `node scripts/affinity-sse-bridge.mjs` |

## 3. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Connection refused | Affinity closed, MCP disabled, or not restarted after enabling |
| Tools listed but every call fails | Affinity was restarted; reconnect the client (restart the session) |
| `NOT_ALLOWED` | The matching permission toggle is off |
| `PERMISSION_DENIED` on a file | Path is outside the Desktop |
| The claude.ai "Affinity" connector asks for login | That is Affinity CRM (affinity.co), a different product |
| Claude treats the document as an old version | Tell it "I'm using Affinity by Canva, April 2026 release or newer" |
