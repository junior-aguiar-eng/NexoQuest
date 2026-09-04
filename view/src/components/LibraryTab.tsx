import React, { useState, useMemo } from "react";
import type { LibraryMaterialCard } from "../fixtures/libraryCatalog";
import { CANONICAL_LIBRARY_CATALOG } from "../fixtures/libraryCatalog";

export const LibraryTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [readingMaterial, setReadingMaterial] = useState<LibraryMaterialCard | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const filteredMaterials = useMemo(() => {
    return CANONICAL_LIBRARY_CATALOG.filter((mat) => {
      const matchDiscipline = selectedDiscipline === "all" || mat.discipline === selectedDiscipline;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchDiscipline;

      const matchText =
        mat.title.toLowerCase().includes(q) ||
        mat.description.toLowerCase().includes(q) ||
        mat.tags.some((t) => t.toLowerCase().includes(q)) ||
        mat.outline.some((o) => o.title.toLowerCase().includes(q) || o.fullContent.toLowerCase().includes(q));

      return matchDiscipline && matchText;
    });
  }, [searchQuery, selectedDiscipline]);

  // Se estiver no modo leitura de uma apostila específica
  if (readingMaterial) {
    const activeSection = readingMaterial.outline.find((s) => s.id === activeSectionId) || readingMaterial.outline[0];

    return (
      <div className="space-y-4">
        {/* Top bar de navegação da leitura */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setReadingMaterial(null);
                setActiveSectionId(null);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border flex items-center gap-1.5 transition-colors"
            >
              ← Voltar ao Catálogo
            </button>
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                {readingMaterial.disciplineName} · {readingMaterial.point}
              </span>
              <h2 className="text-base font-bold text-foreground truncate max-w-lg">
                {readingMaterial.title}
              </h2>
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {readingMaterial.sectionsCount} tópicos indexados
          </span>
        </div>

        {/* Layout Leitor: Sumário à esquerda + Conteúdo à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sumário / Índice */}
          <div className="lg:col-span-1 p-4 rounded-xl border border-border bg-card space-y-3 self-start sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Índice da Apostila
            </h3>
            <div className="space-y-1">
              {readingMaterial.outline.map((sec) => {
                const isActive = (activeSectionId || readingMaterial.outline[0]?.id) === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left text-xs p-2 rounded-md transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {sec.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo da Seção Ativa */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-xl border border-border bg-card space-y-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h1 className="text-xl font-bold text-foreground">
                {activeSection?.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {readingMaterial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <article className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-foreground/90 space-y-4 whitespace-pre-line">
              {activeSection?.fullContent}
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Biblioteca de Apostilas & Doutrina
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acervo canônico em Markdown indexado via SQLite FTS5. Pesquise teses, enunciados, artigos de lei e jurisprudência dos pontos do edital.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por termo, artigo, súmula ou tese (ex: art. 190, insignificância, proporcionalidade)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Discipline Filter */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px]"
          >
            <option value="all">Todas as Disciplinas</option>
            <option value="constitucional">Direito Constitucional</option>
            <option value="penal">Direito Penal</option>
            <option value="processo-civil">Direito Processual Civil</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Exibindo <strong>{filteredMaterials.length}</strong> apostila(s) disponível(is)
        </span>
        <span className="text-[11px]">
          📦 Compatível com importador NexoJuris (`npm run library:import`)
        </span>
      </div>

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/50 space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="font-semibold text-foreground">Nenhuma apostila encontrada</p>
          <p className="text-xs text-muted-foreground">
            Tente buscar por termos mais genéricos ou limpe o filtro de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => {
            const badgeColors = {
              "processo-civil": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
              "constitucional": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              "penal": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }[mat.discipline];

            return (
              <div
                key={mat.id}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badgeColors}`}>
                      {mat.disciplineName}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {mat.sectionsCount} tópicos
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {mat.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {mat.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => {
                      setReadingMaterial(mat);
                      setActiveSectionId(mat.outline[0]?.id || null);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📖 Abrir Leitor da Apostila</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
