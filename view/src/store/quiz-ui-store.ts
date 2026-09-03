import { create } from "zustand";
import type { AnswerLabel, ConfidenceLevel, QuizMode } from "../../../src/core/domain/primitives";
import type { InteractiveLegalQuestion } from "../fixtures/block1Questions";
import { BLOCK_1_LEGAL_QUESTIONS } from "../fixtures/block1Questions";

export interface UserAnswerRecord {
  selectedAnswer: AnswerLabel;
  confidence?: ConfidenceLevel;
  elapsedTimeMs: number;
  isConfirmed: boolean;
}

export interface QuizUiState {
  questions: InteractiveLegalQuestion[];
  mode: QuizMode;
  currentQuestionIndex: number;
  answers: Record<string, UserAnswerRecord>;
  reviewFlags: Record<string, boolean>;
  isCompleted: boolean;
  activeReviewFilter: "all" | "errors" | "flagged" | null;
  filteredQuestionIndices: number[] | null;
}

export interface QuizUiActions {
  setQuestions: (questions: InteractiveLegalQuestion[], mode?: QuizMode) => void;
  setMode: (mode: QuizMode) => void;
  selectAnswer: (questionId: string, label: AnswerLabel) => void;
  setConfidence: (questionId: string, confidence: ConfidenceLevel) => void;
  toggleReviewFlag: (questionId: string) => void;
  confirmAnswer: (questionId: string, elapsedMs?: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestionIndex: (index: number) => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  startReview: (filter: "errors" | "flagged" | "all") => void;
  exitReview: () => void;
}

export type QuizUiStore = QuizUiState & QuizUiActions;

export const useQuizUiStore = create<QuizUiStore>((set, get) => ({
  questions: BLOCK_1_LEGAL_QUESTIONS,
  mode: "study",
  currentQuestionIndex: 0,
  answers: {},
  reviewFlags: {},
  isCompleted: false,
  activeReviewFilter: null,
  filteredQuestionIndices: null,

  setQuestions: (questions, mode = "study") => {
    set({
      questions,
      mode,
      currentQuestionIndex: 0,
      answers: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
    });
  },

  setMode: (mode) => set({ mode }),

  selectAnswer: (questionId, label) => {
    const { answers, mode } = get();
    const current = answers[questionId];

    // No modo estudo, após confirmação não é permitido trocar
    if (mode === "study" && current?.isConfirmed) {
      return;
    }

    set({
      answers: {
        ...answers,
        [questionId]: {
          selectedAnswer: label,
          confidence: current?.confidence,
          elapsedTimeMs: current?.elapsedTimeMs || 0,
          isConfirmed: mode === "study" ? false : Boolean(current?.isConfirmed),
        },
      },
    });
  },

  setConfidence: (questionId, confidence) => {
    const { answers } = get();
    const current = answers[questionId];
    if (!current) return;

    set({
      answers: {
        ...answers,
        [questionId]: {
          ...current,
          confidence,
        },
      },
    });
  },

  toggleReviewFlag: (questionId) => {
    const { reviewFlags } = get();
    const currentFlag = Boolean(reviewFlags[questionId]);
    set({
      reviewFlags: {
        ...reviewFlags,
        [questionId]: !currentFlag,
      },
    });
  },

  confirmAnswer: (questionId, elapsedMs = 0) => {
    const { answers } = get();
    const current = answers[questionId];
    if (!current?.selectedAnswer) return;

    set({
      answers: {
        ...answers,
        [questionId]: {
          ...current,
          isConfirmed: true,
          elapsedTimeMs: (current.elapsedTimeMs || 0) + elapsedMs,
        },
      },
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions, isCompleted, filteredQuestionIndices } = get();
    if (isCompleted) return;

    if (filteredQuestionIndices) {
      const currentPos = filteredQuestionIndices.indexOf(currentQuestionIndex);
      if (currentPos >= 0 && currentPos < filteredQuestionIndices.length - 1) {
        set({ currentQuestionIndex: filteredQuestionIndices[currentPos + 1] });
      } else {
        set({ isCompleted: true });
      }
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      set({ isCompleted: true });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex, filteredQuestionIndices } = get();

    if (filteredQuestionIndices) {
      const currentPos = filteredQuestionIndices.indexOf(currentQuestionIndex);
      if (currentPos > 0) {
        set({ currentQuestionIndex: filteredQuestionIndices[currentPos - 1] });
      }
      return;
    }

    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestionIndex: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  finishQuiz: () => {
    const { questions, answers } = get();
    // Confirma todas as respostas marcadas ao finalizar
    const updatedAnswers = { ...answers };
    for (const q of questions) {
      if (updatedAnswers[q.id]?.selectedAnswer) {
        updatedAnswers[q.id].isConfirmed = true;
      }
    }
    set({ answers: updatedAnswers, isCompleted: true });
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      answers: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
    });
  },

  startReview: (filter) => {
    const { questions, answers, reviewFlags } = get();
    let indices: number[] = [];

    if (filter === "errors") {
      indices = questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => answers[q.id]?.selectedAnswer !== q.correctAnswer)
        .map(({ idx }) => idx);
    } else if (filter === "flagged") {
      indices = questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => Boolean(reviewFlags[q.id]))
        .map(({ idx }) => idx);
    } else {
      indices = questions.map((_, idx) => idx);
    }

    if (indices.length > 0) {
      set({
        isCompleted: false,
        activeReviewFilter: filter,
        filteredQuestionIndices: indices,
        currentQuestionIndex: indices[0],
      });
    }
  },

  exitReview: () => {
    set({
      activeReviewFilter: null,
      filteredQuestionIndices: null,
      isCompleted: true,
    });
  },
}));
