import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NexoQuiz",
  description: "Engine de Questões Jurídicas Interativas via MCP + Apps SDK",
  lang: "pt-BR",
  base: process.env.GITHUB_ACTIONS ? "/NexoQuest/" : "/",
  ignoreDeadLinks: false,
  themeConfig: {
    siteTitle: "⚖️ NexoQuiz",

    nav: [
      { text: "Início", link: "/" },
      { text: "Simulador Live 🎮", link: "/demo" },
      { text: "Arquitetura", link: "/ARCHITECTURE" },
      { text: "Integração ChatGPT", link: "/CHATGPT_INTEGRATION" },
      { text: "Status V1", link: "/IMPLEMENTATION_STATUS" },
      { text: "Changelog", link: "/CHANGELOG" },
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
          { text: "Registro de Alterações (Changelog)", link: "/CHANGELOG" },
        ],
      },
      {
        text: "Decisões de Arquitetura (ADRs)",
        collapsed: false,
        items: [
          { text: "ADR-001: Adaptação Incremental", link: "/adr/ADR-001-adaptar-quizhp" },
          { text: "ADR-002: Não Criar Monorepo", link: "/adr/ADR-002-nao-criar-monorepo" },
          { text: "ADR-003: Core Host-Agnostic", link: "/adr/ADR-003-core-independente-openai" },
          { text: "ADR-004: Sem LLM no Backend", link: "/adr/ADR-004-sem-api-llm-no-backend" },
          { text: "ADR-005: Markdown Canônico", link: "/adr/ADR-005-markdown-fonte-canonica" },
          { text: "ADR-006: Separação QuestionPublic", link: "/adr/ADR-006-gabarito-separado-de-question-public" },
          { text: "ADR-007: Separação de Estados", link: "/adr/ADR-007-separacao-estado-visual-e-duravel" },
          { text: "ADR-008: ChatGPT Pro Stateless", link: "/adr/ADR-008-compatibilidade-chatgpt-pro-stateless" },
          { text: "ADR-009: Regras FGV em Software", link: "/adr/ADR-009-regras-pedagogicas-como-software" },
          { text: "ADR-010: Topologia Git Privada", link: "/adr/ADR-010-repositorio-privado-upstream-tecnico" },
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
