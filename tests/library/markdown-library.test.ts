import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  parseMarkdownMaterial,
  MaterialIndexer,
  MaterialRepository,
} from "../../src/core/library";

describe("Biblioteca Markdown & Indexador FTS5 (Fase 7)", () => {
  const sampleMarkdown = `---
id: test-proc-civil
title: Negócios Processuais Teste
discipline: processo-civil
point: negocios-processuais
point_order: 1
source: MEGE
source_type: course_material
year: 2026
version: "1.0"
tags:
  - art-190
  - calendario
---

# Negócios Processuais

## 1. Requisitos de Validade

As partes plenamente capazes podem pactuar sobre ônus e faculdades processuais.

### 1.1 Direitos Disponíveis
A autocomposição é pressuposto material essencial.

## 2. Calendário Processual
O juiz e as partes podem convencionar prazos específicos para perícia e julgamento.
`;

  let indexer: MaterialIndexer;
  let repo: MaterialRepository;

  beforeEach(() => {
    indexer = new MaterialIndexer(":memory:");
    repo = new MaterialRepository(indexer.getDatabase());
  });

  it("deve realizar o parsing completo do Markdown com frontmatter e AST hierárquica", () => {
    const parsed = parseMarkdownMaterial(sampleMarkdown);

    assert.equal(parsed.frontmatter.id, "test-proc-civil");
    assert.equal(parsed.frontmatter.discipline, "processo-civil");
    assert.equal(parsed.frontmatter.point_order, 1);
    assert.equal(parsed.sections.length, 4);

    // Verificação de Outline
    assert.equal(parsed.outline.length, 1);
    assert.equal(parsed.outline[0].title, "Negócios Processuais");
    assert.equal(parsed.outline[0].children.length, 2);
    assert.equal(parsed.outline[0].children[0].title, "1. Requisitos de Validade");
    assert.equal(parsed.outline[0].children[0].children[0].title, "1.1 Direitos Disponíveis");
  });

  it("deve rejeitar frontmatter inválido ou com campos obrigatórios ausentes", () => {
    const invalidFrontmatter = `---
title: Faltando disciplina e point_order
source: MEGE
---
# Conteudo
`;
    assert.throws(() => parseMarkdownMaterial(invalidFrontmatter), /Frontmatter inválido/);
  });

  it("deve indexar material no SQLite e recuperar outline e seções", () => {
    const parsed = parseMarkdownMaterial(sampleMarkdown);
    indexer.indexMaterial(parsed, "test-path.md");

    const materials = repo.listMaterials();
    assert.equal(materials.length, 1);
    assert.equal(materials[0].id, "test-proc-civil");
    assert.equal(materials[0].totalSections, 4);

    const outline = repo.getMaterialOutline("test-proc-civil");
    assert.ok(outline);
    assert.equal(outline.length, 1);
    assert.equal(outline[0].title, "Negócios Processuais");
  });

  it("deve realizar busca lexical rápida via FTS5 e retornar seções com ranking", () => {
    const parsed = parseMarkdownMaterial(sampleMarkdown);
    indexer.indexMaterial(parsed, "test-path.md");

    // Busca por termo presente na seção 2
    const results = repo.searchSections("perícia");
    assert.ok(results.length >= 1);
    assert.equal(results[0].materialId, "test-proc-civil");
    assert.match(results[0].title, /Calendário Processual/);

    // Busca com filtro de disciplina
    const resultsProcCiv = repo.searchSections("autocomposição", { discipline: "processo-civil" });
    assert.equal(resultsProcCiv.length, 1);
    assert.match(resultsProcCiv[0].headingPath, /Direitos Disponíveis/);

    // Busca com disciplina não correspondente
    const resultsPenal = repo.searchSections("autocomposição", { discipline: "penal" });
    assert.equal(resultsPenal.length, 0);
  });

  it("deve ler seções específicas de forma seletiva (readSections)", () => {
    const parsed = parseMarkdownMaterial(sampleMarkdown);
    indexer.indexMaterial(parsed);

    const sections = repo.readSections("test-proc-civil", ["test-proc-civil-sec-2", "test-proc-civil-sec-4"]);
    assert.equal(sections.length, 2);
    assert.equal(sections[0].sectionId, "test-proc-civil-sec-2");
    assert.equal(sections[1].sectionId, "test-proc-civil-sec-4");
  });

  it("deve garantir idempotência estrita (reindexar o mesmo arquivo não duplica dados)", () => {
    const parsed = parseMarkdownMaterial(sampleMarkdown);
    indexer.indexMaterial(parsed);
    indexer.indexMaterial(parsed); // Reindexação imediata

    const materials = repo.listMaterials();
    assert.equal(materials.length, 1);
    assert.equal(materials[0].totalSections, 4);

    const ftsResults = repo.searchSections("Calendário");
    assert.equal(ftsResults.length, 1);
  });

  it("deve indexar todo o diretório de fixtures reais sem erros", () => {
    const fixturesDir = path.join(process.cwd(), "library", "_fixtures");
    if (fs.existsSync(fixturesDir)) {
      const res = indexer.indexDirectory(fixturesDir);
      assert.ok(res.totalIndexed >= 3);
      assert.equal(res.errors.length, 0);

      const allMaterials = repo.listMaterials();
      assert.ok(allMaterials.length >= 3);

      const constSearch = repo.searchSections("horizontal");
      assert.ok(constSearch.length >= 1);
      assert.equal(constSearch[0].discipline, "constitucional");
    }
  });

});
