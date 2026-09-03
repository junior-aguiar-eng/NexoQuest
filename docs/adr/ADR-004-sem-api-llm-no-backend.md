# ADR-004: Servidor Não Realiza Chamadas de API de LLM

## Status
Aceito

## Contexto
Integrar chamadas para OpenAI API, Gemini ou Anthropic diretamente no backend do MCP server geraria custos adicionais de tokens, necessidade de gestão de chaves no servidor e acoplamento desnecessário.

## Decisão
O modelo do próprio host (o ChatGPT que está executando o app) é o responsável por ler o material e gerar os planos e questões via ferramentas MCP. O backend atua como validador de contratos, guardião de gabarito e motor de correção determinístico.

## Consequências
- Custo zero de API para o backend.
- Eliminação de vendor lock-in no servidor.
