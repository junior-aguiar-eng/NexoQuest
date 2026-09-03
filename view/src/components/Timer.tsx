import React from "react";

interface TimerProps {
  timeFormatted: string;
}

export const Timer: React.FC<TimerProps> = ({ timeFormatted }) => {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-xs font-mono text-neutral-600 dark:text-neutral-400"
      title="Tempo decorrido"
    >
      <svg
        className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path strokeLinecap="round" strokeWidth="2" d="M12 7v5l3 3" />
      </svg>
      <span>{timeFormatted}</span>
    </div>
  );
};
