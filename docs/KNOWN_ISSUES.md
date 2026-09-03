# NexoQuiz — Problemas Conhecidos (Known Issues)

Este arquivo documenta comportamentos, limitações e particularidades observadas durante o desenvolvimento.

---

## Observações de Baseline (Fase 0)

1. **Ordem de geração do Worker Bundle (`src/worker-bundle.ts`)**:
   - `src/worker-bundle.ts` é gerado dinamicamente a partir de `dist/view/index.html` e dos templates via `node scripts/build-worker-bundle.mjs`.
   - Em um repositório limpo recém-clonado, executar `tsc` (ou `npm run build:server`) antes de `npm run build:view && node scripts/build-worker-bundle.mjs` gera erro TS2307 (`Cannot find module './worker-bundle.js'`).
   - **Mitigação:** Sempre gerar a view primeiro ou executar `npm run build:worker` antes da compilação standalone do TypeScript do servidor.

2. **Ausência de Script `test` no Upstream Original**:
   - O repositório original do QuizHP não possuía um script de testes unitários configurado no `package.json`.
   - O framework de testes será introduzido de forma estruturada a partir da Fase 3 (Contratos e Validações de Domínio).
