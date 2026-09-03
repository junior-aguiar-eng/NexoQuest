import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MaterialIndexer, MaterialRepository } from "../../src/core/library";
import { registerLibraryTools } from "../../src/adapters/mcp/register-library-tools";

describe("Integração MCP - Ferramentas de Biblioteca (Fase 8)", () => {
  let indexer: MaterialIndexer;
  let repo: MaterialRepository;
  let server: McpServer;

  beforeEach(() => {
    indexer = new MaterialIndexer(":memory:");
    repo = new MaterialRepository(indexer.getDatabase());
    server = new McpServer({ name: "NexoQuiz-Test", version: "1.0.0" });
    registerLibraryTools(server, repo);

    // Indexa as fixtures
    const fixturesDir = path.join(process.cwd(), "library", "_fixtures");
    indexer.indexDirectory(fixturesDir);
  });

  it("deve executar library_list_materials e retornar catálogo estruturado", async () => {
    const listTool = (server as any)._registeredTools?.["library_list_materials"];
    assert.ok(listTool, "Tool library_list_materials deve estar registrada");

    const res = await listTool.handler({});
    assert.equal(res.isError, undefined);
    assert.ok(res.structuredContent.materials.length >= 3);
    assert.match(res.content[0].text, /Catálogo de Materiais Jurídicos/);

    // Filtro por disciplina
    const resFiltered = await listTool.handler({ discipline: "processo-civil" });
    assert.equal(resFiltered.structuredContent.materials.length, 1);
    assert.equal(resFiltered.structuredContent.materials[0].id, "proc-civ-negocios-processuais-2026");
  });

  it("deve executar library_get_outline e retornar a árvore de seções", async () => {
    const outlineTool = (server as any)._registeredTools?.["library_get_outline"];
    assert.ok(outlineTool, "Tool library_get_outline deve estar registrada");

    const res = await outlineTool.handler({ materialId: "proc-civ-negocios-processuais-2026" });
    assert.equal(res.isError, undefined);
    assert.ok(res.structuredContent.outline.length >= 1);
    assert.match(res.content[0].text, /Árvore de Seções/);

    // Tentativa com ID inexistente deve retornar erro controlado
    const resNotFound = await outlineTool.handler({ materialId: "id-inexistente" });
    assert.equal(resNotFound.isError, true);
    assert.match(resNotFound.content[0].text, /não foi encontrado/);
  });

  it("deve executar library_search via FTS5 e retornar correspondências ranqueadas", async () => {
    const searchTool = (server as any)._registeredTools?.["library_search"];
    assert.ok(searchTool, "Tool library_search deve estar registrada");

    const res = await searchTool.handler({ query: "autocomposição", limit: 5 });
    assert.equal(res.isError, undefined);
    assert.ok(res.structuredContent.results.length >= 1);
    assert.match(res.structuredContent.results[0].content, /autocomposição/i);
  });

  it("deve executar library_read_sections e retornar apenas o texto das seções solicitadas", async () => {
    const readTool = (server as any)._registeredTools?.["library_read_sections"];
    assert.ok(readTool, "Tool library_read_sections deve estar registrada");

    const res = await readTool.handler({
      materialId: "proc-civ-negocios-processuais-2026",
      sectionIds: ["proc-civ-negocios-processuais-2026-sec-2"],
    });

    assert.equal(res.isError, undefined);
    assert.equal(res.structuredContent.sections.length, 1);
    assert.match(res.content[0].text, /SEÇÃO: proc-civ-negocios-processuais-2026-sec-2/);

    // Seção inexistente
    const resEmpty = await readTool.handler({
      materialId: "proc-civ-negocios-processuais-2026",
      sectionIds: ["secao-inexistente"],
    });
    assert.equal(resEmpty.isError, true);
  });

});
