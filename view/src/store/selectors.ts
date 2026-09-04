import type { QuizUiState } from "./quiz-ui-store";
import { calculateQuizStatistics } from "../../../src/core/quiz/result-calculator";

export const selectCurrentQuestion = (state: QuizUiState) => {
  return state.questions[state.currentQuestionIndex] ?? null;
};

export const selectCurrentAnswer = (state: QuizUiState) => {
  const currentQ = selectCurrentQuestion(state);
  return currentQ ? state.answers[currentQ.id] ?? null : null;
};

export const selectIsCurrentConfirmed = (state: QuizUiState) => {
  const answer = selectCurrentAnswer(state);
  return Boolean(answer?.isConfirmed);
};

export const selectIsCurrentFlagged = (state: QuizUiState) => {
  const currentQ = selectCurrentQuestion(state);
  return currentQ ? Boolean(state.reviewFlags[currentQ.id]) : false;
};

export const selectProgress = (state: QuizUiState) => {
  const total = state.questions.length;
  const current = state.currentQuestionIndex + 1;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return { current, total, percentage };
};

export const selectSessionStatistics = (state: QuizUiState) => {
  const items = state.questions.map((q) => {
    const ans = state.answers[q.id];
    const corr = state.corrections[q.id];
    const isCorrect = corr ? corr.isCorrect : (q.correctAnswer ? ans?.selectedAnswer === q.correctAnswer : false);

    return {
      questionId: q.id,
      isCorrect,
      selectedAnswer: ans?.selectedAnswer || "",
      elapsedTimeMs: ans?.elapsedTimeMs || 0,
      confidence: ans?.confidence,
      classification: {
        difficulty: q.difficulty || "medium",
        focus: q.focus || "statute",
      },
      isFlaggedForReview: Boolean(state.reviewFlags[q.id]),
    };
  });

  return calculateQuizStatistics(items);
};

export const selectCanConfirm = (state: QuizUiState) => {
  const answer = selectCurrentAnswer(state);
  return Boolean(answer?.selectedAnswer && !answer.isConfirmed);
};

export const selectCanNavigateNext = (state: QuizUiState) => {
  if (state.mode === "study") {
    return selectIsCurrentConfirmed(state);
  }
  return true; // no modo prova, pode navegar livremente
};

export const selectCanNavigatePrev = (state: QuizUiState) => {
  if (state.mode === "exam" || state.activeReviewFilter !== null) {
    if (state.filteredQuestionIndices) {
      const pos = state.filteredQuestionIndices.indexOf(state.currentQuestionIndex);
      return pos > 0;
    }
    return state.currentQuestionIndex > 0;
  }
  return false; // no modo estudo não volta durante resolução ativa
};
