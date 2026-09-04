# Guia de Contribuição — NexoQuiz

Agradecemos o seu interesse em contribuir com o **NexoQuiz**! Este documento orienta como colaborar com o projeto de forma eficiente, mantendo a consistência arquitetural, a robustez técnica e o rigor pedagógico exigidos para avaliações de alta performance (ENAM e Magistratura).

---

## 1. Princípios e Invariantes Arquiteturais

Para garantir a estabilidade e a independência do sistema, toda contribuição deve respeitar as **invariantes fixas** do projeto:

1. **Core Host-Agnostic**: O domínio (`src/core/`) não depende de SDKs específicos (OpenAI, MCP ou Cloudflare). Integrações residem exclusivamente em `src/adapters/`.
2. **Nenhuma Chamada de LLM no Backend**: O backend é determinístico. A geração de enunciados é realizada pelo modelo no host (ChatGPT); o servidor valida esquemas, cifra gabaritos e corrige respostas.
3. **Markdown como Fonte Canônica**: As apostilas jurídicas residem em arquivos `.md` estruturados com frontmatter em `library/`. O SQLite FTS5 atua estritamente como índice.
4. **Proteção Rigorosa do Gabarito**: `QuestionPublic` **nunca** contém a resposta correta ou justificativas. O gabarito trafega cifrado no `opaqueGradingToken` (AES-256-GCM).
5. **Interface Digital Sóbria**: A interface web (Apps SDK e Standalone) foca na experiência limpa de prova. Elementos lúdicos (sons, moedas, confetes, animações distrativas) estão fora do escopo da V1.
6. **Regras Pedagógicas em Código**: Proporções FGV (bloco 3:1:1), rotação de gabarito e simetria de alternativas são validadas deterministicamente em TypeScript + Zod.
7. **Topologia Git**:
   - `origin`: repositório de desenvolvimento (`junior-aguiar-eng/NexoQuest`).
   - `upstream`: repositório base de referência (`bassimeledath/quizhp-mcp`).
   - **Nunca** realize push para o `upstream`.

---

## 2. Como Você Pode Contribuir

Você pode colaborar de diversas maneiras:

* 📚 **Biblioteca Jurídica**: Adicionar novas apostilas canônicas ou atualizar jurisprudência e legislação em `library/`.
* 🐛 **Correção de Bugs**: Identificar e solucionar falhas em validadores, parsers Markdown ou no player React.
* ⚡ **Performance e Otimizações**: Otimizar consultas FTS5, empacotamento Vite SingleFile ou tipagem TypeScript.
* 📝 **Documentação**: Melhorar guias de arquitetura, documentação de ferramentas MCP ou ADRs.
* 🧪 **Testes**: Ampliar a cobertura de testes automatizados com novos cenários de borda.

---

## 3. Fluxo de Desenvolvimento

### 3.1 Pré-requisitos
* **Node.js**: versão 20 LTS ou superior.
* **npm**: versão 10 ou superior.
* **Git**.

### 3.2 Configuração do Ambiente
```bash
# 1. Clone o repositório
git clone https://github.com/junior-aguiar-eng/NexoQuest.git
cd NexoQuest

# 2. Instale as dependências
npm install

# 3. Valide a integridade inicial
npm run typecheck
npm run test
npm run build
```

### 3.3 Criando uma Branch
Crie uma branch descritiva a partir da branch principal:
```bash
git checkout -b feature/nome-da-funcionalidade
# ou
git checkout -b fix/descricao-do-bug
# ou
git checkout -b content/nova-apostila-processo-penal
```

---

## 4. Diretrizes para Adicionar Material Jurídico (`library/`)

Ao submeter novas apostilas em Markdown:
1. Posicione o arquivo no diretório temático apropriado (ex: `library/direito-civil/`).
2. Garanta que o frontmatter YAML contenha todos os campos obrigatórios:
   ```yaml
   ---
   id: direito-civil-posse
   title: Posse e Direitos Reais
   discipline: Direito Civil
   point: 4
   version: "1.0.0"
   author: NexoQuiz
   targetAudience: ENAM / Magistratura Estadual
   keywords: [posse, detencao, interditos, usucapiao]
   ---
   ```
3. Estruture os títulos com `#` para o título principal e `##` para tópicos e seções.
4. Valide o material executando:
   ```bash
   npm run library:validate
   npm run library:index
   ```

---

## 5. Protocolo de Validação Obrigatório

Antes de submeter qualquer Pull Request, certifique-se de que todos os comandos abaixo executam com **código de saída 0**:

```bash
# 1. Checagem estrita de tipos
npm run typecheck

# 2. Suíte de testes automatizados
npm run test

# 3. Compilação do backend e do frontend React
npm run build

# 4. Compilação da documentação VitePress
npm run docs:build
```

---

## 6. Padrões de Commit

Recomendamos o uso de mensagens de commit claras e semânticas (*Conventional Commits*):

* `feat(core)`: nova funcionalidade no domínio ou validadores.
* `fix(mcp)`: correção de bug em ferramenta MCP.
* `content(civil)`: adição ou ajuste em material jurídico.
* `docs(adr)`: atualização de documentação ou decisão arquitetural.
* `test(security)`: adição de casos de teste.
* `refactor(view)`: refatoração interna de componentes React sem alteração de comportamento.

---

## 7. Submissão de Pull Requests

1. Abra o Pull Request apontando para a branch `main` de `junior-aguiar-eng/NexoQuest`.
2. Preencha o template de PR detalhando:
   - Motivação da alteração.
   - Resumo das mudanças.
   - Confirmação de conformidade com os ADRs.
   - Resultados dos testes executados.
3. Aguarde a revisão dos mantenedores.

Muito obrigado por ajudar a construir o **NexoQuiz**! ⚖️
