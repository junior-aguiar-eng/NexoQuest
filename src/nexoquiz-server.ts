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

  // 6. Recurso Canônico MCP (Permite que clientes descubram o catálogo via resources/list)
  server.resource(
    "library-catalog",
    "nexoquiz://library/catalog",
    async () => {
      const materials = config.searchRepo.listMaterials();
      return {
        contents: [
          {
            uri: "nexoquiz://library/catalog",
            mimeType: "application/json",
            text: JSON.stringify(materials, null, 2),
          },
        ],
      };
    }
  );

  // 7. Prompt Canônico MCP (Permite que clientes descubram instruções do host via prompts/list)
  server.prompt(
    "gerar-simulado-fgv",
    "Prompt de instrução para o Host gerar questões jurídicas no formato estrito FGV / ENAM",
    async () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Gere um simulado jurídico com 5 questões inéditas no formato FGV/ENAM, consultando a biblioteca com library_read_sections, validando o plano com quiz_plan_validate e renderizando via quiz_render.",
            },
          },
        ],
      };
    }
  );

  return server;
}
