import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerQuizPlanTools } from "../../src/adapters/mcp/register-quiz-plan-tools";

describe("Integração MCP - Ferramentas de QuizPlan (Fase 9)", () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({ name: "NexoQuiz-Plan-Test", version: "1.0.0" });
    registerQuizPlanTools(server);
  });

  it("deve gerar template válido via quiz_plan_template e aprová-lo via quiz_plan_validate", async () => {
    const templateTool = (server as any)._registeredTools?.["quiz_plan_template"];
    const validateTool = (server as any)._registeredTools?.["quiz_plan_validate"];

    assert.ok(templateTool, "Tool quiz_plan_template deve estar registrada");
    assert.ok(validateTool, "Tool quiz_plan_validate deve estar registrada");

    // 1. Gera template de 1 bloco (5 questões)
    const templateRes = await templateTool.handler({ numBlocks: 1 });
    assert.equal(templateRes.isError, undefined);
    const plan = templateRes.structuredContent.template;

    assert.equal(plan.totalQuestions, 5);
    assert.equal(plan.blocks.length, 1);
    assert.equal(plan.umts.length, 5);

    // 2. Valida o plano gerado
    const valRes = await validateTool.handler({ plan });
    assert.equal(valRes.isError, undefined);
    assert.equal(valRes.structuredContent.isValid, true);
    assert.match(valRes.content[0].text, /QuizPlan APROVADO com sucesso/);
  });

  it("deve rejeitar plano com esquema Zod inválido (ex: totalQuestions faltando)", async () => {
    const validateTool = (server as any)._registeredTools?.["quiz_plan_validate"];

    const invalidSchemaPlan = {
      schemaVersion: "1.0",
      // faltando material, point, totalQuestions, umts, blocks
    };

    const res = await validateTool.handler({ plan: invalidSchemaPlan });
    assert.equal(res.isError, true);
    assert.equal(res.structuredContent.isValid, false);
    assert.match(res.content[0].text, /Falha de validação estrutural/);
  });

  it("deve rejeitar plano que viola proporções pedagógicas FGV (ex: todas fáceis)", async () => {
    const templateTool = (server as any)._registeredTools?.["quiz_plan_template"];
    const validateTool = (server as any)._registeredTools?.["quiz_plan_validate"];

    const templateRes = await templateTool.handler({ numBlocks: 1 });
    const plan = JSON.parse(JSON.stringify(templateRes.structuredContent.template));

    // Altera dificuldades para violar regra (todas easy)
    plan.blocks[0].slots.forEach((s: any) => {
      s.difficulty = "easy";
    });

    const res = await validateTool.handler({ plan });
    assert.equal(res.isError, true);
    assert.equal(res.structuredContent.isValid, false);
    assert.match(res.content[0].text, /rejeitado pelas regras pedagógicas/);
    assert.ok(res.structuredContent.report.errors.some((e: string) => e.toLowerCase().includes("dificuldade")));
  });

  it("deve rejeitar plano com repetição de gabarito consecutivo (ex: A -> A)", async () => {
    const templateTool = (server as any)._registeredTools?.["quiz_plan_template"];
    const validateTool = (server as any)._registeredTools?.["quiz_plan_validate"];

    const templateRes = await templateTool.handler({ numBlocks: 1 });
    const plan = JSON.parse(JSON.stringify(templateRes.structuredContent.template));

    // Força repetição A -> A
    plan.blocks[0].slots[0].plannedCorrectAnswer = "A";
    plan.blocks[0].slots[1].plannedCorrectAnswer = "A";

    const res = await validateTool.handler({ plan });
    assert.equal(res.isError, true);
    assert.equal(res.structuredContent.isValid, false);
    assert.ok(res.structuredContent.report.errors.some((e: string) => e.includes("duplicado")));
  });

});
