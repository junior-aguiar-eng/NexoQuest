import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerQuizRenderTool } from "../../src/adapters/mcp/register-quiz-render-tool";
import { decryptGradingToken } from "../../src/core/security/crypto-token";

describe("Integração MCP - Ferramenta quiz_render (Fase 10)", () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({ name: "NexoQuiz-Render-Test", version: "1.0.0" });
    registerQuizRenderTool(server);
  });

  const validQuestionInternal = {
    id: "q-proc-1",
    quizId: "quiz-proc-123",
    sequence: 1,
    blockNumber: 1,
    point: {
      id: "negocios-processuais",
      title: "Negócios Processuais",
      order: 1,
    },
    umt: {
      id: "umt-1",
      title: "Cláusula Geral do Art. 190",
    },
    classification: {
      discipline: "processo-civil",
      format: "case_narrative" as const,
      difficulty: "hard" as const,
      focus: "statute" as const,
    },
    content: {
      stem: "Em ação de cobrança, autor e réu acordaram previamente a alteração das regras de distribuição do ônus probatório.",
      command: "Considerando as disposições do CPC sobre negócios processuais, assinale a opção correta:",
      alternatives: [
        { label: "A" as const, text: "O negócio é nulo de pleno direito por versar sobre norma de ordem pública indisponível pelo juízo." },
        { label: "B" as const, text: "A convenção é válida desde que celebrada por escritura pública e homologada judicialmente antes da citação." },
        { label: "C" as const, text: "O acordo é plenamente válido se as partes forem capazes e o direito admitir autocomposição formal." },
        { label: "D" as const, text: "O juiz deve recusar aplicação de ofício por violação ao princípio da inafastabilidade da jurisdição estatal." },
        { label: "E" as const, text: "A estipulação depende de anuência expressa do Ministério Público mesmo sem interesse de incapazes." },
      ],
    },
    answerKey: {
      correctAnswer: "C" as const,
      legalReasoning: "Nos termos do art. 190 do CPC, é lícito às partes plenamente capazes estipular mudanças procedimentais.",
      legalBasis: "Art. 190 do CPC",
      precedents: ["Enunciado 19 do FPPC"],
      doctrine: ["Didier Jr."],
      diagnosis: "O candidato desconsiderou a ampla autonomia privada processual conferida pelo art. 190 do CPC.",
      distractorAnalysis: {
        A: "Incorreta, pois a distribuição do ônus probatório admite convenção prévia (art. 373, § 3º).",
        B: "Incorreta, pois não se exige escritura pública nem homologação como condição geral de eficácia.",
        C: "Correta, conforme art. 190 do CPC.",
        D: "Incorreta, pois o controle judicial restringe-se a nulidades e vulnerabilidades evidentes.",
        E: "Incorreta, pois o MP só intervém nas hipóteses legais do art. 178 do CPC.",
      },
      confidenceScore: 0.95,
    },
  };

  it("deve registrar e executar quiz_render retornando QuestionPublic sem expor o gabarito bruto", async () => {
    const renderTool = (server as any)._registeredTools?.["quiz_render"];
    assert.ok(renderTool, "Tool quiz_render deve estar registrada");

    const res = await renderTool.handler({
      discipline: "processo-civil",
      point: "negocios-processuais",
      questions: [validQuestionInternal],
      mode: "study",
    });

    assert.equal(res.isError, undefined);
    assert.match(res.content[0].text, /NexoQuiz iniciado com sucesso/);

    const publicQ = res.structuredContent.questions[0];
    assert.equal(publicQ.id, "q-proc-1");
    assert.equal(publicQ.content.stem, validQuestionInternal.content.stem);
    assert.equal((publicQ as any).answerKey, undefined, "QuestionPublic NÃO deve conter answerKey");
    assert.equal((publicQ as any).correctAnswer, undefined, "QuestionPublic NÃO deve conter correctAnswer");

    // Valida que o opaqueGradingToken é válido e descriptografável
    assert.ok(publicQ.opaqueGradingToken);
    const decrypted = decryptGradingToken(publicQ.opaqueGradingToken);
    assert.equal(decrypted.correctAnswer, "C");
    assert.equal(decrypted.legalReasoning, validQuestionInternal.answerKey.legalReasoning);
  });

  it("deve reprovar chamada de quiz_render contendo marcadores editoriais no conteúdo", async () => {
    const renderTool = (server as any)._registeredTools?.["quiz_render"];

    const questionWithMarker = JSON.parse(JSON.stringify(validQuestionInternal));
    questionWithMarker.content.stem += " [source: Seção 2, MEGE]";

    const res = await renderTool.handler({
      discipline: "processo-civil",
      point: "negocios-processuais",
      questions: [questionWithMarker],
    });

    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /marcadores editoriais/);
  });

  it("deve reprovar questão sem análise suficiente de distratores", async () => {
    const renderTool = (server as any)._registeredTools?.["quiz_render"];

    const questionWithoutDistractor = JSON.parse(JSON.stringify(validQuestionInternal));
    questionWithoutDistractor.answerKey.distractorAnalysis.A = ""; // vazio

    const res = await renderTool.handler({
      discipline: "processo-civil",
      point: "negocios-processuais",
      questions: [questionWithoutDistractor],
    });

    assert.equal(res.isError, true);
    assert.match(res.content[0].text, /não possui análise pedagógica/);
  });
});
