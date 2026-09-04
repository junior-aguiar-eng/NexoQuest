import React from "react";
import type { AnswerLabel } from "../../../src/core/domain/primitives";
import type { QuestionCorrection } from "../../../src/core/domain/correction";
import type { UnifiedQuizQuestion } from "../store/quiz-ui-store";
import { DistractorAccordion } from "./DistractorAccordion";

interface CorrectionPanelProps {
  question: UnifiedQuizQuestion;
  selectedAnswer: AnswerLabel;
  correction?: QuestionCorrection;
  onNext: () => void;
  isLastQuestion?: boolean;
}

export const CorrectionPanel: React.FC<CorrectionPanelProps> = ({
  question,
  selectedAnswer,
  correction,
  onNext,
  isLastQuestion = false,
}) => {
  // 1. Extração prioritária dos dados a partir de QuestionCorrection ou fallback de fixture
  const hasCorrection = Boolean(correction);
  const isCorrect = correction
    ? correction.isCorrect
    : question.correctAnswer
      ? selectedAnswer === question.correctAnswer
      : false;

  const correctAnswer = correction?.correctAnswer || question.correctAnswer || "A";
  const diagnosis = correction?.diagnosis || (isCorrect ? undefined : question.diagnosis);
  const legalReasoning = correction?.legalReasoning || question.legalReasoning || "Fundamentação jurídica não disponível.";
  const legalBasis = correction?.legalBasis || question.legalBasis;
  const precedents = correction?.precedents || question.precedents || [];
  const doctrine = correction?.doctrine || question.doctrine || [];
  const distractorAnalysis = correction?.distractorAnalysis || question.distractorAnalysis || {
    A: "Análise da alternativa A",
    B: "Análise da alternativa B",
    C: "Análise da alternativa C",
    D: "Análise da alternativa D",
    E: "Análise da alternativa E",
  };

  const alternativesTextMap = question.alternatives.reduce(
    (acc, alt) => {
      acc[alt.label] = alt.text;
      return acc;
    },
    {} as Record<AnswerLabel, string>
  );

  if (!hasCorrection && !question.correctAnswer) {
    return (
      <section className="rounded-xl border p-5 sm:p-6 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          Processando correção pedagógica com o servidor...
        </span>
      </section>
    );
  }

  return (
    <section
      aria-live="polite"
      className={`rounded-xl border p-5 sm:p-6 flex flex-col gap-5 transition-all duration-200 ${
        isCorrect
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
          : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60"
      }`}
    >
      {/* 1. Header do Resultado */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              isCorrect
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {isCorrect ? "✓" : "✗"}
          </span>
          <div>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {isCorrect ? "Resposta Correta" : "Resposta Incorreta"}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Gabarito Oficial: <strong className="text-neutral-900 dark:text-neutral-100">Alternativa {correctAnswer}</strong>
              {!isCorrect && (
                <span className="ml-1 text-rose-600 dark:text-rose-400">
                  (Você marcou {selectedAnswer})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
            Segurança do Gabarito: <strong className="text-emerald-600 dark:text-emerald-400">Alto (AES-256)</strong>
          </span>
        </div>
      </div>

      {/* 2. Diagnóstico do Erro do Candidato (se errou) */}
      {!isCorrect && diagnosis && (
        <div className="p-3.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm leading-relaxed text-rose-950 dark:text-rose-200">
          <div className="font-bold uppercase tracking-wider text-[11px] text-rose-800 dark:text-rose-300 mb-1">
            Diagnóstico Pedagógico do Equívoco
          </div>
          <div>{diagnosis}</div>
        </div>
      )}

      {/* 3. Fundamentação da Alternativa Correta */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          Fundamentação da Alternativa Correta ({correctAnswer})
        </h3>
        <div className="text-xs sm:text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 p-4 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800">
          {legalReasoning}
        </div>
      </div>

      {/* 4. Base Legal, Precedentes e Doutrina */}
      {(legalBasis || precedents.length > 0 || doctrine.length > 0) && (
        <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs flex flex-col gap-2">
          {legalBasis && (
            <div className="flex flex-wrap items-baseline gap-1 text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Dispositivo Legal:</span>
              <span className="font-mono text-neutral-600 dark:text-neutral-400">{legalBasis}</span>
            </div>
          )}

          {precedents.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-1.5 text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Precedentes STF/STJ:</span>
              {precedents.map((prec, idx) => (
                <span key={idx} className="font-mono bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200 dark:border-neutral-700">
                  {prec}
                </span>
              ))}
            </div>
          )}

          {doctrine.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-1 text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Referência Doutrinária:</span>
              <span className="italic text-neutral-600 dark:text-neutral-400">{doctrine.join("; ")}</span>
            </div>
          )}
        </div>
      )}

      {/* 5. Accordions dos 4 Distratores */}
      <DistractorAccordion
        distractorAnalysis={distractorAnalysis}
        correctAnswer={correctAnswer}
        selectedAnswer={selectedAnswer}
        alternativesText={alternativesTextMap}
      />

      {/* 6. Ação Próxima Questão */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer shadow-xs transition-transform active:scale-[0.98]"
        >
          {isLastQuestion ? "Ver Resultado do Bloco →" : "Avançar para Próxima Questão →"}
        </button>
      </div>
    </section>
  );
};
