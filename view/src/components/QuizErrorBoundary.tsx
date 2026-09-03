import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class QuizErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[NexoQuiz ErrorBoundary] Erro capturado:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6 text-neutral-900 dark:text-neutral-100 font-sans">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Ocorreu uma instabilidade na exibição
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {this.state.error?.message || "Erro inesperado ao renderizar a questão."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer transition-colors"
            >
              Recarregar Questões
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
