# Guia de Integração e Implantação no ChatGPT — NexoQuiz V1

Este documento estabelece as instruções completas para integrar e operar o **NexoQuiz** dentro do **ChatGPT** via **MCP (Model Context Protocol) + Apps SDK**, mantendo conformidade estrita com as invariantes arquiteturais do projeto.

---

## 1. Visão Geral da Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ChatGPT (Host de IA)                          │
│                                                                         │
│  1. Recebe intenção do usuário ("Quero treinar Processo Civil")         │
│  2. Consulta catálogo de apostilas: library_list_materials / search     │
│  3. Formula o QuizPlan e valida deterministicamente: quiz_plan_validate │
│  4. Redige as questões com fundamentação e gabarito interno             │
│  5. Chama quiz_render -> Entrega QuestionPublic[] + opaqueGradingToken │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │               Widget React (Apps SDK no iframe)                   │  │
│  │  • Exibe uma questão por vez com interface sóbria (A–E)           │  │
│  │  • Alternância de modos Estudo / Prova e cronômetro               │  │
│  │  • Sincroniza progresso via widgetState (window.openai)           │  │
│  │  • Envia resposta cifrada via tool call quiz_grade_answer         │  │
│  │  • Exibe accordions de distratores e diagnóstico pedagógico       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Como Configurar no ChatGPT (Custom GPT / Actions / MCP)

### Passo 1: Iniciar o Servidor NexoQuiz Localmente
```bash
# Compilar frontend e iniciar servidor HTTP Streamable MCP
npm run build:view
npm start
```
*O servidor estará escutando em `http://localhost:3001/mcp`.*

### Passo 2: Expor via Túnel Seguro (ngrok ou Cloudflare Tunnel)
```bash
# Exemplo com Cloudflare Tunnel (ou ngrok http 3001)
cloudflared tunnel --url http://localhost:3001
```

### Passo 3: Registrar o MCP Server no ChatGPT
1. Acesse as configurações de **Developer Tools / Custom Actions** no ChatGPT.
2. Adicione a URL do MCP Endpoint: `https://seu-tunel.trycloudflare.com/mcp`.
3. Habilite as capacidades de UI do **Apps SDK**:
   - `Display Modes`: `inline`, `fullscreen`.
   - `Resource URI`: `ui://nexoquiz/quiz-app.html`.

---

## 3. Prompt do Sistema Canônico (System Instructions para o ChatGPT)

Copie e cole as instruções abaixo na configuração de System Prompt do Custom GPT / Agente:

```markdown
Você é o Tutor Pedagógico Especialista em Provas de Magistratura e ENAM do NexoQuiz.
Sua missão é conduzir simulados jurídicos determinísticos consumindo a biblioteca canônica via ferramentas MCP.

### PROTOCOLO OBRIGATÓRIO DE EXECUÇÃO:

1. **CONSULTA DE CONTEÚDO**:
   - Nunca invente jurisprudência ou enunciados sem embasamento.
   - Use `library_list_materials` e `library_search` para consultar trechos das apostilas canônicas antes de redigir qualquer questão.

2. **PLANEJAMENTO DO SIMULADO (QuizPlan)**:
   - Para criar um bloco de 5 questões, gere a estrutura e valide via `quiz_plan_validate`.
   - Respeite as proporções FGV: 3 casos narrativos, 1 proposições, 1 conceitual; 3 difíceis, 1 média, 1 fácil; sem gabaritos consecutivos repetidos (ex: nunca A seguido de A).

3. **RENDERIZAÇÃO DA PROVA**:
   - Chame `quiz_render` enviando o array completo `QuestionInternal[]` com todas as 5 alternativas (A, B, C, D, E), a fundamentação (`legalReasoning`), a base legal (`legalBasis`), precedentes e a análise individual dos 4 distratores.
   - NUNCA inclua marcadores editoriais como `[source: N]` no texto público das questões.
   - O servidor irá cifrar o gabarito no `opaqueGradingToken` e abrir o widget interativo sóbrio para o usuário.

4. **CORREÇÃO PEDAGÓGICA**:
   - Quando o usuário submeter uma resposta pelo widget, a ferramenta `quiz_grade_answer` será acionada automaticamente pelo token seguro.
   - Se o candidato errar, apresente acolhimento e reforce o diagnóstico pedagógico do equívoco.
```

---

## 4. Ferramentas MCP Disponíveis e Contratos

| Ferramenta | Entrada | Saída | Finalidade |
| :--- | :--- | :--- | :--- |
| `library_list_materials` | `{}` | Catálogo de apostilas | Lista matérias disponíveis na biblioteca Markdown. |
| `library_search` | `{ query, limit? }` | Lista de seções ranqueadas | Busca lexical rápida FTS5 no conteúdo dos materiais. |
| `library_read_sections` | `{ materialId, sectionIds }` | Texto das seções | Recupera o teor integral dos tópicos solicitados. |
| `quiz_plan_validate` | `{ plan }` | `{ isValid, errors }` | Validação determinística estrita das proporções FGV. |
| `quiz_render` | `{ discipline, point, questions }` | Widget UI (`QuestionPublic[]`) | Renderiza o player sóbrio e protege o gabarito em AES-GCM. |
| `quiz_grade_answer` | `{ opaqueGradingToken, selectedAnswer }` | Diagnóstico e fundamentação | Correção determinística stateless sem vazamento prévio. |
| `quiz_get_history` | `{ discipline?, mode? }` | Sessões e percentuais | Histórico de desempenho e acurácia por matéria. |
| `quiz_save_session` | `{ session }` | Confirmação | Gravação local de histórico pós-simulado. |

---

## 5. Checklist de Homologação da Entrega V1

- [x] **Zero Vazamento de Gabarito**: `QuestionPublic` não contém texto de resposta correta.
- [x] **Resiliência Stateless**: Correção opera via `opaqueGradingToken` criptografado.
- [x] **Interface Sóbria**: Player digital limpo (sem gamificação, sem moedas/XP).
- [x] **Persistência de Estado**: `widgetState` sincronizado com o host ChatGPT.
- [x] **Diagnóstico Completo**: Análise de distratores recolhidos em accordions e relatório pós-prova.
- [x] **54 Testes Automatizados**: Suíte unitária e de integração com 100% de aprovação.
