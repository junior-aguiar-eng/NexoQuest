import { create } from "zustand";
import type { AnswerLabel, ConfidenceLevel, Difficulty, Focus, QuestionFormat, QuizMode } from "../../../src/core/domain/primitives";
import type { QuestionPublic } from "../../../src/core/domain/question";
import type { QuestionCorrection } from "../../../src/core/domain/correction";
import type { InteractiveLegalQuestion } from "../fixtures/block1Questions";
import { BLOCK_1_LEGAL_QUESTIONS } from "../fixtures/block1Questions";
import { readHostWidgetState, writeHostWidgetState } from "../adapters/widget-state";

export interface UnifiedQuizQuestion {
  id: string;
  sequence: number;
  totalQuestions: number;
  discipline: string;
  point: string;
  umtTitle?: string;
  format?: QuestionFormat;
  difficulty?: Difficulty;
  focus?: Focus;
  blockNumber?: number;
  slotInBlock?: number;
  stem: string;
  propositions?: string[];
  command?: string;
  alternatives: { label: AnswerLabel; text: string }[];
  opaqueGradingToken?: string;

  // Opcionais (apenas quando carregados de fixtures offline locais)
  correctAnswer?: AnswerLabel;
  diagnosis?: string;
  legalReasoning?: string;
  legalBasis?: string;
  precedents?: string[];
  doctrine?: string[];
  distractorAnalysis?: Record<AnswerLabel, string>;
}

export function questionPublicToUnified(q: QuestionPublic): UnifiedQuizQuestion {
  return {
    id: q.id,
    sequence: q.sequence,
    totalQuestions: q.header.totalQuestions,
    discipline: q.header.discipline,
    point: q.header.point,
    stem: q.content.stem,
    propositions: q.content.propositions,
    command: q.content.command,
    alternatives: q.content.alternatives,
    opaqueGradingToken: q.opaqueGradingToken,
  };
}

export interface UserAnswerRecord {
  selectedAnswer: AnswerLabel;
  confidence?: ConfidenceLevel;
  elapsedTimeMs: number;
  isConfirmed: boolean;
}

export interface QuizUiState {
  questions: UnifiedQuizQuestion[];
  mode: QuizMode;
  currentQuestionIndex: number;
  answers: Record<string, UserAnswerRecord>;
  corrections: Record<string, QuestionCorrection>;
  reviewFlags: Record<string, boolean>;
  isCompleted: boolean;
  activeReviewFilter: "all" | "errors" | "flagged" | null;
  filteredQuestionIndices: number[] | null;
  quizTitle?: string;
}

export type GradeHandler = (input: {
  questionId: string;
  opaqueGradingToken: string;
  selectedAnswer: AnswerLabel;
  confidence?: ConfidenceLevel;
  elapsedTimeMs: number;
}) => Promise<QuestionCorrection | null>;

let globalGradeHandler: GradeHandler | null = null;

export interface QuizUiActions {
  setQuestions: (questions: InteractiveLegalQuestion[], mode?: QuizMode, title?: string) => void;
  setPublicQuestions: (questions: QuestionPublic[], mode?: QuizMode, title?: string) => void;
  setGradeHandler: (handler: GradeHandler | null) => void;
  setCorrection: (questionId: string, correction: QuestionCorrection) => void;
  setMode: (mode: QuizMode) => void;
  selectAnswer: (questionId: string, label: AnswerLabel) => void;
  setConfidence: (questionId: string, confidence: ConfidenceLevel) => void;
  toggleReviewFlag: (questionId: string) => void;
  confirmAnswer: (questionId: string, elapsedMs?: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestionIndex: (index: number) => void;
  finishQuiz: () => Promise<void>;
  resetQuiz: () => void;
  startReview: (filter: "errors" | "flagged" | "all") => void;
  exitReview: () => void;
}

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
  corrections: {},
  reviewFlags: initialSaved?.reviewFlags || {},
  isCompleted: initialSaved?.isCompleted || false,
  activeReviewFilter: null,
  filteredQuestionIndices: null,
  quizTitle: undefined,

  setGradeHandler: (handler) => {
    globalGradeHandler = handler;
  },

  setCorrection: (questionId, correction) => {
    set({
      corrections: {
        ...get().corrections,
        [questionId]: correction,
      },
    });
  },

  setQuestions: (questions, mode = "study", title) => {
    const newState: Partial<QuizUiState> = {
      questions,
      mode,
      currentQuestionIndex: 0,
      answers: {},
      corrections: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
      quizTitle: title,
    };
    set(newState);
    notifySync({ ...get(), ...newState } as QuizUiState);
  },

