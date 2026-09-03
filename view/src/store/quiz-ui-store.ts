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

import { readHostWidgetState, writeHostWidgetState } from "../adapters/widget-state";

export type QuizUiStore = QuizUiState & QuizUiActions;

const initialSaved = readHostWidgetState();

function notifySync(state: QuizUiState) {
  writeHostWidgetState({
    currentQuestionIndex: state.currentQuestionIndex,
    mode: state.mode,
    answers: state.answers,
    reviewFlags: state.reviewFlags,
    isCompleted: state.isCompleted,
  });
}

export const useQuizUiStore = create<QuizUiStore>((set, get) => ({
  questions: BLOCK_1_LEGAL_QUESTIONS,
  mode: initialSaved?.mode || "study",
  currentQuestionIndex: initialSaved?.currentQuestionIndex ?? 0,
  answers: initialSaved?.answers || {},
  reviewFlags: initialSaved?.reviewFlags || {},
  isCompleted: initialSaved?.isCompleted || false,
  activeReviewFilter: null,
  filteredQuestionIndices: null,

  setQuestions: (questions, mode = "study") => {
    const newState: Partial<QuizUiState> = {
      questions,
      mode,
      currentQuestionIndex: 0,
      answers: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
    };
    set(newState);
    notifySync({ ...get(), ...newState } as QuizUiState);
  },

  setMode: (mode) => {
    set({ mode });
    notifySync(get());
  },

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
    notifySync(get());
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
    notifySync(get());
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
    notifySync(get());
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
    notifySync(get());
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
      notifySync(get());
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      set({ isCompleted: true });
    }
    notifySync(get());
  },

  previousQuestion: () => {
    const { currentQuestionIndex, filteredQuestionIndices } = get();

    if (filteredQuestionIndices) {
      const currentPos = filteredQuestionIndices.indexOf(currentQuestionIndex);
      if (currentPos > 0) {
        set({ currentQuestionIndex: filteredQuestionIndices[currentPos - 1] });
      }
      notifySync(get());
      return;
    }

    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
    notifySync(get());
  },

  goToQuestionIndex: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
      notifySync(get());
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
    notifySync(get());
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
    notifySync(get());
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
      notifySync(get());
    }
  },

  exitReview: () => {
    set({
      activeReviewFilter: null,
      filteredQuestionIndices: null,
      isCompleted: true,
    });
    notifySync(get());
  },
}));
