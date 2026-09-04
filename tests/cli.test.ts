import test from "node:test";
import assert from "node:assert/strict";
import {
  handleSearch,
  handleListMaterials,
  handleReadSection,
  handleMetrics,
} from "../src/cli/cli-commands.js";
import {
  renderBanner,
  renderBox,
  renderProgressBar,
  renderTable,
  c,
} from "../src/cli/cli-tui.js";

test("NexoQuiz CLI — Utilitários de Formatação Visual (TUI)", () => {
  const banner = renderBanner();
  assert.ok(banner.includes("NEXOQUIZ"), "Banner deve conter o nome do projeto");

  const box = renderBox("Teste", "Conteúdo da caixa");
  assert.ok(box.includes("Teste"), "Caixa deve conter o título");
  assert.ok(box.includes("Conteúdo da caixa"), "Caixa deve conter o corpo");

  const progress = renderProgressBar(3, 5);
  assert.ok(progress.includes("3/5"), "Barra de progresso deve exibir a fração");
  assert.ok(progress.includes("60%"), "Barra de progresso deve exibir o percentual");

  const table = renderTable(["Nome", "Valor"], [["Alpha", "10"], ["Beta", "20"]]);
  assert.ok(table.includes("Alpha"), "Tabela deve conter os dados das linhas");
  assert.ok(table.includes("Nome"), "Tabela deve conter os cabeçalhos");
});

test("NexoQuiz CLI — Comandos de Acervo e Busca", () => {
  // 1. Listagem de materiais
  const materialsOutput = handleListMaterials();
  assert.ok(typeof materialsOutput === "string", "Listagem deve retornar string formatada");
  assert.ok(materialsOutput.length > 0, "Listagem não deve ser vazia");

  // 2. Busca FTS5 com termo existente
  const searchOutput = handleSearch("fundamental");
  assert.ok(typeof searchOutput === "string", "Busca deve retornar string formatada");

  // 3. Busca vazia
  const emptySearch = handleSearch("");
  assert.ok(emptySearch.includes("informe um termo"), "Busca vazia deve orientar o usuário");

  // 4. Leitura de material
  const readOutput = handleReadSection("const-direitos-fundamentais-2026");
  assert.ok(typeof readOutput === "string", "Leitura de outline deve retornar string formatada");

  // 5. Métricas locais
  const metricsOutput = handleMetrics();
  assert.ok(typeof metricsOutput === "string", "Métricas devem retornar string formatada");
});
