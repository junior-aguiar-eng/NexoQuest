# NexoQuiz — Matriz de Testes

Este documento define os cenários e critérios de validação para cada camada do sistema.

---

## 1. Níveis de Teste

```text
       ▲
      / \        E2E (Fluxo Completo Bloco de 5 no Host)
     /   \       Integração (MCP Tools ↔ Core ↔ SQLite)
    /     \      UI Components (QuestionPlayer, Seleção, Teclado)
   /       \     Unitários (Zod Schemas, Validadores, Token Crypto, FTS5)
  ───────────
```

---

## 2. Cenários de Teste por Camada

### 2.1 Domínio e Validações (Zod + Validadores)
- [ ] **TC-DOM-01**: Questão com 4 alternativas é rejeitada pelo schema Zod.
- [ ] **TC-DOM-02**: Questão com 6 alternativas é rejeitada pelo schema Zod.
- [ ] **TC-DOM-03**: Letras duplicadas nas alternativas geram erro de validação.
- [ ] **TC-DOM-04**: `correctAnswer` com valor fora de A–E (ex: "F") é rejeitada.
- [ ] **TC-DOM-05**: Conversão para `QuestionPublic` remove 100% dos dados de gabarito e justificativa.
- [ ] **TC-DOM-06**: `QuestionInternal` sem análise de algum dos distratores é rejeitada.
- [ ] **TC-DOM-07**: `QuizPlan` com mais de 2 letras consecutivas iguais de gabarito é rejeitado.
- [ ] **TC-DOM-08**: Bloco completo que desrespeite a distribuição de formatos (3 narrativas, 1 proposição, 1 conceitual) ou dificuldades (3 difíceis, 1 média, 1 fácil) é rejeitado.
- [ ] **TC-DOM-09**: Alternativas com variação de tamanho superior a ±15% geram warning ou erro no modo estrito.

### 2.2 Segurança e Criptografia do Gabarito
- [ ] **TC-SEC-01**: `opaqueGradingToken` cifrado com AES-GCM não permite inspeção em texto plano.
- [ ] **TC-SEC-02**: Token com assinatura adulterada é imediatamente rejeitado no `quiz_grade_answer`.
- [ ] **TC-SEC-03**: Submissão de `questionId` que não pertence ao token retorna erro de validação.
- [ ] **TC-SEC-04**: Geração e decriptação de token preservam diagnósticos e fundamentações intactos.

### 2.3 Biblioteca Markdown e Indexador FTS5
- [ ] **TC-LIB-01**: Frontmatter ausente ou incompleto causa falha no `library:validate`.
- [ ] **TC-LIB-02**: Reindexação idempotente não duplica seções ou materiais no SQLite.
- [ ] **TC-LIB-03**: Busca textual via FTS5 retorna seções relevantes com ranking correto.
- [ ] **TC-LIB-04**: Tentativa de acesso com path traversal (`../`) é bloqueada nas tools MCP.

### 2.4 Interface do Usuário (QuestionPlayer React)
- [ ] **TC-UI-01**: Clique na linha completa da alternativa seleciona o item e marca o radio button.
- [ ] **TC-UI-02**: O botão "Confirmar Resposta" permanece desabilitado até que uma alternativa seja escolhida.
- [ ] **TC-UI-03**: No modo Estudo, após confirmação, as opções são travadas e o `CorrectionPanel` é renderizado.
- [ ] **TC-UI-04**: Accordions de distratores iniciam recolhidos por padrão.
- [ ] **TC-UI-05**: Atalhos de teclado (A–E para seleção, Enter para confirmação, setas para navegação) funcionam sem interferir no foco.
- [ ] **TC-UI-06**: No modo Prova, o usuário pode navegar livremente e alterar respostas até a finalização.
- [ ] **TC-UI-07**: O relatório final consolida pontuação global, acertos por foco e filtros de revisão de erros.

### 2.5 Integração MCP e Apps SDK
- [ ] **TC-MCP-01**: `library_list_materials` retorna catálogo formatado.
- [ ] **TC-MCP-02**: `library_get_outline` retorna árvore de headings sem carregar o conteúdo integral.
- [ ] **TC-MCP-03**: `quiz_render` entrega o resource HTML do widget sem vazar gabarito no payload JSON.
- [ ] **TC-MCP-04**: `quiz_grade_answer` corrige a alternativa submetida e retorna a justificativa.
- [ ] **TC-MCP-05**: `widgetState` preserva índice da questão e respostas marcadas entre re-renders.
