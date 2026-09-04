import React from "react";
import { useQuizUiStore } from "../store/quiz-ui-store";
import {
  selectCurrentQuestion,
  selectCurrentAnswer,
  selectIsCurrentConfirmed,
  selectIsCurrentFlagged,
  selectProgress,
  selectSessionStatistics,
  selectCanConfirm,
  selectCanNavigateNext,
  selectCanNavigatePrev,
} from "../store/selectors";
import { AlternativeList } from "./AlternativeList";
import { ConfirmAnswerButton } from "./ConfirmAnswerButton";
import { ProgressBar } from "./ProgressBar";
import { Timer } from "./Timer";
import { ConfidenceSelector } from "./ConfidenceSelector";
import { ReviewFlag } from "./ReviewFlag";
import { ResultsScreen } from "./ResultsScreen";
import { CorrectionPanel } from "./CorrectionPanel";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTimer } from "../hooks/useTimer";

export const QuestionPlayer: React.FC = () => {
  const store = useQuizUiStore();
  const currentQuestion = selectCurrentQuestion(store);
  const currentAnswer = selectCurrentAnswer(store);
  const isConfirmed = selectIsCurrentConfirmed(store);
  const isFlagged = selectIsCurrentFlagged(store);
  const progress = selectProgress(store);
  const statistics = selectSessionStatistics(store);
  const canConfirm = selectCanConfirm(store);
  const canNext = selectCanNavigateNext(store);
  const canPrev = selectCanNavigatePrev(store);

  const currentCorrection = currentQuestion ? store.corrections[currentQuestion.id] : undefined;

  const { formattedTime, elapsedMs, resetTimer } = useTimer(!store.isCompleted);

  const handleSelectAnswer = (label: "A" | "B" | "C" | "D" | "E") => {
    if (currentQuestion) {
      store.selectAnswer(currentQuestion.id, label);
    }
  };

  const handleConfirm = () => {
    if (currentQuestion && canConfirm) {
      store.confirmAnswer(currentQuestion.id, elapsedMs);
      resetTimer();
    }
  };

  const handleNext = () => {
    if (canNext) {
      resetTimer();
      store.nextQuestion();
    }
  };

  const handlePrev = () => {
    if (canPrev) {
      resetTimer();
      store.previousQuestion();
    }
  };

  // Atalhos de teclado (A-E, Enter, Setas, R)
  useKeyboardShortcuts({
    onSelectAnswer: handleSelectAnswer,
    onConfirm: handleConfirm,
    onNext: handleNext,
    onPrev: handlePrev,
    onToggleReview: () => {
      if (currentQuestion) store.toggleReviewFlag(currentQuestion.id);
    },
    canConfirm,
    canNext,
    canPrev,
    isEnabled: !store.isCompleted,
  });

  // Tela de Resultados
  if (store.isCompleted) {
    return (
      <div className="w-full h-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <ResultsScreen
          stats={statistics}
          onReviewErrors={() => store.startReview("errors")}
          onReviewFlagged={() => store.startReview("flagged")}
          onReviewAll={() => store.startReview("all")}
          onReset={() => store.resetQuiz()}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center text-neutral-500">
        Nenhuma questão carregada.
      </div>
    );
  }

  const isStudyMode = store.mode === "study";
  const isLastQuestion = progress.current === progress.total;
  const revealedCorrectAnswer = isStudyMode && isConfirmed
    ? (currentCorrection?.correctAnswer || currentQuestion.correctAnswer)
    : undefined;

  return (
    <div className="w-full h-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-5 my-auto">
        
        {/* Barra Superior: Modo de Estudo e Cronômetro */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg p-0.5 bg-neutral-200/70 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => store.setMode("study")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  isStudyMode
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Modo Estudo
              </button>
              <button
                type="button"
                onClick={() => store.setMode("exam")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  !isStudyMode
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                Modo Prova
              </button>
            </div>

            {store.activeReviewFilter && (
              <button
                type="button"
                onClick={() => store.exitReview()}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-200 cursor-pointer"
              >
                ✕ Voltar aos Resultados
              </button>
            )}
          </div>

          <Timer timeFormatted={formattedTime} />
        </div>

        {/* Header Sóbrio e Barra de Progresso com Bloco */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              {currentQuestion.discipline}
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {currentQuestion.point}
            </h1>
            {isStudyMode && currentQuestion.umtTitle && (
              <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                UMT: {currentQuestion.umtTitle}
              </div>
            )}
          </div>

          <ProgressBar
            current={progress.current}
            total={progress.total}
            blockNumber={currentQuestion.blockNumber}
            slotInBlock={currentQuestion.slotInBlock}
          />
        </header>

        {/* Card Principal da Questão */}
        <main className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-7 shadow-xs flex flex-col gap-5">
          
          {/* Tag de Formato / Dificuldade no Modo Estudo */}
          {isStudyMode && (currentQuestion.format || currentQuestion.difficulty || currentQuestion.focus) && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              {currentQuestion.format && (
                <span className="uppercase bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700/60">
                  {currentQuestion.format}
                </span>
              )}
              {currentQuestion.difficulty && (
                <span className="uppercase bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700/60">
                  {currentQuestion.difficulty}
                </span>
              )}
              {currentQuestion.focus && (
                <span className="uppercase bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700/60">
                  {currentQuestion.focus}
                </span>
              )}
            </div>
          )}

          {/* Enunciado */}
          <div className="text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line font-normal">
            {currentQuestion.stem}
          </div>

          {/* Proposições I, II, III (se existirem) */}
          {currentQuestion.propositions && currentQuestion.propositions.length > 0 && (
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-normal">
              {currentQuestion.propositions.map((prop, idx) => (
                <div key={idx} className="leading-relaxed">
                  {prop}
                </div>
              ))}
            </div>
          )}

          {/* Comando da questão (se existir) */}
          {currentQuestion.command && (
            <div className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {currentQuestion.command}
            </div>
          )}

          {/* Lista de Alternativas A-E */}
          <AlternativeList
            alternatives={currentQuestion.alternatives}
            selectedAnswer={currentAnswer?.selectedAnswer || null}
            isConfirmed={isStudyMode ? isConfirmed : false}
            correctAnswer={revealedCorrectAnswer}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Barra de Ações: Confiança, Revisão e Botão Confirmar/Navegar */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <ConfidenceSelector
                selectedConfidence={currentAnswer?.confidence}
                onSelectConfidence={(level) => store.setConfidence(currentQuestion.id, level)}
                disabled={isStudyMode && isConfirmed}
              />
              <ReviewFlag
                isFlagged={isFlagged}
                onToggle={() => store.toggleReviewFlag(currentQuestion.id)}
              />
            </div>

            <div className="flex items-center gap-2">
              {canPrev && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 cursor-pointer"
                >
                  ← Anterior
                </button>
              )}

              {isStudyMode ? (
                !isConfirmed && (
                  <ConfirmAnswerButton
                    onConfirm={handleConfirm}
                    disabled={!canConfirm}
                    isConfirmed={isConfirmed}
                  />
                )
              ) : (
                /* Modo Prova */
                isLastQuestion ? (
                  <button
                    type="button"
                    onClick={() => store.finishQuiz()}
                    disabled={!currentAnswer?.selectedAnswer}
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Prova
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
                  >
                    Próxima →
                  </button>
                )
              )}
            </div>
          </div>

          {/* Painel Pedagógico Aprofundado com Accordions (Fase 6) */}
          {isStudyMode && isConfirmed && currentAnswer?.selectedAnswer && (
            <CorrectionPanel
              question={currentQuestion}
              selectedAnswer={currentAnswer.selectedAnswer}
              correction={currentCorrection}
              onNext={handleNext}
              isLastQuestion={isLastQuestion}
            />
          )}

        </main>
      </div>
    </div>
  );
};
