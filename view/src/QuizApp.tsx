import { useState, useCallback, useEffect, useRef } from "react";
import {
  useApp,
  applyHostStyleVariables,
  applyHostFonts,
  applyDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type {
  McpUiHostContext,
  McpUiDisplayMode,
  App,
} from "@modelcontextprotocol/ext-apps";
import { QuestionPlayer } from "./components/QuestionPlayer";
import { QuizErrorBoundary } from "./components/QuizErrorBoundary";
import { HubHeader, type ActiveTab } from "./components/HubHeader";
import { SimuladosTab } from "./components/SimuladosTab";
import { LibraryTab } from "./components/LibraryTab";
import { MetricsTab } from "./components/MetricsTab";
import { useQuizUiStore, type GradeHandler } from "./store/quiz-ui-store";
import type { PresetQuiz } from "./fixtures/allDisciplineQuestions";
import type { QuizMode } from "../../src/core/domain/primitives";
import type { QuestionPublic } from "../../src/core/domain/question";
import type { QuestionCorrection } from "../../src/core/domain/correction";

export function QuizApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const appRef = useRef<App | null>(null);
  
  // Hub Local State
  const [activeTab, setActiveTab] = useState<ActiveTab>("simulados");
  const [activeQuizTitle, setActiveQuizTitle] = useState<string | null>(null);
  const setQuestions = useQuizUiStore((s) => s.setQuestions);
  const setPublicQuestions = useQuizUiStore((s) => s.setPublicQuestions);
  const setGradeHandler = useQuizUiStore((s) => s.setGradeHandler);

  const isInsideHostApp = typeof window !== "undefined" && Boolean(window.openai?.widgetState);

  const onAppCreated = useCallback(
    (app: App) => {
      appRef.current = app;

      // 1. Registra o manipulador de graduação remota via MCP Tool
      const gradeHandler: GradeHandler = async (input) => {
        try {
          const res = await app.callServerTool({
            name: "quiz_grade_answer",
            arguments: {
              opaqueGradingToken: input.opaqueGradingToken,
              selectedAnswer: input.selectedAnswer,
              confidence: input.confidence,
              elapsedTimeMs: input.elapsedTimeMs,
            },
          });

          if (!res.isError && (res.structuredContent as any)?.correction) {
            return (res.structuredContent as any).correction as QuestionCorrection;
          }
        } catch (err) {
          console.warn("[NexoQuiz] Erro na chamada quiz_grade_answer via MCP:", err);
        }
        return null;
      };

      setGradeHandler(gradeHandler);

      // 2. Intercepta resultados de ferramentas (ex: quiz_render)
      app.ontoolresult = (params) => {
        if (params.isError) {
          const text = params.content
            ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map((c) => c.text)
            .join(" ") || "Falha na execução da ferramenta.";
          setErrorMessage(text);
          return;
        }

        // Extrai questões públicas de structuredContent ou _meta.quizData
        const structured = params.structuredContent as any;
        const metaQuiz = (params._meta as any)?.quizData;
        const questions = (structured?.questions || metaQuiz?.questions) as QuestionPublic[] | undefined;
        const mode = (structured?.mode || metaQuiz?.mode || "study") as QuizMode;
        const title = (structured?.title || metaQuiz?.title) as string | undefined;

        if (Array.isArray(questions) && questions.length > 0) {
          setPublicQuestions(questions, mode, title);
          if (title) {
            setActiveQuizTitle(title);
          }
        }
      };

      // 3. Sincroniza contexto do Host
      app.onhostcontextchanged = (ctx) => {
        setHostContext((prev) => ({ ...prev, ...ctx }));
        if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
        if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
        if (ctx.theme) applyDocumentTheme(ctx.theme);
      };
    },
    [setPublicQuestions, setGradeHandler]
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
    setQuestions(quiz.questions, mode, quiz.title);
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
