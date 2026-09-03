import { useEffect } from "react";
import type { AnswerLabel } from "../../../src/core/domain/primitives";

interface KeyboardShortcutsProps {
  onSelectAnswer: (label: AnswerLabel) => void;
  onConfirm: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleReview?: () => void;
  canConfirm: boolean;
  canNext: boolean;
  canPrev: boolean;
  isEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onSelectAnswer,
  onConfirm,
  onNext,
  onPrev,
  onToggleReview,
  canConfirm,
  canNext,
  canPrev,
  isEnabled = true,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input ou textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === "A" || key === "B" || key === "C" || key === "D" || key === "E") {
        onSelectAnswer(key as AnswerLabel);
      } else if (e.key === "Enter") {
        if (canConfirm) {
          e.preventDefault();
          onConfirm();
        } else if (canNext && onNext) {
          e.preventDefault();
          onNext();
        }
      } else if (e.key === "ArrowRight") {
        if (canNext && onNext) {
          e.preventDefault();
          onNext();
        }
      } else if (e.key === "ArrowLeft") {
        if (canPrev && onPrev) {
          e.preventDefault();
          onPrev();
        }
      } else if (key === "R") {
        if (onToggleReview) {
          e.preventDefault();
          onToggleReview();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, onSelectAnswer, onConfirm, onNext, onPrev, onToggleReview, canConfirm, canNext, canPrev]);
}
