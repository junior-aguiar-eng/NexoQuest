# Registro de Alterações (Changelog) — NexoQuiz

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.2] - 2026-09-04

### 📦 Modernização e Atualização Geral de Dependências

#### Atualizado
* **Dependências de Produção (`dependencies`)**:
  * `@modelcontextprotocol/ext-apps`: `1.2.2` ➔ `^1.7.5`
  * `@modelcontextprotocol/sdk`: `1.27.1` ➔ `^1.30.0`
  * `express`: mantido em `^5.2.1` estável
  * `express-rate-limit`: `8.3.1` ➔ `^8.7.0`
  * `zod`: atualizado para a versão mais recente e estável `^3.25.76`
* **Dependências de Desenvolvimento (`devDependencies`)**:
  * `react` e `react-dom`: `19.0.0` ➔ `^19.2.8`
  * `@types/react` e `@types/react-dom`: `19.0.0` ➔ `^19.2.18` / `^19.2.7`
  * `@types/express`: `4.17.21` ➔ `^5.0.6` (alinhado ao Express 5)
  * `@types/node`: `22.10.5` ➔ `^22.20.1` (Node.js 22 LTS estável)
  * `tailwindcss` e `@tailwindcss/vite`: `4.0.0` ➔ `^4.3.3`
  * `zustand`: `5.0.3` ➔ `^5.0.15`
  * `tsx`: `4.19.2` ➔ `^4.23.13`
  * `typescript`: `5.7.2` ➔ `^5.9.3`
  * `vite-plugin-singlefile`: `2.0.3` ➔ `^2.3.3`
  * `@vitejs/plugin-react`: `4.3.4` ➔ `^4.7.0`
* **Auditoria de Segurança**:
  * Resolução de todas as vulnerabilidades transitivas; 0 vulnerabilidades detectadas via `npm audit`.
  * Validação com 100% de sucesso em testes (57 testes passando), compilação TypeScript estrita e builds de produção.

---

## [1.0.1] - 2026-09-04

### 🛡️ Auditoria de Engenharia Sênior & Hardening Integral

#### Corrigido & Aprimorado
* **Hidratação Dinâmica e Ciclo de Correção Stateless no Widget (`view/src/`)**:
  * Integração do listener `app.ontoolresult` no `QuizApp.tsx` para carregar `QuestionPublic[]` diretamente a partir de chamadas `quiz_render`.
  * Implementação da chamada remota `app.callServerTool("quiz_grade_answer", ...)` no Zustand store (`quiz-ui-store.ts`), garantindo que o gabarito protegido em `opaqueGradingToken` seja corrigido deterministicamente sem necessidade de pré-exposição de respostas no cliente.
  * Desacoplamento de `CorrectionPanel.tsx` e `QuestionPlayer.tsx` para consumir o objeto `QuestionCorrection` retornado pelo servidor.
* **Expurgo de Resíduos do Upstream**:
  * Remoção física completa do diretório legado `templates/` contendo 8.5MB de minigames do QuizHP.
  * Exclusão de scripts obsoletos de banco externo (`scripts/update-supabase-controls.mjs`, `scripts/fix-controls-format.mjs`).
  * Reconstrução de `scripts/build-worker-bundle.mjs` e `src/worker-bundle.ts`, reduzindo o bundle estático de **8.51 MB** para **443 KB**.
* **Hardening Criptográfico (`src/core/security/crypto-token.ts`)**:
  * Derivação padronizada de chave de 256 bits (`deriveAesKey`) com SHA-256 KDF para suporte uniforme a qualquer string de segredo/passphrase.
  * Otimização do fluxo de cifragem AES-256-GCM com manipulação direta de Buffers e codificação `base64url`.
* **Busca Lexical no SQLite FTS5 (`src/core/library/material-search.ts`)**:
  * Tokenização Unicode avançada e formatação estruturada com operadores `AND` e curingas `*`, conferindo alta tolerância a pontuações de artigos e dispositivos legais.
* **Alinhamento de Contratos & Qualidade**:
  * Alinhamento estrito de `scripts/verify-e2e.ts` com `QuestionInternalSchema`.
  * Adição de novos testes unitários para a chave customizada via KDF e para o fluxo de hidratação de `QuestionPublic` e correção remota no widget (totalizando 58 testes automatizados).

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
