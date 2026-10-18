#!/usr/bin/env node
// Stdio <-> SSE relay for the Affinity by Canva MCP server.
// Affinity serves MCP over SSE (http://localhost:6767/sse). Clients that only speak
// stdio (for example Codex) launch this script instead. No dependencies; Node 18+.
// It only ever connects to a loopback address and only relays JSON-RPC messages.

const DEFAULT_URL = 'http://localhost:6767/sse';
const sseUrl = new URL(process.env.AFFINITY_MCP_SSE_URL || DEFAULT_URL);

if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(sseUrl.hostname)) {
  console.error(`[affinity-bridge] refusing non-loopback URL: ${sseUrl.href}`);
  process.exit(1);
}

const log = (...a) => console.error('[affinity-bridge]', ...a);
let postUrl = null;
const pending = [];

async function post(message) {
  const res = await fetch(postUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: message,
  });
  if (!res.ok) log(`POST ${res.status} ${await res.text().catch(() => '')}`);
}

function handleEvent(event, data) {
  if (event === 'endpoint') {
    postUrl = new URL(data.trim(), sseUrl).href;
    while (pending.length) post(pending.shift()).catch(e => log('post failed:', e.message));
  } else if (event === 'message' && data) {
    process.stdout.write(data.replace(/\n/g, '') + '\n');
  }
}

async function connect() {
  let res;
  try {
    res = await fetch(sseUrl, { headers: { accept: 'text/event-stream' } });
  } catch (e) {
    log(`cannot reach ${sseUrl.href}. Is Affinity open with "Enable Affinity MCP" on (and restarted)?`, e.message);
    process.exit(1);
  }
  if (!res.ok || !res.body) { log(`SSE connect failed: HTTP ${res.status}`); process.exit(1); }

  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx;
    while ((idx = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx).replace(/^\r?\n\r?\n/, '');
      let event = 'message';
      const dataLines = [];
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
      }
      handleEvent(event, dataLines.join('\n'));
    }
  }
  log('SSE stream closed by Affinity');
  process.exit(0);
}

let stdinBuffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  stdinBuffer += chunk;
  let nl;
  while ((nl = stdinBuffer.indexOf('\n')) !== -1) {
    const line = stdinBuffer.slice(0, nl).trim();
    stdinBuffer = stdinBuffer.slice(nl + 1);
    if (!line) continue;
    if (postUrl) post(line).catch(e => log('post failed:', e.message));
    else pending.push(line);
  }
});
process.stdin.on('end', () => process.exit(0));

connect();
