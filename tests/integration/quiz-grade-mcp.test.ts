import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerQuizGradeTool } from "../../src/adapters/mcp/register-quiz-grade-tool";
import { createGradingToken } from "../../src/core/security/crypto-token";

describe("Integração MCP - Ferramenta quiz_grade_answer (Fase 11)", () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({ name: "NexoQuiz-Grade-Test", version: "1.0.0" });
    registerQuizGradeTool(server);
  });

  const testToken = createGradingToken({
    questionId: "q-constitucional-1",
    correctAnswer: "A",
    legalReasoning: "A eficácia horizontal dos direitos fundamentais decorre da força normativa da Constituição.",
    legalBasis: "Art. 5º da CF/88",
    precedents: ["STF, RE 201.819/RJ"],
    diagnosis: "O candidato confundiu eficácia vertical (Estado-indivíduo) com eficácia horizontal (entre particulares).",
    distractorAnalyses: [
      { letter: "B", analysis: "Incorreta, pois a eficácia irradia sobre entidades privadas.", isPlausible: true },
      { letter: "C", analysis: "Incorreta, pois não exige prévia lei regulamentadora.", isPlausible: true },
      { letter: "D", analysis: "Incorreta, pois aplica-se também às relações de trabalho.", isPlausible: true },
      { letter: "E", analysis: "Incorreta, pois a garantia de ampla defesa incide em associações privadas.", isPlausible: true },
    ],
    createdAt: Date.now(),
  });

  it("deve executar quiz_grade_answer para acerto e retornar payload com feedback positivo", async () => {
    const gradeTool = (server as any)._registeredTools?.["quiz_grade_answer"];
    assert.ok(gradeTool, "Tool quiz_grade_answer deve estar registrada");

    const res = await gradeTool.handler({
      opaqueGradingToken: testToken,
      selectedAnswer: "A",
      confidence: "high",
    });

    assert.equal(res.isError, undefined);
    assert.equal(res.structuredContent.success, true);
    assert.equal(res.structuredContent.correction.isCorrect, true);
    assert.match(res.content[0].text, /RESPOSTA CORRETA/);
    assert.match(res.content[0].text, /STF, RE 201\.819\/RJ/);
  });

  it("deve executar quiz_grade_answer para erro e retornar diagnóstico do equívoco", async () => {
    const gradeTool = (server as any)._registeredTools?.["quiz_grade_answer"];

    const res = await gradeTool.handler({
      opaqueGradingToken: testToken,
      selectedAnswer: "B",
      confidence: "medium",
    });

    assert.equal(res.isError, undefined);
    assert.equal(res.structuredContent.success, true);
    assert.equal(res.structuredContent.correction.isCorrect, false);
    assert.match(res.content[0].text, /RESPOSTA INCORRETA/);
    assert.match(res.content[0].text, /DIAGNÓSTICO DO EQUÍVOCO/);
    assert.match(res.content[0].text, /eficácia vertical/);
  });

  it("deve retornar erro estruturado quando o token for inválido", async () => {
    const gradeTool = (server as any)._registeredTools?.["quiz_grade_answer"];

    const res = await gradeTool.handler({
      opaqueGradingToken: "token-falso-invalido-123",
      selectedAnswer: "A",
    });

    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /Falha na correção/);
  });
});
