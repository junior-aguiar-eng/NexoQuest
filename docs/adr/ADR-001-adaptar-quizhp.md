# ADR-001: Adaptação Incremental do QuizHP em vez de Reescrita

## Status
Aceito

## Contexto
O projeto de partida `quizhp-mcp` já fornece uma infraestrutura funcional de transporte MCP (Streamable HTTP e stdio), registro de resources/tools, bridge de comunicação com o host, Vite singlefile build, Tailwind e React com Zustand.

## Decisão
Preservar a infraestrutura de transporte, bridge e pipeline de build do QuizHP. A substituição da camada de minigames pelo `QuestionPlayer` será feita de forma incremental e controlada, sem refatoração "big bang".

## Consequências
- Economia significativa de tempo em infraestrutura de protocolo MCP.
- Redução de bugs de transporte e compatibilidade no Apps SDK.
- Código legado de jogos será removido cirurgicamente apenas após a consolidação da engine de questões (Fase 15).
