#!/usr/bin/env node
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  handleSearch,
  handleListMaterials,
  handleReadSection,
  handleMetrics,
  runInteractiveQuiz,
} from "./cli-commands.js";
import { renderBanner, c } from "./cli-tui.js";

function renderHelp(): string {
  return `
${c.title("📖 Comandos Disponíveis no Terminal NexoQuiz:")}

  ${c.brand("/busca <termo>")}        Busca instantânea FTS5 em todas as apostilas
  ${c.brand("/materiais")}            Lista o catálogo completo de matérias e pontos
  ${c.brand("/ler <id> [secao]")}     Exibe o texto completo de uma apostila ou tópico
  ${c.brand("/simulado [materia]")}   Inicia um simulado interativo com questões reais
  ${c.brand("/prova [materia]")}      Inicia simulado no modo Prova (sem gabarito imediato)
  ${c.brand("/metricas")}             Exibe seu histórico de acertos e desempenho local
  ${c.brand("/limpar")}               Limpa a tela do terminal
  ${c.brand("/ajuda")}                Exibe esta lista de comandos
  ${c.brand("/sair")}                 Encerra o NexoQuiz CLI

${c.dim("Você também pode digitar o termo de busca diretamente (sem /busca).")}
`;
}

async function startInteractiveCLI() {
  console.clear();
  console.log(renderBanner());
  console.log(renderHelp());

  const rl = readline.createInterface({ input, output });

  while (true) {
    let line: string;
    try {
      line = await rl.question(`\n${c.gold("nexoquiz")} ${c.brand("❯")} `);
    } catch {
      break;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    if (cmd === "/sair" || cmd === "sair" || cmd === "exit" || cmd === "quit" || cmd === "/exit") {
      console.log(`\n${c.gold("⚖️  Bons estudos e até a próxima sessão no NexoQuiz!")}\n`);
      rl.close();
      process.exit(0);
    }

    if (cmd === "/limpar" || cmd === "clear" || cmd === "cls") {
      console.clear();
      console.log(renderBanner());
      continue;
    }

    if (cmd === "/ajuda" || cmd === "/help" || cmd === "help" || cmd === "?") {
      console.log(renderHelp());
      continue;
    }

    if (cmd === "/materiais" || cmd === "/catalogo" || cmd === "/list") {
      console.log(handleListMaterials());
      continue;
    }

    if (cmd === "/metricas" || cmd === "/stats" || cmd === "/historico") {
      console.log(handleMetrics());
      continue;
    }

    if (cmd === "/busca" || cmd === "/search") {
      console.log(handleSearch(args));
      continue;
    }

    if (cmd === "/ler" || cmd === "/read") {
      const subParts = args.split(/\s+/);
      const materialId = subParts[0];
      const sectionId = subParts[1];
      console.log(handleReadSection(materialId, sectionId));
      continue;
    }

    if (cmd === "/simulado" || cmd === "/quiz") {
      rl.pause();
      await runInteractiveQuiz(args || undefined, "study");
      rl.resume();
      continue;
    }

    if (cmd === "/prova" || cmd === "/exam") {
      rl.pause();
      await runInteractiveQuiz(args || undefined, "exam");
      rl.resume();
      continue;
    }

    // Se não começou com '/', trata como busca direta
    if (!trimmed.startsWith("/")) {
      console.log(handleSearch(trimmed));
      continue;
    }

    console.log(c.warning(`Comando desconhecido: "${cmd}". Digite /ajuda para ver as opções.`));
  }
}

// Suporte a argumentos diretos via linha de comando (ex: npx tsx src/cli/index.ts /busca controle)
async function main() {
  const cliArgs = process.argv.slice(2);

  if (cliArgs.length === 0) {
    await startInteractiveCLI();
    return;
  }

  const cmd = cliArgs[0].toLowerCase();
  const rest = cliArgs.slice(1).join(" ");

  if (cmd === "/materiais" || cmd === "materiais" || cmd === "--list") {
    console.log(handleListMaterials());
    process.exit(0);
  }

  if (cmd === "/busca" || cmd === "busca" || cmd === "--search") {
    console.log(handleSearch(rest));
    process.exit(0);
  }

  if (cmd === "/metricas" || cmd === "metricas" || cmd === "--metrics") {
    console.log(handleMetrics());
    process.exit(0);
  }

  if (cmd === "/ler" || cmd === "ler" || cmd === "--read") {
    const sub = rest.split(/\s+/);
    console.log(handleReadSection(sub[0], sub[1]));
    process.exit(0);
  }

  if (cmd === "/simulado" || cmd === "simulado" || cmd === "--quiz") {
    await runInteractiveQuiz(rest || undefined, "study");
    process.exit(0);
  }

  if (cmd === "/prova" || cmd === "prova" || cmd === "--exam") {
    await runInteractiveQuiz(rest || undefined, "exam");
    process.exit(0);
  }

  // Fallback: inicia interativo
  await startInteractiveCLI();
}

main().catch(err => {
  console.error("Erro no CLI:", err);
  process.exit(1);
});
