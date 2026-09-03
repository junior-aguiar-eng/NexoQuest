import React, { useState } from "react";
import type { LegalQuestionFixture } from "../fixtures/sampleQuestion";
import { AlternativeList } from "./AlternativeList";
import { ConfirmAnswerButton } from "./ConfirmAnswerButton";

interface QuestionPlayerProps {
  question: LegalQuestionFixture;
  onNext?: () => void;
  hasNext?: boolean;
}

export const QuestionPlayer: React.FC<QuestionPlayerProps> = ({
  question,
  onNext,
  hasNext = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<("A" | "B" | "C" | "D" | "E") | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleSelectAnswer = (label: "A" | "B" | "C" | "D" | "E") => {
    if (!isConfirmed) {
      setSelectedAnswer(label);
    }
  };

  const handleConfirm = () => {
    if (selectedAnswer && !isConfirmed) {
      setIsConfirmed(true);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-6 my-auto">
        {/* Header Sóbrio */}
        <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            <span>{question.discipline}</span>
            <span className="font-mono">{question.sequence.toString().padStart(2, "0")} / {question.totalQuestions.toString().padStart(2, "0")}</span>
          </div>
          <h1 className="text-base font-medium text-neutral-700 dark:text-neutral-300">
            {question.point}
          </h1>
        </header>

        {/* Card Principal da Questão */}
        <main className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-xs flex flex-col gap-6">
          <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Questão {question.sequence}
          </div>

          {/* Enunciado */}
          <div className="text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line font-normal">
            {question.stem}
          </div>

          {/* Lista de Alternativas */}
          <AlternativeList
            alternatives={question.alternatives}
            selectedAnswer={selectedAnswer}
            isConfirmed={isConfirmed}
            correctAnswer={question.correctAnswer}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Ações e Confirmação */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="text-xs text-neutral-400 dark:text-neutral-500">
              {!isConfirmed ? "Selecione uma alternativa e confirme." : "Resposta registrada."}
            </div>

            <ConfirmAnswerButton
              onConfirm={handleConfirm}
              disabled={!selectedAnswer}
              isConfirmed={isConfirmed}
            />
          </div>

          {/* Feedback Sóbrio de Correção (Fase 2) */}
          {isConfirmed && (
            <section
              aria-live="polite"
              className={`p-5 rounded-lg border flex flex-col gap-3 transition-opacity duration-200 ${
                isCorrect
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100"
                  : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-100"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="text-base">{isCorrect ? "✓" : "✗"}</span>
                <span>{isCorrect ? "Resposta Correta" : `Resposta Incorreta (Gabarito: Alternativa ${question.correctAnswer})`}</span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                <strong className="font-semibold text-neutral-900 dark:text-neutral-100">Fundamentação: </strong>
                {question.explanation}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    hasNext
                      ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  Próxima Questão
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
