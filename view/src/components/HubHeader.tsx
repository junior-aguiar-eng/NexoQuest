import React from "react";

export type ActiveTab = "simulados" | "biblioteca" | "metricas";

interface HubHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeQuizTitle?: string;
  onExitQuiz?: () => void;
}

export const HubHeader: React.FC<HubHeaderProps> = ({
  activeTab,
  onTabChange,
  activeQuizTitle,
  onExitQuiz,
}) => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-foreground">NexoQuiz</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Engine Jurídica de Questões & Avaliação Digital
              </p>
            </div>
          </div>

          {activeQuizTitle && onExitQuiz && (
            <button
              onClick={onExitQuiz}
              className="sm:hidden text-xs font-medium px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
            >
              ✕ Voltar ao Hub
            </button>
          )}
        </div>

        {/* Navigation Tabs or Active Quiz Banner */}
        {activeQuizTitle ? (
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 truncate max-w-[280px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block flex-shrink-0" />
              Simulado em andamento: <strong className="text-foreground">{activeQuizTitle}</strong>
            </span>
            {onExitQuiz && (
              <button
                onClick={onExitQuiz}
                className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors"
              >
                ← Voltar ao Hub
              </button>
            )}
          </div>
        ) : (
          <nav className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border self-start sm:self-auto">
            <button
              onClick={() => onTabChange("simulados")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activeTab === "simulados"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎯 Simulados
            </button>
            <button
              onClick={() => onTabChange("biblioteca")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activeTab === "biblioteca"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📚 Biblioteca & Acervo
            </button>
            <button
              onClick={() => onTabChange("metricas")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                activeTab === "metricas"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📊 Desempenho
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
