import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AnswerLabelSchema, ConfidenceLevelSchema } from "../../core/domain/primitives.js";
import { gradeAnswer } from "../../core/quiz/grade-service.js";

export const QuizGradeAnswerInputSchema = {
  opaqueGradingToken: z
    .string()
    .min(10)
    .describe("Envelope seguro cifrado (AES-256-GCM) recebido na renderização da questão"),
  selectedAnswer: AnswerLabelSchema.describe("Alternativa assinalada pelo candidato (estritamente 'A', 'B', 'C', 'D' ou 'E')"),
  confidence: ConfidenceLevelSchema.optional().describe("Nível de confiança informado pelo candidato ('high', 'medium', 'low')"),
  elapsedTimeMs: z.number().int().nonnegative().optional().default(0).describe("Tempo decorrido em milissegundos na questão"),
};

/**
 * Registra a ferramenta MCP quiz_grade_answer para correção determinística stateless
 */
export function registerQuizGradeTool(server: McpServer): void {
  server.tool(
    "quiz_grade_answer",
    "Corrige deterministicamente uma questão jurídica a partir de seu token cifrado seguro, retornando o diagnóstico pedagógico do erro, a fundamentação jurídica e a análise de todos os distratores.",
    QuizGradeAnswerInputSchema,
    async (params) => {
      try {
        const { opaqueGradingToken, selectedAnswer, confidence, elapsedTimeMs } = params;

        const correction = gradeAnswer({
          opaqueGradingToken,
          selectedAnswer,
          confidence,
          elapsedTimeMs,
        });

        const statusSymbol = correction.isCorrect ? "✓" : "✗";
        const statusText = correction.isCorrect
          ? "RESPOSTA CORRETA!"
          : `RESPOSTA INCORRETA. Gabarito Oficial: Alternativa ${correction.correctAnswer}`;

        const lines = [
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `${statusSymbol} ${statusText}`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ];

        if (!correction.isCorrect && correction.diagnosis) {
          lines.push(`\n🎯 DIAGNÓSTICO DO EQUÍVOCO:`);
          lines.push(correction.diagnosis);
        }

        lines.push(`\n📖 FUNDAMENTAÇÃO JURÍDICA:`);
        lines.push(correction.legalReasoning);

        if (correction.legalBasis) {
          lines.push(`\n⚖️ BASE LEGAL: ${correction.legalBasis}`);
        }

        if (correction.precedents && correction.precedents.length > 0) {
          lines.push(`\n🏛️ PRECEDENTES: ${correction.precedents.join("; ")}`);
        }

        lines.push(`\n🔍 ANÁLISE DOS DISTRATORES:`);
        const labels = ["A", "B", "C", "D", "E"] as const;
        for (const label of labels) {
          const isCorrectChoice = label === correction.correctAnswer;
          const isUserChoice = label === correction.selectedAnswer;
          const marker = isCorrectChoice ? " [GABARITO]" : isUserChoice ? " [SUA ESCOLHA]" : "";
          lines.push(`  • Alternativa ${label}${marker}: ${correction.distractorAnalysis[label]}`);
        }

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
            },
          ],
          structuredContent: {
            success: true,
            correction,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `❌ Falha na correção da resposta: ${msg}. Verifique a integridade do opaqueGradingToken.`,
            },
          ],
        };
      }
    }
  );
}
