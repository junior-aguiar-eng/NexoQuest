import React from "react";

interface ConfirmAnswerButtonProps {
  onConfirm: () => void;
  disabled: boolean;
  isConfirmed: boolean;
}

export const ConfirmAnswerButton: React.FC<ConfirmAnswerButtonProps> = ({
  onConfirm,
  disabled,
  isConfirmed,
}) => {
  if (isConfirmed) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onConfirm}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 shadow-sm ${
        disabled
          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border border-neutral-200 dark:border-neutral-700"
          : "bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:active:bg-white dark:text-neutral-900 cursor-pointer"
      }`}
    >
      Confirmar Resposta
    </button>
  );
};
