import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { QuestionInternal, QuestionInternalSchema, QuestionPublic } from "../../core/domain/question.js";
import { validateQuestionContent } from "../../core/quiz/question-validator.js";
import { createGradingToken } from "../../core/security/crypto-token.js";

export const QuizRenderInputSchema = {
  discipline: z.string().min(2).describe("Disciplina jurídica do quiz (ex: 'processo-civil')"),
  point: z.string().min(2).describe("Ponto do edital ou tema testado"),
  title: z.string().optional().describe("Título opcional do bloco de questões"),
  mode: z.enum(["study", "exam"]).optional().default("study").describe("Modo de execução: 'study' (com correção imediata) ou 'exam' (modo prova cronometrado)"),
  questions: z.array(QuestionInternalSchema).min(1).max(20).describe("Lista de questões completas com gabarito e análises de distratores geradas pelo modelo"),
};

/**
 * Registra a ferramenta principal quiz_render que valida, protege o gabarito em token cifrado e renderiza o widget
 */
export function registerQuizRenderTool(server: McpServer): void {
  registerAppTool(
    server,
    "quiz_render",
    {
      title: "NexoQuiz — Renderizar Questões",
      description: `Renderiza uma bateria de questões interativas sóbrias no padrão FGV/ENAM.
Recebe as questões com gabarito interno, cifra as respostas em opaqueGradingToken seguro e abre o QuestionPlayer no ChatGPT Apps SDK.`,
      inputSchema: QuizRenderInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: {
          resourceUri: "ui://nexoquiz/quiz-app.html",
          visibility: ["model"] as const,
        },
      },
    },
    async (params) => {
      try {
        const { discipline, point, title, mode = "study", questions } = params;

        // 1. Validação Pedagógica de Cada Questão
        const validationErrors: string[] = [];
        const validationWarnings: string[] = [];

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i] as QuestionInternal;
          const valRes = validateQuestionContent(q, { strictSymmetry: false });

          if (!valRes.isValid) {
            validationErrors.push(...valRes.errors.map((e) => `Questão ${i + 1} (${q.id}): ${e}`));
          }
          if (valRes.warnings.length > 0) {
            validationWarnings.push(...valRes.warnings.map((w) => `Questão ${i + 1} (${q.id}): ${w}`));
          }
        }

        if (validationErrors.length > 0) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `❌ Falha na validação pedagógica das questões:\n${validationErrors.map((e) => `• ${e}`).join("\n")}\n\nPor favor, ajuste o conteúdo das questões e reenvie a chamada de quiz_render.`,
              },
            ],
            structuredContent: {
              success: false,
              errors: validationErrors,
              warnings: validationWarnings,
            },
          };
        }

        // 2. Proteção do Gabarito: Geração de QuestionPublic com opaqueGradingToken Cifrado
        const publicQuestions: QuestionPublic[] = questions.map((q: QuestionInternal) => {
          // Constrói array estruturado de distratores para o payload criptografado
          const distractorAnalyses = Object.entries(q.answerKey.distractorAnalysis).map(
            ([letter, analysis]) => ({
              letter: letter as any,
              analysis,
              isPlausible: true,
            })
          );

          // Criptografia AES-256-GCM sem vazar gabarito no JSON público
          const opaqueGradingToken = createGradingToken({
            questionId: q.id,
            correctAnswer: q.answerKey.correctAnswer,
            legalReasoning: q.answerKey.legalReasoning,
            legalBasis: q.answerKey.legalBasis,
            precedents: q.answerKey.precedents,
            diagnosis: q.answerKey.diagnosis,
            distractorAnalyses,
            createdAt: Date.now(),
          });

          const publicQ: QuestionPublic = {
            id: q.id,
            sequence: q.sequence,
            header: {
              discipline: q.classification?.discipline || discipline,
              point: q.point?.title || point,
              totalQuestions: questions.length,
            },
            content: {
              stem: q.content.stem,
              propositions: q.content.propositions,
              command: q.content.command,
              alternatives: q.content.alternatives,
            },
            interaction: {
              mode,
              allowConfidence: true,
              allowReview: true,
            },
            opaqueGradingToken,
          };

          return publicQ;
        });

        const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const displayTitle = title || `Simulado: ${point} (${discipline.toUpperCase()})`;

        const textOutput = [
          `🏛️ NexoQuiz iniciado com sucesso!`,
          `  Disciplina: ${discipline.toUpperCase()} | Ponto: ${point}`,
          `  Total de Questões: ${publicQuestions.length}`,
          `  Modo de Execução: ${mode === "study" ? "Estudo (Correção Pedagógica Imediata)" : "Prova (Simulado Cronometrado)"}`,
          `  Gabarito: Protegido por criptografia AES-256-GCM (opaqueGradingToken).`,
          `\nO widget interativo QuestionPlayer foi carregado na interface do candidato.`,
        ].join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: textOutput,
            },
          ],
          structuredContent: {
            sessionId,
            discipline,
            point,
            title: displayTitle,
            mode,
            totalQuestions: publicQuestions.length,
            questions: publicQuestions,
          },
          _meta: {
            ui: {
              resourceUri: "ui://nexoquiz/quiz-app.html",
              visibility: ["model"] as const,
            },
            quizData: {
              sessionId,
              mode,
              title: displayTitle,
              questions: publicQuestions,
            },
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao renderizar quiz: ${msg}` }],
        };
      }
    }
  );
}
