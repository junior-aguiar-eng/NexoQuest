# Registro de Alterações (Changelog) — NexoQuiz

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-09-03

### 🎉 Lançamento Inicial — Fundação NexoQuiz V1

#### Adicionado
* **Núcleo de Domínio Host-Agnostic (`src/core/domain/`)**:
  * Contratos TypeScript canônicos e validações estritas via Zod (`QuestionInternal`, `QuestionPublic`, `QuizPlan`, `UMTDefinition` e `QuizSession`).
  * Separação estrita entre o modelo interno com gabarito e o payload público entregue ao host.
* **Motor Pedagógico Determinístico (`src/core/quiz/`)**:
  * Validador de distribuição de blocos FGV (proporção 3 casos narrativos, 1 proposições e 1 conceitual; 3 difíceis, 1 média e 1 fácil).
  * Validador de rotação de letras sem gabaritos consecutivos duplicados.
  * Verificador de simetria de extensão das alternativas e detecção de marcadores editoriais maliciosos.
* **Biblioteca Canônica em Markdown & Indexação FTS5 (`src/core/library/`)**:
  * Parser de AST com `remark/unified` e validação de frontmatter YAML com `gray-matter` e Zod.
  * Indexador lexical SQLite FTS5 com busca por relevância e extração seletiva de seções.
* **Envelope Criptográfico Stateless (`src/core/security/`)**:
  * Criptografia autenticada AES-256-GCM para o `opaqueGradingToken`, permitindo correção determinística stateless sem vazamento prévio de respostas.
* **Serviço de Correção Pedagógica (`gradeAnswer`)**:
  * Decodificação segura do envelope, diagnóstico detalhado de equívocos, fundamentação jurídica, base legal e análise de distratores.
* **Servidor e Ferramentas MCP (`src/adapters/mcp/`)**:
  * 8 ferramentas MCP: `library_list_materials`, `library_get_outline`, `library_search`, `library_read_sections`, `quiz_plan_template`, `quiz_plan_validate`, `quiz_render` e `quiz_grade_answer`.
  * Suporte a transporte HTTP Server-Sent Events (SSE / Streamable) e Stdio.
* **Interface Digital Sóbria React (`view/src/`)**:
  * Widget de avaliação digital para ChatGPT Apps SDK empacotado em arquivo único HTML (`vite-plugin-singlefile`).
  * Modos **Estudo** (com diagnóstico imediato e accordions de distratores) e **Prova** (com cronômetro, revisão e relatório consolidado de acertos).
  * Sincronização bidirecional de estado via `widgetState` (`window.openai`).
  * Tema dinâmico (Dark/Light) e layout totalmente responsivo e acessível.
* **Persistência Standalone Local (`src/core/persistence/`)**:
  * Adaptador SQLite nativo para gravação de histórico de sessões e cálculo de métricas de desempenho por matéria.
* **Portal de Documentação e Simulador Live (`docs/`)**:
  * Site estático VitePress com documentação completa da arquitetura, guia de integração ChatGPT, 10 ADRs registrados e Simulador Live interativo em `/demo`.
  * Pipeline automatizada de deploy no GitHub Pages (`.github/workflows/deploy-pages.yml`).
* **Padrões Comunitários e Governança**:
  * Código de Conduta (`CODE_OF_CONDUCT.md`), Guia de Contribuição (`CONTRIBUTING.md`) e Política de Segurança (`SECURITY.md`).
  * Modelos de issue para bugs, propostas e atualizações de materiais jurídicos em `.github/ISSUE_TEMPLATE/`.
  * Modelo padronizado de Pull Request com checklist de invariantes em `.github/pull_request_template.md`.
* **Qualidade e Segurança**:
  * 54 testes automatizados cobrindo 100% dos contratos, validadores, ferramentas MCP e criptografia.
  * Auditoria de dependências com 0 vulnerabilidades conhecidas (`npm audit`).
