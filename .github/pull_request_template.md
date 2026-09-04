## Descrição das Alterações
<!-- Descreva de forma concisa o que este Pull Request introduz, corrige ou melhora. -->

## Motivação e Contexto
<!-- Por que esta mudança é necessária? Qual problema ou melhoria ela aborda? -->

## Issue Relacionada
<!-- Ex: Closes #123 ou Fixes #45 -->

---

## Checklist de Invariantes Arquiteturais

Por favor, confirme se o seu PR respeita os princípios fundamentais do **NexoQuiz**:

- [ ] **Core Host-Agnostic**: Nenhum import ou tipo de OpenAI/MCP foi inserido em `src/core/`.
- [ ] **Sem API de IA no Backend**: O backend não realiza chamadas externas para provedores de LLM.
- [ ] **Proteção do Gabarito**: `QuestionPublic` não expõe a resposta correta ou fundamentações; o gabarito trafega cifrado no `opaqueGradingToken`.
- [ ] **Interface Sóbria**: Não foram adicionados elementos lúdicos de gamificação (sons, moedas, confetes, minigames).
- [ ] **Topologia Git**: O PR é destinado à branch `main` de `junior-aguiar-eng/NexoQuest` (nunca ao `upstream`).

---

## Validação e Testes Locais

Confirmo que executei localmente todos os comandos abaixo e obtive código de saída 0:

- [ ] `npm run typecheck` (Checagem de tipos TypeScript sem erros)
- [ ] `npm run test` (Suíte de testes automatizados com 100% de sucesso)
- [ ] `npm run build` (Compilação completa do servidor e da interface React)
- [ ] `npm run docs:build` (Compilação da documentação VitePress sem links quebrados)

---

## Informações Adicionais / Screenshots (se aplicável)
<!-- Adicione capturas de tela ou notas extras que auxiliem na revisão técnica. -->
