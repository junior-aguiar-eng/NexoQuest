# ADR-003: Núcleo do Domínio Independente de Provedor de IA

## Status
Aceito

## Contexto
O NexoQuiz precisa ser uma aplicação independente de host, podendo no futuro rodar em outros ambientes ou standalone.

## Decisão
É expressamente proibido importar SDKs da OpenAI, MCP ou de provedores de IA dentro de `src/core/domain`, `src/core/library`, `src/core/quiz` e `src/core/persistence`. Toda comunicação com o host é isolada em `src/adapters/` e `view/src/adapters/`.

## Consequências
- Domínio 100% testável com testes unitários puros em Node/TypeScript.
- Facilidade para adicionar novos adaptadores ou interfaces.
