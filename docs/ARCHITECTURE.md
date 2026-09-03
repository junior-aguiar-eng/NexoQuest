# NexoQuiz — Arquitetura do Sistema

Este documento descreve a visão técnica, separação de camadas e fluxo de dados do NexoQuiz.

---

## 1. Visão Geral da Arquitetura

O NexoQuiz é estruturado em camadas desacopladas com isolamento estrito entre o domínio e os adapters de integração.

```text
                    ┌─────────────────────────┐
                    │       CHATGPT / LLM     │
                    │ Mapeamento UMT + Geração │
                    └────────────┬────────────┘
                                 │
                          MCP / Apps SDK
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────▼────────┐             ┌────────▼────────┐
        │ Library Adapter │             │   Quiz Adapter  │
        │ (MCP Tools)     │             │ (quiz_render,   │
        └────────┬────────┘             │  quiz_grade)    │
                 │                      └────────┬────────┘
        ┌────────▼────────┐                      │
        │ Markdown + FTS  │             ┌────────▼────────┐
        │ SQLite Index    │             │ Quiz Core       │
        └─────────────────┘             │ Contracts (Zod) │
                                        │ Validators      │
                                        │ Token Envelope  │
                                        └────────┬────────┘
                                                 │
                                        ┌────────▼────────┐
                                        │ QuestionPlayer  │
                                        │ React + Zustand │
                                        └────────┬────────┘
                                                 │
                                      ┌──────────▼──────────┐
                                      │ Session Adapters    │
                                      │ - widgetState (Host)│
                                      │ - Memory (Tests)    │
                                      │ - SQLite (Standalone)
                                      └─────────────────────┘
```

---

## 2. Estrutura de Camadas

### 2.1 Core do Domínio (`src/core/`)
O núcleo da aplicação não possui conhecimento sobre ChatGPT, OpenAI ou MCP:
- **`core/domain/`**: Tipos primitivos, UMTs, planos de bloco, questões internas/públicas, correções e sessões com validações Zod.
- **`core/library/`**: Parser Markdown (`remark/unified`), schema de frontmatter (`gray-matter`), indexador e busca lexical em SQLite FTS5.
- **`core/quiz/`**: Validadores determinísticos de regras de bloco, simetria de alternativas, rotação de letras e cálculo de estatísticas.
- **`core/security/`**: Geração e validação do `opaqueGradingToken` usando AES-GCM (criptografia nativa do Node.js).
- **`core/persistence/`**: Interface `SessionRepository` e implementações (Memória e SQLite).

### 2.2 Adapters MCP (`src/adapters/mcp/`)
Exposição das ferramentas e recursos MCP para o ChatGPT Apps SDK:
- **Ferramentas de Biblioteca**: `library_list_materials`, `library_get_outline`, `library_search`, `library_read_sections`.
- **Ferramentas de Quiz**: `quiz_validate_plan`, `quiz_render`, `quiz_grade_answer`.
- **Resources**: Carregamento do bundle HTML do widget React para o Apps SDK.

### 2.3 Interface do Usuário (`view/src/`)
Frontend React sóbrio construído para avaliação jurídica:
- **`components/`**: `QuestionPlayer`, `AlternativeList`, `ConfirmAnswerButton`, `CorrectionPanel`, `DistractorAccordion`, `ProgressBar`, `Timer`, `ConfidenceSelector`, `ReviewFlag`, `ResultsScreen`.
- **`store/`**: Zustand dividido em stores especializados (conteúdo, estado de sessão e estado transitório de UI).
- **`adapters/`**: Abstração de ponte (`chatgpt-app.ts` usando `widgetState` e `standalone.ts` para modo local).

---

## 3. Fluxo de Dados e Ciclo de Vida da Questão

```text
1. Host (ChatGPT) consulta outline/seções do material via library_get_outline e library_read_sections
2. Host mapeia Unidades Mínimas Testáveis (UMTs) e constrói o QuizPlan
3. Host valida o plano via quiz_validate_plan (regras mecânicas de bloco e rotação)
4. Host gera QuestionInternal para o primeiro bloco de 5 questões
5. Host chama quiz_render:
   - Valida os schemas Zod
   - Extrai QuestionPublic (sem gabarito)
   - Cifra o gabarito e justificativas no opaqueGradingToken
   - Retorna o Resource do QuestionPlayer com dados públicos
6. Candidato interage no QuestionPlayer (seleciona alternativa, marca revisão, seleciona confiança)
7. Candidato clica em "Confirmar Resposta"
8. QuestionPlayer invoca quiz_grade_answer passando opaqueGradingToken, questionId e selectedAnswer
9. Servidor decifra o token, avalia deterministamente e retorna QuestionCorrection
10. QuestionPlayer exibe o CorrectionPanel com diagnóstico e distratores recolhidos em accordions
```

---

## 4. Estratégia de Proteção do Gabarito

Para assegurar integridade pedagógica mesmo em hosts sem permissão de escrita de banco de dados:
1. **Payload Público Limpo**: O contrato `QuestionPublic` é estritamente separado de `QuestionInternal`. Nunca contém `correctAnswer`, `legalReasoning`, `distractorAnalysis` ou referências internas.
2. **Envelope Stateless (AES-GCM)**: O servidor gera um token assinado e cifrado contendo a chave de correção.
3. **Avaliação Segura**: Na correção, o cliente envia apenas a resposta e o token; o servidor decifra em memória, calcula o resultado e retorna a correção individualizada.
