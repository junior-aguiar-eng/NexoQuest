---
layout: home

hero:
  name: "NexoQuiz"
  text: "Simulados Jurídicos Interativos"
  tagline: "Engine determinística para ChatGPT MCP e Apps SDK baseada em biblioteca canônica Markdown"
  image:
    src: /logo.svg
    alt: NexoQuiz
  actions:
    - theme: brand
      text: Guia de Integração
      link: /CHATGPT_INTEGRATION
    - theme: alt
      text: Ver Arquitetura
      link: /ARCHITECTURE

features:
  - icon: ⚖️
    title: Proporções Estritas FGV
    details: Validação em software do bloco 3:1:1 (3 casos narrativos, 1 proposições, 1 conceitual; 3 difíceis, 1 média, 1 fácil) e rotação de gabarito.
  - icon: 🔒
    title: Zero Vazamento de Gabarito
    details: Gabarito trafega cifrado no opaqueGradingToken (AES-256-GCM), permitindo correção determinística stateless sem que o host acesse as respostas de antemão.
  - icon: 📱
    title: Apps SDK & Interface Sóbria
    details: Widget React limpo e elegante com modos Estudo e Prova, cronômetro, accordions de distratores e sincronização de widgetState com o ChatGPT.
  - icon: 📚
    title: Biblioteca Markdown Canônica
    details: Apostilas com frontmatter validado em Zod, parser MDAST e indexação rápida via SQLite FTS5.
---
