# ADR-007: Separação entre Estado Visual e Estado Durável

## Status
Aceito

## Contexto
Durante uma sessão de quiz, existem estados puramente visuais e efêmeros (alternativa selecionada no momento, tempo corrido, accordion expandido) e estados com relevância histórica/durável (respostas confirmadas, tempo total, erros por UMT).

## Decisão
Manter separação clara entre o estado de interface (`quiz-ui-store.ts`), o estado transitório do host (`widgetState`) e o repositório de persistência durável (`SessionRepository`).

## Consequências
- Stores Zustand enxutos e focados com selectors.
- Sem acoplamento entre o ciclo de renderização do widget e a persistência em banco.
