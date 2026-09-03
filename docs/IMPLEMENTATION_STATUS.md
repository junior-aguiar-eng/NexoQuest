# NexoQuiz — Status de Implementação

Este documento registra o estado factual das fases de engenharia do NexoQuiz.

---

## Topologia Git e Remotes

- **`origin` (Privado):** `https://github.com/junior-aguiar-eng/NexoQuest.git` (Repositório privado independente de trabalho)
- **`upstream` (Público de Referência):** `https://github.com/bassimeledath/quizhp-mcp.git` (Somente leitura / fetch)

---

## Baseline Upstream (Fase 0)

- **Commit de Baseline:** `3fa1350068b4e764518273072e097f4faaec0df2`
- **Tag de Baseline:** `quizhp-upstream-baseline`
- **Data do Commit Upstream:** `Fri Apr 17 13:06:18 2026 -0700`
- **Mensagem do Commit:** `Remove pr-12 from mobile fullscreen header so nav arrows sit symmetrically and question centers in viewport`
- **Branch Inicial:** `main`

---

## Comandos Executados e Resultados na Fase 0

| Comando | Resultado | Observações |
| :--- | :--- | :--- |
| `npm install` | **Sucesso (Exit 0)** | 231 pacotes adicionados. |
| `npm run build:view` | **Sucesso (Exit 0)** | Gerado `dist/view/index.html` (342 KB) via Vite singlefile. |
| `node scripts/build-worker-bundle.mjs` | **Sucesso (Exit 0)** | Gerado `src/worker-bundle.ts` com templates embutidos. |
| `npm run build:server` (`tsc`) | **Sucesso (Exit 0)** | Compilação TypeScript do servidor concluída sem erros. |
| `npm run build` | **Sucesso (Exit 0)** | Pipeline completa de build validada com sucesso. |
| `git push -u origin main` | **Sucesso (Exit 0)** | Código sincronizado com o repositório privado. |
| `git push origin quizhp-upstream-baseline` | **Sucesso (Exit 0)** | Tag de referência publicada no repositório privado. |

---

## Matriz de Fases

- [x] **Fase 0** — Clone privado independente, baseline e congelamento do upstream
- [x] **Fase 1** — Guardrails do projeto (`AGENTS.md`, `ARCHITECTURE.md`, `TEST_MATRIX.md`, ADRs 001-010)
- [x] **Fase 2** — Substituição visual mínima do GameRuntime (`QuestionPlayer`, `AlternativeList`, `ConfirmAnswerButton`)
- [x] **Fase 3** — Contratos de domínio + Zod (`primitives`, `umt`, `quiz-plan`, `question`, `correction`, `session`)
- [x] **Fase 4** — Engine determinística de bloco e validação FGV (`answer-rotation`, `block-rules`, `plan-validator`, `question-validator`, `result-calculator`)
- [x] **Fase 5** — Engine de sessão no frontend (Zustand `quiz-ui-store`, modos Estudo/Prova, `ProgressBar`, `Timer`, `ConfidenceSelector`, `ReviewFlag`, `ResultsScreen`, atalhos de teclado)
- [x] **Fase 6** — Correção jurídica e accordions (`CorrectionPanel`, diagnóstico pedagógico, fundamentação, `DistractorAccordion` com recolhimento por padrão)
- [x] **Fase 7** — Biblioteca Markdown (`gray-matter`, `unified/remark` AST, `MaterialIndexer`, SQLite FTS5, CLI `library:validate` e `library:index`)
- [x] **Fase 8** — Tools MCP de biblioteca (`library_list_materials`, `library_get_outline`, `library_search`, `library_read_sections`)
- [x] **Fase 9** — Planejamento de UMT e geração: protocolo do host (`quiz_plan_validate`, `quiz_plan_template`, validação pedagógica estrita)
- [x] **Fase 10** — `quiz_render` stateless e proteção do gabarito (`opaqueGradingToken` AES-256-GCM, remoção de vazamento no `QuestionPublic`)
- [x] **Fase 11** — `quiz_grade_answer` (correção determinística stateless, diagnóstico pedagógico, fundamentação e análise de distratores)
- [x] **Fase 12** — Integração de `widgetState` (sincronização com ChatGPT Apps SDK e persistência local com debounce)
- [x] **Fase 13** — SQLite e persistência local (`SessionRepository`, `quiz_sessions`, `session_answers`, métricas por disciplina)
- [ ] **Fase 14** — Relatório final e revisão
- [ ] **Fase 15** — Limpeza do legado QuizHP
- [ ] **Fase 16** — Hardening do MCP e do widget
- [ ] **Fase 17** — Integração real no ChatGPT
