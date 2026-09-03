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
});
