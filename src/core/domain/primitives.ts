import { z } from "zod";

/**
 * Rótulos válidos para alternativas (estritamente A, B, C, D, E)
 */
export const AnswerLabelSchema = z.enum(["A", "B", "C", "D", "E"]);
export type AnswerLabel = z.infer<typeof AnswerLabelSchema>;

/**
 * Formatos estruturais de questão jurídica (padrão FGV/ENAM)
 */
export const QuestionFormatSchema = z.enum([
  "case_narrative", // Caso concreto / narrativa fática
  "propositions",    // Proposições I, II e III combinatórias
  "conceptual",      // Conceitual, regra objetiva ou literalidade
]);
export type QuestionFormat = z.infer<typeof QuestionFormatSchema>;

/**
 * Níveis de dificuldade de questão
 */
export const DifficultySchema = z.enum(["hard", "medium", "easy"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * Foco substancial da questão
 */
export const FocusSchema = z.enum([
  "jurisprudence", // Súmulas, teses e precedentes qualificados
  "statute",       // Lei seca, prazos e tipicidade legal
  "doctrine",      // Doutrina clássica e contemporânea
  "mixed",         // Integração pluridisciplinar / caso prático
]);
export type Focus = z.infer<typeof FocusSchema>;

/**
 * Nível de confiança informado pelo candidato
 */
export const ConfidenceLevelSchema = z.enum([
  "high",   // Certeza / alta segurança
  "medium", // Dúvida entre duas alternativas
  "low",    // Chute / baixa segurança
]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * Modo de execução do Quiz
 */
export const QuizModeSchema = z.enum(["study", "exam"]);
export type QuizMode = z.infer<typeof QuizModeSchema>;
