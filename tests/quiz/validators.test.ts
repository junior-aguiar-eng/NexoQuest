import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateAnswerRotation,
  hasConsecutiveDuplicateAnswers,
  validateBlockRules,
  validateQuizPlan,
  validateQuestionContent,
  checkAlternativeSymmetry,
  calculateQuizStatistics,
} from "../../src/core/quiz";
import { QuizPlan, QuestionSlot, QuizBlockPlan } from "../../src/core/domain/quiz-plan";
import { QuestionInternal } from "../../src/core/domain/question";

describe("Validadores FGV e Regras de Bloco (Fase 4)", () => {

  // Fixture de Bloco Válido de 5 Questões
  const validSlots5: QuestionSlot[] = [
    { sequence: 1, umtId: "umt-1", format: "case_narrative", difficulty: "hard", focus: "jurisprudence", plannedCorrectAnswer: "A" },
    { sequence: 2, umtId: "umt-2", format: "case_narrative", difficulty: "hard", focus: "statute", plannedCorrectAnswer: "C" },
    { sequence: 3, umtId: "umt-3", format: "propositions", difficulty: "medium", focus: "doctrine", plannedCorrectAnswer: "E" },
    { sequence: 4, umtId: "umt-4", format: "case_narrative", difficulty: "hard", focus: "jurisprudence", plannedCorrectAnswer: "B" },
    { sequence: 5, umtId: "umt-5", format: "conceptual", difficulty: "easy", focus: "jurisprudence", plannedCorrectAnswer: "D" },
  ];

  const validBlock: QuizBlockPlan = {
    blockNumber: 1,
    questionCount: 5,
    slots: validSlots5,
  };

  it("deve aprovar rotação de gabarito sem letras consecutivas repetidas", () => {
    const res = validateAnswerRotation(validSlots5);
    assert.equal(res.isValid, true);
    assert.equal(res.errors.length, 0);
    assert.equal(hasConsecutiveDuplicateAnswers(["A", "C", "E", "B", "D"]), false);
  });

  it("deve reprovar rotação com gabarito consecutivo duplicado (ex: A -> A)", () => {
    const duplicateConsecutive: QuestionSlot[] = [
      { sequence: 1, umtId: "umt-1", format: "case_narrative", difficulty: "hard", focus: "jurisprudence", plannedCorrectAnswer: "B" },
      { sequence: 2, umtId: "umt-2", format: "case_narrative", difficulty: "hard", focus: "statute", plannedCorrectAnswer: "B" },
    ];
    const res = validateAnswerRotation(duplicateConsecutive);
    assert.equal(res.isValid, false);
    assert.equal(res.errors.length, 1);
    assert.match(res.errors[0], /Gabarito consecutivo duplicado/);
    assert.equal(hasConsecutiveDuplicateAnswers(["B", "B"]), true);
  });

  it("deve aprovar bloco de 5 com distribuição exata FGV (3 casos, 1 prop, 1 conc; 3 hard, 1 med, 1 easy; 1 statute, 1 doctrine)", () => {
    const res = validateBlockRules(validBlock, { strict: true });
    assert.equal(res.isValid, true);
    assert.equal(res.errors.length, 0);
  });

  it("deve reprovar bloco com 3 formatos consecutivos iguais (anti-repetição)", () => {
    const invalidConsecutiveBlock: QuizBlockPlan = {
      blockNumber: 1,
      questionCount: 5,
      slots: [
        { sequence: 1, umtId: "umt-1", format: "case_narrative", difficulty: "hard", focus: "jurisprudence", plannedCorrectAnswer: "A" },
        { sequence: 2, umtId: "umt-2", format: "case_narrative", difficulty: "hard", focus: "statute", plannedCorrectAnswer: "B" },
        { sequence: 3, umtId: "umt-3", format: "case_narrative", difficulty: "hard", focus: "doctrine", plannedCorrectAnswer: "C" }, // 3º caso fático seguido
        { sequence: 4, umtId: "umt-4", format: "propositions", difficulty: "medium", focus: "jurisprudence", plannedCorrectAnswer: "D" },
        { sequence: 5, umtId: "umt-5", format: "conceptual", difficulty: "easy", focus: "jurisprudence", plannedCorrectAnswer: "E" },
      ],
    };
    const res = validateBlockRules(invalidConsecutiveBlock);
    assert.equal(res.isValid, false);
    assert.match(res.errors[0], /3 ou mais questões consecutivas com o mesmo formato/);
  });

  it("deve validar QuizPlan completo com UMTs lineares e sem omissão de slots", () => {
    const fullPlan: QuizPlan = {
      schemaVersion: "1.0",
      quizId: "quiz-01",
      material: { id: "mat-01", name: "Proc Civil" },
      point: { id: "pt-01", order: 1, title: "Negócios Processuais" },
      umts: [
        { id: "umt-1", order: 1, title: "UMT 1", description: "Desc 1 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
        { id: "umt-2", order: 2, title: "UMT 2", description: "Desc 2 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
        { id: "umt-3", order: 3, title: "UMT 3", description: "Desc 3 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
        { id: "umt-4", order: 4, title: "UMT 4", description: "Desc 4 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
        { id: "umt-5", order: 5, title: "UMT 5", description: "Desc 5 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
      ],
      totalQuestions: 5,
      blocks: [validBlock],
    };

    const report = validateQuizPlan(fullPlan, { strict: true });
    assert.equal(report.isValid, true);
    assert.equal(report.totalQuestions, 5);
    assert.equal(report.errors.length, 0);
  });

  it("deve rejeitar QuizPlan quando uma UMT for omitida ou duplicada nos blocos", () => {
    const invalidPlan: QuizPlan = {
      schemaVersion: "1.0",
      quizId: "quiz-01",
      material: { id: "mat-01", name: "Proc Civil" },
      point: { id: "pt-01", order: 1, title: "Negócios Processuais" },
      umts: [
        { id: "umt-1", order: 1, title: "UMT 1", description: "Desc 1 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
        { id: "umt-2", order: 2, title: "UMT 2", description: "Desc 2 com mais de dez caracteres", category: "rule", substantiveWeight: "high", sourceRefs: [] },
      ],
      totalQuestions: 2,
      blocks: [
        {
          blockNumber: 1,
          questionCount: 2,
          slots: [
            { sequence: 1, umtId: "umt-1", format: "case_narrative", difficulty: "hard", focus: "jurisprudence", plannedCorrectAnswer: "A" },
            { sequence: 2, umtId: "umt-1", format: "conceptual", difficulty: "easy", focus: "statute", plannedCorrectAnswer: "B" }, // umt-1 duplicada e umt-2 omitida
          ],
        },
      ],
    };

    const report = validateQuizPlan(invalidPlan);
    assert.equal(report.isValid, false);
    assert.ok(report.errors.some((e) => e.includes("UMT testada mais de uma vez")));
    assert.ok(report.errors.some((e) => e.includes("UMT mapeada não possui slot alocado")));
  });

  it("deve detectar assimetria de palavras nas alternativas (checkAlternativeSymmetry)", () => {
    const symmetricAlts = [
      { label: "A" as const, text: "Esta é uma alternativa com dez palavras para testar a simetria." },
      { label: "B" as const, text: "Esta é outra alternativa de dez palavras para o teste da questão." },
      { label: "C" as const, text: "Mais uma opção com dez palavras exatas para conferência do validador." },
      { label: "D" as const, text: "Opção D com dez palavras selecionadas para validação do exame FGV." },
      { label: "E" as const, text: "Opção E contendo dez palavras redigidas para teste de simetria textual." },
    ];
    const sym = checkAlternativeSymmetry(symmetricAlts, 0.15);
    assert.equal(sym.isSymmetric, true);

    const asymmetricAlts = [
      { label: "A" as const, text: "Curta." },
      { label: "B" as const, text: "Esta é uma alternativa extremamente longa com muitas palavras adicionais para quebrar intencionalmente a simetria exigida pela banca examinadora da FGV." },
      { label: "C" as const, text: "Texto médio de teste." },
      { label: "D" as const, text: "Texto médio de teste." },
      { label: "E" as const, text: "Texto médio de teste." },
    ];
    const asym = checkAlternativeSymmetry(asymmetricAlts, 0.15);
    assert.equal(asym.isSymmetric, false);
    assert.ok(asym.maxDeviationPercentage > 15);
  });

  it("deve reprovar questão contendo marcadores editoriais proibidos no conteúdo público", () => {
    const leakedQuestion: QuestionInternal = {
      id: "q-leak",
      quizId: "quiz-01",
      sequence: 1,
      point: { id: "pt-01", title: "Negócios", order: 1 },
      umt: { id: "umt-01", title: "Art. 190" },
      blockNumber: 1,
      classification: { discipline: "Proc Civil", format: "case_narrative", difficulty: "hard", focus: "jurisprudence" },
      content: {
        stem: "Em ação civil [source: 3] [página: 45], as partes celebraram acordo...",
        alternatives: [
          { label: "A", text: "Alternativa A normal." },
          { label: "B", text: "Alternativa B normal." },
          { label: "C", text: "Alternativa C normal." },
          { label: "D", text: "Alternativa D normal." },
          { label: "E", text: "Alternativa E normal." },
        ],
      },
      answerKey: {
        correctAnswer: "A",
        legalReasoning: "Fundamentação válida.",
        legalBasis: "Art. 190 CPC",
        distractorAnalysis: { A: "A", B: "B", C: "C", D: "D", E: "E" },
      },
    };

    const res = validateQuestionContent(leakedQuestion);
    assert.equal(res.isValid, false);
    assert.match(res.errors[0], /marcadores editoriais\/internos proibidos/);
  });

  it("deve calcular estatísticas consolidadas corretamente (calculateQuizStatistics)", () => {
    const stats = calculateQuizStatistics([
      { questionId: "q1", isCorrect: true, selectedAnswer: "A", elapsedTimeMs: 30000, confidence: "high", classification: { difficulty: "hard", focus: "jurisprudence" } },
      { questionId: "q2", isCorrect: false, selectedAnswer: "B", elapsedTimeMs: 40000, confidence: "high", classification: { difficulty: "hard", focus: "statute" } }, // erro de alta confiança
      { questionId: "q3", isCorrect: true, selectedAnswer: "C", elapsedTimeMs: 50000, confidence: "medium", classification: { difficulty: "medium", focus: "doctrine" } },
      { questionId: "q4", isCorrect: true, selectedAnswer: "D", elapsedTimeMs: 20000, confidence: "high", classification: { difficulty: "easy", focus: "jurisprudence" }, isFlaggedForReview: true },
    ]);

    assert.equal(stats.totalAnswered, 4);
    assert.equal(stats.totalCorrect, 3);
    assert.equal(stats.accuracyPercentage, 75); // 3 de 4 = 75%
    assert.equal(stats.totalTimeMs, 140000);
    assert.equal(stats.averageTimePerQuestionMs, 35000);
    assert.equal(stats.highConfidenceErrors, 1);
    assert.equal(stats.reviewFlagsCount, 1);
    assert.equal(stats.accuracyByDifficulty?.hard.correct, 1);
    assert.equal(stats.accuracyByDifficulty?.hard.total, 2);
  });

});
