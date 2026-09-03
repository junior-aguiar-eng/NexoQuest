import React, { useState } from "react";
import type { AnswerLabel } from "../../../src/core/domain/primitives";

interface DistractorAccordionProps {
  distractorAnalysis: Record<AnswerLabel, string>;
  correctAnswer: AnswerLabel;
  selectedAnswer?: AnswerLabel;
  alternativesText?: Record<AnswerLabel, string>;
}

export const DistractorAccordion: React.FC<DistractorAccordionProps> = ({
  distractorAnalysis,
  correctAnswer,
  selectedAnswer,
  alternativesText,
}) => {
  const allLabels: AnswerLabel[] = ["A", "B", "C", "D", "E"];
  const distractorLabels = allLabels.filter((label) => label !== correctAnswer);

  // Inicialmente todos os accordions ficam fechados
  const [openMap, setOpenMap] = useState<Record<AnswerLabel, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
  });

  const toggleAccordion = (label: AnswerLabel) => {
    setOpenMap((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const areAllOpen = distractorLabels.every((l) => openMap[l]);

  const toggleAll = () => {
    const nextState = !areAllOpen;
    const nextMap: Record<AnswerLabel, boolean> = {
      A: nextState,
      B: nextState,
      C: nextState,
      D: nextState,
      E: nextState,
    };
    setOpenMap(nextMap);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          Análise dos Distratores ({distractorLabels.length})
        </h3>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors cursor-pointer"
        >
          {areAllOpen ? "Recolher Todos" : "Expandir Todos"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {distractorLabels.map((label) => {
          const isOpen = Boolean(openMap[label]);
          const analysisText = distractorAnalysis[label] || "Sem análise específica informada.";
          const altSnippet = alternativesText ? alternativesText[label] : null;
          const wasSelected = selectedAnswer === label;

          return (
            <div
              key={label}
              className={`rounded-lg border transition-all duration-150 overflow-hidden ${
                wasSelected
                  ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20"
                  : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(label)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-3 text-left gap-3 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded text-[11px] font-bold shrink-0 ${
                      wasSelected
                        ? "bg-rose-600 text-white"
                        : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {label}
                  </span>
                  <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {wasSelected ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold mr-1">
                        (Sua escolha)
                      </span>
                    ) : null}
                    {altSnippet ? (
                      <span className="opacity-90">{altSnippet}</span>
                    ) : (
                      <span>Distrator {label}</span>
                    )}
                  </div>
                </div>

                <div className="text-neutral-400 dark:text-neutral-500 text-xs shrink-0 font-mono">
                  {isOpen ? "▲" : "▼"}
                </div>
              </button>

              {isOpen && (
                <div className="p-3.5 pt-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 border-t border-neutral-200/60 dark:border-neutral-700/60 bg-white/70 dark:bg-neutral-900/70">
                  <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
                    Por que está incorreta:{" "}
                  </strong>
                  {analysisText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
