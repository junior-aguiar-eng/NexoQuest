import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { MaterialIndexer } from "../src/core/library/material-indexer.js";
import { MaterialFrontmatterSchema } from "../src/core/library/frontmatter-schema.js";

const ROOT_DIR = process.cwd();
const LIBRARY_DIR = path.join(ROOT_DIR, "library");
const DB_PATH = path.join(ROOT_DIR, "data", "nexoquiz.sqlite");

export interface ImportOptions {
  filePath: string;
  discipline?: string;
  title?: string;
  point?: string;
  pointOrder?: number;
  source?: string;
  sourceType?: "course_material" | "statute_commented" | "jurisprudence_digest" | "doctrine";
  tags?: string[];
  year?: number;
  targetFileName?: string;
  dryRun?: boolean;
}

/**
 * Normaliza nomes de disciplinas para slugs canônicos de diretório
 */
export function normalizeDisciplineSlug(discipline: string): string {
  const clean = discipline
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/direito\s+/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const map: Record<string, string> = {
    "const": "constitucional",
    "constitucional": "constitucional",
    "proc-civil": "processo-civil",
    "processual-civil": "processo-civil",
    "processo-civil": "processo-civil",
    "admin": "administrativo",
    "administrativo": "administrativo",
    "civ": "civil",
    "civil": "civil",
    "pen": "penal",
    "penal": "penal",
    "proc-penal": "processo-penal",
    "processual-penal": "processo-penal",
    "processo-penal": "processo-penal",
    "emp": "empresarial",
    "empresarial": "empresarial",
    "trib": "tributario",
    "tributario": "tributario",
    "amb": "ambiental",
    "ambiental": "ambiental",
    "humanos": "direitos-humanos",
    "direitos-humanos": "direitos-humanos",
    "humanistica": "humanistica",
    "eleitoral": "eleitoral",
  };

  return map[clean] || clean || "geral";
}

/**
 * Tenta inferir metadados do cabeçalho ou título do Markdown
 */