  setPublicQuestions: (publicQuestions, mode = "study", title) => {
    const unified = publicQuestions.map(questionPublicToUnified);
    const newState: Partial<QuizUiState> = {
      questions: unified,
      mode,
      currentQuestionIndex: 0,
      answers: {},
      corrections: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
      quizTitle: title,
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

  confirmAnswer: async (questionId, elapsedMs = 0) => {
    const { answers, questions } = get();
    const currentAns = answers[questionId];
    if (!currentAns?.selectedAnswer) return;

    const updatedAns: UserAnswerRecord = {
      ...currentAns,
      isConfirmed: true,
      elapsedTimeMs: (currentAns.elapsedTimeMs || 0) + elapsedMs,
    };

    set({
      answers: {
        ...answers,
        [questionId]: updatedAns,
      },
    });

    const targetQuestion = questions.find((q) => q.id === questionId);
    if (!targetQuestion) {
      notifySync(get());
      return;
    }

    // 1. Se houver gradeHandler registrado e token disponível (MCP host)
    if (globalGradeHandler && targetQuestion.opaqueGradingToken) {
      try {
        const corr = await globalGradeHandler({
          questionId,
          opaqueGradingToken: targetQuestion.opaqueGradingToken,
          selectedAnswer: currentAns.selectedAnswer,
          confidence: currentAns.confidence,
          elapsedTimeMs: updatedAns.elapsedTimeMs,
        });
        if (corr) {
          set({
            corrections: {
              ...get().corrections,
              [questionId]: corr,
            },
          });
        }
      } catch (err) {
        console.warn("[NexoQuiz] Falha na graduação stateless via MCP host:", err);
      }
    } else if (targetQuestion.correctAnswer) {
      // 2. Modo Fixture Local / Standalone: constrói a correção a partir dos dados locais
      const isCorrect = currentAns.selectedAnswer === targetQuestion.correctAnswer;
      const localCorr: QuestionCorrection = {
        questionId: targetQuestion.id,
        selectedAnswer: currentAns.selectedAnswer,
        correctAnswer: targetQuestion.correctAnswer,
        isCorrect,
        diagnosis: isCorrect ? undefined : targetQuestion.diagnosis,
        legalReasoning: targetQuestion.legalReasoning || "",
        legalBasis: targetQuestion.legalBasis,
        precedents: targetQuestion.precedents || [],
        doctrine: targetQuestion.doctrine || [],
        distractorAnalysis: targetQuestion.distractorAnalysis || {
          A: "Gabarito ou distrator A",
          B: "Gabarito ou distrator B",
          C: "Gabarito ou distrator C",
          D: "Gabarito ou distrator D",
          E: "Gabarito ou distrator E",
        },
        confidence: currentAns.confidence,
      };
      set({
        corrections: {
          ...get().corrections,
          [questionId]: localCorr,
        },
      });
    }

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

  finishQuiz: async () => {
    const { questions, answers } = get();
    const updatedAnswers = { ...answers };
    for (const q of questions) {
      if (updatedAnswers[q.id]?.selectedAnswer) {
        updatedAnswers[q.id].isConfirmed = true;
      }
    }
    set({ answers: updatedAnswers, isCompleted: true });

    // Gradua todas as questões pendentes no modo Prova
    for (const q of questions) {
      const ans = updatedAnswers[q.id];
      if (ans?.selectedAnswer && !get().corrections[q.id]) {
        if (globalGradeHandler && q.opaqueGradingToken) {
          try {
            const corr = await globalGradeHandler({
              questionId: q.id,
              opaqueGradingToken: q.opaqueGradingToken,
              selectedAnswer: ans.selectedAnswer,
              confidence: ans.confidence,
              elapsedTimeMs: ans.elapsedTimeMs,
            });
            if (corr) {
              set({ corrections: { ...get().corrections, [q.id]: corr } });
            }
          } catch {
            // Ignora erro individual na finalização em lote
          }
        } else if (q.correctAnswer) {
          const isCorrect = ans.selectedAnswer === q.correctAnswer;
          const localCorr: QuestionCorrection = {
            questionId: q.id,
            selectedAnswer: ans.selectedAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect,
            diagnosis: isCorrect ? undefined : q.diagnosis,
            legalReasoning: q.legalReasoning || "",
            legalBasis: q.legalBasis,
            precedents: q.precedents || [],
            doctrine: q.doctrine || [],
            distractorAnalysis: q.distractorAnalysis || {
              A: "Distrator A", B: "Distrator B", C: "Distrator C", D: "Distrator D", E: "Distrator E"
            },
            confidence: ans.confidence,
          };
          set({ corrections: { ...get().corrections, [q.id]: localCorr } });
        }
      }
    }

    notifySync(get());
  },

  resetQuiz: () => {
    set({
      currentQuestionIndex: 0,
      answers: {},
      corrections: {},
      reviewFlags: {},
      isCompleted: false,
      activeReviewFilter: null,
      filteredQuestionIndices: null,
    });
    notifySync(get());
  },

  startReview: (filter) => {
    const { questions, answers, corrections, reviewFlags } = get();
    let indices: number[] = [];

    if (filter === "errors") {
      indices = questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q }) => {
          const corr = corrections[q.id];
          if (corr) return !corr.isCorrect;
          const ans = answers[q.id];
          return q.correctAnswer ? ans?.selectedAnswer !== q.correctAnswer : false;
        })
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
