import React, { useState } from "react";
import type { QuizStatistics } from "../../../src/core/domain/session";

interface ResultsScreenProps {
  stats: QuizStatistics;
  onReviewErrors: () => void;
  onReviewFlagged: () => void;
  onReviewAll: () => void;
  onReset: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  stats,
  onReviewErrors,
  onReviewFlagged,
  onReviewAll,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}min ${secs}s`;
  };

  const hasErrors = stats.totalAnswered - stats.totalCorrect > 0;
  const hasFlagged = stats.reviewFlagsCount > 0;

  const handleCopyReport = () => {
    const text = [
      `📊 NEXOQUIZ — RELATÓRIO DE DESEMPENHO`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• Acertos: ${stats.totalCorrect}/${stats.totalAnswered} (${stats.accuracyPercentage}%)`,
      `• Tempo Total: ${formatTime(stats.totalTimeMs)}`,
      `• Erros em Alta Confiança: ${stats.highConfidenceErrors}`,
      `• Questões Marcadas para Revisão: ${stats.reviewFlagsCount}`,
      `\n📈 Acurácia por Foco:`,
      `  - Jurisprudência: ${stats.accuracyByFocus?.jurisprudence?.correct || 0}/${stats.accuracyByFocus?.jurisprudence?.total || 0}`,
      `  - Lei Seca / Prazos: ${stats.accuracyByFocus?.statute?.correct || 0}/${stats.accuracyByFocus?.statute?.total || 0}`,
      `  - Doutrina: ${stats.accuracyByFocus?.doctrine?.correct || 0}/${stats.accuracyByFocus?.doctrine?.total || 0}`,
      `\n🎯 Acurácia por Dificuldade:`,
      `  - Difíceis: ${stats.accuracyByDifficulty?.hard?.correct || 0}/${stats.accuracyByDifficulty?.hard?.total || 0}`,
      `  - Médias: ${stats.accuracyByDifficulty?.medium?.correct || 0}/${stats.accuracyByDifficulty?.medium?.total || 0}`,
      `  - Fáceis: ${stats.accuracyByDifficulty?.easy?.correct || 0}/${stats.accuracyByDifficulty?.easy?.total || 0}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4 text-center">
        <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
          Desempenho da Sessão
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Relatório de Fechamento
        </h1>
      </header>

      {/* Destaque Principal de Pontuação */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
          <div className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 font-mono">
            {stats.totalCorrect} / {stats.totalAnswered}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Acertos Globais</div>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.accuracyPercentage}%
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Aproveitamento</div>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-mono">
            {formatTime(stats.totalTimeMs)}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Tempo Total</div>
        </div>
      </div>

      {/* Detalhamento por Foco e Dificuldade */}
      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        {/* Desempenho por Foco */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Acurácia por Foco
          </div>
          {stats.accuracyByFocus && (
            <>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-600 dark:text-neutral-400">Jurisprudência</span>
                <span className="font-mono font-medium">{stats.accuracyByFocus.jurisprudence?.correct || 0} / {stats.accuracyByFocus.jurisprudence?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-600 dark:text-neutral-400">Lei Seca / Prazos</span>
                <span className="font-mono font-medium">{stats.accuracyByFocus.statute?.correct || 0} / {stats.accuracyByFocus.statute?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600 dark:text-neutral-400">Doutrina</span>
                <span className="font-mono font-medium">{stats.accuracyByFocus.doctrine?.correct || 0} / {stats.accuracyByFocus.doctrine?.total || 0}</span>
              </div>
            </>
          )}
        </div>

        {/* Desempenho por Dificuldade */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Acurácia por Dificuldade
          </div>
          {stats.accuracyByDifficulty && (
            <>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-600 dark:text-neutral-400">Difíceis</span>
                <span className="font-mono font-medium">{stats.accuracyByDifficulty.hard?.correct || 0} / {stats.accuracyByDifficulty.hard?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                <span className="text-neutral-600 dark:text-neutral-400">Médias</span>
                <span className="font-mono font-medium">{stats.accuracyByDifficulty.medium?.correct || 0} / {stats.accuracyByDifficulty.medium?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600 dark:text-neutral-400">Fáceis</span>
                <span className="font-mono font-medium">{stats.accuracyByDifficulty.easy?.correct || 0} / {stats.accuracyByDifficulty.easy?.total || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diagnóstico Pedagógico */}
      <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs flex flex-col gap-2">
        <div className="font-semibold text-amber-900 dark:text-amber-300">
          Métricas de Calibração Pedagógica
        </div>
        <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
          <span>Erros cometidos com Alta Segurança:</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{stats.highConfidenceErrors}</span>
        </div>
        <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
          <span>Questões marcadas para revisão:</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{stats.reviewFlagsCount}</span>
        </div>
      </div>

      {/* Ações de Revisão e Reinício */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleCopyReport}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-800 cursor-pointer"
        >
          {copied ? "✓ Copiado!" : "📋 Copiar Resumo"}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {hasErrors && (
            <button
              type="button"
              onClick={onReviewErrors}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
            >
              Rever Erros ({stats.totalAnswered - stats.totalCorrect})
            </button>
          )}

          {hasFlagged && (
            <button
              type="button"
              onClick={onReviewFlagged}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              Rever Marcadas ({stats.reviewFlagsCount})
            </button>
          )}

          <button
            type="button"
            onClick={onReviewAll}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 cursor-pointer"
          >
            Rever Todas
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
          >
            Reiniciar Ciclo
          </button>
        </div>
      </div>
    </div>
  );
};
