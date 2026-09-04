import { z } from "zod";
import {
  DifficultySchema,
  FocusSchema,
  QuizModeSchema,
} from "./primitives.js";
import { QuestionSubmissionSchema } from "./correction.js";

export const QuizSessionStatusSchema = z.enum(["in_progress", "completed"]);
export type QuizSessionStatus = z.infer<typeof QuizSessionStatusSchema>;

/**
 * Registro de resposta da sessão
 */
export const SessionAnswerRecordSchema = QuestionSubmissionSchema.extend({
  isCorrect: z.boolean().optional(),
  gradedAt: z.string().datetime().optional(),
});
export type SessionAnswerRecord = z.infer<typeof SessionAnswerRecordSchema>;

/**
 * Estatísticas e métricas de desempenho consolidadas da sessão
 */
export const AccuracyStatSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const QuizStatisticsSchema = z.object({
  totalAnswered: z.number().int().nonnegative(),
  totalCorrect: z.number().int().nonnegative(),
  accuracyPercentage: z.number().min(0).max(100),
  totalTimeMs: z.number().int().nonnegative(),
  averageTimePerQuestionMs: z.number().nonnegative(),
  accuracyByFocus: z.record(FocusSchema, AccuracyStatSchema).optional(),
  accuracyByDifficulty: z.record(DifficultySchema, AccuracyStatSchema).optional(),
  highConfidenceErrors: z.number().int().nonnegative().default(0),
  reviewFlagsCount: z.number().int().nonnegative().default(0),
});
export type QuizStatistics = z.infer<typeof QuizStatisticsSchema>;

/**
 * Sessão completa de Quiz
 */
export const QuizSessionSchema = z.object({
  id: z.string().min(1),
  quizId: z.string().min(1),
  mode: QuizModeSchema.default("study"),
  status: QuizSessionStatusSchema.default("in_progress"),
  currentQuestionIndex: z.number().int().nonnegative().default(0),
  totalQuestions: z.number().int().positive(),
  answers: z.record(z.string(), SessionAnswerRecordSchema).default({}),
  reviewFlags: z.array(z.string()).default([]),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  statistics: QuizStatisticsSchema.optional(),
});
export type QuizSession = z.infer<typeof QuizSessionSchema>;
