#!/usr/bin/env node

/**
 * Minimal MCP server that exposes a `set_key` tool for Claude and serves the
 * current state over HTTP so the React app can poll it.
 */

const {
  McpServer,
  ResourceTemplate,
} = require("./node_modules/@modelcontextprotocol/sdk/dist/cjs/server/mcp.js");
const {
  StdioServerTransport,
} = require("./node_modules/@modelcontextprotocol/sdk/dist/cjs/server/stdio.js");
const { z } = require("zod");
const http = require("http");
const fs = require("fs");
const path = require("path");

const STATE_PORT = parseInt(process.env.MCP_STATE_PORT || "7420", 10);
const DEFAULT_OCTAVE = parseInt(process.env.MCP_DEFAULT_OCTAVE || "3", 10);
const STATE_FILE = path.join(__dirname, "mcp-state.json");

const BASE_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLAT_TO_SHARP = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
const ALLOWED_ROOT_NOTES = Array.from({ length: 6 }, (_, i) => i + 1).flatMap(
  (octave) => BASE_NOTES.map((note) => `${note}${octave}`)
);

const DEFAULT_STATE = {
  rootNote: `C${DEFAULT_OCTAVE}`,
  mode: "Ionian (major)",
};

let state = loadState();

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.rootNote && ALLOWED_ROOT_NOTES.includes(parsed.rootNote)) {
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (err) {
    // File may not exist on first run; fall back to defaults
  }
  return {
    ...DEFAULT_STATE,
    updatedAt: new Date().toISOString(),
  };
}

function persistState(nextState) {
  state = { ...state, ...nextState, updatedAt: new Date().toISOString() };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function normalizeKey(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  const matches = /^([A-Ga-g])([b#]?)(\d+)?$/.exec(trimmed);
  if (!matches) return null;

  const [, letterRaw, accidentalRaw, octaveRaw] = matches;
  const letter = letterRaw.toUpperCase();
  const accidental =
    accidentalRaw === "b" ? "b" : accidentalRaw === "#" ? "#" : "";
  const octave = octaveRaw || `${DEFAULT_OCTAVE}`;

  const noteCore =
    accidental === "b" ? FLAT_TO_SHARP[`${letter}b`] : `${letter}${accidental}`;
  if (!noteCore) return null;

  const normalized = `${noteCore}${octave}`;
  if (!ALLOWED_ROOT_NOTES.includes(normalized)) return null;
  return normalized;
}

const server = new McpServer({
  name: "music-theory-mcp",
  version: "0.1.0",
});

const stateResourceTemplate = new ResourceTemplate("state://current", {
  list: async () => [{ uri: "state://current" }],
});

server.registerResource(
  "current-state",
  stateResourceTemplate,
  {
    title: "Current music-theory state",
    description: "Root key and mode currently stored for the React UI.",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(state, null, 2),
        mimeType: "application/json",
      },
    ],
  })
);

server.registerTool(
  "get_state",
  {
    title: "Get current key/mode",
    description: "Returns the current root key and mode the UI will consume.",
    inputSchema: z.object({}).optional(),
    outputSchema: z.object({
      rootNote: z.string(),
      mode: z.string(),
      updatedAt: z.string().optional(),
    }),
  },
  async () => ({
    content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
    structuredContent: state,
  })
);

server.registerTool(
  "set_key",
  {
    title: "Set the key/root note",
    description:
      "Change the current key. Accepts formats like G, G3, Bb2, F#4 (octave defaults to 3).",
    inputSchema: z.object({
      key: z.string(),
    }),
    outputSchema: z.object({
      rootNote: z.string(),
      mode: z.string(),
      updatedAt: z.string().optional(),
    }),
  },
  async ({ key }) => {
    const normalized = normalizeKey(key);
    if (!normalized) {
      throw new Error(
        `Invalid key '${key}'. Use notes like C3, G#2, Bb4. Allowed octaves: 1-6.`
      );
    }
    const updated = persistState({ rootNote: normalized });
    return {
      content: [{ type: "text", text: `Root key set to ${normalized}` }],
      structuredContent: updated,
    };
  }
);

function startStateHttpServer() {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (
      req.method === "GET" &&
      req.url &&
      new URL(req.url, "http://localhost").pathname === "/state"
    ) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(state));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(STATE_PORT, "127.0.0.1", () => {
    console.error(
      `[mcp] State HTTP server listening on http://127.0.0.1:${STATE_PORT}/state`
    );
  });
}

async function main() {
  startStateHttpServer();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcp] Ready for Claude (stdio).");
}

main().catch((err) => {
  console.error("[mcp] Server failed to start:", err);
  process.exit(1);
});
