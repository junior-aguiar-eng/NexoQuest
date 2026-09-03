#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MaterialIndexer } from "./core/library/material-indexer.js";
import { MaterialRepository } from "./core/library/material-search.js";
import { SessionRepository } from "./core/persistence/session-repository.js";
import { createNexoQuizServer } from "./nexoquiz-server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.NEXOQUIZ_DB_PATH ?? join(__dirname, "..", "data", "nexoquiz.db");
const LIBRARY_PATH = process.env.NEXOQUIZ_LIBRARY_PATH ?? join(__dirname, "..", "library");

function log(message: string, data?: unknown): void {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    console.error(`[nexoquiz-stdio ${ts}] ${message}`, JSON.stringify(data));
  } else {
    console.error(`[nexoquiz-stdio ${ts}] ${message}`);
  }
}

/** Carrega o HTML do widget construído */
async function getWidgetHtml(): Promise<string> {
  const htmlPath = join(__dirname, "..", "dist", "view", "index.html");
  try {
    return await readFile(htmlPath, "utf-8");
  } catch {
    log("Widget HTML not found at " + htmlPath);
    return `<!DOCTYPE html><html><body><p>Widget em preparação. Execute <code>npm run build:view</code></p></body></html>`;
  }
}

async function main(): Promise<void> {
  log("Iniciando NexoQuiz MCP Server (modo stdio)");

  const indexer = new MaterialIndexer(DB_PATH);
  try {
    indexer.indexDirectory(LIBRARY_PATH);
  } catch (err) {
    log("Aviso na indexação da biblioteca", { error: err instanceof Error ? err.message : String(err) });
  }

  const searchRepo = new MaterialRepository(indexer.getDatabase());
  const sessionRepo = new SessionRepository(indexer.getDatabase());

  const connectDomains = (process.env.CONNECT_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  const server = createNexoQuizServer({
    searchRepo,
    sessionRepo,
    getWidgetHtml,
    connectDomains,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Servidor NexoQuiz MCP conectado via stdio e pronto");

  process.on("unhandledRejection", (err) => {
    log("Unhandled rejection", { error: err instanceof Error ? err.message : String(err) });
  });

  process.on("uncaughtException", (err) => {
    log("Uncaught exception", { error: err.message });
  });

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await server.close();
    process.exit(0);
  });

  process.stdin.resume();

  const keepalive = setInterval(() => {}, 30000);
  keepalive.unref();

  process.stdin.on("end", () => {
    clearInterval(keepalive);
  });

  process.stdin.on("error", (err) => {
    log("stdin error", { error: err.message });
  });
}

main().catch((error) => {
  log("Falha ao iniciar servidor stdio", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
