import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MaterialRepository } from "./core/library/material-search.js";
import { SessionRepository } from "./core/persistence/session-repository.js";
import { registerLibraryTools } from "./adapters/mcp/register-library-tools.js";
import { registerQuizPlanTools } from "./adapters/mcp/register-quiz-plan-tools.js";
import { registerQuizRenderTool } from "./adapters/mcp/register-quiz-render-tool.js";
import { registerQuizGradeTool } from "./adapters/mcp/register-quiz-grade-tool.js";
import { registerHistoryTools } from "./adapters/mcp/register-history-tools.js";

export interface NexoQuizServerConfig {
  searchRepo: MaterialRepository;
  sessionRepo: SessionRepository;
  getWidgetHtml: () => Promise<string>;
  connectDomains?: string[];
}

/**
 * Cria e configura a instância canônica do servidor MCP NexoQuiz com todas as ferramentas de domínio
 */
export function createNexoQuizServer(config: NexoQuizServerConfig): McpServer {
  const server = new McpServer({
    name: "NexoQuiz",
    version: "1.0.0",
  });

  // 1. Ferramentas de Biblioteca Markdown (Fase 8)
  registerLibraryTools(server, config.searchRepo);

  // 2. Ferramentas de QuizPlan e UMT (Fase 9)
  registerQuizPlanTools(server);

  // 3. Ferramenta de Renderização Stateless de Questões (Fase 10)
  registerQuizRenderTool(server, config.getWidgetHtml, config.connectDomains);

  // 4. Ferramenta de Correção Pedagógica Determinística (Fase 11)
  registerQuizGradeTool(server);

  // 5. Ferramentas de Histórico e Persistência Local (Fase 13)
  registerHistoryTools(server, config.sessionRepo);

  return server;
}
