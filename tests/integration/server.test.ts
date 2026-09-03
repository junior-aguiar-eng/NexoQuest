import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createNexoQuizServer } from "../../src/nexoquiz-server";
import { MaterialIndexer } from "../../src/core/library/material-indexer";
import { MaterialRepository } from "../../src/core/library/material-search";
import { SessionRepository } from "../../src/core/persistence/session-repository";

describe("Servidor Canônico NexoQuiz MCP (Fase 15)", () => {
  const indexer = new MaterialIndexer(":memory:");
  const searchRepo = new MaterialRepository(indexer.getDatabase());
  const sessionRepo = new SessionRepository(indexer.getDatabase());

  it("deve instanciar o servidor MCP com todas as ferramentas de domínio registradas", () => {
    const server = createNexoQuizServer({
      searchRepo,
      sessionRepo,
      getWidgetHtml: async () => "<div>NexoQuiz Widget</div>",
    });

    const registered = (server as any)._registeredTools;
    assert.ok(registered["library_list_materials"], "library_list_materials deve estar registrada");
    assert.ok(registered["library_get_outline"], "library_get_outline deve estar registrada");
    assert.ok(registered["library_search"], "library_search deve estar registrada");
    assert.ok(registered["library_read_sections"], "library_read_sections deve estar registrada");
    assert.ok(registered["quiz_plan_template"], "quiz_plan_template deve estar registrada");
    assert.ok(registered["quiz_plan_validate"], "quiz_plan_validate deve estar registrada");
    assert.ok(registered["quiz_render"], "quiz_render deve estar registrada");
    assert.ok(registered["quiz_grade_answer"], "quiz_grade_answer deve estar registrada");
    assert.ok(registered["quiz_get_history"], "quiz_get_history deve estar registrada");
    assert.ok(registered["quiz_save_session"], "quiz_save_session deve estar registrada");

    // Não deve conter ferramentas legadas de gamificação
    assert.equal(registered["play-quiz"], undefined, "Ferramenta legada play-quiz não deve existir");
  });
});
