import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer } from "../../src/core/quiz/grade-service";
import { createGradingToken } from "../../src/core/security/crypto-token";

describe("Serviço de Correção Pedagógica Stateless — gradeAnswer (Fase 11)", () => {
  const token = createGradingToken({
    questionId: "q-proc-100",
    correctAnswer: "D",
    legalReasoning: "A fixação de calendário vincula as partes e o órgão jurisdicional (art. 191 do CPC).",
    legalBasis: "Art. 191 do CPC",
    precedents: ["STJ, REsp 1.700.000"],
    diagnosis: "O candidato errou ao assumir que o juiz pode alterar unilateralmente as datas pré-fixadas sem motivo legítimo.",
    distractorAnalyses: [
      { letter: "A", analysis: "Incorreta, pois o calendário não depende de homologação prévia do tribunal.", isPlausible: true },
      { letter: "B", analysis: "Incorreta, pois os prazos correm independentemente de nova intimação.", isPlausible: true },
      { letter: "C", analysis: "Incorreta, pois é lícito convencionar mesmo em causas de menor complexidade.", isPlausible: true },
      { letter: "E", analysis: "Incorreta, pois vincula tanto os litigantes quanto o próprio juiz.", isPlausible: true },
    ],
    createdAt: Date.now(),
  });

  it("deve corrigir resposta correta retornando isCorrect: true e fundamentação completa", () => {
    const correction = gradeAnswer({
      opaqueGradingToken: token,
      selectedAnswer: "D",
      confidence: "high",
      elapsedTimeMs: 45000,
    });

    assert.equal(correction.isCorrect, true);
    assert.equal(correction.questionId, "q-proc-100");
    assert.equal(correction.correctAnswer, "D");
    assert.equal(correction.selectedAnswer, "D");
    assert.equal(correction.diagnosis, undefined);
    assert.match(correction.legalReasoning, /art\. 191 do CPC/);
    assert.ok(correction.distractorAnalysis.A);
    assert.ok(correction.distractorAnalysis.B);
  });

  it("deve corrigir resposta incorreta retornando isCorrect: false e diagnóstico detalhado", () => {
    const correction = gradeAnswer({
      opaqueGradingToken: token,
      selectedAnswer: "B",
      confidence: "medium",
    });

    assert.equal(correction.isCorrect, false);
    assert.equal(correction.correctAnswer, "D");
    assert.equal(correction.selectedAnswer, "B");
    assert.ok(correction.diagnosis, "Diagnóstico deve ser retornado quando incorreta");
    assert.match(correction.diagnosis, /candidato/i);
    assert.match(correction.distractorAnalysis.B, /independentemente de nova intimação/);
  });

  it("deve rejeitar token violado com erro descritivo", () => {
    assert.throws(
      () =>
        gradeAnswer({
          opaqueGradingToken: "token.falso.invalido",
          selectedAnswer: "A",
        }),
      /token/i
    );
  });
});
