export interface LibraryMaterialCard {
  id: string;
  discipline: "constitucional" | "penal" | "processo-civil";
  disciplineName: string;
  point: string;
  title: string;
  description: string;
  sectionsCount: number;
  tags: string[];
  outline: {
    id: string;
    title: string;
    level: number;
    contentPreview: string;
    fullContent: string;
  }[];
}

export const CANONICAL_LIBRARY_CATALOG: LibraryMaterialCard[] = [
  {
    id: "proc-civ-negocios-processuais-2026",
    discipline: "processo-civil",
    disciplineName: "Direito Processual Civil",
    point: "Ponto 1 — Negócios Jurídicos Processuais",
    title: "Negócios Jurídicos Processuais no CPC/2015",
    description: "Teoria geral, cláusula atípica do art. 190, limites objetivos e subjetivos, calendário processual e controle de validade pelo magistrado.",
    sectionsCount: 6,
    tags: ["Art. 190 CPC", "Calendário Processual", "Enunciados FPPC", "Saneamento Compartilhado"],
    outline: [
      {
        id: "proc-civ-sec-1",
        title: "1. Teoria Geral e Cláusula Geral do Art. 190 do CPC",
        level: 1,
        contentPreview: "O Código de Processo Civil de 2015 consagrou o princípio da cooperação (art. 6º) e a ampla autonomia da vontade no âmbito procedimental...",
        fullContent: `## 1. Teoria Geral e Cláusula Geral do Art. 190 do CPC

O Código de Processo Civil de 2015 consagrou o princípio da cooperação (art. 6º) e a ampla autonomia da vontade no âmbito procedimental através da cláusula geral de negociação processual atípica prevista no art. 190.

### Requisitos de Validade (Art. 190, caput)
1. **Capacidade Plena das Partes:** As partes devem ser plenamente capazes para os atos da vida civil e processual.
2. **Direitos que admitam auto-composição:** A lide ou a relação jurídica de direito material subjacente deve versar sobre direitos disponíveis ou passíveis de transação.
3. **Momento da Celebração:** Os negócios jurídicos processuais podem ser celebrados antes do processo (em contrato preliminar ou cláusula processual) ou durante o curso da demanda.

### Efeitos e Vinculação Judicial
De acordo com o art. 190, parágrafo único, o juiz somente recusará aplicação às convenções se houver nulidade ou inserção abusiva em contrato de adesão, ou se alguma parte se encontrar em manifesta situação de vulnerabilidade.`
      },
      {
        id: "proc-civ-sec-2",
        title: "2. Calendário Processual (Art. 191 do CPC)",
        level: 1,
        contentPreview: "De comum acordo, o juiz e as partes podem fixar calendário para a prática dos atos processuais, quando for o caso...",
        fullContent: `## 2. Calendário Processual (Art. 191 do CPC)

O art. 191 do CPC estabelece uma modalidade típica e tripartite de negócio jurídico processual:

> "De comum acordo, o juiz e as partes podem fixar calendário para a prática dos atos processuais, quando for o caso."

### Principais Características
- **Vinculação Tripartite:** O calendário vincula as partes e o próprio juiz.
- **Dispensa de Intimação:** Os prazos que constarem do calendário começam a correr independentemente de intimação prévia (art. 191, § 2º).
- **Modificação Excepcional:** As datas previamente fixadas somente podem ser modificadas em situações excepcionais devidamente justificadas.`
      },
      {
        id: "proc-civ-sec-3",
        title: "3. Saneamento Compartilhado e Negócios Probatórios",
        level: 1,
        contentPreview: "O saneamento compartilhado (art. 357, § 2º) e os acordos sobre distribuição do ônus probatório (art. 373, §§ 3º e 4º)...",
        fullContent: `## 3. Saneamento Compartilhado e Negócios Probatórios

As partes podem, em consenso com o magistrado ou bilateralmente:
- Delimitar consensualmente as questões de fato e de direito (art. 357, § 2º);
- Convencionar a redistribuição dinâmica do ônus da prova antes ou durante o processo, salvo sobre direito indisponível ou se tornar excessivamente difícil a defesa de uma das partes.`
      }
    ]
  },
  {
    id: "const-direitos-fundamentais-2026",
    discipline: "constitucional",
    disciplineName: "Direito Constitucional",
    point: "Ponto 2 — Direitos e Garantias Fundamentais",
    title: "Teoria Geral dos Direitos Fundamentais",
    description: "Eficácia vertical e horizontal (Drittwirkung), teoria dos limites dos limites, postulado da proporcionalidade e reserva do possível.",
    sectionsCount: 3,
    tags: ["Eficácia Horizontal", "Proporcionalidade", "Mínimo Existencial", "STF"],
    outline: [
      {
        id: "const-sec-1",
        title: "1. Eficácia dos Direitos Fundamentais nas Relações Privadas (Drittwirkung)",
        level: 1,
        contentPreview: "A teoria da eficácia horizontal imediata (direta) dos direitos fundamentais sustenta que as normas de direitos fundamentais vinculam não apenas o Estado...",
        fullContent: `## 1. Eficácia dos Direitos Fundamentais nas Relações Privadas (Drittwirkung)

O Supremo Tribunal Federal consolidou o entendimento de que os direitos fundamentais possuem eficácia horizontal direta e imediata nas relações entre particulares (ex: caso da exclusão de associado da UBC - RE 201.819).

### Pilares da Jurisprudência
- **Não dependência de mediação legislativa:** Os particulares estão diretamente submetidos aos preceitos constitucionais fundamentais (ampla defesa, contraditório, dignidade da pessoa humana).
- **Ponderação e Autonomia Privada:** A incidência não anula a autonomia da vontade, exigindo juízo de ponderação proporcional pelo magistrado.`
      },
      {
        id: "const-sec-2",
        title: "2. Postulado da Proporcionalidade e Limites dos Limites",
        level: 1,
        contentPreview: "A restrição a direitos fundamentais deve observar os três subelementos do princípio da proporcionalidade...",
        fullContent: `## 2. Postulado da Proporcionalidade e Limites dos Limites

O exame de constitucionalidade de leis restritivas de direitos fundamentais exige a observância da máxima da proporcionalidade (Robert Alexy):

1. **Adequação (Geeignetheit):** A medida estatal é idônea para fomentar o objetivo pretendido?
2. **Necessidade (Erforderlichkeit):** Existe meio alternativo menos gravoso que atinja o mesmo resultado com igual eficácia?
3. **Proporcionalidade em Sentido Estrito (Verhältnismäßigkeit):** As vantagens superam os sacrifícios impostos ao direito restringido?

### Teoria dos Limites dos Limites (Schranken-Schranken)
As leis restritivas não podem esvaziar o núcleo essencial (Wesensgehalt) do direito fundamental protegido.`
      }
    ]
  },
  {
    id: "penal-teoria-do-delito-2026",
    discipline: "penal",
    disciplineName: "Direito Penal",
    point: "Ponto 3 — Teoria do Delito e Tipicidade",
    title: "Teoria Geral do Delito e Tipicidade Material",
    description: "Estrutura analítica tripartite do crime, princípio da insignificância (requisitos STF), imputação objetiva e teoria da equivalência das condições.",
    sectionsCount: 3,
    tags: ["Insignificância", "Tipicidade Conglobante", "Imputação Objetiva", "STJ/STF"],
    outline: [
      {
        id: "penal-sec-1",
        title: "1. Princípio da Insignificância e Tipicidade Material",
        level: 1,
        contentPreview: "A tipicidade penal desdobra-se em tipicidade formal (adequação ao tipo abstrato) e tipicidade material (lesão ou perigo relevante)...",
        fullContent: `## 1. Princípio da Insignificância e Tipicidade Material

A teoria conglobante e material do delito exige que haja lesão ou perigo de lesão expressivo ao bem jurídico tutelado. A ausência de ofensividade material exclui a própria tipicidade da conduta, ensejando a absolvição por atipicidade (art. 386, III, do CPP).

### Vetores Cumulativos Fixados pelo STF (HC 84.412/SP)
1. **Mínima ofensividade da conduta** do agente;
2. **Nenhuma periculosidade social** da ação;
3. **Reduzidíssimo grau de reprovabilidade** do comportamento;
4. **Inexpressividade da lesão jurídica** provocada.`
      },
      {
        id: "penal-sec-2",
        title: "2. Teoria da Imputação Objetiva (Claus Roxin)",
        level: 1,
        contentPreview: "A imputação do resultado não decorre apenas da causalidade natural (conditio sine qua non), mas da criação ou incremento de risco proibido...",
        fullContent: `## 2. Teoria da Imputação Objetiva (Claus Roxin)

A imputação jurídica do resultado exige que o agente tenha criado ou incrementado um risco proibido e que esse mesmo risco tenha se concretizado no resultado típico dentro do alcance de proteção da norma.`
      }
    ]
  }
];
