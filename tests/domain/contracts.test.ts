import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AnswerLabelSchema,
  AlternativesListSchema,
  QuestionInternalSchema,
  QuestionPublicSchema,
  QuestionCorrectionSchema,
  toQuestionPublic,
  UMTDefinitionSchema,
  QuizPlanSchema,
  type QuestionInternal,
} from "../../src/core/domain";

describe("Contratos de Domínio Canônicos (Fase 3)", () => {

  const validAlternatives = [
    { label: "A" as const, text: "Alternativa A válida." },
    { label: "B" as const, text: "Alternativa B válida." },
    { label: "C" as const, text: "Alternativa C válida." },
    { label: "D" as const, text: "Alternativa D válida." },
    { label: "E" as const, text: "Alternativa E válida." },
  ];

  const sampleQuestionInternal: QuestionInternal = {
    id: "q-proc-civ-01",
    quizId: "quiz-proc-civ-01",
    sequence: 1,
    point: {
      id: "pt-negocios",
      title: "Negócios Processuais",
      order: 1,
    },
    umt: {
      id: "umt-01",
      title: "Art. 190 CPC - Cláusula Geral de Negociação Processual",
    },
    blockNumber: 1,
    classification: {
      discipline: "Processo Civil",
      format: "case_narrative",
      difficulty: "hard",
      focus: "jurisprudence",
    },
    content: {
      stem: "Em ação ordinária fundada em negócio processual atípico...",
      alternatives: validAlternatives,
    },
    answerKey: {
      correctAnswer: "B",
      legalReasoning: "Fundamentação jurídica detalhada baseada no art. 190 do CPC.",
      legalBasis: "Art. 190 do CPC",
      precedents: ["REsp 1.738.613/SP"],
      doctrine: ["Didier Jr., Fredie"],
      distractorAnalysis: {
        A: "Incorreta porque a lei autoriza negócios atípicos.",
        B: "Correta, conforme o art. 190 do CPC.",
        C: "Incorreta por exigir homologação obrigatória.",
        D: "Incorreta quanto à renúncia genérica.",
        E: "Incorreta quanto ao momento temporal.",
      },
    },
    sourceTrace: ["docs/material/proc-civ-01.md"],
  };

  it("deve validar com sucesso AnswerLabel para A, B, C, D, E", () => {
    assert.equal(AnswerLabelSchema.parse("A"), "A");
    assert.equal(AnswerLabelSchema.parse("E"), "E");
    assert.throws(() => AnswerLabelSchema.parse("F"));
    assert.throws(() => AnswerLabelSchema.parse("1"));
  });

  it("deve rejeitar lista com 4 alternativas (menos que 5)", () => {
    const fourAlts = validAlternatives.slice(0, 4);
    assert.throws(() => AlternativesListSchema.parse(fourAlts));
  });

  it("deve rejeitar lista com 6 alternativas (mais que 5)", () => {
    const sixAlts = [
      ...validAlternatives,
      { label: "E" as const, text: "Alternativa extra." },
    ];
    assert.throws(() => AlternativesListSchema.parse(sixAlts));
  });

  it("deve rejeitar alternativas com letras duplicadas ou desordenadas", () => {
    const duplicateAlts = [
      { label: "A" as const, text: "Texto A" },
      { label: "B" as const, text: "Texto B" },
      { label: "B" as const, text: "Texto B duplicado" },
      { label: "D" as const, text: "Texto D" },
      { label: "E" as const, text: "Texto E" },
    ];
    assert.throws(() => AlternativesListSchema.parse(duplicateAlts));
  });

  it("deve transformar QuestionInternal em QuestionPublic sem vazar gabarito ou fundamentação", () => {
    const pub = toQuestionPublic(sampleQuestionInternal, 5, "study");

    assert.equal(pub.id, sampleQuestionInternal.id);
    assert.equal(pub.sequence, 1);
    assert.equal(pub.header.discipline, "Processo Civil");
    assert.equal(pub.header.totalQuestions, 5);
    assert.equal(pub.content.alternatives.length, 5);

    // Garantir ausência de campos confidenciais no objeto público
    const pubObj = pub as Record<string, unknown>;
    assert.equal(pubObj.answerKey, undefined);
    assert.equal(pubObj.correctAnswer, undefined);
    assert.equal(pubObj.legalReasoning, undefined);
    assert.equal(pubObj.distractorAnalysis, undefined);
    assert.equal(pubObj.sourceTrace, undefined);

    // Validação estrita pelo schema
    assert.doesNotThrow(() => QuestionPublicSchema.parse(pub));
  });

  it("deve validar correção correta e rejeitar correção incorreta sem diagnóstico", () => {
    // Correção com acerto (não exige diagnóstico obrigatório)
    const correctResult = {
      questionId: "q-01",
      selectedAnswer: "B" as const,
      correctAnswer: "B" as const,
      isCorrect: true,
      legalReasoning: "Fundamentação da resposta correta.",
      distractorAnalysis: {
        A: "Análise A",
        B: "Análise B",
        C: "Análise C",
        D: "Análise D",
        E: "Análise E",
      },
    };
    assert.doesNotThrow(() => QuestionCorrectionSchema.parse(correctResult));

    // Correção com erro mas sem diagnóstico -> deve falhar
    const incorrectWithoutDiagnosis = {
      questionId: "q-01",
      selectedAnswer: "A" as const,
      correctAnswer: "B" as const,
      isCorrect: false,
      legalReasoning: "Fundamentação da correta.",
      distractorAnalysis: {
        A: "Análise A",
        B: "Análise B",
        C: "Análise C",
        D: "Análise D",
        E: "Análise E",
      },
    };
    assert.throws(() => QuestionCorrectionSchema.parse(incorrectWithoutDiagnosis));

    // Correção com erro e com diagnóstico -> sucesso
    const incorrectWithDiagnosis = {
      ...incorrectWithoutDiagnosis,
      diagnosis: "O candidato confundiu o negócio processual atípico com o calendário do art. 191.",
    };
    assert.doesNotThrow(() => QuestionCorrectionSchema.parse(incorrectWithDiagnosis));
  });

  it("deve validar UMTDefinitionSchema e QuizPlanSchema válidos", () => {
    const umt = {
      id: "umt-01",
      order: 1,
      title: "Cláusula Geral de Negociação",
      description: "Permite ajuste do procedimento e convenção sobre ônus e faculdades.",
      category: "rule" as const,
      substantiveWeight: "high" as const,
      sourceRefs: [{ sectionId: "sec-01" }],
    };
    assert.doesNotThrow(() => UMTDefinitionSchema.parse(umt));

    const plan = {
      schemaVersion: "1.0" as const,
      quizId: "quiz-01",
      material: { id: "mat-01", name: "Processo Civil" },
      point: { id: "pt-01", order: 1, title: "Negócios Processuais" },
      umts: [umt],
      totalQuestions: 1,
      blocks: [
        {
          blockNumber: 1,
          questionCount: 1,
          slots: [
            {
              sequence: 1,
              umtId: "umt-01",
              format: "case_narrative" as const,
              difficulty: "hard" as const,
              focus: "jurisprudence" as const,
              plannedCorrectAnswer: "B" as const,
            },
          ],
        },
      ],
    };
    assert.doesNotThrow(() => QuizPlanSchema.parse(plan));
  });

});
