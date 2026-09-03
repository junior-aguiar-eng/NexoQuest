import React from "react";

interface ReviewFlagProps {
  isFlagged: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const ReviewFlag: React.FC<ReviewFlagProps> = ({
  isFlagged,
  onToggle,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
        isFlagged
          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60 shadow-xs"
          : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/60 hover:text-neutral-900 dark:hover:text-neutral-200"
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
      title={isFlagged ? "Questão marcada para revisão" : "Marcar questão para revisar depois"}
    >
      <span className={isFlagged ? "text-amber-600 dark:text-amber-400" : "opacity-60"}>⚑</span>
      <span>{isFlagged ? "Marcada para revisão" : "Marcar para revisão"}</span>
    </button>
  );
};
