# ADR-009: Regras Pedagógicas e de Bloco Validadas Deterministicamente

## Status
Aceito

## Contexto
Prompts de LLM sozinhos podem falhar em cumprir regras mecânicas exatas (ex: número exato de alternativas, simetria de tamanho de texto, distribuição de dificuldade e rotação de letras corretas).

## Decisão
Regras pedagógicas mecânicas são convertidas em validadores de software determinísticos (`plan-validator.ts`, `question-validator.ts`, `block-rules.ts`). O LLM é responsável pela semântica jurídica e o software pela conformidade estrutural.

## Consequências
- Garantia de que blocos defeituosos gerados pelo modelo sejam interceptados e corrigidos antes de chegar ao widget.
- Alto nível de fidelidade ao perfil do exame (ENAM/FGV).
