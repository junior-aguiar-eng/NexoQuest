import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { MaterialIndexer } from "../core/library/material-indexer.js";
import { MaterialRepository, SectionSearchResult } from "../core/library/material-search.js";
import { SessionRepository, CompletedSessionData, DisciplinePerformanceMetrics } from "../core/persistence/session-repository.js";
import { createGradingToken } from "../core/security/crypto-token.js";
import { gradeAnswer } from "../core/quiz/grade-service.js";
import { AnswerLabel, Difficulty, Focus, QuestionFormat, QuizMode } from "../core/domain/primitives.js";
import { DistractorAnalysisItem } from "../core/domain/question.js";
import { OutlineNode, ParsedSection } from "../core/library/markdown-parser.js";
import { c, renderBox, renderProgressBar, renderTable } from "./cli-tui.js";

const ROOT_DIR = process.cwd();
const DB_PATH = path.join(ROOT_DIR, "data", "nexoquiz.sqlite");

function getRepositories() {
  const indexer = new MaterialIndexer(DB_PATH);
  const materialRepo = new MaterialRepository(indexer.getDatabase());
  const sessionRepo = new SessionRepository(DB_PATH);
  return { indexer, materialRepo, sessionRepo };
}

/**
 * Executa busca lexical FTS5 no acervo de apostilas
 */
export function handleSearch(query: string): string {
  if (!query || query.trim().length === 0) {
    return c.warning("⚠️  Por favor, informe um termo para buscar. Ex: /busca recurso especial");
  }

  const { materialRepo } = getRepositories();
  const results: SectionSearchResult[] = materialRepo.searchSections(query.trim(), { limit: 5 });

  if (results.length === 0) {
    return c.dim(`Nenhum resultado encontrado para "${query}". Tente outros termos jurídicos.`);
  }

  let out = `\n🔍 ${c.bold(`Resultados da busca por:`)} "${c.gold(query)}"\n`;
  out += c.dim("─".repeat(70)) + "\n";

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const pathStr = r.headingPath ? ` > ${r.headingPath}` : "";
    out += `\n${c.brand(`[${i + 1}]`)} ${c.title(r.materialTitle)} ${c.dim(`(${r.discipline} · Ponto ${r.point})`)}\n`;
    out += `    ${c.dim("Seção:")} ${c.gold(r.title)}${c.dim(pathStr)}\n`;
    out += `    ${c.dim("Material ID:")} ${r.materialId} ${c.dim("· Seção:")} ${r.sectionId}\n`;

    // Trecho limpo
    const snippet = r.content
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 240);
    out += `    ${c.info("Trecho:")} "${snippet}..."\n`;
  }

  out += "\n" + c.dim(`💡 Dica: Use /ler ${results[0].materialId} para ver a estrutura do material.`);
  return out;
}

/**
 * Lista todo o catálogo de materiais indexados
 */
export function handleListMaterials(): string {
  const { materialRepo } = getRepositories();
  const materials = materialRepo.listMaterials();

  if (materials.length === 0) {
    return c.warning("⚠️  Nenhum material indexado no momento. Execute 'npm run library:index' para indexar.");
  }

  const headers = ["Disciplina", "Ponto", "Título do Material", "Seções", "ID"];
  const rows = materials.map(m => [
    c.gold(m.discipline),
    `Ponto ${m.pointOrder}`,
    m.title.length > 35 ? m.title.slice(0, 32) + "..." : m.title,
    String(m.totalSections),
    c.dim(m.id),
  ]);

  let out = `\n📚 ${c.bold("Catálogo Canônico de Apostilas Jurídicas (NexoQuiz)")}\n`;
  out += renderTable(headers, rows);
  out += `\n${c.dim(`Total: ${materials.length} material(is) disponível(is) para consulta e simulados.`)}`;
  return out;
}

/**
 * Lê uma seção ou exibe a estrutura do material
 */
