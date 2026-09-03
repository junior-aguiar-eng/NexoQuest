import { Difficulty, Focus } from "../domain/primitives";
import { QuizStatistics } from "../domain/session";

export interface AnswerItemForCalculation {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer: string;
  elapsedTimeMs: number;
  confidence?: "high" | "medium" | "low";
  classification?: {
    difficulty: Difficulty;
    focus: Focus;
  };
  isFlaggedForReview?: boolean;
}

/**
 * Calcula deterministicamente as estatísticas de desempenho do candidato
 */
export function calculateQuizStatistics(
  items: AnswerItemForCalculation[]
): QuizStatistics {
  const totalAnswered = items.length;
  if (totalAnswered === 0) {
    return {
      totalAnswered: 0,
      totalCorrect: 0,
      accuracyPercentage: 0,
      totalTimeMs: 0,
      averageTimePerQuestionMs: 0,
      highConfidenceErrors: 0,
      reviewFlagsCount: 0,
    };
  }

  let totalCorrect = 0;
  let totalTimeMs = 0;
  let highConfidenceErrors = 0;
  let reviewFlagsCount = 0;

  const focusStats: Record<Focus, { correct: number; total: number }> = {
    jurisprudence: { correct: 0, total: 0 },
    statute: { correct: 0, total: 0 },
    doctrine: { correct: 0, total: 0 },
    mixed: { correct: 0, total: 0 },
  };

  const difficultyStats: Record<Difficulty, { correct: number; total: number }> = {
    hard: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    easy: { correct: 0, total: 0 },
  };

  for (const item of items) {
    if (item.isCorrect) {
      totalCorrect++;
    } else if (item.confidence === "high") {
      highConfidenceErrors++;
    }

    if (item.isFlaggedForReview) {
      reviewFlagsCount++;
    }

    totalTimeMs += item.elapsedTimeMs || 0;

    if (item.classification) {
      const { focus, difficulty } = item.classification;
      if (focusStats[focus]) {
        focusStats[focus].total++;
        if (item.isCorrect) focusStats[focus].correct++;
      }
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++;
        if (item.isCorrect) difficultyStats[difficulty].correct++;
      }
    }
  }

  const accuracyPercentage = Math.round((totalCorrect / totalAnswered) * 1000) / 10;
  const averageTimePerQuestionMs = Math.round(totalTimeMs / totalAnswered);

  return {
    totalAnswered,
    totalCorrect,
    accuracyPercentage,
    totalTimeMs,
    averageTimePerQuestionMs,
    accuracyByFocus: focusStats,
    accuracyByDifficulty: difficultyStats,
    highConfidenceErrors,
    reviewFlagsCount,
  };
}
