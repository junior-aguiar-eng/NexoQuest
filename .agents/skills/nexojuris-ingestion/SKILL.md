---
name: nexojuris-ingestion
description: Importa apostilas jurídicas convertidas pelo NexoJuris Conversor para a biblioteca canônica do NexoQuiz, estruturando frontmatter Zod e atualizando o índice SQLite FTS5.
---

# Ingestão Automatizada do NexoJuris para o NexoQuiz

Esta Skill orienta e automatiza a importação de materiais didáticos jurídicos gerados pelo **NexoJuris Conversor** para a biblioteca canônica do **NexoQuiz** (`library/`).

---

## 🎯 Quando Usar Esta Skill
* Quando o usuário solicitar importar, adicionar ou indexar uma nova apostila ou manual convertido pelo NexoJuris.
* Quando o usuário fornecer um caminho de arquivo `.md` ou pedir para escanear a pasta de saídas (`PDFs Convertidos/`).
* Quando for necessário cadastrar uma nova disciplina ou ponto de edital na biblioteca de simulados.

---

## 📋 Protocolo de Execução

### Passo 1: Localizar o Arquivo de Origem
Identifique o arquivo Markdown (`.md`) gerado pelo NexoJuris.
Exemplos de locais comuns:
- `C:\Users\Boni Jr\AppData\Local\Programs\NexoJuris Conversor\PDFs Convertidos\<arquivo>.md`
- Qualquer caminho informado pelo usuário.

### Passo 2: Analisar e Inferir os Metadados
Ao ler o início do arquivo ou a capa, identifique:
1. **Disciplina**: Ex: `Direito Constitucional`, `Processo Civil`, `Penal`, `Administrativo`, `Empresarial`.
2. **Ponto do Edital**: Ex: `Ponto 1`, `Ponto 02`.
3. **Ordem Numérica (`point_order`)**: Número inteiro (ex: `1`, `2`, `5`).
4. **Título do Ponto**: Nome formal do tema (ex: `Constitucionalismo e Teoria da Constituição`).
5. **Tags Relevantes**: Palavras-chave dos tópicos abordados.

### Passo 3: Executar o Script de Importação
Execute o comando via terminal:

```bash
npx tsx scripts/import-nexojuris.ts "<caminho_do_arquivo.md>" \
  --discipline "<disciplina>" \
  --title "<titulo_do_ponto>" \
  --point "ponto-<numero_formatado>" \
  --order <numero_inteiro> \
  --source "NexoJuris Conversor" \
  --tags "<tag1>,<tag2>,<tag3>"
```

*Exemplo prático:*
```bash
npx tsx scripts/import-nexojuris.ts "C:\Users\Boni Jr\AppData\Local\Programs\NexoJuris Conversor\PDFs Convertidos\NexoJuri_Croqui_Engenharia_Software.md" \
  --discipline "Direito Constitucional" \
  --title "Constitucionalismo e Teoria da Constituição: Concepção, Classificação e Elementos" \
  --point "ponto-01" \
  --order 1 \
  --tags "constitucionalismo,classificacao,elementos,neoconstitucionalismo"
```

### Passo 4: Validação e Confirmação
1. O script salvará o arquivo padronizado em `library/<disciplina>/ponto-<ordem>.md`.
2. O índice SQLite FTS5 (`data/nexoquiz.sqlite`) será atualizado automaticamente.
3. Confirme para o usuário que o material foi catalogado com sucesso e que as questões já podem ser geradas no ChatGPT e no Simulador Live.

---

## 🔒 Invariantes Respeitadas
* O código Python original do NexoJuris permanece 100% intocado.
* Todo material importado respeita estritamente o `MaterialFrontmatterSchema` validado pelo Zod.
* O arquivo original do usuário não é deletado nem corrompido.
