import React from "react";
import type { QuestionAlternativeFixture } from "../fixtures/sampleQuestion";
import { AlternativeOption } from "./AlternativeOption";

interface AlternativeListProps {
  alternatives: QuestionAlternativeFixture[];
  selectedAnswer: ("A" | "B" | "C" | "D" | "E") | null;
  isConfirmed: boolean;
  correctAnswer?: "A" | "B" | "C" | "D" | "E";
  onSelectAnswer: (label: "A" | "B" | "C" | "D" | "E") => void;
  disabled?: boolean;
}

export const AlternativeList: React.FC<AlternativeListProps> = ({
  alternatives,
  selectedAnswer,
  isConfirmed,
  correctAnswer,
  onSelectAnswer,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {alternatives.map((alt) => (
        <AlternativeOption
          key={alt.label}
          alternative={alt}
          isSelected={selectedAnswer === alt.label}
          isConfirmed={isConfirmed}
          isCorrect={isConfirmed ? alt.label === correctAnswer : undefined}
          onSelect={onSelectAnswer}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
