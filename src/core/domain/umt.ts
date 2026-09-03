import { z } from "zod";

/**
 * Categoria material da Unidade Mínima Testável (UMT)
 */
export const UMTCategorySchema = z.enum([
  "rule",              // Regra geral
  "exception",         // Exceção ou ressalva legal/jurisprudencial
  "precedent",         // Precedente qualificado (STF/STJ)
  "statutory_rule",    // Dispositivo legal específico com prazo/requisito
  "doctrinal_concept", // Conceito ou classificação doutrinária
]);
export type UMTCategory = z.infer<typeof UMTCategorySchema>;

/**
 * Peso substantivo da UMT para planejamento pedagógico
 */
export const SubstantiveWeightSchema = z.enum(["high", "medium", "low"]);
export type SubstantiveWeight = z.infer<typeof SubstantiveWeightSchema>;

/**
 * Referência de origem no material didático
 */
export const InternalSourceRefSchema = z.object({
  sectionId: z.string().min(1),
  headingPath: z.string().optional(),
  lineRange: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
});
export type InternalSourceRef = z.infer<typeof InternalSourceRefSchema>;

/**
 * Schema canônico da Unidade Mínima Testável (UMT)
 */
export const UMTDefinitionSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(3),
  description: z.string().min(10),
  category: UMTCategorySchema,
  substantiveWeight: SubstantiveWeightSchema,
  sourceRefs: z.array(InternalSourceRefSchema).default([]),
});
export type UMTDefinition = z.infer<typeof UMTDefinitionSchema>;