export function handleReadSection(materialId: string, sectionId?: string): string {
  if (!materialId || materialId.trim().length === 0) {
    return c.warning("⚠️  Informe o ID do material. Ex: /ler const-direitos-fundamentais-2026");
  }

  const { materialRepo } = getRepositories();
  const outline: OutlineNode[] | null = materialRepo.getMaterialOutline(materialId.trim());

  if (!outline) {
    return c.error(`❌ Material com ID "${materialId}" não encontrado no catálogo.`);
  }

  if (!sectionId) {
    let out = `\n📖 ${c.title(materialId)}\n`;
    out += c.dim("─".repeat(70)) + "\n";
    out += `${c.bold("Estrutura de Tópicos e Seções:")}\n`;
    for (const s of outline) {
      const indent = "  ".repeat(Math.max(0, s.level - 1));
      out += `${indent}${c.brand("•")} ${c.title(s.title)} ${c.dim(`(ID: ${s.sectionId})`)}\n`;
    }
    out += `\n${c.dim(`Para ler o conteúdo de um tópico específico, use: /ler ${materialId} <ID_DA_SECAO>`)}`;
    return out;
  }

  const sections: ParsedSection[] = materialRepo.readSections(materialId.trim(), [sectionId.trim()]);
  if (sections.length === 0) {
    return c.error(`❌ Seção "${sectionId}" não encontrada no material "${materialId}".`);
  }

  const sec = sections[0];
  return renderBox(
    `${materialId} — ${sec.title}`,
    sec.content.trim(),
    c.brand
  );
}

/**
 * Exibe métricas de desempenho e histórico local do candidato
 */
