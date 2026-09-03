# ADR-005: Markdown como Fonte Canônica do Material

## Status
Aceito

## Contexto
O material didático jurídico precisa ser de fácil manutenção, versionável via Git, legível por humanos e editável sem dependência de painéis complexos.

## Decisão
Arquivos `.md` estruturados com frontmatter padronizado (validado por Zod) constituem a única fonte da verdade do acervo didático. O banco de dados (SQLite/FTS5) funciona estritamente como índice reconstruível e cache de busca lexical.

## Consequências
- Simplicidade na adição e atualização de disciplinas e pontos.
- Índice pode ser totalmente reconstruído a qualquer momento com `npm run library:index`.
