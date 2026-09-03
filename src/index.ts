#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import rateLimit from "express-rate-limit";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MaterialIndexer } from "./core/library/material-indexer.js";
import { MaterialRepository } from "./core/library/material-search.js";
import { SessionRepository } from "./core/persistence/session-repository.js";
import { createNexoQuizServer } from "./nexoquiz-server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? "3001", 10);
const DB_PATH = process.env.NEXOQUIZ_DB_PATH ?? join(__dirname, "..", "data", "nexoquiz.db");
const LIBRARY_PATH = process.env.NEXOQUIZ_LIBRARY_PATH ?? join(__dirname, "..", "library");

// Domínios autorizados para o iframe do widget (CSP)
const CONNECT_DOMAINS = (process.env.CONNECT_DOMAINS ?? "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  "https://claude.ai",
  "https://claude.com",
  "https://chatgpt.com",
  "https://chat.openai.com",
];

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://localhost:5173");
}

// Inicializa a indexação da biblioteca Markdown e o repositório de busca
const indexer = new MaterialIndexer(DB_PATH);
try {
  indexer.indexDirectory(LIBRARY_PATH);
} catch (err) {
  console.warn("[NexoQuiz] Aviso ao indexar biblioteca inicial:", err);
}

const searchRepo = new MaterialRepository(indexer.getDatabase());
const sessionRepo = new SessionRepository(indexer.getDatabase());

/** Carrega o HTML do widget construído */
async function getWidgetHtml(): Promise<string> {
  const htmlPath = join(__dirname, "..", "dist", "view", "index.html");
  try {
    return await readFile(htmlPath, "utf-8");
  } catch {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>NexoQuiz</title>
<style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#f8fafc}
.spinner{width:40px;height:40px;border:3px solid #334155;border-top-color:#38bdf8;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem}
@keyframes spin{to{transform:rotate(360deg)}}</style></head>
<body><div style="text-align:center"><div class="spinner"></div><p>Widget em preparação. Execute <code>npm run build:view</code></p></div></body></html>`;
  }
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "512kb" }));

// CORS para clientes MCP (ChatGPT, Claude)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");
    res.header("Access-Control-Expose-Headers", "mcp-session-id");
  }
  next();
});

const mcpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    jsonrpc: "2.0",
    error: { code: -32000, message: "Rate limit exceeded. Try again later." },
    id: null,
  },
});

app.options("/mcp", (_req, res) => {
  res.sendStatus(204);
});

// GET /mcp — Streamable HTTP spec: 405 para servidores stateless
app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method Not Allowed: NexoQuiz operates in stateless mode" },
    id: null,
  });
});

// DELETE /mcp
app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method Not Allowed: NexoQuiz operates in stateless mode" },
    id: null,
  });
});

// Endpoint principal MCP via POST
app.post("/mcp", mcpLimiter, async (req, res) => {
  try {
    const server = createNexoQuizServer({
      searchRepo,
      sessionRepo,
      getWidgetHtml,
      connectDomains: CONNECT_DOMAINS,
    });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Erro na requisição MCP:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "NexoQuiz MCP Server",
    version: "1.0.0",
    engine: "stateless",
  });
});

app.listen(PORT, () => {
  console.log(`[NexoQuiz] MCP Server em execução em http://localhost:${PORT}`);
  console.log(`[NexoQuiz] Endpoint MCP: http://localhost:${PORT}/mcp`);
});