export function handleMetrics(): string {
  const { sessionRepo } = getRepositories();
  const metrics: DisciplinePerformanceMetrics[] = sessionRepo.getDisciplineMetrics();
  const recentSessions = sessionRepo.listSessions({ limit: 5 });

  if (metrics.length === 0 && recentSessions.length === 0) {
    return c.dim("Nenhum simulado realizado ainda. Execute /simulado para iniciar seu primeiro teste!");
  }

  let out = `\n📊 ${c.bold("Relatório Consolidado de Desempenho (SQLite Local)")}\n\n`;

  if (metrics.length > 0) {
    const headers = ["Disciplina", "Questões", "Acertos", "Acurácia", "Tempo"];
    const rows = metrics.map((m: DisciplinePerformanceMetrics) => [
      c.gold(m.discipline),
      String(m.totalAttempts),
      c.success(String(m.totalCorrect)),
      m.accuracyPercentage >= 70 ? c.success(`${m.accuracyPercentage}%`) : c.warning(`${m.accuracyPercentage}%`),
      `${m.totalTimeMinutes} min`,
    ]);
    out += `${c.title("Desempenho por Disciplina:")}\n` + renderTable(headers, rows) + "\n\n";
  }

  if (recentSessions.length > 0) {
    out += `${c.title("Últimas Sessões Realizadas:")}\n`;
    for (const s of recentSessions) {
      const dateStr = s.completedAt ? new Date(s.completedAt).toLocaleDateString("pt-BR") : "Recente";
      const statusIcon = s.accuracyPercentage >= 70 ? "✅" : "⚠️";
      out += `  ${statusIcon} ${c.dim(dateStr)} · ${c.bold(s.discipline)} (${s.point}) : ${s.correctCount}/${s.totalQuestions} (${s.accuracyPercentage}%) [${s.mode.toUpperCase()}]\n`;
    }
  }

  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
// BANCO CANÔNICO DE QUESTÕES PARA SIMULADO CLI
// ══════════════════════════════════════════════════════════════════════════════
export interface CliQuestionItem {
  id: string;
  discipline: string;
  point: string;
  format: QuestionFormat;
  difficulty: Difficulty;
  focus: Focus;
  stem: string;
  alternatives: { label: AnswerLabel; text: string }[];
  correctAnswer: AnswerLabel;
  legalReasoning: string;
  legalBasis: string;
  distractorAnalyses: DistractorAnalysisItem[];
}

const CANONICAL_DEMO_QUESTIONS: CliQuestionItem[] = [
  {
    id: "q-const-01",
    format: "case_narrative",
    difficulty: "hard",
    focus: "statute",
    discipline: "Direito Constitucional",
    point: "Ponto 1 - Teoria da Constituição",
    stem: "Maria, servidora pública federal estável, foi exonerada de seu cargo sem processo administrativo disciplinar prévio, sob a justificativa de \"necessidade de enxugamento da máquina pública\". Inconformada, impetrou mandado de segurança. À luz da Constituição Federal de 1988 e da jurisprudência consolidada do STF, assinale a alternativa correta:",
    alternatives: [
      { label: "A", text: "A exoneração é válida, pois a Administração Pública possui discricionariedade para dispensar servidores com base no interesse público." },
      { label: "B", text: "O servidor estável somente pode perder o cargo mediante sentença judicial transitada em julgado, processo administrativo disciplinar com ampla defesa, ou avaliação periódica de desempenho insuficiente (art. 41, §1º, CF)." },
      { label: "C", text: "A estabilidade do servidor público pode ser flexibilizada em períodos de crise fiscal, conforme decisão do STF na ADI 2.135." },
      { label: "D", text: "O mandado de segurança é incabível, pois Maria deveria ter impetrado ação ordinária com pedido de reintegração." },
      { label: "E", text: "A estabilidade prevista no art. 41 da CF aplica-se apenas aos servidores celetistas da Administração Direta." },
    ],
    correctAnswer: "B",
    legalReasoning: "O art. 41, §1º, da CF/88 estabelece taxativamente as hipóteses de perda do cargo pelo servidor estável: (I) sentença judicial transitada em julgado; (II) processo administrativo disciplinar com garantia de ampla defesa; (III) avaliação periódica de desempenho, na forma de lei complementar.",
    legalBasis: "Art. 41, §1º, incisos I a III, CF/88; Súmula 20 do STF.",
    distractorAnalyses: [
      { letter: "A", analysis: "A discricionariedade administrativa não se estende à dispensa de servidores estáveis — trata-se de matéria sujeita a reserva legal e processual constitucional.", isPlausible: true },
      { letter: "C", analysis: "A ADI 2.135 suspendeu a EC 19/98 quanto à flexibilização do regime jurídico único, não autorizando dispensa por crise fiscal.", isPlausible: true },
      { letter: "D", analysis: "O mandado de segurança é cabível contra ato de autoridade que viole direito líquido e certo (art. 5º, LXIX, CF).", isPlausible: false },
      { letter: "E", analysis: "A estabilidade do art. 41 aplica-se aos servidores estatutários, não aos celetistas.", isPlausible: true },
    ],
  },
  {
    id: "q-proc-civil-02",
    format: "propositions",
    difficulty: "medium",
    focus: "jurisprudence",
    discipline: "Direito Processual Civil",
    point: "Ponto 5 - Teoria Geral dos Recursos",
    stem: "Sobre os requisitos de admissibilidade do Recurso Especial perante o Superior Tribunal de Justiça, analise as proposições e assinale a alternativa correta:",
    alternatives: [
      { label: "A", text: "O prequestionamento da matéria federal é dispensável quando a violação legal for manifesta e de interesse público." },
      { label: "B", text: "Cabe Recurso Especial para reexame de provas produzidas nas instâncias ordinárias, desde que se demonstre violação ao princípio do livre convencimento motivado." },
      { label: "C", text: "O Recurso Especial exige prequestionamento da questão federal (Súmula 211/STJ), não serve para reexame de provas (Súmula 7/STJ) e pressupõe esgotamento das vias ordinárias." },
      { label: "D", text: "O Recurso Especial pode ser interposto diretamente contra decisão de juiz de primeiro grau, desde que haja violação de lei federal." },
      { label: "E", text: "A interposição simultânea de Recurso Especial e Recurso Extraordinário é vedada pelo ordenamento processual brasileiro." },
    ],
    correctAnswer: "C",
    legalReasoning: "O Recurso Especial (art. 105, III, CF) exige: (1) prequestionamento da matéria federal (Súmula 211/STJ); (2) impossibilidade de reexame fático-probatório (Súmula 7/STJ); (3) decisão de tribunal de última instância ordinária.",
    legalBasis: "Art. 105, III, CF/88; Súmulas 7 e 211 do STJ; art. 1.029 do CPC/2015.",
    distractorAnalyses: [
      { letter: "A", analysis: "O prequestionamento é requisito indispensável, mesmo em matérias de ordem pública (Súmula 211/STJ).", isPlausible: true },
      { letter: "B", analysis: "A Súmula 7/STJ veda expressamente o reexame fático-probatório em sede de REsp.", isPlausible: true },
      { letter: "D", analysis: "O REsp pressupõe decisão colegiada de tribunal de 2º grau, não decisão de juiz singular.", isPlausible: false },
      { letter: "E", analysis: "A interposição simultânea de REsp e RE é permitida e regulamentada pelo art. 1.031 do CPC.", isPlausible: true },
    ],
  },
  {
    id: "q-penal-03",
    format: "case_narrative",
    difficulty: "hard",
    focus: "doctrine",
    discipline: "Direito Penal",
    point: "Ponto 2 - Teoria do Delito e Excludentes",
    stem: "João, policial militar em patrulhamento noturno, dispara arma de fogo contra Pedro, que corria em via pública portando objeto metálico brilhante. Pedro falece. Perícia posterior revela que o objeto era um celular com capa metálica. Sobre a responsabilidade penal de João, assinale a alternativa correta:",
    alternatives: [
      { label: "A", text: "João responde por homicídio doloso qualificado, pois assumiu o risco do resultado ao disparar sem certeza absoluta." },
      { label: "B", text: "Trata-se de exercício regular de direito com isenção absoluta de pena em qualquer circunstância." },
      { label: "C", text: "Configura-se legítima defesa putativa: João supôs, por erro plenamente justificado pelas circunstâncias, estar diante de agressão iminente. Aplica-se o art. 20, §1º, do CP, excluindo o dolo." },
      { label: "D", text: "O fato é atípico, amparado pelo estrito cumprimento do dever legal automático de policiais." },
      { label: "E", text: "João deve responder por homicídio culposo militar, de competência da Justiça Federal." },
    ],
    correctAnswer: "C",
    legalReasoning: "A legítima defesa putativa decorre de erro de tipo permissivo (art. 20, §1º, CP), em que o agente supõe situação de fato que, se existisse, tornaria a ação legítima. Exclui o dolo; se evitável, permite punição culposa.",
    legalBasis: "Art. 20, §1º, e art. 25 do Código Penal; Teoria Limitada da Culpabilidade.",
    distractorAnalyses: [
      { letter: "A", analysis: "Na legítima defesa putativa, o agente crê genuinamente estar em perigo real, afastando o dolo direto ou eventual.", isPlausible: true },
      { letter: "B", analysis: "Não existe autorização legal irrestrita para disparo de arma de fogo letal sem necessidade (Lei 13.060/2014).", isPlausible: false },
      { letter: "D", analysis: "O estrito cumprimento do dever legal exige proporcionalidade e perigo real demonstrado.", isPlausible: false },
      { letter: "E", analysis: "Crimes de PM em serviço contra civis são julgados pela Justiça Estadual comum (Tribunal do Júri).", isPlausible: true },
    ],
  },
  {
    id: "q-admin-04",
    format: "conceptual",
    difficulty: "easy",
    focus: "doctrine",
    discipline: "Direito Administrativo",
    point: "Ponto 1 - Atos Administrativos",
    stem: "Assinale a alternativa que apresenta corretamente o conceito de ato administrativo vinculado e sua distinção em relação ao ato discricionário:",
    alternatives: [
      { label: "A", text: "O ato vinculado é aquele em que a Administração possui margem de escolha quanto à conveniência e oportunidade." },
      { label: "B", text: "No ato vinculado, todos os elementos (competência, forma, finalidade, motivo e objeto) estão rigidamente definidos em lei. No discricionário, a lei confere margem de apreciação quanto ao motivo e ao objeto." },
      { label: "C", text: "Atos vinculados e discricionários diferem apenas quanto à competência, sendo a competência do vinculado intransferível." },
      { label: "D", text: "Atos discricionários são imunes a qualquer controle de legalidade pelo Poder Judiciário." },
      { label: "E", text: "Todo ato administrativo é por natureza discricionário, cabendo ao administrador moldar seus requisitos." },
    ],
    correctAnswer: "B",
    legalReasoning: "No ato vinculado, todos os elementos encontram-se determinados pela norma legal. No ato discricionário, a lei concede juízo de conveniência e oportunidade (mérito administrativo) restrito ao motivo e ao objeto.",
    legalBasis: "Doutrina de Hely Lopes Meirelles e Celso Antônio Bandeira de Mello; Art. 2º da Lei 4.717/65.",
    distractorAnalyses: [
      { letter: "A", analysis: "Descrição invertida: juízo de conveniência e oportunidade é atributo do ato discricionário.", isPlausible: true },
      { letter: "C", analysis: "A distinção essencial repousa no grau de liberdade sobre o motivo e o objeto, não na competência.", isPlausible: false },
      { letter: "D", analysis: "Atos discricionários submetem-se ao controle judicial de legalidade, razoabilidade e proporcionalidade (Súmula 473/STF).", isPlausible: false },
      { letter: "E", analysis: "Diversos atos (ex: concessão de licença, aposentadoria compulsória) são expressamente vinculados.", isPlausible: false },
    ],
  },
  {
    id: "q-const-05",
    format: "case_narrative",
    difficulty: "hard",
    focus: "statute",
    discipline: "Direito Constitucional",
    point: "Ponto 3 - Organização do Estado",
    stem: "O Governador do Estado X editou decreto determinando a intervenção no Município Y para garantir a prestação de contas do Poder Executivo municipal, alegando omissão no prazo legal. Sobre essa intervenção estadual, assinale a alternativa correta:",
    alternatives: [
      { label: "A", text: "A intervenção é inconstitucional, pois apenas a União possui competência para intervir em municípios." },
      { label: "B", text: "A intervenção independe de qualquer controle ou apreciação pelo Poder Legislativo estadual." },
      { label: "C", text: "A intervenção estadual em município por não prestação de contas é prevista no art. 35, II, da CF. Depende de decreto do Governador, com apreciação pela Assembleia Legislativa no prazo de 24 horas (art. 36, §1º, CF)." },
      { label: "D", text: "O Governador só pode intervir com autorização prévia e vinculante do Tribunal de Contas." },
      { label: "E", text: "A intervenção estadual em municípios foi revogada pela Emenda Constitucional 45/2004." },
    ],
    correctAnswer: "C",
    legalReasoning: "A intervenção dos Estados em Municípios é taxativamente prevista no art. 35 da CF/88 (inciso II: não prestação de contas). O procedimento exige submissão do decreto interventivo à Assembleia Legislativa em 24h.",
    legalBasis: "Art. 35, II, e art. 36, §1º, da Constituição Federal de 1988.",
    distractorAnalyses: [
      { letter: "A", analysis: "A CF prevê expressamente intervenção estadual em municípios (art. 35). A União só intervém em municípios localizados em Territórios Federais.", isPlausible: true },
      { letter: "B", analysis: "O controle político pela Assembleia Legislativa em 24 horas é obrigatório (art. 36, §1º, CF).", isPlausible: false },
      { letter: "D", analysis: "O Tribunal de Contas emite parecer prévio; a deliberação política é da Assembleia Legislativa.", isPlausible: true },
      { letter: "E", analysis: "A intervenção em municípios permanece plenamente em vigor no texto constitucional.", isPlausible: false },
    ],
  },
];

/**
 * Conduz a sessão interativa de simulado no terminal
 */
export async function runInteractiveQuiz(
  disciplineFilter?: string,
  mode: QuizMode = "study"
): Promise<void> {
  const rl = readline.createInterface({ input, output });
  const { sessionRepo } = getRepositories();

  let questions = CANONICAL_DEMO_QUESTIONS;
  if (disciplineFilter) {
    const filtered = questions.filter(q =>
      q.discipline.toLowerCase().includes(disciplineFilter.toLowerCase())
    );
    if (filtered.length > 0) questions = filtered;
  }

  const startTime = Date.now();
  let correctCount = 0;
  const answerRecords = [];

  console.log(`\n${c.brand("=======================================================================")}`);
  console.log(`  🎯 ${c.gold(`INICIANDO SIMULADO JURÍDICO [MODO ${mode.toUpperCase()}]`)}`);
  console.log(`  ${c.dim(`Total de Questões: ${questions.length} · Formato FGV (3:1:1)`)}`);
  console.log(`${c.brand("=======================================================================")}\n`);

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    const qStart = Date.now();

    // Gera token criptografado para o motor de correção determinística
    const gradingToken = createGradingToken({
      questionId: q.id,
      correctAnswer: q.correctAnswer,
      legalReasoning: q.legalReasoning,
      legalBasis: q.legalBasis,
      distractorAnalyses: q.distractorAnalyses,
      diagnosis: `O candidato errou a questão ${q.id}.`,
      createdAt: Date.now(),
    });

    const diffBadge = q.difficulty === "hard" ? c.error("[DIFÍCIL]") :
                      q.difficulty === "medium" ? c.warning("[MÉDIA]") : c.success("[FÁCIL]");

    console.log(`\n${renderProgressBar(idx + 1, questions.length)} ${c.dim(`· ${q.discipline}`)} ${diffBadge}`);
    console.log(c.dim("─".repeat(70)));
    console.log(`${c.title(`Questão ${idx + 1}:`)} ${q.stem}\n`);

    for (const alt of q.alternatives) {
      console.log(`  ${c.bold(c.brand(`[${alt.label}]`))} ${alt.text}`);
    }

    let selectedLetter: AnswerLabel | null = null;
    while (!selectedLetter) {
      const answerInput = await rl.question(`\n👉 ${c.gold("Sua resposta (A, B, C, D, E")} ou ${c.dim("Q para sair")}): `);
      const cleaned = answerInput.trim().toUpperCase();

      if (cleaned === "Q") {
        console.log(`\n${c.warning("Simulado interrompido pelo usuário.")}`);
        rl.close();
        return;
      }

      if (["A", "B", "C", "D", "E"].includes(cleaned)) {
        selectedLetter = cleaned as AnswerLabel;
      } else {
        console.log(c.error("Opção inválida. Digite uma das letras: A, B, C, D ou E."));
      }
    }

    const elapsedMs = Date.now() - qStart;

    // Correção determinística via serviço do core
    const correction = gradeAnswer({
      opaqueGradingToken: gradingToken,
      selectedAnswer: selectedLetter,
      elapsedTimeMs: elapsedMs,
    });

    const isCorrect = correction.isCorrect;
    if (isCorrect) {
      correctCount++;
      console.log(`\n${c.success("✅ RESPOSTA CORRETA!")}`);
    } else {
      console.log(`\n${c.error(`❌ RESPOSTA INCORRETA — Gabarito oficial: Alternativa ${correction.correctAnswer}`)}`);
    }

    // Modo Estudo: exibe a fundamentação jurídica e a análise de distratores imediatamente
    if (mode === "study") {
      let feedbackContent = `${c.bold("Fundamentação:")}\n${correction.legalReasoning}\n\n`;
      feedbackContent += `${c.bold("Base Legal:")} ${correction.legalBasis}\n\n`;
      feedbackContent += `${c.bold("Análise dos Distratores:")}\n`;

      for (const [letter, analysis] of Object.entries(correction.distractorAnalysis)) {
        const icon = letter === correction.correctAnswer ? c.success("✓") : c.error("✗");
        feedbackContent += `  ${icon} ${c.bold(`Alt ${letter}:`)} ${analysis}\n`;
      }

      console.log(renderBox(`Diagnóstico Pedagógico — Questão ${idx + 1}`, feedbackContent, isCorrect ? c.success : c.error));
    }

    answerRecords.push({
      questionId: q.id,
      sequence: idx + 1,
      format: q.format,
      difficulty: q.difficulty,
      focus: q.focus,
      selectedAnswer: selectedLetter,
      correctAnswer: correction.correctAnswer,
      isCorrect,
      elapsedTimeMs: elapsedMs,
    });

    if (idx < questions.length - 1) {
      await rl.question(`\n${c.dim("Pressione [ENTER] para a próxima questão...")}`);
    }
  }

  const totalTimeMs = Date.now() - startTime;
  const accuracyPercentage = Math.round((correctCount / questions.length) * 100);

  // Gravação da sessão no SQLite local
  const sessionData: CompletedSessionData = {
    sessionId: `cli-session-${Date.now()}`,
    discipline: disciplineFilter || "Mista / Geral",
    point: "Simulado Terminal",
    mode,
    totalQuestions: questions.length,
    correctCount,
    errorCount: questions.length - correctCount,
    accuracyPercentage,
    totalTimeMs,
    answers: answerRecords,
  };

  try {
    sessionRepo.saveSession(sessionData);
  } catch (err: any) {
    console.debug("Aviso de gravação:", err.message);
  }

  // Tela Final de Desempenho
  const mins = Math.floor(totalTimeMs / 60000);
  const secs = Math.floor((totalTimeMs % 60000) / 1000);

  let resultCard = `${c.title("Resultado:")} ${c.bold(`${correctCount} de ${questions.length} questões corretas`)} (${accuracyPercentage}%)\n`;
  resultCard += `${c.title("Tempo Total:")} ${mins}m ${secs}s\n`;
  resultCard += `${c.title("Status:")} ${accuracyPercentage >= 70 ? c.success("APROVADO NA FAIXA DE CORTE (>=70%)") : c.warning("NECESSITA REFORÇO NO CONTEÚDO")}\n\n`;
  resultCard += c.dim("Sessão salva com sucesso no banco de dados SQLite local.");

  console.log("\n" + renderBox("📊 Relatório Final de Desempenho", resultCard, c.gold));
  rl.close();
}
