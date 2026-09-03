import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QuestionInternal, QuestionPublicSchema } from "../../src/core/domain/question";
import { validateQuestionContent } from "../../src/core/quiz/question-validator";
import { gradeAnswer } from "../../src/core/quiz/grade-service";

describe("Hardening e Segurança do NexoQuiz (Fase 16)", () => {
  const sampleInternalQuestion: QuestionInternal = {
    id: "q-harden-1",
    sequence: 1,
    format: "case_narrative",
    difficulty: "hard",
    focus: "jurisprudence",
    header: {
      discipline: "processo-civil",
      point: "tutela-provisoria",
      totalQuestions: 5,
    },
    content: {
      stem: "Em ação ordinária, foi requerida tutela provisória de urgência de natureza antecipada...",
      alternatives: [
        { label: "A", text: "A decisão concessiva da tutela de urgência antecipada produz efeitos imediatos." },
        { label: "B", text: "A decisão concessiva da tutela de urgência cautelar é irrecorrível por agravo de instrumento." },
        { label: "C", text: "A tutela de urgência nunca poderá ser concedida liminarmente sem oitiva prévia." },
        { label: "D", text: "A estabilização da tutela opera-se mesmo se houver interposição tempestiva de recurso." },
        { label: "E", text: "A tutela de urgência cautelar transforma-se compulsoriamente em execução definitiva." },
      ],
    },
    interaction: {
      mode: "study",
      allowConfidence: true,
      allowReview: true,
    },
    answerKey: {
      correctAnswer: "A",
      legalReasoning: "Artigo 300 do CPC e jurisprudência pacífica do STJ sobre eficácia imediata das tutelas de urgência.",
      legalBasis: "Art. 300 do CPC",
      precedents: ["STJ, REsp 1.500.000"],
      diagnosis: "O candidato confundiu tutela cautelar com tutela antecipada.",
      distractorAnalysis: {
        A: "Gabarito oficial.",
        B: "Incorreta, cabe agravo de instrumento.",
        C: "Incorreta, autoriza concessão liminar.",
        D: "Incorreta, recurso obsta estabilização.",
        E: "Incorreta, não há conversão automática.",
      },
    },
  };

  it("QuestionPublicSchema deve sanitizar e não permitir que correctAnswer ou legalReasoning vazem no objeto público", () => {
    const publicQuestionWithLeak = {
      id: "q-leak-1",
      sequence: 1,
      header: sampleInternalQuestion.header,
      content: sampleInternalQuestion.content,
      interaction: sampleInternalQuestion.interaction,
      correctAnswer: "A", // Tentativa de injeção indevida
      legalReasoning: "Vazamento indevido de fundamentação",
    };

    const parsed: any = QuestionPublicSchema.parse(publicQuestionWithLeak);
    assert.equal(parsed.correctAnswer, undefined, "correctAnswer não deve existir no QuestionPublic");
    assert.equal(parsed.legalReasoning, undefined, "legalReasoning não deve existir no QuestionPublic");
  });

  it("validateQuestionContent deve detectar e reprovar marcadores editoriais maliciosos ou de debug", () => {
    const questionWithEditorials: QuestionInternal = {
      ...sampleInternalQuestion,
      content: {
        ...sampleInternalQuestion.content,
        stem: "Conforme visto no material [source: 3], o prazo processual é peremptório.",
      },
    };

    const validation = validateQuestionContent(questionWithEditorials);
    assert.equal(validation.isValid, false);
    assert.match(validation.errors[0], /marcadores editoriais|editorial/i);
  });

  it("gradeAnswer deve falhar deterministicamente com erro quando o token for corrompido propositalmente", () => {
    assert.throws(
      () =>
        gradeAnswer({
          opaqueGradingToken: "token.adulterado.12345",
          selectedAnswer: "A",
        }),
      /token de gabarito/i
    );
  });
});
