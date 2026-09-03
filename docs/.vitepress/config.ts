import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NexoQuiz",
  description: "Engine de Questões Jurídicas Interativas via MCP + Apps SDK",
  lang: "pt-BR",
  base: process.env.GITHUB_ACTIONS ? "/NexoQuest/" : "/",
  ignoreDeadLinks: true,
  themeConfig: {
    siteTitle: "⚖️ NexoQuiz",

    nav: [
      { text: "Início", link: "/" },
      { text: "Simulador Live 🎮", link: "/demo" },
      { text: "Arquitetura", link: "/ARCHITECTURE" },
      { text: "Integração ChatGPT", link: "/CHATGPT_INTEGRATION" },
      { text: "Status V1", link: "/IMPLEMENTATION_STATUS" },
    ],

    sidebar: [
      {
        text: "Visão Geral",
        items: [
          { text: "Apresentação", link: "/" },
          { text: "Simulador Live Interativo", link: "/demo" },
          { text: "Guia de Integração ChatGPT", link: "/CHATGPT_INTEGRATION" },
          { text: "Arquitetura do Sistema", link: "/ARCHITECTURE" },
          { text: "Status da Implementação V1", link: "/IMPLEMENTATION_STATUS" },
          { text: "Matriz de Testes", link: "/TEST_MATRIX" },
        ],
      },
      {
        text: "Decisões de Arquitetura (ADRs)",
        collapsed: false,
        items: [
          { text: "ADR-001: Core Host-Agnostic", link: "/adr/ADR-001-core-host-agnostic" },
          { text: "ADR-002: Sem LLM no Backend", link: "/adr/ADR-002-no-llm-calls-in-backend" },
          { text: "ADR-003: Markdown Canônico", link: "/adr/ADR-003-markdown-canonical-library" },
          { text: "ADR-004: Separação QuestionPublic", link: "/adr/ADR-004-question-public-separation" },
          { text: "ADR-005: Correção Stateless", link: "/adr/ADR-005-stateless-quiz-grading" },
          { text: "ADR-006: Sincronização widgetState", link: "/adr/ADR-006-chatgpt-widget-state" },
          { text: "ADR-007: SQLite Standalone", link: "/adr/ADR-007-sqlite-local-persistence" },
          { text: "ADR-008: Interface Digital Sóbria", link: "/adr/ADR-008-sobria-exam-interface" },
          { text: "ADR-009: Regras FGV em Código", link: "/adr/ADR-009-deterministic-pedagogical-rules" },
          { text: "ADR-010: Topologia Git Privada", link: "/adr/ADR-010-git-topology-and-remotes" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/junior-aguiar-eng/NexoQuest" },
    ],

    footer: {
      message: "NexoQuiz — Simulação Jurídica Interativa de Alta Performance",
      copyright: "Copyright © 2026 NexoQuiz",
    },

    search: {
      provider: "local",
    },
  },
});
