import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { parseMarkdownMaterial, ParsedMaterial } from "./markdown-parser.js";

export class MaterialIndexer {
  private db: DatabaseSync;

  constructor(dbOrPath: DatabaseSync | string = ":memory:") {
    if (typeof dbOrPath === "string") {
      if (dbOrPath !== ":memory:") {
        const dir = path.dirname(dbOrPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
      this.db = new DatabaseSync(dbOrPath);
    } else {
      this.db = dbOrPath;
    }
    this.initSchema();
  }

  public getDatabase(): DatabaseSync {
    return this.db;
  }

  /**
   * Cria tabelas relacionais e a tabela virtual FTS5 para busca textual rápida
   */
  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        discipline TEXT NOT NULL,
        point TEXT NOT NULL,
        point_order INTEGER NOT NULL,
        source TEXT NOT NULL,
        source_type TEXT NOT NULL,
        file_path TEXT,
        raw_frontmatter TEXT,
        raw_outline TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        material_id TEXT NOT NULL,
        section_id TEXT NOT NULL,
        heading_path TEXT NOT NULL,
        heading_level INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        line_start INTEGER NOT NULL,
        line_end INTEGER NOT NULL,
        section_order INTEGER NOT NULL,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_materials_discipline ON materials(discipline);
      CREATE INDEX IF NOT EXISTS idx_materials_point ON materials(point);
      CREATE INDEX IF NOT EXISTS idx_sections_material ON sections(material_id);
      CREATE INDEX IF NOT EXISTS idx_sections_section_id ON sections(section_id);

      CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
        heading_path,
        title,
        content,
        material_id UNINDEXED,
        section_id UNINDEXED,
        tokenize = 'unicode61'
      );
    `);
  }

  /**
   * Indexa um material de forma idempotente (remove versão prévia se existir)
   */
  public indexMaterial(parsed: ParsedMaterial, filePath?: string): void {
    const { frontmatter, sections, outline } = parsed;

    // Remove registros antigos do material para garantir idempotência estrita
    this.deleteMaterial(frontmatter.id);

    // 1. Inserção na tabela de materiais
    const insertMaterialStmt = this.db.prepare(`
      INSERT INTO materials (
        id, title, discipline, point, point_order, source, source_type, file_path, raw_frontmatter, raw_outline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMaterialStmt.run(
      frontmatter.id,
      frontmatter.title,
      frontmatter.discipline,
      frontmatter.point,
      frontmatter.point_order,
      frontmatter.source,
      frontmatter.source_type,
      filePath || null,
      JSON.stringify(frontmatter),
      JSON.stringify(outline)
    );

    // 2. Inserção nas seções e no índice FTS5
    const insertSectionStmt = this.db.prepare(`
      INSERT INTO sections (
        id, material_id, section_id, heading_path, heading_level, title, content, line_start, line_end, section_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertFtsStmt = this.db.prepare(`
      INSERT INTO sections_fts (
        heading_path, title, content, material_id, section_id
      ) VALUES (?, ?, ?, ?, ?)
    `);

    for (const sec of sections) {
      const primaryKey = `${frontmatter.id}:${sec.sectionId}`;

      insertSectionStmt.run(
        primaryKey,
        frontmatter.id,
        sec.sectionId,
        sec.headingPath,
        sec.headingLevel,
        sec.title,
        sec.content,
        sec.lineStart,
        sec.lineEnd,
        sec.order
      );

      insertFtsStmt.run(
        sec.headingPath,
        sec.title,
        sec.content,
        frontmatter.id,
        sec.sectionId
      );
    }
  }

  /**
   * Remove um material e suas seções indexadas
   */
  public deleteMaterial(materialId: string): void {
    this.db.prepare("DELETE FROM materials WHERE id = ?").run(materialId);
    this.db.prepare("DELETE FROM sections WHERE material_id = ?").run(materialId);
    this.db.prepare("DELETE FROM sections_fts WHERE material_id = ?").run(materialId);
  }

  /**
   * Indexa todos os arquivos .md em um diretório (recursivamente)
   */
  public indexDirectory(dirPath: string): { totalIndexed: number; errors: { file: string; error: string }[] } {
    const results = { totalIndexed: 0, errors: [] as { file: string; error: string }[] };

    if (!fs.existsSync(dirPath)) {
      return results;
    }

    const files = this.scanMarkdownFiles(dirPath);

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = parseMarkdownMaterial(content, filePath);
        this.indexMaterial(parsed, filePath);
        results.totalIndexed++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push({ file: filePath, error: msg });
      }
    }

    return results;
  }

  private scanMarkdownFiles(dir: string): string[] {
    const mdFiles: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        mdFiles.push(...this.scanMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        mdFiles.push(fullPath);
      }
    }

    return mdFiles;
  }
}
