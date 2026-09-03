import fs from "node:fs";
import path from "node:path";
import { parseMarkdownMaterial } from "../src/core/library/markdown-parser";

const ROOT_DIR = process.cwd();
const LIBRARY_DIR = path.join(ROOT_DIR, "library");

function main() {
  console.log("🔍 Validando acervo Markdown da biblioteca em:", LIBRARY_DIR);

  if (!fs.existsSync(LIBRARY_DIR)) {
    console.error("❌ Diretório da biblioteca não encontrado:", LIBRARY_DIR);
    process.exit(1);
  }

  const mdFiles = scanFiles(LIBRARY_DIR);
  console.log(`📄 Encontrados ${mdFiles.length} arquivos Markdown para validação.`);

  let errorCount = 0;
  const seenIds = new Map<string, string>();

  for (const filePath of mdFiles) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      if (!content.trim()) {
        throw new Error("Arquivo vazio");
      }

      const parsed = parseMarkdownMaterial(content, filePath);
      const id = parsed.frontmatter.id;

      if (seenIds.has(id)) {
        throw new Error(`ID duplicado "${id}" (já utilizado em ${seenIds.get(id)})`);
      }
      seenIds.set(id, path.relative(ROOT_DIR, filePath));

      console.log(`  ✓ [${parsed.frontmatter.discipline}] ${parsed.frontmatter.title} (${parsed.sections.length} seções)`);
    } catch (err: unknown) {
      errorCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ERRO em ${path.relative(ROOT_DIR, filePath)}: ${msg}`);
    }
  }

  if (errorCount > 0) {
    console.error(`\n❌ Validação concluída com ${errorCount} erro(s).`);
    process.exit(1);
  } else {
    console.log(`\n✅ Todos os ${mdFiles.length} arquivos foram validados com sucesso!`);
  }
}

function scanFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

main();
