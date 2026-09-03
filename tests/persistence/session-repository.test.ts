import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { SessionRepository, CompletedSessionData } from "../../src/core/persistence/session-repository";

describe("Persistência Local & Histórico SQLite (Fase 13)", () => {
  let repo: SessionRepository;

  beforeEach(() => {
    repo = new SessionRepository(":memory:");
  });

  const sampleSession: CompletedSessionData = {
    sessionId: "sess-2026-001",
    discipline: "processo-civil",
    point: "negocios-processuais",
    mode: "study",
    totalQuestions: 5,
    correctCount: 4,
    errorCount: 1,
    accuracyPercentage: 80,
    totalTimeMs: 180000,
    answers: [
      {
        questionId: "q-1",
        sequence: 1,
        format: "case_narrative",
        difficulty: "hard",
        focus: "statute",
        selectedAnswer: "C",
        correctAnswer: "C",
        isCorrect: true,
        confidence: "high",
        elapsedTimeMs: 35000,
      },
      {
        questionId: "q-2",
        sequence: 2,
        format: "case_narrative",
        difficulty: "hard",
        focus: "jurisprudence",
        selectedAnswer: "B",
        correctAnswer: "D",
        isCorrect: false,
        confidence: "medium",
        elapsedTimeMs: 45000,
      },
    ],
  };

  it("deve salvar e recuperar uma sessão completa com suas respostas", () => {
    repo.saveSession(sampleSession);

    const retrieved = repo.getSession("sess-2026-001");
    assert.ok(retrieved);
    assert.equal(retrieved.sessionId, "sess-2026-001");
    assert.equal(retrieved.discipline, "processo-civil");
    assert.equal(retrieved.accuracyPercentage, 80);
    assert.equal(retrieved.answers.length, 2);
    assert.equal(retrieved.answers[0].isCorrect, true);
    assert.equal(retrieved.answers[1].isCorrect, false);
  });

  it("deve listar resumos de sessões e aplicar filtros por disciplina", () => {
    repo.saveSession(sampleSession);
    repo.saveSession({
      ...sampleSession,
      sessionId: "sess-2026-002",
      discipline: "constitucional",
      point: "direitos-fundamentais",
    });

    const allSessions = repo.listSessions();
    assert.equal(allSessions.length, 2);

    const procCivSessions = repo.listSessions({ discipline: "processo-civil" });
    assert.equal(procCivSessions.length, 1);
    assert.equal(procCivSessions[0].sessionId, "sess-2026-001");
  });

  it("deve agregar métricas consolidadas de desempenho por disciplina", () => {
    repo.saveSession(sampleSession); // 5 questoes, 4 certas (80%)
    repo.saveSession({
      ...sampleSession,
      sessionId: "sess-2026-003",
      discipline: "processo-civil",
      totalQuestions: 5,
      correctCount: 5,
      errorCount: 0,
      accuracyPercentage: 100,
      totalTimeMs: 120000,
      answers: [],
    });

    const metrics = repo.getDisciplineMetrics();
    assert.equal(metrics.length, 1);
    assert.equal(metrics[0].discipline, "processo-civil");
    assert.equal(metrics[0].totalAttempts, 10);
    assert.equal(metrics[0].totalCorrect, 9);
    assert.equal(metrics[0].accuracyPercentage, 90); // 9/10 = 90%
    assert.equal(metrics[0].totalTimeMinutes, 5); // (180k + 120k) / 60k = 5 min
  });

  it("deve limpar o histórico com clearHistory", () => {
    repo.saveSession(sampleSession);
    assert.equal(repo.listSessions().length, 1);

    repo.clearHistory();
    assert.equal(repo.listSessions().length, 0);
    assert.equal(repo.getSession("sess-2026-001"), null);
  });
});
