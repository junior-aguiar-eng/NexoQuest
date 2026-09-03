import type { QuizMode } from "../../../src/core/domain/primitives";
import type { UserAnswerRecord } from "../store/quiz-ui-store";

export interface PersistedWidgetState {
  version: "1.0";
  sessionId?: string;
  currentQuestionIndex: number;
  mode: QuizMode;
  answers: Record<string, UserAnswerRecord>;
  reviewFlags: Record<string, boolean>;
  isCompleted: boolean;
  updatedAt: number;
}

declare global {
  interface Window {
    openai?: {
      widgetState?: PersistedWidgetState;
      setWidgetState?: (state: PersistedWidgetState) => void;
      notify?: (event: string, payload: unknown) => void;
    };
  }
}

const STORAGE_FALLBACK_KEY = "nexoquiz_persisted_widget_state_v1";

/**
 * Lê o estado persistido do widget a partir do host ChatGPT Apps SDK (ou sessionStorage no modo local)
 */
export function readHostWidgetState(): PersistedWidgetState | null {
  // 1. Tenta recuperar do objeto global window.openai injetado pelo ChatGPT
  if (window.openai?.widgetState) {
    try {
      const state = window.openai.widgetState;
      if (state && typeof state === "object" && state.answers) {
        return state;
      }
    } catch {
      // Ignora e tenta fallback
    }
  }

  // 2. Fallback local via sessionStorage para desenvolvimento e preview
  try {
    const raw = sessionStorage.getItem(STORAGE_FALLBACK_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedWidgetState;
    }
  } catch {
    // SessionStorage indisponível em sandbox estrito
  }

  return null;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Sincroniza o estado atual do player com o ChatGPT Apps SDK de forma debounced
 */
export function writeHostWidgetState(state: Omit<PersistedWidgetState, "version" | "updatedAt">): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    const payload: PersistedWidgetState = {
      version: "1.0",
      ...state,
      updatedAt: Date.now(),
    };

    // 1. Sincroniza com ChatGPT Apps SDK se disponível
    if (typeof window.openai?.setWidgetState === "function") {
      try {
        window.openai.setWidgetState(payload);
      } catch (err) {
        console.warn("[NexoQuiz] Falha ao enviar widgetState para window.openai:", err);
      }
    }

    // 2. Persiste em sessionStorage para resiliência local
    try {
      sessionStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify(payload));
    } catch {
      // Sandbox estrito
    }
  }, 100);
}
