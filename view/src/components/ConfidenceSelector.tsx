import React from "react";
import type { ConfidenceLevel } from "../../../src/core/domain/primitives";

interface ConfidenceSelectorProps {
  selectedConfidence?: ConfidenceLevel;
  onSelectConfidence: (level: ConfidenceLevel) => void;
  disabled?: boolean;
}

export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  selectedConfidence,
  onSelectConfidence,
  disabled = false,
}) => {
  const options: { level: ConfidenceLevel; label: string; icon: string }[] = [
    { level: "high", label: "Certeza", icon: "●" },
    { level: "medium", label: "Dúvida entre 2", icon: "◐" },
    { level: "low", label: "Chute", icon: "○" },
  ];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-neutral-400 dark:text-neutral-500 font-medium">Segurança:</span>
      <div className="inline-flex rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60">
        {options.map(({ level, label, icon }) => {
          const isSelected = selectedConfidence === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelectConfidence(level)}
              disabled={disabled}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                isSelected
                  ? "bg-white dark:bg-neutral-900 text-sky-700 dark:text-sky-400 shadow-xs border border-neutral-200/80 dark:border-neutral-700"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="text-[10px] opacity-70">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
