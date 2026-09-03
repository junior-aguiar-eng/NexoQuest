import type { AnswerLabel, ConfidenceLevel, Difficulty, Focus, QuestionFormat } from "../../../src/core/domain/primitives";

export interface InteractiveLegalQuestion {
  id: string;
  sequence: number;
  totalQuestions: number;
  blockNumber: number;
  slotInBlock: number;
  discipline: string;
  point: string;
  umtTitle: string;
  format: QuestionFormat;
  difficulty: Difficulty;
  focus: Focus;
  stem: string;
  propositions?: string[];
  command?: string;
  alternatives: { label: AnswerLabel; text: string }[];
  correctAnswer: AnswerLabel;
  diagnosis: string;
  legalReasoning: string;
  legalBasis: string;
  precedents?: string[];
  doctrine?: string[];
  distractorAnalysis: Record<AnswerLabel, string>;
}

export const BLOCK_1_LEGAL_QUESTIONS: InteractiveLegalQuestion[] = [
  {
    id: "q-mege-01",
    sequence: 1,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 1,
    discipline: "DIREITO PROCESSUAL CIVIL",
    point: "Negócios Jurídicos Processuais",
    umtTitle: "Art. 190 do CPC - Cláusula Geral de Negociação Atípica",
    format: "case_narrative",
    difficulty: "hard",
    focus: "jurisprudence",
    stem: `Em ação indenizatória de elevada complexidade econômica, duas sociedades empresárias plenamente capazes estipularam, antes da instauração do contraditório em contrato preliminar, cláusula de supressão prévia de agravo de instrumento em face de decisões interlocutórias redistributivas do ônus da prova, além de fixarem prazo convencional de 20 (vinte) dias úteis para resposta. O magistrado de primeiro grau, de ofício e sem facultar manifestação das partes, declarou nula a cláusula por entender que as regras procedimentais recursais são de ordem pública absoluta e inderrogáveis por vontade privada.

Considerando a disciplina dos negócios jurídicos processuais atípicos no Código de Processo Civil e a jurisprudência do Superior Tribunal de Justiça, assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "A decisão do magistrado foi incorreta, pois o art. 190 do CPC confere ampla autonomia para alteração do procedimento e renúncia a faculdades recursais sobre direitos disponíveis."
      },
      {
        label: "B",
        text: "A decisão do magistrado foi correta, pois a fixação de prazos peremptórios e a renúncia antecipada a recursos constituem matérias de ordem pública indisponíveis pelas partes."
      },
      {
        label: "C",
        text: "A convenção processual é nula quanto à renúncia recursal, mas plenamente eficaz quanto ao prazo de resposta, desde que homologada previamente pelo juízo da causa."
      },
      {
        label: "D",
        text: "Os negócios jurídicos processuais atípicos celebrados antes do ajuizamento da ação exigem expressa autorização legal casuística para vincular o juiz da causa."
      },
      {
        label: "E",
        text: "O controle judicial de validade do negócio processual atípico deve ser exercido de plano, independentemente de contraditório ou de comprovação de vulnerabilidade."
      }
    ],
    correctAnswer: "A",
    diagnosis: "O candidato desconsiderou a abrangência da cláusula geral do art. 190 do CPC e a orientação do STJ que admite renúncia a faculdades recursais disponíveis.",
    legalReasoning: "Nos termos do art. 190 do CPC e da jurisprudência consolidada do STJ (ex: REsp 1.738.613/SP), partes capazes podem pactuar negócios atípicos sobre direitos que admitam autocomposição, antes ou durante o processo, inclusive sobre ônus, poderes, faculdades e prazos. O controle judicial depende de contraditório e restringe-se a nulidade ou vulnerabilidade manifesta.",
    legalBasis: "Art. 190, caput e parágrafo único, do CPC.",
    precedents: ["STJ - REsp 1.738.613/SP", "Enunciado 19 do FPPC"],
    distractorAnalysis: {
      A: "Correta, conforme o art. 190 do CPC e jurisprudência do STJ.",
      B: "Incorreta: o CPC consagrou o princípio do autorregramento da vontade no processo para direitos disponíveis.",
      C: "Incorreta: o art. 190 dispensa homologação judicial como requisito geral de validade do negócio atípico.",
      D: "Incorreta: a cláusula do art. 190 é geral e autoriza negócios atípicos inominados.",
      E: "Incorreta: o controle de vulnerabilidade deve observar o contraditório prévio (art. 9º e 10 do CPC)."
    }
  },
  {
    id: "q-mege-02",
    sequence: 2,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 2,
    discipline: "DIREITO PROCESSUAL CIVIL",
    point: "Negócios Jurídicos Processuais",
    umtTitle: "Art. 191 do CPC - Calendário Processual",
    format: "case_narrative",
    difficulty: "hard",
    focus: "statute",
    stem: `Em cumprimento de sentença relativo a obrigação de fazer cumulada com perdas e danos, exequente e executado compareceram à audiência de conciliação e ajustaram, em termo conjunto assinado com o magistrado condutor, um calendário processual discriminando as datas para realização de perícia técnica contábil, apresentação de laudos e data da decisão sobre as impugnações aos cálculos. No calendário, restou expressamente consignado que a intimação para manifestação sobre o laudo pericial dar-se-ia exclusivamente pelo decurso da data pactuada.

À luz das regras expressas do Código de Processo Civil relativas ao calendário processual, assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "O calendário processual não vincula o magistrado condutor, que poderá alterar unilateralmente as datas dos atos de ofício por conveniência da pauta da vara."
      },
      {
        label: "B",
        text: "A fixação do calendário depende de aprovação prévia da Corregedoria-Geral de Justiça para ter eficácia nos prazos próprios do juiz."
      },
      {
        label: "C",
        text: "O calendário vincula as partes e o juiz, e os prazos nele fixados para a prática dos atos processuais começam a correr independentemente de intimação."
      },
      {
        label: "D",
        text: "A dispensa de intimação para os atos previstos no calendário constitui nulidade insanável por ofensa ao princípio da ampla defesa e do contraditório."
      },
      {
        label: "E",
        text: "O calendário processual é aplicável exclusivamente à fase de conhecimento, sendo expressamente vedada sua estipulação em cumprimento de sentença ou execução."
      }
    ],
    correctAnswer: "C",
    diagnosis: "O candidato confundiu o regime legal do art. 191 do CPC com a regra geral de intimação prévia dos atos ordinatórios.",
    legalReasoning: "Conforme dispõe o art. 191, § 2º, do CPC: 'Dispensa-se a intimação das partes para a prática de ato processual ou a realização de audiência cujas datas tiverem sido designadas no calendário'. O § 1º do mesmo dispositivo prevê expressamente que o calendário vincula os litigantes e o órgão jurisdicional.",
    legalBasis: "Art. 191, §§ 1º e 2º, do CPC.",
    distractorAnalysis: {
      A: "Incorreta: o calendário vincula o juiz e as datas só podem ser modificadas em situações excepcionais devidamente justificadas (§ 1º).",
      B: "Incorreta: não há qualquer exigência de aprovação por órgão correcional.",
      C: "Correta: expressa literalidade do art. 191, §§ 1º e 2º, do CPC.",
      D: "Incorreta: a dispensa de intimação é autorizada por expressa previsão legal (§ 2º).",
      E: "Incorreta: o calendário pode ser firmado em qualquer fase processual ou procedimento sobre direitos disponíveis."
    }
  },
  {
    id: "q-mege-03",
    sequence: 3,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 3,
    discipline: "DIREITO PROCESSUAL CIVIL",
    point: "Negócios Jurídicos Processuais",
    umtTitle: "Limites e Nulidades do Negócio Processual (Lei nº 14.879/2024)",
    format: "propositions",
    difficulty: "medium",
    focus: "doctrine",
    stem: `Analise as proposições a seguir sobre os limites dogmáticos, a competência e o controle de validade dos negócios jurídicos processuais atípicos no direito brasileiro:`,
    propositions: [
      "I. É nula a cláusula de eleição de foro inserida em contrato sem guardar pertinência temática com o domicílio das partes ou com o local do cumprimento da obrigação, configurando juízo aleatório vedado pela Lei nº 14.879/2024.",
      "II. As partes podem estipular negócio processual para criar recurso inexistente na lei federal, haja vista que a taxatividade recursal é matéria submetida à disponibilidade das partes capazes.",
      "III. O juiz controlará a validade das convenções processuais atípicas, recusando-lhes aplicação somente nos casos de nulidade ou quando constatar inserção abusiva em contrato de adesão ou vulnerabilidade manifesta."
    ],
    command: "Está correto o que se afirma em:",
    alternatives: [
      {
        label: "A",
        text: "I e II, apenas."
      },
      {
        label: "B",
        text: "II e III, apenas."
      },
      {
        label: "C",
        text: "I, II e III."
      },
      {
        label: "D",
        text: "II, apenas."
      },
      {
        label: "E",
        text: "I e III, apenas."
      }
    ],
    correctAnswer: "E",
    diagnosis: "O candidato considerou válida a criação de recursos atípicos, desconsiderando a reserva legal privativa da União sobre processo e taxatividade recursal.",
    legalReasoning: "A proposição I está correta conforme a nova redação do art. 63, § 1º, do CPC dada pela Lei nº 14.879/2024 (vedação ao foro aleatório). A proposição II está errada porque o princípio da taxatividade recursal decorre da competência legislativa privativa da União (CF, art. 22, I), sendo vedada a criação de novos recursos por acordo de vontades. A proposição III está correta na dicção do art. 190, parágrafo único, do CPC.",
    legalBasis: "Art. 63, § 1º (Lei 14.879/2024), e Art. 190, parágrafo único, do CPC.",
    precedents: ["STJ - CC 198.814/DF"],
    doctrine: ["DIDIER JR., Fredie. Curso de Direito Processual Civil. Salvador: Juspodivm."],
    distractorAnalysis: {
      A: "Incorreta: a proposição II é falsa (taxatividade recursal é inderrogável).",
      B: "Incorreta: a proposição II é falsa e a proposição I é verdadeira.",
      C: "Incorreta: a proposição II vicia o item.",
      D: "Incorreta: a proposição II é justamente a proposição incorreta.",
      E: "Correta: as proposições I e III são estritamente verdadeiras."
    }
  },
  {
    id: "q-mege-04",
    sequence: 4,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 4,
    discipline: "DIREITO PROCESSUAL CIVIL",
    point: "Negócios Jurídicos Processuais",
    umtTitle: "Acordo de Prova Pericial e Perito Convencional",
    format: "case_narrative",
    difficulty: "hard",
    focus: "jurisprudence",
    stem: `Em demanda na qual se controverte sobre avaliação patrimonial de ativos intangíveis de tecnologia, as partes, ambas assessoradas por advogados constituídos e em pleno gozo de capacidade civil, apresentaram petição conjunta requerendo a indicação de perito único de sua estrita confiança para elaboração do laudo e convencionando a substituição dos assistentes técnicos. O juiz indeferiu o pedido, afirmando que a escolha do perito é ato privativo do magistrado integrante de lista de peritos cadastrados do tribunal.

Sobre a hipótese narrada e o regramento legal do perito consensual no Código de Processo Civil, assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "O juiz agiu corretamente, pois a confiança do juízo no perito oficial é requisito indisponível que prevalece sobre o consenso dos litigantes."
      },
      {
        label: "B",
        text: "As partes podem, de comum acordo, escolher o perito, indicando-o mediante requerimento, caso em que a perícia consensual substitui, para todos os efeitos, a que seria realizada pelo perito nomeado pelo juiz."
      },
      {
        label: "C",
        text: "A perícia consensual é admitida apenas na arbitragem, sendo incompatível com o procedimento comum do Código de Processo Civil."
      },
      {
        label: "D",
        text: "A indicação consensual de perito obriga as partes a renunciarem à formulação de quesitos e à apresentação de esclarecimentos futuros."
      },
      {
        label: "E",
        text: "A escolha consensual de perito exige que o profissional indicado já integre previamente o cadastro de peritos credenciados do Tribunal local."
      }
    ],
    correctAnswer: "B",
    diagnosis: "O candidato desconsiderou a previsão legal expressa da perícia consensual no art. 471 do CPC.",
    legalReasoning: "O art. 471 do CPC consagra expressamente a perícia consensual: 'As partes podem, de comum acordo, escolher o perito, indicando-o mediante requerimento, desde que sejam plenamente capazes e a causa possa ser resolvida por autocomposição'. O § 1º estabelece que a perícia consensual substitui, para todos os efeitos, a perícia que seria realizada pelo perito do juiz.",
    legalBasis: "Art. 471, caput e § 1º, do CPC.",
    distractorAnalysis: {
      A: "Incorreta: o art. 471 autoriza a escolha consensual pelas partes capazes.",
      B: "Correta: literalidade e inteligência do art. 471 do CPC.",
      C: "Incorreta: o instituto é típico e expressamente previsto no CPC.",
      D: "Incorreta: a faculdade de formular quesitos e impugnações permanece resguardada.",
      E: "Incorreta: o § 2º do art. 471 dispensa a prévia inscrição no cadastro do tribunal quando houver consenso."
    }
  },
  {
    id: "q-mege-05",
    sequence: 5,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 5,
    discipline: "DIREITO PROCESSUAL CIVIL",
    point: "Negócios Jurídicos Processuais",
    umtTitle: "Forma e Eficácia dos Negócios Processuais Unilaterais e Bilaterais",
    format: "conceptual",
    difficulty: "easy",
    focus: "jurisprudence",
    stem: `No que tange aos atos processuais das partes e à produção de efeitos das declarações unilaterais ou bilaterais de vontade destinadas a criar, modificar ou extinguir direitos processuais, assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "Todos os atos processuais das partes exigem necessária sentença homologatória para que passem a produzir efeitos jurídicos no processo."
      },
      {
        label: "B",
        text: "A desistência da ação produz efeitos de imediato, independentemente de homologação judicial, impedindo a prática de atos ulteriores."
      },
      {
        label: "C",
        text: "A renúncia ao direito de recorrer independe de aceitação da outra parte, mas somente produz efeitos após homologação formal pelo relator."
      },
      {
        label: "D",
        text: "Os atos das partes produzem imediatamente a constituição, modificação ou extinção de direitos processuais, ressalvada a desistência da ação, que só produz efeitos após homologada por sentença."
      },
      {
        label: "E",
        text: "A transação celebrada por instrumento particular sem a assinatura de duas testemunhas não possui qualquer eficácia no âmbito do processo civil."
      }
    ],
    correctAnswer: "D",
    diagnosis: "O candidato errou a regra geral do art. 200 do CPC e a ressalva específica da desistência da ação.",
    legalReasoning: "O art. 200, caput, do CPC estatui: 'Os atos das partes, consistentes em declarações unilaterais ou bilaterais de vontade, produzem imediatamente a constituição, modificação ou extinção de direitos processuais'. O parágrafo único traz a clássica ressalva: 'A desistência da ação só produzirá efeitos após homologada por sentença'.",
    legalBasis: "Art. 200, caput e parágrafo único, do CPC.",
    distractorAnalysis: {
      A: "Incorreta: a regra geral é a produção imediata de efeitos sem necessidade de homologação.",
      B: "Incorreta: a desistência é a expressa exceção legal que exige homologação por sentença.",
      C: "Incorreta: a renúncia recursal produz efeitos imediatos (art. 999 do CPC).",
      D: "Correta: redação estrita do art. 200, caput e parágrafo único, do CPC.",
      E: "Incorreta: a transação processual independe de testemunhas para surtir efeitos entre os litigantes."
    }
  }
];
