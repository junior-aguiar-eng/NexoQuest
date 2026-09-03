# ADR-006: Separação Rígida entre Gabarito e Payload Público

## Status
Aceito

## Contexto
O modelo gera a questão completa com gabarito e fundamentação (`QuestionInternal`). Enviar esse objeto ao frontend ou escondê-lo via CSS permitiria inspeção indevida do gabarito no browser/DOM antes da resposta.

## Decisão
Criar o contrato `QuestionPublic`, que remove explicitamente `correctAnswer`, `legalReasoning`, `distractorAnalysis` e metadados internos. A chave de correção é cifrada em um `opaqueGradingToken` (AES-GCM) e enviada ao widget apenas para posterior conferência no backend.

## Consequências
- Impossibilidade de vazamento do gabarito antes da confirmação da resposta.
- Garantia de integridade da avaliação do candidato.
