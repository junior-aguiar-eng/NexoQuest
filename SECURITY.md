# Política de Segurança — NexoQuiz

A segurança e a integridade determinística das avaliações no **NexoQuiz** são fundamentais. Levamos a sério a proteção contra vazamentos de gabarito, ataques de adulteração de estado e vulnerabilidades de código.

---

## 1. Versões com Suporte

| Versão | Suporte a Correções de Segurança |
| :--- | :--- |
| **1.x (Atual)** | ✅ Suportada ativamente |
| < 1.0 | ❌ Não suportada |

---

## 2. Escopo e Áreas Críticas de Segurança

Agradecemos relatórios de vulnerabilidade especialmente nas seguintes áreas:

1. **Envelope Criptográfico (`opaqueGradingToken`)**:
   - Falhas na autenticação AES-256-GCM que permitam falsificação de gabarito, adulteração de chave ou decodificação sem a chave mestra do servidor.
   - Replay attacks ou bypass na validação de expiração e integridade do token.
2. **Separação de Contratos (`QuestionInternal` vs `QuestionPublic`)**:
   - Vazamento de `correctAnswer`, `legalReasoning` ou análise de distratores no payload público trafegado para o cliente/Apps SDK.
3. **Validação de Conteúdo e Markdown**:
   - Injeção de código, XSS no renderer React ou contaminação de marcadores de debug/editorial.
4. **Armazenamento e Estado**:
   - Falhas de injeção em consultas FTS5 ou corrupção na sincronização via `widgetState`.

---

## 3. Como Reportar uma Vulnerabilidade

**Por favor, NÃO abra issues públicas para reportar vulnerabilidades de segurança.**

Para reportar uma vulnerabilidade de forma responsável:

1. Utilize o recurso oficial de **Security Advisory** privado do repositório:
   - Acesse a aba **Security** > **Advisories** > **Report a vulnerability**.
2. Ou envie um e-mail direto para os mantenedores através do perfil do GitHub: [junior-aguiar-eng](https://github.com/junior-aguiar-eng).

### O que incluir no seu relatório:
* Descrição clara da vulnerabilidade.
* Passos detalhados para reprodução ou Prova de Conceito (*Proof of Concept* - PoC).
* Impacto potencial estimado (ex: vazamento de gabarito, negação de serviço, bypass de autenticação).
* Sugestão de correção (se houver).

---

## 4. Nosso Compromisso de Resposta

* **Confirmação inicial**: em até **48 horas úteis**.
* **Avaliação de impacto e triagem**: em até **5 dias úteis**.
* **Correção e publicação de patch**: prioridade máxima com liberação de versão de correção (*hotfix*) e atribuição de crédito ao pesquisador (salvo pedido de anonimato).

Agradecemos imensamente aos pesquisadores e à comunidade por ajudarem a manter o NexoQuiz seguro e confiável! 🔒
