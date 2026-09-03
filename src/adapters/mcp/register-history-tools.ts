import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SessionRepository } from "../../core/persistence/session-repository.js";

export const QuizGetHistoryInputSchema = {
  discipline: z.string().optional().describe("Filtro opcional por disciplina (ex: 'processo-civil')"),
  mode: z.enum(["study", "exam"]).optional().describe("Filtro opcional por modo de realização ('study' ou 'exam')"),
  limit: z.number().int().min(1).max(50).optional().default(10).describe("Quantidade máxima de sessões a retornar"),
};

export const QuizSaveSessionInputSchema = {
  sessionId: z.string().min(1).describe("Identificador único da sessão"),
  discipline: z.string().min(1).describe("Disciplina jurídica"),
  point: z.string().min(1).describe("Ponto do edital"),
  mode: z.enum(["study", "exam"]).describe("Modo realizado"),
  totalQuestions: z.number().int().positive().describe("Total de questões"),
  correctCount: z.number().int().nonnegative().describe("Quantidade de acertos"),
  errorCount: z.number().int().nonnegative().describe("Quantidade de erros"),
  accuracyPercentage: z.number().nonnegative().describe("Taxa percentual de acerto"),
  totalTimeMs: z.number().int().nonnegative().describe("Tempo total gasto em milissegundos"),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      sequence: z.number().int().positive(),
      format: z.enum(["case_narrative", "propositions", "conceptual"]),
      difficulty: z.enum(["hard", "medium", "easy"]),
      focus: z.enum(["jurisprudence", "statute", "doctrine", "mixed"]),
      selectedAnswer: z.enum(["A", "B", "C", "D", "E"]),
      correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
      isCorrect: z.boolean(),
      confidence: z.enum(["high", "medium", "low"]).optional(),
      elapsedTimeMs: z.number().int().nonnegative(),
    })
  ),
};

/**
 * Registra ferramentas MCP para consulta e gravação de histórico de desempenho no modo standalone
 */
export function registerHistoryTools(server: McpServer, sessionRepo: SessionRepository): void {

  // ── 1. quiz_get_history ────────────────────────────────────────────
  server.tool(
    "quiz_get_history",
    "Consulta o histórico consolidado de sessões e estatísticas de acerto por disciplina no banco de dados local.",
    QuizGetHistoryInputSchema,
    async (params) => {
      try {
        const sessions = sessionRepo.listSessions({
          discipline: params.discipline,
          mode: params.mode,
          limit: params.limit,
        });

        const metrics = sessionRepo.getDisciplineMetrics();

        if (sessions.length === 0 && metrics.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Nenhuma sessão de quiz registrada no histórico local até o momento.",
              },
            ],
            structuredContent: {
              sessions: [],
              disciplineMetrics: [],
            },
          };
        }

        const metricLines = metrics.map(
          (m) =>
            `  • [${m.discipline.toUpperCase()}] ${m.accuracyPercentage}% de acerto (${m.totalCorrect}/${m.totalAttempts} questões | ${m.totalTimeMinutes} min)`
        );

        const sessionLines = sessions.map(
          (s) =>
            `  • ${(s.completedAt || "").slice(0, 10)} | [${s.discipline.toUpperCase()}] ${s.point} | ${s.correctCount}/${s.totalQuestions} acertos (${s.accuracyPercentage}%) | Modo: ${s.mode}`
        );

        const textOutput = [
          `📊 Histórico de Desempenho Local (NexoQuiz):`,
          `\n📈 Métricas por Disciplina:`,
          ...metricLines,
          `\n🕒 Últimas Sessões Realizadas (${sessions.length}):`,
          ...sessionLines,
        ].join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: textOutput,
            },
          ],
          structuredContent: {
            sessions,
            disciplineMetrics: metrics,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao consultar histórico: ${msg}` }],
        };
      }
    }
  );

  // ── 2. quiz_save_session ───────────────────────────────────────────
  server.tool(
    "quiz_save_session",
    "Salva uma sessão de quiz concluída e suas respostas no banco de dados local para relatórios e analytics.",
    QuizSaveSessionInputSchema,
    async (params) => {
      try {
        sessionRepo.saveSession(params as any);

        return {
          content: [
            {
              type: "text" as const,
              text: `✅ Sessão "${params.sessionId}" (${params.discipline.toUpperCase()} - ${params.point}) salva com sucesso no histórico local!`,
            },
          ],
          structuredContent: {
            success: true,
            sessionId: params.sessionId,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao salvar sessão: ${msg}` }],
        };
      }
    }
  );
}
