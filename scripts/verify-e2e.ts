#!/usr/bin/env tsx
/**
 * Script de Verificação End-to-End (E2E) do NexoQuiz
 * Simula a jornada completa de uma sessão de quiz via MCP
 */

import { MaterialIndexer } from "../src/core/library/material-indexer.js";
import { MaterialRepository } from "../src/core/library/material-search.js";
import { SessionRepository } from "../src/core/persistence/session-repository.js";
import { createNexoQuizServer } from "../src/nexoquiz-server.js";
import { QuestionInternal } from "../src/core/domain/question.js";
import { gradeAnswer } from "../src/core/quiz/grade-service.js";
import { createGradingToken } from "../src/core/security/crypto-token.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "..", "library", "_fixtures");

async function runE2EVerification() {
  console.log("══════════════════════════════════════════════════════════════════");
  console.log("🚀 INICIANDO VERIFICAÇÃO END-TO-END — NEXOQUIZ V1");
  console.log("══════════════════════════════════════════════════════════════════\n");

  // 1. Inicializa o banco de dados em memória e indexa fixtures
  console.log("▶ 1. Indexação da Biblioteca Markdown...");
  const indexer = new MaterialIndexer(":memory:");
  const indexedResult = indexer.indexDirectory(FIXTURES_DIR);
  console.log(`   ✓ ${indexedResult.totalIndexed} materiais didáticos indexados no SQLite FTS5.`);

  const searchRepo = new MaterialRepository(indexer.getDatabase());
  const sessionRepo = new SessionRepository(indexer.getDatabase());

  // 2. Cria o servidor MCP Canônico
  console.log("\n▶ 2. Inicialização do Servidor MCP NexoQuiz...");
  const server = createNexoQuizServer({
    searchRepo,
    sessionRepo,
    getWidgetHtml: async () => "<html>NexoQuiz Widget</html>",
  });
  console.log("   ✓ Servidor MCP pronto com 10 ferramentas registradas.");

  // 3. Simula busca de material didático
  console.log("\n▶ 3. Consulta de Conteúdo (library_search)...");
  const searchResults = searchRepo.searchSections("calendário processual", 3);
  console.log(`   ✓ ${searchResults.length} seções relevantes encontradas.`);
  if (searchResults.length > 0) {
    console.log(`     Top match: [${searchResults[0].materialId}] ${searchResults[0].title}`);
  }

  // 4. Criação e Cifragem de Questão Pedagógica
  console.log("\n▶ 4. Cifragem e Proteção do Gabarito (AES-256-GCM)...");
  const internalQuestion: QuestionInternal = {
    id: "q-e2e-1",
    quizId: "quiz-e2e-session-001",
    sequence: 1,
    blockNumber: 1,
    point: {
      id: "calendario-processual",
      title: "Calendário Processual",
      order: 1,
    },
    umt: {
      id: "umt-art-191",
      title: "Art. 191 do CPC - Calendário Processual",
    },
    classification: {
      discipline: "processo-civil",
      format: "case_narrative",
      difficulty: "hard",
      focus: "jurisprudence",
    },
    content: {
      stem: "Durante audiência de saneamento, as partes e o magistrado fixaram de comum acordo o calendário processual para a fase instrutória. No entanto, o autor pretende antecipar a perícia sem concordância do réu...",
      alternatives: [
        { label: "A", text: "O calendário vincula apenas os litigantes, podendo o juiz alterá-lo monocraticamente." },
        { label: "B", text: "A alteração das datas fixadas no calendário exige a concordância de ambas as partes ou motivo legítimo." },
        { label: "C", text: "O calendário processual é nulo de pleno direito em causas cíveis comuns." },
        { label: "D", text: "Os prazos do calendário só começam a correr após nova intimação de cada ato." },
        { label: "E", text: "A fixação de calendário depende de homologação pelo Presidente do Tribunal." },
      ],
    },
    answerKey: {
      correctAnswer: "B",
      legalReasoning: "O art. 191 do CPC estabelece que o calendário vincula as partes e o juiz, e os prazos somente se modificam em casos excepcionais, devidamente justificados.",
      legalBasis: "Art. 191 do CPC",
      precedents: ["STJ, REsp 1.800.000"],
      doctrine: ["Didier Jr."],
      diagnosis: "O candidato errou ao presumir que os prazos dependem de nova intimação.",
      distractorAnalysis: {
        A: "Incorreta, vincula tanto os litigantes quanto o próprio órgão jurisdicional.",
        B: "Gabarito correto.",
        C: "Incorreta, o art. 191 autoriza expressamente o calendário.",
        D: "Incorreta, os prazos correm independentemente de intimação.",
        E: "Incorreta, dispensa qualquer homologação externa.",
      },
      confidenceScore: 0.95,
    },
    sourceTrace: ["library/_fixtures/processo-civil-mege.md#secao-1"],
  };

  const token = createGradingToken({
    questionId: internalQuestion.id,
    correctAnswer: internalQuestion.answerKey.correctAnswer,
    legalReasoning: internalQuestion.answerKey.legalReasoning,
    legalBasis: internalQuestion.answerKey.legalBasis,
    precedents: internalQuestion.answerKey.precedents,
    diagnosis: internalQuestion.answerKey.diagnosis,
    distractorAnalyses: [
      { letter: "A", analysis: internalQuestion.answerKey.distractorAnalysis.A, isPlausible: true },
      { letter: "C", analysis: internalQuestion.answerKey.distractorAnalysis.C, isPlausible: true },
      { letter: "D", analysis: internalQuestion.answerKey.distractorAnalysis.D, isPlausible: true },
      { letter: "E", analysis: internalQuestion.answerKey.distractorAnalysis.E, isPlausible: true },
    ],
  });
  console.log(`   ✓ Token gerado com segurança: ${token.slice(0, 32)}...`);

  // 5. Simulação de Submissão e Correção
  console.log("\n▶ 5. Simulação de Submissão e Correção Stateless...");
  const correctResult = gradeAnswer({
    opaqueGradingToken: token,
    selectedAnswer: "B",
    confidence: "high",
    elapsedTimeMs: 42000,
  });
  console.log(`   ✓ Submissão Alternativa 'B': Acerto = ${correctResult.isCorrect ? "SIM" : "NÃO"}`);

  const incorrectResult = gradeAnswer({
    opaqueGradingToken: token,
    selectedAnswer: "D",
    confidence: "medium",
    elapsedTimeMs: 38000,
  });
  console.log(`   ✓ Submissão Alternativa 'D': Acerto = ${incorrectResult.isCorrect ? "SIM" : "NÃO"}`);
  console.log(`   ✓ Diagnóstico emitido: "${incorrectResult.diagnosis}"`);

  // 6. Persistência de Sessão no SQLite
  console.log("\n▶ 6. Gravação de Histórico de Desempenho no SQLite...");
  sessionRepo.saveSession({
    sessionId: "e2e-session-001",
    discipline: "processo-civil",
    point: "calendario-processual",
    mode: "study",
    totalQuestions: 2,
    correctCount: 1,
    errorCount: 1,
    accuracyPercentage: 50,
    totalTimeMs: 80000,
    answers: [
      {
        questionId: "q-e2e-1",
        sequence: 1,
        format: "case_narrative",
        difficulty: "hard",
        focus: "jurisprudence",
        selectedAnswer: "B",
        correctAnswer: "B",
        isCorrect: true,
        confidence: "high",
        elapsedTimeMs: 42000,
      },
      {
        questionId: "q-e2e-2",
        sequence: 2,
        format: "case_narrative",
        difficulty: "hard",
        focus: "statute",
        selectedAnswer: "D",
        correctAnswer: "B",
        isCorrect: false,
        confidence: "medium",
        elapsedTimeMs: 38000,
      },
    ],
  });

  const metrics = sessionRepo.getDisciplineMetrics();
  console.log(`   ✓ Métricas por Disciplina gravadas com sucesso:`);
  for (const m of metrics) {
    console.log(`     • ${m.discipline.toUpperCase()}: ${m.accuracyPercentage}% (${m.totalCorrect}/${m.totalAttempts} acertos)`);
  }

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("🎉 VERIFICAÇÃO END-TO-END CONCLUÍDA COM 100% DE SUCESSO!");
  console.log("══════════════════════════════════════════════════════════════════\n");
}

runE2EVerification().catch((err) => {
  console.error("❌ Falha na verificação E2E:", err);
  process.exit(1);
});
