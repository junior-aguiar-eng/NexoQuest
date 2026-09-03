import { z } from "zod";

/**
 * Disciplinas canônicas jurídicas (ENAM / Magistratura)
 */
export const DisciplineEnum = z.enum([
  "constitucional",
  "processo-civil",
  "administrativo",
  "civil",
  "penal",
  "processo-penal",
  "empresarial",
  "tributario",
  "ambiental",
  "direitos-humanos",
  "humanistica",
  "eleitoral",
]);

/**
 * Schema obrigatório de Frontmatter para materiais em Markdown da Biblioteca
 */
export const MaterialFrontmatterSchema = z.object({
  id: z.string().min(3, "ID do material é obrigatório e deve ter no mínimo 3 caracteres"),
  title: z.string().min(3, "Título do ponto é obrigatório"),
  discipline: z.string().min(2, "Disciplina é obrigatória"),
  point: z.string().min(2, "Identificador do ponto é obrigatório"),
  point_order: z.number().int().positive("Ordem do ponto (point_order) deve ser um inteiro positivo"),
  source: z.string().min(2, "Fonte do material é obrigatória (ex: MEGE, Dizer o Direito, etc.)"),
  source_type: z.enum(["course_material", "statute_commented", "jurisprudence_digest", "doctrine"]),
  year: z.union([z.number().int(), z.string()]).optional(),
  version: z.string().optional().default("1.0"),
  tags: z.array(z.string()).optional().default([]),
  updated_at: z.string().optional(),
  jurisdiction: z.string().optional(),
  notes: z.string().optional(),
});

export type MaterialFrontmatter = z.infer<typeof MaterialFrontmatterSchema>;
