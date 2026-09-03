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

export function QuizApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (error) return <div style={{ padding: 24, color: "red" }}>{error.message}</div>;
  if (errorMessage) return <div style={{ padding: 24, color: "red" }}>{errorMessage}</div>;

  return (
    <QuizErrorBoundary>
      <QuestionPlayer />
    </QuizErrorBoundary>
  );
}
