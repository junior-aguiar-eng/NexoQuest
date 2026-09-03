import { z } from "zod";

/**
 * Schemas para a ferramenta library_list_materials
 */
export const LibraryListMaterialsInputSchema = {
  discipline: z
    .string()
    .optional()
    .describe("Filtro opcional por disciplina (ex: 'processo-civil', 'constitucional', 'penal')"),
  source: z
    .string()
    .optional()
    .describe("Filtro opcional por fonte do material didático (ex: 'MEGE')"),
};

/**
 * Schemas para a ferramenta library_get_outline
 */
export const LibraryGetOutlineInputSchema = {
  materialId: z
    .string()
    .min(1)
    .describe("ID único do material catalogado para obter a árvore de seções/outline"),
};

/**
 * Schemas para a ferramenta library_search
 */
export const LibrarySearchInputSchema = {
  query: z
    .string()
    .min(2)
    .describe("Termos ou palavras-chave jurídicas para busca lexical via FTS5 no acervo"),
  discipline: z
    .string()
    .optional()
    .describe("Filtro opcional para restringir a busca a uma disciplina específica"),
  materialId: z
    .string()
    .optional()
    .describe("Filtro opcional para restringir a busca a um único material"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(8)
    .describe("Quantidade máxima de seções retornadas (padrão 8, máximo 20)"),
};

/**
 * Schemas para a ferramenta library_read_sections
 */
export const LibraryReadSectionsInputSchema = {
  materialId: z
    .string()
    .min(1)
    .describe("ID do material do qual as seções serão lidas"),
  sectionIds: z
    .array(z.string().min(1))
    .min(1)
    .max(10)
    .describe("Lista de IDs de seções a serem lidas integralmente (obtidos via outline ou search)"),
};
