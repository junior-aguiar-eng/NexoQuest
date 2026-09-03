import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";
import { MaterialFrontmatter, MaterialFrontmatterSchema } from "./frontmatter-schema";

export interface ParsedSection {
  sectionId: string;
  headingPath: string;
  headingLevel: number;
  title: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  order: number;
}

export interface OutlineNode {
  sectionId: string;
  title: string;
  level: number;
  headingPath: string;
  lineRange: [number, number];
  children: OutlineNode[];
}

export interface ParsedMaterial {
  frontmatter: MaterialFrontmatter;
  rawBody: string;
  sections: ParsedSection[];
  outline: OutlineNode[];
}

/**
 * Realiza o parsing completo de um arquivo Markdown didático:
 * 1. Valida frontmatter com Zod
 * 2. Gera AST de headings com remark
 * 3. Segmenta o conteúdo por seções com ranges de linhas
 * 4. Constrói a árvore de outline hierárquica
 */
export function parseMarkdownMaterial(rawContent: string, filePath?: string): ParsedMaterial {
  // 1. Extração de Frontmatter
  const { data: rawData, content: rawBody } = matter(rawContent);

  const frontmatterResult = MaterialFrontmatterSchema.safeParse(rawData);
  if (!frontmatterResult.success) {
    const issues = frontmatterResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Frontmatter inválido${filePath ? ` em ${filePath}` : ""}: ${issues}`);
  }
  const frontmatter = frontmatterResult.data;

  // 2. Parsing de AST com Remark
  const processor = unified().use(remarkParse);
  const tree = processor.parse(rawBody) as Root;

  const lines = rawBody.split(/\r?\n/);
  const totalLines = lines.length;

  interface HeadingItem {
    title: string;
    level: number;
    lineStart: number;
  }

  const headings: HeadingItem[] = [];

  visit(tree, "heading", (node: Heading) => {
    // Extrai o texto plano do heading
    const headingText = extractTextFromHeading(node);
    const lineStart = node.position?.start?.line ?? 1;
    headings.push({
      title: headingText,
      level: node.depth,
      lineStart,
    });
  });

  const sections: ParsedSection[] = [];
  const outline: OutlineNode[] = [];

  if (headings.length === 0) {
    // Material sem headings (seção única)
    const singleSection: ParsedSection = {
      sectionId: `${frontmatter.id}-sec-1`,
      headingPath: frontmatter.title,
      headingLevel: 1,
      title: frontmatter.title,
      content: rawBody.trim(),
      lineStart: 1,
      lineEnd: totalLines,
      order: 1,
    };
    sections.push(singleSection);
    outline.push({
      sectionId: singleSection.sectionId,
      title: frontmatter.title,
      level: 1,
      headingPath: frontmatter.title,
      lineRange: [1, totalLines],
      children: [],
    });
    return { frontmatter, rawBody, sections, outline };
  }

  // Pilha para construir o caminho hierárquico (Heading Path)
  const pathStack: { level: number; title: string }[] = [];

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const nextH = headings[i + 1];

    const lineStart = h.lineStart;
    const lineEnd = nextH ? nextH.lineStart - 1 : totalLines;

    // Atualiza pilha hierárquica
    while (pathStack.length > 0 && pathStack[pathStack.length - 1].level >= h.level) {
      pathStack.pop();
    }
    pathStack.push({ level: h.level, title: h.title });

    const headingPath = pathStack.map((p) => p.title).join(" > ");
    const sectionContent = lines.slice(lineStart - 1, lineEnd).join("\n").trim();
    const sectionId = `${frontmatter.id}-sec-${i + 1}`;

    sections.push({
      sectionId,
      headingPath,
      headingLevel: h.level,
      title: h.title,
      content: sectionContent,
      lineStart,
      lineEnd,
      order: i + 1,
    });
  }

  // 3. Construção da Árvore de Outline Hierárquico
  const outlineStack: { level: number; node: OutlineNode }[] = [];

  for (const sec of sections) {
    const node: OutlineNode = {
      sectionId: sec.sectionId,
      title: sec.title,
      level: sec.headingLevel,
      headingPath: sec.headingPath,
      lineRange: [sec.lineStart, sec.lineEnd],
      children: [],
    };

    while (outlineStack.length > 0 && outlineStack[outlineStack.length - 1].level >= sec.headingLevel) {
      outlineStack.pop();
    }

    if (outlineStack.length === 0) {
      outline.push(node);
    } else {
      outlineStack[outlineStack.length - 1].node.children.push(node);
    }

    outlineStack.push({ level: sec.headingLevel, node });
  }

  return {
    frontmatter,
    rawBody,
    sections,
    outline,
  };
}

/**
 * Função utilitária para extrair texto concatenado de nós AST de heading
 */
function extractTextFromHeading(heading: Heading): string {
  const parts: string[] = [];
  visit(heading, (child) => {
    if ("value" in child && typeof child.value === "string") {
      parts.push(child.value);
    }
  });
  return parts.join("").trim();
}
