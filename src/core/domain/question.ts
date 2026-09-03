import { z } from "zod";
import {
  AnswerLabel,
  AnswerLabelSchema,
  ConfidenceLevelSchema,
  DifficultySchema,
  FocusSchema,
  QuestionFormatSchema,
  QuizMode,
  QuizModeSchema,
} from "./primitives";

/**
 * Item individual de alternativa A–E
 */
export const QuestionAlternativeSchema = z.object({
  label: AnswerLabelSchema,
  text: z.string().min(1, "O texto da alternativa não pode ser vazio"),
});
export type QuestionAlternative = z.infer<typeof QuestionAlternativeSchema>;

/**
 * Validador estrito de lista de 5 alternativas (A, B, C, D, E sem repetição)
 */
export const AlternativesListSchema = z
  .array(QuestionAlternativeSchema)
  .length(5, "A questão deve conter exatamente 5 alternativas (A-E)")
  .refine(
    (alts) => {
      const labels = alts.map((a) => a.label);
      const expected = ["A", "B", "C", "D", "E"];
      return expected.every((exp, idx) => labels[idx] === exp);
    },
    {
      message: "As alternativas devem estar estritamente ordenadas de A a E sem omissões ou repetições.",
    }
  );

/**
 * Cabeçalho exibível da questão
 */
export const QuestionHeaderSchema = z.object({
  discipline: z.string().min(1),
  point: z.string().min(1),
  totalQuestions: z.number().int().positive(),
});
export type QuestionHeader = z.infer<typeof QuestionHeaderSchema>;

/**
 * Conteúdo público da questão (enunciado, proposições opcionais, alternativas)
 */
export const QuestionPublicContentSchema = z.object({
  stem: z.string().min(10, "O enunciado deve conter ao menos 10 caracteres"),
  propositions: z.array(z.string()).optional(),
  command: z.string().optional(),
  alternatives: AlternativesListSchema,
});
export type QuestionPublicContent = z.infer<typeof QuestionPublicContentSchema>;

/**
 * Configurações de interação da questão no widget
 */
export const QuestionInteractionSchema = z.object({
  mode: QuizModeSchema.default("study"),
  allowConfidence: z.boolean().default(true),
  allowReview: z.boolean().default(true),
});
export type QuestionInteraction = z.infer<typeof QuestionInteractionSchema>;

/**
 * Schema CANÔNICO de Questão Pública (QuestionPublic)
 * NUNCA contém gabarito, justificativas ou distratores analisados.
 */
export const QuestionPublicSchema = z.object({
  id: z.string().min(1),
  sequence: z.number().int().positive(),
  header: QuestionHeaderSchema,
  content: QuestionPublicContentSchema,
  interaction: QuestionInteractionSchema,
});
export type QuestionPublic = z.infer<typeof QuestionPublicSchema>;

/**
 * Análise pedagógica dos distratores
 */
export const DistractorAnalysisMapSchema = z.object({
  A: z.string().min(1),
  B: z.string().min(1),
  C: z.string().min(1),
  D: z.string().min(1),
  E: z.string().min(1),
});
export type DistractorAnalysisMap = z.infer<typeof DistractorAnalysisMapSchema>;

/**
 * Chave de correção e fundamentação interna (AnswerKey)
 */
export const AnswerKeySchema = z.object({
  correctAnswer: AnswerLabelSchema,
  legalReasoning: z.string().min(10, "A fundamentação jurídica deve ser detalhada"),
  legalBasis: z.string().min(3, "Indique o dispositivo legal/constitucional aplicável"),
  precedents: z.array(z.string()).default([]),
  doctrine: z.array(z.string()).default([]),
  distractorAnalysis: DistractorAnalysisMapSchema,
  confidence: ConfidenceLevelSchema.optional(),
});
export type AnswerKey = z.infer<typeof AnswerKeySchema>;

/**
 * Schema CANÔNICO de Questão Interna Completa (QuestionInternal)
 */
export const QuestionInternalSchema = z.object({
  id: z.string().min(1),
  quizId: z.string().min(1),
  sequence: z.number().int().positive(),
  point: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    order: z.number().int().positive(),
  }),
  umt: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
  }),
  blockNumber: z.number().int().positive(),
  classification: z.object({
    discipline: z.string().min(1),
    format: QuestionFormatSchema,
    difficulty: DifficultySchema,
    focus: FocusSchema,
  }),
  content: QuestionPublicContentSchema,
  answerKey: AnswerKeySchema,
  generationMetadata: z.record(z.unknown()).optional(),
  sourceTrace: z.array(z.string()).default([]),
});
export type QuestionInternal = z.infer<typeof QuestionInternalSchema>;

/**
 * Função de transformação segura: extrai estritamente QuestionPublic a partir de QuestionInternal
 * eliminando qualquer resquício de gabarito ou fundamentação privada.
 */
export function toQuestionPublic(
  internal: QuestionInternal,
  totalQuestions: number,
  mode: QuizMode = "study"
): QuestionPublic {
  return QuestionPublicSchema.parse({
    id: internal.id,
    sequence: internal.sequence,
    header: {
      discipline: internal.classification.discipline,
      point: internal.point.title,
      totalQuestions,
    },
    content: {
      stem: internal.content.stem,
      propositions: internal.content.propositions,
      command: internal.content.command,
      alternatives: internal.content.alternatives,
    },
    interaction: {
      mode,
      allowConfidence: true,
      allowReview: true,
    },
  });
}
