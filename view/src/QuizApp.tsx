import { useState, useCallback, useEffect } from "react";
import {
  useApp,
  applyHostStyleVariables,
  applyHostFonts,
  applyDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type {
  McpUiHostContext,
  McpUiDisplayMode,
} from "@modelcontextprotocol/ext-apps";
import { QuestionPlayer } from "./components/QuestionPlayer";
import { QuizErrorBoundary } from "./components/QuizErrorBoundary";
import { HubHeader, type ActiveTab } from "./components/HubHeader";
import { SimuladosTab } from "./components/SimuladosTab";
import { LibraryTab } from "./components/LibraryTab";
import { MetricsTab } from "./components/MetricsTab";
import { useQuizUiStore } from "./store/quiz-ui-store";
import type { PresetQuiz } from "./fixtures/allDisciplineQuestions";
import type { QuizMode } from "../../src/core/domain/primitives";

export function QuizApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Hub Local State
  const [activeTab, setActiveTab] = useState<ActiveTab>("simulados");
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const setQuestions = useQuizUiStore((s) => s.setQuestions);

  const isInsideHostApp = typeof window !== "undefined" && Boolean(window.openai?.widgetState);

  const onAppCreated = useCallback(
    (app: import("@modelcontextprotocol/ext-apps").App) => {
      app.ontoolresult = (params) => {
        if (params.isError) {
          const text = params.content
            ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map((c) => c.text)
            .join(" ") || "Tool execution failed";
          setErrorMessage(text);
        }
      };

      app.onhostcontextchanged = (ctx) => {
        setHostContext((prev) => ({ ...prev, ...ctx }));
        if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
        if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
        if (ctx.theme) applyDocumentTheme(ctx.theme);
      };
    },
    []
  );

  const { error } = useApp({
    appInfo: { name: "NexoQuiz", version: "1.0.0" },
    capabilities: {
      availableDisplayModes: ["inline", "fullscreen"] as McpUiDisplayMode[],
    },
    onAppCreated,
  });

  // Theme synchronization with host
  useEffect(() => {
    if (hostContext?.theme) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyDocumentTheme(mq.matches ? "dark" : "light");
    const onChange = (e: MediaQueryListEvent) => {
      if (!hostContext?.theme) applyDocumentTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hostContext?.theme]);

  const handleStartQuiz = (quiz: PresetQuiz, mode: QuizMode) => {
    setQuestions(quiz.questions, mode);
    setActiveQuizTitle(quiz.title);
  };

  const handleExitQuiz = () => {
    setActiveQuizTitle(null);
  };

  if (error) return <div style={{ padding: 24, color: "red" }}>{error.message}</div>;
  if (errorMessage) return <div style={{ padding: 24, color: "red" }}>{errorMessage}</div>;

  // Se estiver em execução estrita dentro do ChatGPT Apps SDK, renderiza diretamente o player de prova
  if (isInsideHostApp) {
    return (
      <QuizErrorBoundary>
        <QuestionPlayer />
      </QuizErrorBoundary>
    );
  }

  // Modo Hub Standalone / Navegador Local
  return (
    <QuizErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <HubHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeQuizTitle={activeQuizTitle || undefined}
          onExitQuiz={handleExitQuiz}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          {activeQuizTitle ? (
            <div className="space-y-4">
              <QuestionPlayer />
            </div>
          ) : (
            <>
              {activeTab === "simulados" && <SimuladosTab onStartQuiz={handleStartQuiz} />}
              {activeTab === "biblioteca" && <LibraryTab />}
              {activeTab === "metricas" && <MetricsTab />}
            </>
          )}
        </main>
      </div>
    </QuizErrorBoundary>
  );
}
