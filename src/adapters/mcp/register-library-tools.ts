import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MaterialRepository } from "../../core/library/material-search.js";
import {
  LibraryListMaterialsInputSchema,
  LibraryGetOutlineInputSchema,
  LibrarySearchInputSchema,
  LibraryReadSectionsInputSchema,
} from "./schemas.js";

/**
 * Registra as ferramentas MCP de consulta e leitura seletiva da biblioteca no servidor MCP
 */
export function registerLibraryTools(server: McpServer, repo: MaterialRepository): void {

  // ── 1. library_list_materials ──────────────────────────────────────
  server.tool(
    "library_list_materials",
    "Lista todos os materiais jurídicos disponíveis no acervo com metadados estruturados (disciplina, ponto, ordem e quantidade de seções).",
    LibraryListMaterialsInputSchema,
    async (params) => {
      try {
        const materials = repo.listMaterials({
          discipline: params.discipline,
          source: params.source,
        });

        if (materials.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Nenhum material encontrado no acervo com os filtros informados.",
              },
            ],
            structuredContent: { materials: [] },
          };
        }

        const lines = [
          `📚 Catálogo de Materiais Jurídicos (${materials.length} encontrados):`,
          ...materials.map(
            (m) =>
              `• ID: "${m.id}" | [${m.discipline.toUpperCase()}] ${m.title} (Ponto: ${m.point}, Ordem: ${m.pointOrder}, Seções: ${m.totalSections})`
          ),
        ];

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
            },
          ],
          structuredContent: {
            materials,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao listar materiais: ${msg}` }],
        };
      }
    }
  );

  // ── 2. library_get_outline ────────────────────────────────────────
  server.tool(
    "library_get_outline",
    "Obtém o índice/árvore de seções (outline) de um material sem carregar o texto completo, permitindo triagem e mapeamento de UMTs.",
    LibraryGetOutlineInputSchema,
    async (params) => {
      try {
        const { materialId } = params;
        const outline = repo.getMaterialOutline(materialId);

        if (!outline) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Material com ID "${materialId}" não foi encontrado no acervo. Use library_list_materials para consultar IDs válidos.`,
              },
            ],
          };
        }

        const formatTree = (nodes: typeof outline, indent = 0): string[] => {
          const res: string[] = [];
          for (const node of nodes) {
            const prefix = "  ".repeat(indent) + "• ";
            res.push(`${prefix}[ID: ${node.sectionId}] ${node.title} (linhas ${node.lineRange[0]}-${node.lineRange[1]})`);
            if (node.children && node.children.length > 0) {
              res.push(...formatTree(node.children, indent + 1));
            }
          }
          return res;
        };

        const lines = [
          `📑 Outline / Árvore de Seções do Material "${materialId}":`,
          ...formatTree(outline),
        ];

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
            },
          ],
          structuredContent: {
            materialId,
            outline,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao obter outline: ${msg}` }],
        };
      }
    }
  );

  // ── 3. library_search ─────────────────────────────────────────────
  server.tool(
    "library_search",
    "Busca textual lexical de alta precisão via FTS5 no acervo de seções de doutrina, lei comentada e jurisprudência.",
    LibrarySearchInputSchema,
    async (params) => {
      try {
        const results = repo.searchSections(params.query, {
          discipline: params.discipline,
          materialId: params.materialId,
          limit: params.limit,
        });

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Nenhum resultado encontrado para a busca "${params.query}".`,
              },
            ],
            structuredContent: { results: [] },
          };
        }

        const lines = [
          `🔍 Resultados da Busca por "${params.query}" (${results.length} seções encontradas):`,
          ...results.map((r, i) => {
            const snippet = r.content.length > 180 ? r.content.substring(0, 180) + "..." : r.content;
            return `\n[${i + 1}] Seção: "${r.sectionId}" (Material: "${r.materialId}")\n    Caminho: ${r.headingPath}\n    Trecho: ${snippet.replace(/\n+/g, " ")}`;
          }),
        ];

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
            },
          ],
          structuredContent: {
            query: params.query,
            totalResults: results.length,
            results,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro na busca FTS5: ${msg}` }],
        };
      }
    }
  );

  // ── 4. library_read_sections ──────────────────────────────────────
  server.tool(
    "library_read_sections",
    "Lê integralmente o conteúdo de seções específicas a partir de seus IDs, sem carregar o arquivo didático inteiro.",
    LibraryReadSectionsInputSchema,
    async (params) => {
      try {
        const { materialId, sectionIds } = params;
        const sections = repo.readSections(materialId, sectionIds);

        if (sections.length === 0) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Nenhuma das seções solicitadas (${sectionIds.join(", ")}) foi encontrada no material "${materialId}".`,
              },
            ],
          };
        }

        const textBlocks = sections.map(
          (sec) =>
            `════════════════════════════════════════════════════════════════\n` +
            `SEÇÃO: ${sec.sectionId} | HIERARQUIA: ${sec.headingPath}\n` +
            `LINHAS: ${sec.lineStart}-${sec.lineEnd}\n` +
            `────────────────────────────────────────────────────────────────\n` +
            `${sec.content}\n`
        );

        return {
          content: [
            {
              type: "text" as const,
              text: textBlocks.join("\n"),
            },
          ],
          structuredContent: {
            materialId,
            sections,
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Erro ao ler seções: ${msg}` }],
        };
      }
    }
  );
}
