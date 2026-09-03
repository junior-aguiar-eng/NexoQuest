import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createGradingToken, decryptGradingToken, GradingPayload } from "../../src/core/security/crypto-token";

describe("Segurança & Criptografia — opaqueGradingToken (Fase 10)", () => {
  const validPayload: GradingPayload = {
    questionId: "q-test-1",
    correctAnswer: "C",
    legalReasoning: "Fundamentação jurídica com base no art. 190 do CPC/2015.",
    legalBasis: "Art. 190 do CPC",
    precedents: ["STJ, REsp 1.810.059/SP"],
    diagnosis: "O candidato confundiu negócio jurídico atípico com cláusula abusiva.",
    distractorAnalyses: [
      { letter: "A", analysis: "Incorreta porque exige forma solene.", isPlausible: true },
      { letter: "B", analysis: "Incorreta porque não há nulidade de pleno direito.", isPlausible: true },
      { letter: "D", analysis: "Incorreta pois o juiz não pode intervir de ofício sem vulnerabilidade.", isPlausible: true },
      { letter: "E", analysis: "Incorreta por violação ao princípio da cooperação.", isPlausible: true },
    ],
    createdAt: Date.now(),
  };

  it("deve criptografar e descriptografar o payload de gabarito com integridade perfeita", () => {
    const token = createGradingToken(validPayload);
    assert.ok(typeof token === "string");
    assert.equal(token.split(".").length, 3, "Token deve conter 3 partes (iv.authTag.ciphertext)");

    const decrypted = decryptGradingToken(token);
    assert.equal(decrypted.questionId, validPayload.questionId);
    assert.equal(decrypted.correctAnswer, "C");
    assert.equal(decrypted.legalReasoning, validPayload.legalReasoning);
    assert.equal(decrypted.diagnosis, validPayload.diagnosis);
    assert.equal(decrypted.distractorAnalyses.length, 4);
  });

  it("deve rejeitar token adulterado ou violado (autenticação AES-GCM)", () => {
    const token = createGradingToken(validPayload);
    const parts = token.split(".");
    
    // Adultera o ciphertext
    const tamperedCiphertext = parts[2].slice(0, -4) + "AAAA";
    const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedCiphertext}`;

    assert.throws(() => decryptGradingToken(tamperedToken), /Unsupported state or unable to authenticate data|bad decrypt/i);
  });

  it("deve rejeitar token malformado sem partes válidas", () => {
    assert.throws(() => decryptGradingToken("token-invalido-sem-pontos"), /Token de gabarito malformado/);
  });

  it("deve rejeitar token expirado quando expiresAt estiver no passado", () => {
    const expiredPayload: GradingPayload = {
      ...validPayload,
      expiresAt: Date.now() - 10000, // 10s no passado
    };

    const token = createGradingToken(expiredPayload);
    assert.throws(() => decryptGradingToken(token), /Token de gabarito expirado/);
  });
});
