# ADR-002: Não Criar Monorepo na Fundação

## Status
Aceito

## Contexto
Reestruturar a base em monorepo (`packages/`, `apps/`, pnpm workspaces) durante a fase inicial aumentaria a complexidade de tooling, resolução de tipos e risco de quebras sem benefício imediato.

## Decisão
Manter a estrutura de diretórios raiz com separação lógica clara (`src/core`, `src/adapters`, `view/src`). Refatorações para monorepo ficam reservadas para pós-MVP e auditoria no Codex.

## Consequências
- Simplicidade mantida nos scripts de build e validação.
- Menor atrito durante o desenvolvimento inicial no Antigravity.
