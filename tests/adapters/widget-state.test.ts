import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  readHostWidgetState,
  writeHostWidgetState,
  PersistedWidgetState,
} from "../../view/src/adapters/widget-state";

describe("Integração ChatGPT Apps SDK — widgetState (Fase 12)", () => {
  beforeEach(() => {
    // Mock global window e sessionStorage
    (global as any).window = {
      openai: {
        widgetState: undefined,
        setWidgetState: (state: any) => {
          (global as any).window.openai.widgetState = state;
        },
      },
    };
    (global as any).sessionStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] || null;
      },
      setItem(key: string, val: string) {
        this.store[key] = val;
      },
      clear() {
        this.store = {};
      },
    };
  });

  it("deve sincronizar o estado com window.openai.setWidgetState", async () => {
    const state = {
      sessionId: "session-123",
      currentQuestionIndex: 2,
      mode: "study" as const,
      answers: {
        "q-1": {
          selectedAnswer: "C" as const,
          confidence: "high" as const,
          elapsedTimeMs: 15000,
          isConfirmed: true,
        },
      },
      reviewFlags: { "q-1": false, "q-2": true },
      isCompleted: false,
    };

    writeHostWidgetState(state);

    // Aguarda o debounce de 100ms
    await new Promise((resolve) => setTimeout(resolve, 150));

    const hostState = (global as any).window.openai.widgetState as PersistedWidgetState;
    assert.ok(hostState);
    assert.equal(hostState.sessionId, "session-123");
    assert.equal(hostState.currentQuestionIndex, 2);
    assert.equal(hostState.answers["q-1"].selectedAnswer, "C");
    assert.equal(hostState.reviewFlags["q-2"], true);
    assert.equal(hostState.version, "1.0");
  });

  it("deve restaurar o estado a partir do host via readHostWidgetState", () => {
    (global as any).window.openai.widgetState = {
      version: "1.0",
      sessionId: "session-restore-456",
      currentQuestionIndex: 4,
      mode: "exam",
      answers: {
        "q-5": {
          selectedAnswer: "A",
          elapsedTimeMs: 30000,
          isConfirmed: true,
        },
      },
      reviewFlags: {},
      isCompleted: true,
      updatedAt: Date.now(),
    };

    const restored = readHostWidgetState();
    assert.ok(restored);
    assert.equal(restored.sessionId, "session-restore-456");
    assert.equal(restored.currentQuestionIndex, 4);
    assert.equal(restored.mode, "exam");
    assert.equal(restored.isCompleted, true);
  });

  it("deve carregar QuestionPublic e processar correção via gradeHandler registrado", async () => {
    const { useQuizUiStore } = await import("../../view/src/store/quiz-ui-store");

    const samplePublicQ = {
      id: "q-public-test",
      sequence: 1,
      header: {
        discipline: "processo-civil",
        point: "negocios-processuais",
        totalQuestions: 1,
      },
      content: {
        stem: "Enunciado público da questão de processo civil...",
        alternatives: [
          { label: "A" as const, text: "Alternativa A" },
          { label: "B" as const, text: "Alternativa B" },
          { label: "C" as const, text: "Alternativa C" },
          { label: "D" as const, text: "Alternativa D" },
          { label: "E" as const, text: "Alternativa E" },
        ],
      },
      interaction: {
        mode: "study" as const,
        allowConfidence: true,
        allowReview: true,
      },
      opaqueGradingToken: "mock-opaque-token.part2.part3",
    };

    // 1. Registra mock handler
    let handlerCalledWith: any = null;
    useQuizUiStore.getState().setGradeHandler(async (input) => {
      handlerCalledWith = input;
      return {
        questionId: input.questionId,
        selectedAnswer: input.selectedAnswer,
        correctAnswer: "C",
        isCorrect: input.selectedAnswer === "C",
        diagnosis: input.selectedAnswer === "C" ? undefined : "Equívoco pedagógico detectado",
        legalReasoning: "Fundamentação jurídica do CPC",
        legalBasis: "Art. 190 do CPC",
        precedents: ["STJ REsp 1.738.613"],
        doctrine: [],
        distractorAnalysis: {
          A: "Distrator A",
          B: "Distrator B",
          C: "Gabarito Correto",
          D: "Distrator D",
          E: "Distrator E",
        },
        confidence: input.confidence,
      };
    });

    // 2. Hidrata com QuestionPublic
    useQuizUiStore.getState().setPublicQuestions([samplePublicQ], "study", "Simulado Teste");

    const storeState = useQuizUiStore.getState();
    assert.equal(storeState.questions.length, 1);
    assert.equal(storeState.questions[0].id, "q-public-test");
    assert.equal(storeState.questions[0].correctAnswer, undefined, "QuestionPublic não deve conter correctAnswer aberto");

    // 3. Seleciona alternativa e confirma resposta
    useQuizUiStore.getState().selectAnswer("q-public-test", "C");
    useQuizUiStore.getState().setConfidence("q-public-test", "high");
    await useQuizUiStore.getState().confirmAnswer("q-public-test", 5000);

    assert.ok(handlerCalledWith);
    assert.equal(handlerCalledWith.questionId, "q-public-test");
    assert.equal(handlerCalledWith.selectedAnswer, "C");
    assert.equal(handlerCalledWith.confidence, "high");

    const afterConfirmState = useQuizUiStore.getState();
    const correction = afterConfirmState.corrections["q-public-test"];
    assert.ok(correction);
    assert.equal(correction.isCorrect, true);
    assert.equal(correction.correctAnswer, "C");
    assert.equal(correction.legalBasis, "Art. 190 do CPC");
  });
});

