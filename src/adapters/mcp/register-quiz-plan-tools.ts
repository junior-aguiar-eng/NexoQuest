import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { QuizPlanSchema } from "../../core/domain/quiz-plan.js";
import { validateQuizPlan } from "../../core/quiz/plan-validator.js";

/**
 * Registra ferramentas MCP para validação determinística de QuizPlan e protocolo de UMTs
 */
export function registerQuizPlanTools(server: McpServer): void {

  // ── 1. quiz_plan_validate ──────────────────────────────────────────
  server.tool(
    "quiz_plan_validate",
    "Valida deterministicamente a conformidade pedagógica de um QuizPlan proposto pelo modelo segundo as regras ENAM/FGV (distribuição de bloco 3:1:1, rotação de gabarito e cobertura linear de UMTs).",
    {
      plan: z.any().describe("Objeto QuizPlan completo contendo discipline, point, totalQuestions, umts e blocks"),
    },
    async (params) => {
      try {
        // 1. Validação de Contrato (Zod)
        const parseResult = QuizPlanSchema.safeParse(params.plan);
        if (!parseResult.success) {
          const formattedIssues = parseResult.error.issues
            .map((issue) => `• Campo "${issue.path.join(".")}": ${issue.message}`)
            .join("\n");

          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `❌ Falha de validação estrutural no QuizPlan:\n${formattedIssues}\n\nPor favor, corrija a estrutura do JSON e reenvie.`,
              },
            ],
            structuredContent: {
              isValid: false,
              schemaErrors: parseResult.error.issues,
            },
          };
        }

        const validPlan = parseResult.data;

        // 2. Validação de Regras Pedagógicas FGV (modo strict)
        const report = validateQuizPlan(validPlan, { strict: true });

        if (!report.isValid) {
          const errorLines = report.errors.map((e) => `• ${e}`).join("\n");
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `❌ O QuizPlan foi rejeitado pelas regras pedagógicas do padrão FGV/ENAM:\n${errorLines}\n\nInstruções de autocorreção:\n- Cada bloco de 5 questões deve ter exatamente 3 casos narrativos, 1 proposições e 1 conceitual.\n- Cada bloco deve conter 3 questões difíceis, 1 média e 1 fácil.\n- Não repita a mesma letra de gabarito em questões consecutivas.\n- Cada UMT cadastrada deve ser testada exatamente uma vez.`,
              },
            ],
            structuredContent: {
              isValid: false,
              report,
            },
          };
        }

        // Resumo de Sucesso
        const blockSummaries = validPlan.blocks.map((b) => {
          const formats = b.slots.map((s) => s.format).join(", ");
          const diffs = b.slots.map((s) => s.difficulty).join(", ");
          const rotation = b.slots.map((s) => s.plannedCorrectAnswer).join(" → ");
          return `  • Bloco ${b.blockNumber}: Formatos [${formats}] | Dificuldades [${diffs}] | Rotação [${rotation}]`;
        });

        const successText = [
          `✅ QuizPlan APROVADO com sucesso!`,
          `  Material: ${validPlan.material.name} | Ponto: ${validPlan.point.title}`,
          `  Total de Questões: ${validPlan.totalQuestions} em ${validPlan.blocks.length} bloco(s)`,
          `  UMTs Mapeadas: ${validPlan.umts.length}`,
          `\nEstrutura dos Blocos:`,
          ...blockSummaries,
          `\nO modelo está autorizado a prosseguir para a geração das questões e chamada de quiz_render.`,
        ].join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: successText,
            },
          ],
          structuredContent: {
            isValid: true,
            plan: validPlan,
            report,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro interno na validação do plano: ${msg}` }],
        };
      }
    }
  );

  // ── 2. quiz_plan_template ──────────────────────────────────────────
  server.tool(
    "quiz_plan_template",
    "Retorna um template estrutural recomendado de QuizPlan configurado para o padrão FGV/ENAM (blocos de 5 questões com distribuição 3:1:1 e rotação de gabarito pré-balanceada).",
    {
      numBlocks: z
        .number()
        .int()
        .min(1)
        .max(4)
        .optional()
        .default(1)
        .describe("Quantidade de blocos de 5 questões desejada (padrão 1 bloco = 5 questões)"),
    },
    async (params) => {
      const numBlocks = params.numBlocks ?? 1;
      const rotationCycle = ["A", "C", "E", "B", "D", "B", "E", "A", "C", "D", "E", "B", "A", "D", "C"] as const;

      const templateBlocks = [];
      let globalSeq = 1;

      for (let b = 1; b <= numBlocks; b++) {
        const slots = [
          {
            sequence: globalSeq++,
            umtId: `umt-${globalSeq - 1}`,
            format: "case_narrative" as const,
            difficulty: "hard" as const,
            focus: "statute" as const,
            plannedCorrectAnswer: rotationCycle[(globalSeq - 2) % rotationCycle.length],
          },
          {
            sequence: globalSeq++,
            umtId: `umt-${globalSeq - 1}`,
            format: "case_narrative" as const,
            difficulty: "hard" as const,
            focus: "jurisprudence" as const,
            plannedCorrectAnswer: rotationCycle[(globalSeq - 2) % rotationCycle.length],
          },
          {
            sequence: globalSeq++,
            umtId: `umt-${globalSeq - 1}`,
            format: "propositions" as const,
            difficulty: "hard" as const,
            focus: "doctrine" as const,
            plannedCorrectAnswer: rotationCycle[(globalSeq - 2) % rotationCycle.length],
          },
          {
            sequence: globalSeq++,
            umtId: `umt-${globalSeq - 1}`,
            format: "case_narrative" as const,
            difficulty: "medium" as const,
            focus: "mixed" as const,
            plannedCorrectAnswer: rotationCycle[(globalSeq - 2) % rotationCycle.length],
          },
          {
            sequence: globalSeq++,
            umtId: `umt-${globalSeq - 1}`,
            format: "conceptual" as const,
            difficulty: "easy" as const,
            focus: "statute" as const,
            plannedCorrectAnswer: rotationCycle[(globalSeq - 2) % rotationCycle.length],
          },
        ];

        templateBlocks.push({
          blockNumber: b,
          questionCount: 5,
          slots,
        });
      }

      const templateUmts = Array.from({ length: numBlocks * 5 }, (_, i) => ({
        id: `umt-${i + 1}`,
        order: i + 1,
        title: `Título da UMT ${i + 1}`,
        description: `Descrição detalhada do conteúdo e conceito da UMT ${i + 1}`,
        category: "rule" as const,
        substantiveWeight: "high" as const,
        sourceRefs: [
          {
            sectionId: `sec-${i + 1}`,
            headingPath: `Capítulo Exemplo > Tópico ${i + 1}`,
          },
        ],
      }));

      const templatePlan = {
        schemaVersion: "1.0" as const,
        quizId: `quiz-template-${Date.now()}`,
        material: {
          id: "proc-civ-negocios-processuais-2026",
          name: "Negócios Jurídicos Processuais",
        },
        point: {
          id: "negocios-processuais",
          order: 1,
          title: "Negócios Jurídicos Processuais",
        },
        totalQuestions: numBlocks * 5,
        umts: templateUmts,
        blocks: templateBlocks,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: `📋 Template de QuizPlan com ${numBlocks} bloco(s) (${numBlocks * 5} questões) configurado segundo os critérios do padrão FGV/ENAM:\n- Proporção por bloco: 3 Casos Narrativos, 1 Proposições, 1 Conceitual\n- Dificuldade por bloco: 3 Difíceis, 1 Média, 1 Fácil\n- Rotação de gabarito sem repetições consecutivas.`,
          },
        ],
        structuredContent: {
          template: templatePlan,
        },
      };
    }
  );
}
