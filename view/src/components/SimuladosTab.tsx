import React, { useState } from "react";
import type { QuizMode } from "../../../src/core/domain/primitives";
import type { PresetQuiz } from "../fixtures/allDisciplineQuestions";
import { PRESET_QUIZZES } from "../fixtures/allDisciplineQuestions";

interface SimuladosTabProps {
  onStartQuiz: (quiz: PresetQuiz, mode: QuizMode) => void;
}

export const SimuladosTab: React.FC<SimuladosTabProps> = ({ onStartQuiz }) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode>("study");

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas e Configuração de Modo */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Simulados Jurídicos FGV / ENAM
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Questões no padrão rigoroso da Magistratura e ENAM: casos práticos complexos, 5 alternativas assimétricas com rotação de gabarito e diagnóstico pedagógico minucioso.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col gap-1.5 self-start sm:self-auto min-w-[240px]">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Modo de Resolução
            </label>
            <div className="grid grid-cols-2 p-1 bg-muted rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setSelectedMode("study")}
                className={`text-xs font-semibold py-1.5 px-2 rounded-md transition-all ${
                  selectedMode === "study"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📖 Estudo (Imediato)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("exam")}
                className={`text-xs font-semibold py-1.5 px-2 rounded-md transition-all ${
                  selectedMode === "exam"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ⏱️ Prova Real
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {selectedMode === "study"
                ? "💡 Feedback e diagnóstico detalhado logo após confirmar cada questão."
                : "🔒 Sem gabarito durante a prova. Relatório completo ao concluir."}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Simulados Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_QUIZZES.map((quiz) => {
          const badgeColors = {
            "processo-civil": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            "constitucional": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            "penal": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
            "misto": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
          }[quiz.discipline];

          return (
            <div
              key={quiz.id}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColors}`}>
                    {quiz.disciplineBadge}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {quiz.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    📝 {quiz.questionCount} Questões
                  </span>
                  <span className="flex items-center gap-1">
                    ⏳ ~{quiz.estimatedMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    🎯 Alternativas A–E
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => onStartQuiz(quiz, selectedMode)}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Iniciar Simulado</span>
                  <span className="text-xs opacity-75">({selectedMode === "study" ? "Modo Estudo" : "Modo Prova"})</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dica de Utilização */}
      <div className="p-4 rounded-lg border border-border/60 bg-muted/30 text-xs text-muted-foreground flex items-start gap-3">
        <span className="text-base">💡</span>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Como funciona a correção das questões?</p>
          <p>
            O NexoQuiz utiliza envelopes criptografados AES-256-GCM para proteger o gabarito. No modo estudo, a fundamentação legal (artigos, súmulas e diagnóstico de equívoco) é exibida para cada alternativa com análise dos distratores.
          </p>
        </div>
      </div>
    </div>
  );
};
