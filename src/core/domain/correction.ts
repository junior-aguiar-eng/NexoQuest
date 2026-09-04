import { z } from "zod";
import {
  AnswerLabelSchema,
  ConfidenceLevelSchema,
} from "./primitives.js";
import { DistractorAnalysisMapSchema } from "./question.js";

/**
 * Submissão de resposta do candidato para uma questão
 */
export const QuestionSubmissionSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: AnswerLabelSchema,
  confidence: ConfidenceLevelSchema.optional(),
  elapsedTimeMs: z.number().int().nonnegative().default(0),
});
export type QuestionSubmission = z.infer<typeof QuestionSubmissionSchema>;

/**
 * Resultado da correção pedagógica de uma questão
 */
export const QuestionCorrectionSchema = z
  .object({
    questionId: z.string().min(1),
    selectedAnswer: AnswerLabelSchema,
    correctAnswer: AnswerLabelSchema,
    isCorrect: z.boolean(),
    diagnosis: z.string().optional(),
    legalReasoning: z.string().min(10),
    legalBasis: z.string().optional(),
    precedents: z.array(z.string()).default([]),
    doctrine: z.array(z.string()).default([]),
    distractorAnalysis: DistractorAnalysisMapSchema,
    confidence: ConfidenceLevelSchema.optional(),
  })
  .refine(
    (data) => {
      // Se errou, o diagnóstico do raciocínio é altamente desejável/obrigatório
      if (!data.isCorrect && !data.diagnosis) {
        return false;
      }
      return true;
    },
    {
      message: "O diagnóstico do equívoco de raciocínio é obrigatório quando a resposta for incorreta.",
      path: ["diagnosis"],
    }
  );
export type QuestionCorrection = z.infer<typeof QuestionCorrectionSchema>;
