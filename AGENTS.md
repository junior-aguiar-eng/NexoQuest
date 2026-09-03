# Guia Operacional do Agente (AGENTS.md) — NexoQuiz

Este documento estabelece as regras e restrições obrigatórias para qualquer agente ou desenvolvedor atuando no repositório do **NexoQuiz**.

---

## 1. Propósito do Projeto
O **NexoQuiz** é uma engine de questões jurídicas interativas (foco inicial: ENAM e Magistratura), que consome uma biblioteca própria em Markdown e apresenta questões estruturadas no ChatGPT via **MCP (Model Context Protocol) + Apps SDK**, mantendo-se como uma aplicação totalmente independente do host de IA.

---

## 2. Invariantes Arquiteturais e Restrições Fixas

1. **Core Host-Agnostic**:
   - Nenhum import ou tipo de SDKs da OpenAI ou do MCP dentro de `src/core/domain`, `src/core/library`, `src/core/quiz` ou `src/core/persistence`.
   - Toda integração específica com ChatGPT/MCP reside exclusivamente em `src/adapters/` e `view/src/adapters/`.

2. **Nenhuma API de LLM no Backend**:
   - O backend não realiza chamadas para OpenAI, Gemini ou Anthropic.
   - O modelo do host (ChatGPT) consulta materiais e gera `QuizPlan`/questões. O servidor valida contratos, protege gabaritos e corrige deterministicamente.

3. **Markdown como Fonte Canônica**:
   - A biblioteca de conteúdo reside em arquivos `.md` estruturados com frontmatter. O banco de dados (SQLite/FTS5) é estritamente índice e cache.

4. **Separação Rígida entre `QuestionInternal` e `QuestionPublic`**:
   - `QuestionPublic` **nunca** contém a resposta correta (`correctAnswer`), justificativas ou análises de distratores.
   - O gabarito trafega cifrado no `opaqueGradingToken` (AES-GCM) para correção stateless via `quiz_grade_answer`.

5. **Compatibilidade ChatGPT Pro sem Escrita Obrigatória**:
   - O fluxo normal do quiz opera de forma stateless para o servidor, utilizando `widgetState` no cliente.
   - Não depender de ferramentas de escrita/modificação de arquivos (`write/modify`) no MCP para o funcionamento básico.

6. **Interface de Prova Sóbria (Sem Gamificação)**:
   - Proibido implementar elementos lúdicos como canvas interativo, minigames, sons, confetes, moedas, XP, avatares ou streaks chamativos.
   - O foco é uma interface limpa de avaliação digital (uma questão por vez, alternativas A–E, seleção explícita e confirmação).

7. **Regras Pedagógicas como Software**:
   - Estrutura de blocos (ex: 3 narrativas, 1 proposições, 1 conceitual; 3 difíceis, 1 média, 1 fácil), simetria de alternativas e rotação de letras são validadas deterministicamente em código (Zod/validadores).

8. **Topologia Git**:
   - `origin` = repositório privado NexoQuiz (`junior-aguiar-eng/NexoQuest`).
   - `upstream` = repositório público de referência (`bassimeledath/quizhp-mcp`).
   - **Nunca** realizar `git push upstream`.

---

## 3. Escopo da Versão 1 (V1)

### Incluído na V1
- Biblioteca Markdown com frontmatter validado e busca textual (SQLite FTS5).
- Recuperação de outlines e seções via MCP tools.
- Contratos TypeScript + Zod para UMT, QuizPlan, Questão e Sessão.
- Widget React (`QuestionPlayer`) com modos Estudo e Prova.
- Seleção A–E com confirmação explícita, barra de progresso, cronômetro, confiança e marcação para revisão.
- Correção pedagógica com diagnóstico de erro e distratores em accordions.
- Envelope cifrado para correção stateless.
- Relatório final de desempenho com métricas objetivas.
- Adapter de persistência SQLite para modo local/standalone.

### Fora do Escopo da V1 (Não Implementar)
- Gamificação, XP, ranking, áudio ou animações distrativas.
- Autenticação de usuários ou multi-tenancy.
- Banco vetorial ou embeddings (busca lexical FTS5 é suficiente na V1).
- Ingestão automática de PDF ou OCR.
- Chamadas de API de IA no backend.
- Módulos avançados de analytics em Python (reservados para roadmap futuro).
- Spaced Repetition complexo na V1.

---

## 4. Protocolo Obrigatório de Trabalho

### Antes de Cada Tarefa
1. Ler este arquivo (`AGENTS.md`), `docs/ARCHITECTURE.md` e `docs/IMPLEMENTATION_STATUS.md`.
2. Inspecionar apenas os arquivos estritamente relacionados ao escopo da fase.
3. Não realizar refatorações amplas ou modificações fora do escopo.

### Validação Obrigatória Após Cada Tarefa
Executar e garantir retorno com código de saída 0:
```bash
npm run typecheck
npm run test      # quando implementado
npm run build
```

### Regra de Parada
- Se qualquer teste ou build falhar, pare imediatamente e corrija a causa raiz. Nunca silencie erros ou remova testes para passar a verificação.
- Atualize `docs/IMPLEMENTATION_STATUS.md` e `docs/KNOWN_ISSUES.md` a cada entrega.
