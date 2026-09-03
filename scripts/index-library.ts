import path from "node:path";
import { MaterialIndexer } from "../src/core/library/material-indexer";
import { MaterialRepository } from "../src/core/library/material-search";

const ROOT_DIR = process.cwd();
const LIBRARY_DIR = path.join(ROOT_DIR, "library");
const DB_PATH = path.join(ROOT_DIR, "data", "nexoquiz.sqlite");

function main() {
  console.log("🚀 Indexando acervo da biblioteca no SQLite FTS5...");
  console.log("  Fonte Markdown:", LIBRARY_DIR);
  console.log("  Banco SQLite:", DB_PATH);

  const indexer = new MaterialIndexer(DB_PATH);
  const result = indexer.indexDirectory(LIBRARY_DIR);

  console.log(`\n📊 Relatório de Indexação:`);
  console.log(`  ✓ Materiais indexados: ${result.totalIndexed}`);
  if (result.errors.length > 0) {
    console.error(`  ❌ Falhas na indexação (${result.errors.length}):`);
    for (const err of result.errors) {
      console.error(`    - ${err.file}: ${err.error}`);
    }
    process.exit(1);
  }

  // Estatísticas FTS5
  const repo = new MaterialRepository(indexer.getDatabase());
  const materials = repo.listMaterials();

  console.log(`\n📚 Catálogo de Materiais Indexados:`);
  for (const m of materials) {
    console.log(`  • [${m.discipline}] ${m.title} (Ordem: ${m.pointOrder} | Seções: ${m.totalSections} | ID: ${m.id})`);
  }

  console.log("\n✅ Indexação concluída com sucesso e FTS5 pronto para busca!");
}

main();
