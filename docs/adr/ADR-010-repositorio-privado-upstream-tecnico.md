# ADR-010: Repositório Privado Independente e Upstream Técnico

## Status
Aceito

## Contexto
O NexoQuiz precisa ser um produto privado e proprietário, mas aproveitando o código de infraestrutura do QuizHP (MIT). Não deve haver uma rede pública de forks no GitHub expondo o código ou materiais.

## Decisão
Clonar o QuizHP localmente e publicá-lo em um repositório privado independente (`origin`). O repositório original do QuizHP permanece configurado apenas como `upstream` para eventuais comparações ou atualizações técnicas controladas. É expressamente proibido fazer push para `upstream`.

## Consequências
- Código do NexoQuiz permanece privado no GitHub.
- Atribuição ao projeto original e licença MIT preservadas via `NOTICE.md` e `LICENSE`.
- Isolamento total contra publicações acidentais no projeto público.
