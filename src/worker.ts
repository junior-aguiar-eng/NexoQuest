/**
 * Cloudflare Worker entry point for NexoQuiz MCP Server.
 *
 * Utiliza a fábrica canônica createNexoQuizServer com dependências compatíveis com Workers.
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createNexoQuizServer } from "./nexoquiz-server.js";
import { MaterialIndexer } from "./core/library/material-indexer.js";
import { MaterialRepository } from "./core/library/material-search.js";
import { SessionRepository } from "./core/persistence/session-repository.js";
import { WIDGET_HTML } from "./worker-bundle.js";

// Instâncias em memória para o ciclo do isolate
const indexer = new MaterialIndexer(":memory:");
const searchRepo = new MaterialRepository(indexer.getDatabase());
const sessionRepo = new SessionRepository(indexer.getDatabase());

async function getWidgetHtml(): Promise<string> {
  return WIDGET_HTML;
}

// ── CORS helpers ─────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://claude.ai",
  "https://claude.com",
  "https://chatgpt.com",
  "https://chat.openai.com",
];

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin") ?? "";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, mcp-session-id, mcp-protocol-version",
    "Access-Control-Expose-Headers": "mcp-session-id",
  };
}

// ── Worker fetch handler ─────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // Health check
    if (url.pathname === "/health") {
      return Response.json(
        { status: "ok", name: "NexoQuiz MCP Worker", version: "1.0.0" },
        { headers: corsHeaders(request) }
      );
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      if (request.method === "GET" || request.method === "DELETE") {
        return Response.json(
          {
            jsonrpc: "2.0",
            error: { code: -32000, message: "Method Not Allowed: NexoQuiz operates in stateless mode" },
            id: null,
          },
          { status: 405, headers: corsHeaders(request) }
        );
      }

      if (request.method === "POST") {
        const MAX_BODY_BYTES = 524_288; // 512 KB
        const body = await request.arrayBuffer();
        if (body.byteLength > MAX_BODY_BYTES) {
          return Response.json(
            {
              jsonrpc: "2.0",
              error: { code: -32000, message: "Request body too large (max 512KB)" },
              id: null,
            },
            { status: 413, headers: corsHeaders(request) }
          );
        }

        const checkedRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body,
        });

        try {
          const server = createNexoQuizServer({
            searchRepo,
            sessionRepo,
            getWidgetHtml,
            connectDomains: [],
          });

          const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
          });

          await server.connect(transport);

          const response = await transport.handleRequest(checkedRequest);
          const headers = new Headers(response.headers);
          for (const [k, v] of Object.entries(corsHeaders(request))) {
            headers.set(k, v);
          }

          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch (error) {
          console.error("MCP request error:", error);
          return Response.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders(request) }
          );
        }
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders(request) });
  },
};
