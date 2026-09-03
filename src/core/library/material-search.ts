import { DatabaseSync } from "node:sqlite";
import { MaterialFrontmatter } from "./frontmatter-schema";
import { OutlineNode, ParsedSection } from "./markdown-parser";

export interface MaterialSummary {
  id: string;
  title: string;
  discipline: string;
  point: string;
  pointOrder: number;
  source: string;
  sourceType: string;
  filePath: string | null;
  frontmatter: MaterialFrontmatter;
  totalSections: number;
}

export interface SectionSearchResult {
  materialId: string;
  sectionId: string;
  materialTitle: string;
  discipline: string;
  point: string;
  headingPath: string;
  title: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  rank?: number;
}

export interface SearchOptions {
  discipline?: string;
  materialId?: string;
  limit?: number;
}

export class MaterialRepository {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  /**
   * Lista materiais catalogados com filtros opcionais
   */
  public listMaterials(filters: { discipline?: string; source?: string } = {}): MaterialSummary[] {
    let sql = `
      SELECT m.*, COUNT(s.id) as total_sections 
      FROM materials m
      LEFT JOIN sections s ON s.material_id = m.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filters.discipline) {
      sql += " AND m.discipline = ?";
      params.push(filters.discipline);
    }
    if (filters.source) {
      sql += " AND m.source = ?";
      params.push(filters.source);
    }

    sql += " GROUP BY m.id ORDER BY m.discipline, m.point_order ASC";

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];

    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      discipline: String(row.discipline),
      point: String(row.point),
      pointOrder: Number(row.point_order),
      source: String(row.source),
      sourceType: String(row.source_type),
      filePath: row.file_path ? String(row.file_path) : null,
      frontmatter: JSON.parse(String(row.raw_frontmatter)),
      totalSections: Number(row.total_sections || 0),
    }));
  }

  /**
   * Obtém a árvore hierárquica (outline) de um material sem carregar seu conteúdo integral
   */
  public getMaterialOutline(materialId: string): OutlineNode[] | null {
    const row = this.db
      .prepare("SELECT raw_outline FROM materials WHERE id = ?")
      .get(materialId) as Record<string, unknown> | undefined;

    if (!row || !row.raw_outline) {
      return null;
    }

    return JSON.parse(String(row.raw_outline)) as OutlineNode[];
  }

  /**
   * Realiza busca textual rápida via FTS5 nas seções
   */
  public searchSections(query: string, options: SearchOptions = {}): SectionSearchResult[] {
    const limit = Math.min(options.limit ?? 10, 50);
    const cleanedQuery = query.trim().replace(/['"]/g, "");

    if (!cleanedQuery) {
      return [];
    }

    let sql = `
      SELECT 
        fts.material_id,
        fts.section_id,
        s.heading_path,
        s.title,
        s.content,
        s.line_start,
        s.line_end,
        m.title as material_title,
        m.discipline,
        m.point
      FROM sections_fts fts
      JOIN sections s ON s.material_id = fts.material_id AND s.section_id = fts.section_id
      JOIN materials m ON m.id = fts.material_id
      WHERE sections_fts MATCH ?
    `;
    const params: (string | number)[] = [cleanedQuery];

    if (options.discipline) {
      sql += " AND m.discipline = ?";
      params.push(options.discipline);
    }

    if (options.materialId) {
      sql += " AND m.id = ?";
      params.push(options.materialId);
    }

    sql += " LIMIT ?";
    params.push(limit);

    try {
      const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];

      return rows.map((r) => ({
        materialId: String(r.material_id),
        sectionId: String(r.section_id),
        materialTitle: String(r.material_title),
        discipline: String(r.discipline),
        point: String(r.point),
        headingPath: String(r.heading_path),
        title: String(r.title),
        content: String(r.content),
        lineStart: Number(r.line_start),
        lineEnd: Number(r.line_end),
      }));
    } catch {
      // Se query FTS5 tiver sintaxe especial, faz fallback com termo entre aspas
      const fallbackParams: (string | number)[] = [`"${cleanedQuery}"`];
      if (options.discipline) fallbackParams.push(options.discipline);
      if (options.materialId) fallbackParams.push(options.materialId);
      fallbackParams.push(limit);

      const rows = this.db.prepare(sql).all(...fallbackParams) as Record<string, unknown>[];

      return rows.map((r) => ({
        materialId: String(r.material_id),
        sectionId: String(r.section_id),
        materialTitle: String(r.material_title),
        discipline: String(r.discipline),
        point: String(r.point),
        headingPath: String(r.heading_path),
        title: String(r.title),
        content: String(r.content),
        lineStart: Number(r.line_start),
        lineEnd: Number(r.line_end),
      }));
    }
  }

  /**
   * Lê o conteúdo integral apenas das seções solicitadas
   */
  public readSections(materialId: string, sectionIds: string[]): ParsedSection[] {
    if (sectionIds.length === 0) {
      return [];
    }

    const placeholders = sectionIds.map(() => "?").join(",");
    const sql = `
      SELECT * FROM sections
      WHERE material_id = ? AND section_id IN (${placeholders})
      ORDER BY section_order ASC
    `;

    const rows = this.db.prepare(sql).all(materialId, ...sectionIds) as Record<string, unknown>[];

    return rows.map((r) => ({
      sectionId: String(r.section_id),
      headingPath: String(r.heading_path),
      headingLevel: Number(r.heading_level),
      title: String(r.title),
      content: String(r.content),
      lineStart: Number(r.line_start),
      lineEnd: Number(r.line_end),
      order: Number(r.section_order),
    }));
  }
}
