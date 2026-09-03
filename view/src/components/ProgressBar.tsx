import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  blockNumber: number;
  slotInBlock: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  blockNumber,
  slotInBlock,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
        <span className="font-mono">
          Questão {current.toString().padStart(2, "0")} de {total.toString().padStart(2, "0")}
        </span>
        <span className="bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded text-[11px] font-mono border border-neutral-200 dark:border-neutral-700/60">
          Bloco {blockNumber} (questão {slotInBlock} de 5)
        </span>
      </div>

      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
