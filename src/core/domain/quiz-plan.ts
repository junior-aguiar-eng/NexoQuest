import { z } from "zod";
import {
  AnswerLabelSchema,
  DifficultySchema,
  FocusSchema,
  QuestionFormatSchema,
} from "./primitives.js";
import { UMTDefinitionSchema } from "./umt.js";

/**
 * Slot individual planejado para uma questão dentro de um bloco
 */
export const QuestionSlotSchema = z.object({
  sequence: z.number().int().positive(),
  umtId: z.string().min(1),
  format: QuestionFormatSchema,
  difficulty: DifficultySchema,
  focus: FocusSchema,
  plannedCorrectAnswer: AnswerLabelSchema,
});
export type QuestionSlot = z.infer<typeof QuestionSlotSchema>;

/**
 * Plano de um bloco de questões (geralmente 5 questões por ciclo)
 */
export const QuizBlockPlanSchema = z.object({
  blockNumber: z.number().int().positive(),
  questionCount: z.number().int().min(1).max(5),
  slots: z.array(QuestionSlotSchema).min(1).max(5),
});
export type QuizBlockPlan = z.infer<typeof QuizBlockPlanSchema>;

/**
 * Plano completo do Quiz para um Ponto do Edital / Material
 */
export const QuizPlanSchema = z.object({
  schemaVersion: z.literal("1.0"),
  quizId: z.string().min(1),
  material: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  point: z.object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    title: z.string().min(1),
  }),
  umts: z.array(UMTDefinitionSchema).min(1),
  totalQuestions: z.number().int().positive(),
  blocks: z.array(QuizBlockPlanSchema).min(1),
});
export type QuizPlan = z.infer<typeof QuizPlanSchema>;
