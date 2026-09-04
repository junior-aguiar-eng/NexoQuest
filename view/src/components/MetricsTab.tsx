import React from "react";
import { useQuizUiStore } from "../store/quiz-ui-store";

export const MetricsTab: React.FC = () => {
  const { answers, questions } = useQuizUiStore();

  const totalAnswered = Object.keys(answers).length;
  const answeredList = Object.entries(answers);

  // Calcula estatísticas básicas da sessão em memória
  let correctCount = 0;
  let highConfidenceCount = 0;
  let totalTimeMs = 0;

  answeredList.forEach(([qId, ans]) => {
    const q = questions.find((item) => item.id === qId);
    if (q && q.correctAnswer === ans.selectedAnswer) {
      correctCount++;
    }
    if (ans.confidence === "high") {
      highConfidenceCount++;
    }
    totalTimeMs += ans.elapsedTimeMs || 0;
  });

  const accuracyPct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const avgTimeSec = totalAnswered > 0 ? Math.round(totalTimeMs / totalAnswered / 1000) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-sm space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Painel de Desempenho & Diagnóstico
        </h2>
        <p className="text-sm text-muted-foreground">
          Métricas calculadas deterministicamente pelo NexoQuiz. Acompanhe sua precisão nas provas do ENAM e Magistratura.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Assertividade Global
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {totalAnswered > 0 ? `${accuracyPct}%` : "--"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({correctCount}/{totalAnswered})
            </span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${accuracyPct}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Questões Respondidas
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {totalAnswered}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Nesta sessão de estudo
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tempo Médio / Questão
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {totalAnswered > 0 ? `${avgTimeSec}s` : "--"}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Meta ENAM: &le; 180 segundos
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Alta Certeza (Confiança)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {highConfidenceCount}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            Resoluções com convicção plena
          </p>
        </div>
      </div>

      {/* Tabela de Desempenho por Disciplina */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
          Métricas por Disciplina (Edital Nacional)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Disciplina</th>
                <th className="py-2.5 px-3">Status de Cobertura</th>
                <th className="py-2.5 px-3">Apostilas Ativas</th>
                <th className="py-2.5 px-3">Padrão da Banca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 px-3 font-medium text-foreground">Direito Processual Civil</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    ● 100% Indexado FTS5
                  </span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">Negócios Jurídicos Processuais (Art. 190)</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">FGV / ENAM</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-foreground">Direito Constitucional</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    ● 100% Indexado FTS5
                  </span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">Direitos Fundamentais & STF</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">Magistratura</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-foreground">Direito Penal</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    ● 100% Indexado FTS5
                  </span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">Teoria do Delito & Tipicidade Material</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">FGV / ENAM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
