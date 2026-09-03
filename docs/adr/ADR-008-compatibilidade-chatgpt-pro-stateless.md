# ADR-008: Compatibilidade ChatGPT Pro sem Dependência de MCP Write

## Status
Aceito

## Contexto
O ChatGPT Pro pode restringir ferramentas MCP que exigem gravação ou mutação no sistema de arquivos local/externo (`write/modify`).

## Decisão
O fluxo principal do NexoQuiz (apresentação, seleção, confirmação e correção) deve funcionar de forma 100% stateless para o servidor, usando `widgetState` para sincronização no cliente e o envelope criptográfico para validação de respostas (`quiz_grade_answer`). O adapter SQLite é mantido para execução standalone/local.

## Consequências
- Total compatibilidade com o ecossistema ChatGPT Apps SDK em qualquer nível de permissão.
- Sem falhas de execução causadas por permissões de escrita negadas pelo host.