function inferMetadata(rawContent: string, fileName: string) {
  let inferredDiscipline = "constitucional";
  let inferredTitle = path.basename(fileName, path.extname(fileName)).replace(/[-_]+/g, " ");
  let inferredPoint = "Ponto 1";
  let inferredPointOrder = 1;

  // Busca padrões como "Ponto 1: ...", "PONTO 02 - ..."
  const pointMatch = rawContent.match(/Ponto\s*(\d+)[:\s\-–]+([^\n\r#]+)/i);
  if (pointMatch) {
    inferredPointOrder = parseInt(pointMatch[1], 10) || 1;
    inferredPoint = `ponto-${String(inferredPointOrder).padStart(2, "0")}`;
    inferredTitle = pointMatch[2].trim();
  } else {
    // Busca primeiro título H1 (# Titulo)
    const h1Match = rawContent.match(/^#\s+(.+)$/m);
    if (h1Match) {
      inferredTitle = h1Match[1].trim();
    }
  }

  // Busca menção a disciplinas comuns no texto
  const lower = (rawContent.slice(0, 1500) + " " + fileName).toLowerCase();
  if (lower.includes("constitucional")) inferredDiscipline = "constitucional";
  else if (lower.includes("processo civil") || lower.includes("processual civil") || lower.includes("cpc")) inferredDiscipline = "processo-civil";
  else if (lower.includes("administrativo")) inferredDiscipline = "administrativo";
  else if (lower.includes("processo penal") || lower.includes("processual penal") || lower.includes("cpp")) inferredDiscipline = "processo-penal";
  else if (lower.includes("penal") || lower.includes("código penal")) inferredDiscipline = "penal";
  else if (lower.includes("civil") || lower.includes("código civil")) inferredDiscipline = "civil";
  else if (lower.includes("empresarial") || lower.includes("falência")) inferredDiscipline = "empresarial";
  else if (lower.includes("tributário") || lower.includes("tributario")) inferredDiscipline = "tributario";
  else if (lower.includes("ambiental")) inferredDiscipline = "ambiental";
  else if (lower.includes("humanos")) inferredDiscipline = "direitos-humanos";

  return {
    discipline: inferredDiscipline,
    title: inferredTitle,
    point: inferredPoint,
    pointOrder: inferredPointOrder,
  };
}

/**
 * Função principal de importação
 */
export function importNexoJurisMarkdown(options: ImportOptions) {
  const resolvedPath = path.resolve(options.filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Arquivo não encontrado: ${resolvedPath}`);
  }

  const rawFile = fs.readFileSync(resolvedPath, "utf-8");
  const parsed = matter(rawFile);
  const existingFrontmatter = parsed.data || {};
  const contentBody = parsed.content.trim();

  const inferred = inferMetadata(contentBody || rawFile, path.basename(resolvedPath));

  const discipline = normalizeDisciplineSlug(
    options.discipline || existingFrontmatter.discipline || inferred.discipline
  );
  const pointOrder = options.pointOrder || existingFrontmatter.point_order || inferred.pointOrder;
  const point = options.point || existingFrontmatter.point || `ponto-${String(pointOrder).padStart(2, "0")}`;
  const title = options.title || existingFrontmatter.title || inferred.title;
  const source = options.source || existingFrontmatter.source || "NexoJuris Conversor";
  const sourceType = options.sourceType || existingFrontmatter.source_type || "course_material";
  const year = options.year || existingFrontmatter.year || new Date().getFullYear();
  const tags = options.tags || existingFrontmatter.tags || [];

  const materialId = `${discipline}-${point}-${year}`.toLowerCase().replace(/[^a-z0-9\-]/g, "-");

  const frontmatterData = {
    id: materialId,
    title,
    discipline,
    point,
    point_order: pointOrder,
    source,
    source_type: sourceType,
    year,
    version: "1.0",
    tags,
  };

  // Validação estrita via Zod
  const validation = MaterialFrontmatterSchema.safeParse(frontmatterData);
  if (!validation.success) {
    console.error("❌ Erro de validação no Frontmatter gerado:", validation.error.format());
    throw new Error("Falha na validação do Frontmatter para o NexoQuiz.");
  }

  // Gera o Markdown final estruturado
  const finalMarkdown = matter.stringify(contentBody, frontmatterData);

  // Define diretório de destino em library/<disciplina>/
  const targetDir = path.join(LIBRARY_DIR, discipline);
  const targetFileName = options.targetFileName || `${point}.md`;
  const targetFilePath = path.join(targetDir, targetFileName);

  if (options.dryRun) {
    console.log("🔍 [DRY-RUN] Simulação de importação:");
    console.log(`  Destino: ${targetFilePath}`);
    console.log("  Metadados gerados:", JSON.stringify(frontmatterData, null, 2));
    return { targetFilePath, frontmatterData, indexed: false };
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFilePath, finalMarkdown, "utf-8");

  console.log(`✅ Material salvo com sucesso em: ${targetFilePath}`);

  // Executa indexação automática no SQLite FTS5
  console.log("⚡ Atualizando índice FTS5 do NexoQuiz...");
  const indexer = new MaterialIndexer(DB_PATH);
  const result = indexer.indexDirectory(LIBRARY_DIR);

  if (result.errors.length > 0) {
    console.warn("⚠️ Avisos durante indexação:", result.errors);
  } else {
    console.log(`🎉 Sucesso! ${result.totalIndexed} materiais indexados e disponíveis no catálogo.`);
  }

  return { targetFilePath, frontmatterData, indexed: true };
}

// CLI Runner
if (process.argv[1] && (process.argv[1].endsWith("import-nexojuris.ts") || process.argv[1].endsWith("import-nexojuris.js"))) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Uso: npx tsx scripts/import-nexojuris.ts <caminho-do-arquivo.md> [opções]

Opções:
  --discipline <nome>     Disciplina (ex: "Direito Constitucional")
  --title <titulo>        Título do Ponto (ex: "Teoria da Constituição")
  --point <ponto>         Identificador do Ponto (ex: "ponto-01")
  --order <numero>        Ordem numérica do ponto no edital (ex: 1)
  --source <nome>         Nome da fonte (padrão: "NexoJuris Conversor")
  --tags <tag1,tag2>      Tags separadas por vírgula
  --dry-run               Apenas simula a importação sem gravar
    `);
    process.exit(0);
  }

  const filePath = args[0];
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  const discipline = getArg("--discipline");
  const title = getArg("--title");
  const point = getArg("--point");
  const orderStr = getArg("--order");
  const source = getArg("--source");
  const tagsStr = getArg("--tags");
  const dryRun = args.includes("--dry-run");

  try {
    importNexoJurisMarkdown({
      filePath,
      discipline,
      title,
      point,
      pointOrder: orderStr ? parseInt(orderStr, 10) : undefined,
      source,
      tags: tagsStr ? tagsStr.split(",").map(t => t.trim()) : undefined,
      dryRun,
    });
  } catch (err: any) {
    console.error("❌ Falha na importação:", err.message);
    process.exit(1);
  }
}
