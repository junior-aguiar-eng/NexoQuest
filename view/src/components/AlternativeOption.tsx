import React from "react";
import type { QuestionAlternativeFixture } from "../fixtures/sampleQuestion";

interface AlternativeOptionProps {
  alternative: QuestionAlternativeFixture;
  isSelected: boolean;
  isConfirmed: boolean;
  isCorrect?: boolean;
  onSelect: (label: "A" | "B" | "C" | "D" | "E") => void;
  disabled?: boolean;
}

export const AlternativeOption: React.FC<AlternativeOptionProps> = ({
  alternative,
  isSelected,
  isConfirmed,
  isCorrect,
  onSelect,
  disabled = false,
}) => {
  const { label, text } = alternative;

  let containerBorder = "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900";
  let badgeClasses = "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700";

  if (isSelected && !isConfirmed) {
    containerBorder = "border-sky-600 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-1 ring-sky-600 dark:ring-sky-500";
    badgeClasses = "bg-sky-600 text-white border-sky-600";
  } else if (isConfirmed) {
    if (isCorrect) {
      containerBorder = "border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-600 dark:ring-emerald-500";
      badgeClasses = "bg-emerald-600 text-white border-emerald-600";
    } else if (isSelected && !isCorrect) {
      containerBorder = "border-rose-600 dark:border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-1 ring-rose-600 dark:ring-rose-500";
      badgeClasses = "bg-rose-600 text-white border-rose-600";
    } else {
      containerBorder = "border-neutral-200 dark:border-neutral-800 opacity-60 bg-white dark:bg-neutral-900";
      badgeClasses = "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700";
    }
  }

  return (
    <label
      onClick={() => {
        if (!disabled && !isConfirmed) {
          onSelect(label);
        }
      }}
      className={`group flex items-start gap-3.5 p-4 rounded-lg border transition-all duration-150 ${containerBorder} ${
        disabled || isConfirmed ? "cursor-default" : "cursor-pointer active:scale-[0.995]"
      }`}
    >
      <div className="pt-0.5 flex items-center gap-2.5 shrink-0">
        <input
          type="radio"
          name="quiz-alternative"
          value={label}
          checked={isSelected}
          onChange={() => {
            if (!disabled && !isConfirmed) {
              onSelect(label);
            }
          }}
          disabled={disabled || isConfirmed}
          className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-neutral-300 dark:border-neutral-700 cursor-pointer disabled:cursor-default"
        />
        <span
          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold border ${badgeClasses}`}
        >
          {label}
        </span>
      </div>

      <div className="flex-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 select-none">
        {text}
      </div>
    </label>
  );
};
